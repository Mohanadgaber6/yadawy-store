const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { uploadImages, processImage, deleteUploadedFile, setUploadDir, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// PUBLIC — get all active site content
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const sections = db.prepare('SELECT * FROM homepage_sections WHERE is_active = 1 ORDER BY display_order ASC').all();

        // For product sections, fetch actual products
        for (const section of sections) {
            if (section.section_type === 'products' && section.product_source) {
                let where = "p.status = 'active'";
                switch (section.product_source) {
                    case 'featured': where += ' AND p.is_featured = 1'; break;
                    case 'best_seller': where += ' AND p.is_best_seller = 1'; break;
                    case 'new_arrival': where += ' AND p.is_new_arrival = 1'; break;
                    case 'on_sale': where += ' AND p.is_on_sale = 1 AND p.sale_price IS NOT NULL'; break;
                }

                if (section.product_filter) {
                    try {
                        const filter = JSON.parse(section.product_filter);
                        if (filter.collection_id) where += ` AND p.collection_id = ${parseInt(filter.collection_id)}`;
                        if (filter.category_id) where += ` AND p.category_id = ${parseInt(filter.category_id)}`;
                    } catch (e) { /* ignore invalid filter */ }
                }

                section.products = db.prepare(`
                    SELECT p.*, c.name as category_name, pt.name as type_name,
                        (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
                        (SELECT thumbnail_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_thumbnail,
                        (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 0 ORDER BY display_order LIMIT 1) as secondary_image
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN product_types pt ON p.type_id = pt.id
                    WHERE ${where}
                    ORDER BY p.created_at DESC
                    LIMIT ?
                `).all(section.max_products || 10);
            }

            if (section.section_type === 'collections') {
                section.title = section.title || 'OUR COLLECTION';
                section.subtitle = section.subtitle || 'Discover our two core heritage disciplines: Handcrafted Carpets and Egyptian Kilims';
                section.collections = [
                    {
                        id: 1,
                        name: 'CARPETS',
                        slug: 'carpets',
                        subtitle: 'Antique & Handwoven Rugs',
                        image: '/uploads/products/prod_1_0.webp',
                        link_url: '/shop?section=carpets'
                    },
                    {
                        id: 2,
                        name: 'KILIMS',
                        slug: 'kilims',
                        subtitle: 'Authentic Wool & Cotton Kilim',
                        image: '/uploads/products/prod_11_0.webp',
                        link_url: '/shop?section=kilims'
                    }
                ];
            }

            if (section.section_type === 'testimonials') {
                section.testimonials = db.prepare(
                    'SELECT * FROM testimonials WHERE is_active = 1 ORDER BY display_order ASC'
                ).all();
            }
        }

        res.json({ sections });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to fetch site content' });
    }
});

// PUBLIC — get settings
router.get('/settings', (req, res) => {
    try {
        const db = getDb();
        const rows = db.prepare('SELECT setting_key, setting_value FROM site_settings').all();
        const settings = {};
        for (const row of rows) {
            settings[row.setting_key] = row.setting_value;
        }
        res.json({ settings });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// PUBLIC — get navigation
router.get('/navigation', (req, res) => {
    try {
        const db = getDb();
        const items = db.prepare(
            'SELECT * FROM navigation_items WHERE is_active = 1 ORDER BY display_order ASC'
        ).all();
        res.json({ navigation: items });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch navigation' });
    }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const heroUploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
const heroStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isVideo = file.mimetype.startsWith('video/');
        const subDir = isVideo ? 'videos' : 'hero';
        const dest = path.join(heroUploadDir, subDir);
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
        cb(null, safeName);
    }
});

const uploadHero = multer({
    storage: heroStorage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    },
    fileFilter: (req, file, cb) => {
        const allowed = [
            'image/jpeg', 'image/png', 'image/webp', 'image/avif',
            'video/mp4', 'video/webm', 'video/ogg'
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG, WEBP, AVIF images and MP4, WEBM videos are allowed.'));
        }
    }
});

// ===== ADMIN =====

// Dedicated Hero Section API
router.get('/admin/hero', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const hero = db.prepare("SELECT * FROM homepage_sections WHERE section_key = 'hero' OR section_type = 'hero' LIMIT 1").get();
        if (!hero) return res.status(404).json({ error: 'Hero section not found' });
        res.json({ hero });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch hero section' });
    }
});

router.put('/admin/hero', requireAdmin, uploadHero.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const db = getDb();
        const existing = db.prepare("SELECT * FROM homepage_sections WHERE section_key = 'hero' OR section_type = 'hero' LIMIT 1").get();
        if (!existing) return res.status(404).json({ error: 'Hero section not found' });

        const data = req.body;
        let imagePath = existing.image;
        let videoPath = existing.video;

        if (req.files?.image?.[0]) {
            imagePath = `/uploads/hero/${req.files.image[0].filename}`;
        } else if (data.remove_image === 'true' || data.image === '') {
            imagePath = null;
        } else if (data.image !== undefined) {
            imagePath = data.image || null;
        }

        if (req.files?.video?.[0]) {
            videoPath = `/uploads/videos/${req.files.video[0].filename}`;
        } else if (data.remove_video === 'true' || data.video === '') {
            videoPath = null;
        } else if (data.video !== undefined) {
            videoPath = data.video || null;
        }

        // Parse & merge metadata (overlay_opacity, show_video)
        let meta = {};
        try {
            meta = existing.metadata ? JSON.parse(existing.metadata) : {};
        } catch (e) { meta = {}; }

        if (data.metadata) {
            try {
                const parsed = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
                meta = { ...meta, ...parsed };
            } catch (e) {}
        }
        if (data.overlay_opacity !== undefined) {
            meta.overlay_opacity = parseFloat(data.overlay_opacity);
        }
        if (data.show_video !== undefined) {
            meta.show_video = (data.show_video === 'true' || data.show_video === true || data.show_video === '1' || data.show_video === 1);
        }

        db.prepare(`
            UPDATE homepage_sections SET
                title = ?,
                subtitle = ?,
                image = ?,
                video = ?,
                link_text = ?,
                link_url = ?,
                metadata = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `).run(
            data.title !== undefined ? data.title : existing.title,
            data.subtitle !== undefined ? data.subtitle : existing.subtitle,
            imagePath,
            videoPath,
            data.link_text !== undefined ? data.link_text : existing.link_text,
            data.link_url !== undefined ? data.link_url : existing.link_url,
            JSON.stringify(meta),
            existing.id
        );

        const updated = db.prepare('SELECT * FROM homepage_sections WHERE id = ?').get(existing.id);
        res.json({ success: true, hero: updated, message: 'Hero section updated successfully' });
    } catch (err) {
        console.error('Error updating hero:', err);
        res.status(500).json({ error: err.message || 'Failed to update hero section' });
    }
});

// Homepage sections CRUD
router.get('/admin/sections', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        res.json({ sections: db.prepare('SELECT * FROM homepage_sections ORDER BY display_order ASC').all() });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch sections' }); }
});

router.put('/admin/sections/:id', requireAdmin, uploadHero.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const existing = db.prepare('SELECT * FROM homepage_sections WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Section not found' });

        const data = req.body;
        let imagePath = existing.image;
        let videoPath = existing.video;

        if (req.files?.image?.[0]) {
            imagePath = `/uploads/hero/${req.files.image[0].filename}`;
        } else if (data.remove_image === 'true' || data.image === '') {
            imagePath = null;
        } else if (data.image !== undefined) {
            imagePath = data.image || null;
        }

        if (req.files?.video?.[0]) {
            videoPath = `/uploads/videos/${req.files.video[0].filename}`;
        } else if (data.remove_video === 'true' || data.video === '') {
            videoPath = null;
        } else if (data.video !== undefined) {
            videoPath = data.video || null;
        }

        let meta = existing.metadata;
        if (data.metadata || data.overlay_opacity !== undefined || data.show_video !== undefined) {
            let m = {};
            try { m = existing.metadata ? JSON.parse(existing.metadata) : {}; } catch (e) {}
            if (data.metadata) {
                try {
                    const parsed = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
                    m = { ...m, ...parsed };
                } catch (e) {}
            }
            if (data.overlay_opacity !== undefined) m.overlay_opacity = parseFloat(data.overlay_opacity);
            if (data.show_video !== undefined) m.show_video = (data.show_video === 'true' || data.show_video === true || data.show_video === '1' || data.show_video === 1);
            meta = JSON.stringify(m);
        }

        db.prepare(`
            UPDATE homepage_sections SET title=?, subtitle=?, content=?, image=?, video=?,
            link_text=?, link_url=?, product_source=?, product_filter=?, max_products=?,
            display_order=?, is_active=?, metadata=?, updated_at=datetime('now') WHERE id=?
        `).run(
            data.title !== undefined ? data.title : existing.title,
            data.subtitle !== undefined ? data.subtitle : existing.subtitle,
            data.content !== undefined ? data.content : existing.content,
            imagePath,
            videoPath,
            data.link_text !== undefined ? data.link_text : existing.link_text,
            data.link_url !== undefined ? data.link_url : existing.link_url,
            data.product_source !== undefined ? data.product_source : existing.product_source,
            data.product_filter !== undefined ? data.product_filter : existing.product_filter,
            data.max_products !== undefined ? parseInt(data.max_products) : existing.max_products,
            data.display_order !== undefined ? parseInt(data.display_order) : existing.display_order,
            data.is_active !== undefined ? (data.is_active === 'true' || data.is_active === true ? 1 : 0) : existing.is_active,
            meta,
            id
        );

        const updated = db.prepare('SELECT * FROM homepage_sections WHERE id = ?').get(id);
        res.json({ success: true, section: updated });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to update section' });
    }
});

// Settings CRUD
router.get('/admin/settings', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        res.json({ settings: db.prepare('SELECT * FROM site_settings ORDER BY setting_key ASC').all() });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch settings' }); }
});

router.put('/admin/settings', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const { settings } = req.body;
        if (!settings || typeof settings !== 'object') return res.status(400).json({ error: 'Settings object required' });

        if (settings.shipping_cost !== undefined) {
            const cost = parseFloat(settings.shipping_cost);
            if (isNaN(cost) || cost < 0) {
                return res.status(400).json({ error: 'Shipping cost must be a valid non-negative number' });
            }
        }

        const checkStmt = db.prepare("SELECT id FROM site_settings WHERE setting_key = ?");
        const updateStmt = db.prepare("UPDATE site_settings SET setting_value = ?, updated_at = datetime('now') WHERE setting_key = ?");
        const insertStmt = db.prepare("INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES (?, ?, 'text')");

        for (const [key, value] of Object.entries(settings)) {
            const existing = checkStmt.get(key);
            if (existing) {
                updateStmt.run(String(value), key);
            } else {
                insertStmt.run(key, String(value));
            }
        }
        res.json({ success: true, message: 'Settings saved successfully' });
    } catch (err) { 
        console.error('Failed to update settings:', err);
        res.status(500).json({ error: 'Failed to update settings' }); 
    }
});

// Navigation CRUD
router.get('/admin/navigation', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        res.json({ navigation: db.prepare('SELECT * FROM navigation_items ORDER BY location ASC, display_order ASC').all() });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch navigation' }); }
});

router.post('/admin/navigation', requireAdmin, (req, res) => {
    try {
        const { label, url, location, open_in_new_tab } = req.body;
        if (!label || !url) return res.status(400).json({ error: 'Label and URL are required' });
        const db = getDb();
        const maxOrder = db.prepare('SELECT MAX(display_order) as m FROM navigation_items WHERE location = ?').get(location || 'main').m || 0;
        const result = db.prepare(
            'INSERT INTO navigation_items (label, url, display_order, location, open_in_new_tab) VALUES (?, ?, ?, ?, ?)'
        ).run(label, url, maxOrder + 1, location || 'main', open_in_new_tab ? 1 : 0);
        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(500).json({ error: 'Failed to create nav item' }); }
});

router.put('/admin/navigation/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { label, url, display_order, is_active, location, open_in_new_tab } = req.body;
        const db = getDb();
        const existing = db.prepare('SELECT * FROM navigation_items WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Nav item not found' });

        db.prepare(`
            UPDATE navigation_items SET label=?, url=?, display_order=?, is_active=?, location=?, open_in_new_tab=? WHERE id=?
        `).run(
            label || existing.label, url || existing.url,
            display_order !== undefined ? parseInt(display_order) : existing.display_order,
            is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
            location || existing.location,
            open_in_new_tab !== undefined ? (open_in_new_tab ? 1 : 0) : existing.open_in_new_tab,
            id
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to update nav item' }); }
});

router.delete('/admin/navigation/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const nav = db.prepare('SELECT * FROM navigation_items WHERE id = ?').get(id);
        if (!nav) return res.status(404).json({ error: 'Navigation item not found' });

        db.prepare('DELETE FROM navigation_items WHERE id = ?').run(id);

        res.json({ success: true, message: `Navigation item "${nav.title}" deleted successfully` });
    } catch (err) { res.status(500).json({ error: 'Failed to delete nav item' }); }
});

// Testimonials
router.get('/admin/testimonials', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        res.json({ testimonials: db.prepare('SELECT * FROM testimonials ORDER BY display_order ASC').all() });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch testimonials' }); }
});

router.post('/admin/testimonials', requireAdmin, (req, res) => {
    try {
        const { author_name, author_title, content, rating } = req.body;
        if (!author_name || !content) return res.status(400).json({ error: 'Author name and content required' });
        const db = getDb();
        const maxOrder = db.prepare('SELECT MAX(display_order) as m FROM testimonials').get().m || 0;
        const result = db.prepare(
            'INSERT INTO testimonials (author_name, author_title, content, rating, display_order) VALUES (?, ?, ?, ?, ?)'
        ).run(author_name, author_title || null, content, parseInt(rating) || 5, maxOrder + 1);
        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(500).json({ error: 'Failed to create testimonial' }); }
});

router.put('/admin/testimonials/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Not found' });
        const { author_name, author_title, content, rating, display_order, is_active } = req.body;
        db.prepare(`UPDATE testimonials SET author_name=?, author_title=?, content=?, rating=?, display_order=?, is_active=? WHERE id=?`)
            .run(author_name || existing.author_name, author_title !== undefined ? author_title : existing.author_title,
                content || existing.content, rating !== undefined ? parseInt(rating) : existing.rating,
                display_order !== undefined ? parseInt(display_order) : existing.display_order,
                is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active, id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to update testimonial' }); }
});

router.delete('/admin/testimonials/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const item = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
        if (!item) return res.status(404).json({ error: 'Testimonial not found' });

        db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);

        res.json({ success: true, message: `Testimonial from "${item.author_name}" deleted successfully` });
    } catch (err) { res.status(500).json({ error: 'Failed to delete testimonial' }); }
});

// Newsletter
router.post('/newsletter', (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !require('validator').isEmail(email)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }
        const db = getDb();
        const existing = db.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?').get(email);
        if (existing) return res.json({ success: true, message: 'Already subscribed' });
        db.prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)').run(email);
        res.json({ success: true, message: 'Successfully subscribed' });
    } catch (err) { res.status(500).json({ error: 'Failed to subscribe' }); }
});

router.get('/admin/newsletter', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        res.json({ subscribers: db.prepare('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC').all() });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch subscribers' }); }
});

// ============================================================
// CUSTOMER REVIEWS (WHY YADAWY & ADMIN MODERATION)
// ============================================================
const reviewSubmissionRates = new Map();
function isReviewRateLimited(ip) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxSubmissions = 5;
    const timestamps = (reviewSubmissionRates.get(ip) || []).filter(t => now - t < windowMs);
    if (timestamps.length >= maxSubmissions) {
        return true;
    }
    timestamps.push(now);
    reviewSubmissionRates.set(ip, timestamps);
    return false;
}

// PUBLIC — GET approved customer reviews (customer emails are excluded!)
router.get('/reviews', (req, res) => {
    try {
        const db = getDb();
        const returnAll = req.query.all === 'true';
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 4));
        const offset = (page - 1) * limit;

        const totalRow = db.prepare("SELECT COUNT(*) as c FROM customer_reviews WHERE status = 'approved'").get();
        const total = totalRow ? totalRow.c : 0;

        let reviews;
        if (returnAll) {
            reviews = db.prepare(`
                SELECT id, customer_name, rating, review_text, language, is_demo, created_at
                FROM customer_reviews
                WHERE status = 'approved'
                ORDER BY id DESC
            `).all();
        } else {
            reviews = db.prepare(`
                SELECT id, customer_name, rating, review_text, language, is_demo, created_at
                FROM customer_reviews
                WHERE status = 'approved'
                ORDER BY id DESC
                LIMIT ? OFFSET ?
            `).all(limit, offset);
        }

        const hasMore = returnAll ? false : ((offset + reviews.length) < total);

        res.json({
            reviews,
            total,
            page,
            limit,
            hasMore
        });
    } catch (err) {
        console.error('Error fetching public reviews:', err);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// PUBLIC — POST a new customer review (sets status to pending)
router.post('/reviews', (req, res) => {
    try {
        const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
        if (isReviewRateLimited(clientIp)) {
            return res.status(429).json({
                error: req.body.language === 'en'
                    ? 'Too many review submissions. Please wait a few minutes before trying again.'
                    : 'لقد قمت بإرسال عدة تقييمات مؤخراً. يرجى الانتظار بضع دقائق والمحاولة مرة أخرى.'
            });
        }

        const validator = require('validator');
        let { customer_name, customer_email, rating, review_text, language } = req.body;

        // Customer Name must be First and Last Name in English
        const nameEnglishRegex = /^[a-zA-Z]+(?:[\s'-][a-zA-Z]+)+$/;
        if (!customer_name || typeof customer_name !== 'string' || !nameEnglishRegex.test(customer_name.trim())) {
            return res.status(400).json({
                error: language === 'en'
                    ? 'Please provide your first and last name in English (e.g. Mariam Ahmed).'
                    : 'يرجى إدخال اسمك الأول واسم العائلة باللغة الإنجليزية (مثال: Mariam Ahmed).'
            });
        }
        if (!customer_email || typeof customer_email !== 'string' || !validator.isEmail(customer_email.trim())) {
            return res.status(400).json({
                error: language === 'en' ? 'Please provide a valid email address.' : 'يرجى إدخال بريد إلكتروني صحيح.'
            });
        }
        const intRating = parseInt(rating);
        if (isNaN(intRating) || intRating < 1 || intRating > 5) {
            return res.status(400).json({
                error: language === 'en' ? 'Rating must be between 1 and 5 stars.' : 'يرجى اختيار التقييم من نجمة واحدة إلى 5 نجوم.'
            });
        }
        if (!review_text || typeof review_text !== 'string' || review_text.trim().length < 5) {
            return res.status(400).json({
                error: language === 'en' ? 'Review text must be at least 5 characters.' : 'يرجى كتابة رأيك وتجربتك بالتفصيل (5 أحرف على الأقل).'
            });
        }

        // Clean & sanitize text
        const cleanName = customer_name.trim().slice(0, 100);
        const cleanEmail = customer_email.trim().toLowerCase().slice(0, 150);
        const cleanText = review_text.trim().slice(0, 1500);
        const cleanLang = (language === 'en') ? 'en' : 'ar';

        const db = getDb();

        // Prevent rapid duplicate resubmissions
        const recentDuplicate = db.prepare(`
            SELECT id FROM customer_reviews
            WHERE customer_email = ? AND review_text = ? AND created_at >= datetime('now', '-1 hour')
        `).get(cleanEmail, cleanText);

        if (recentDuplicate) {
            return res.json({
                success: true,
                message: cleanLang === 'en'
                    ? 'Thank you for sharing your feedback! Your review will appear after approval.'
                    : 'شكرًا ليك على تقييمك ❤️ رأيك مهم عندنا، وهيظهر بعد ما فريق يدوي يراجعه.'
            });
        }

        const stmt = db.prepare(`
            INSERT INTO customer_reviews (customer_name, customer_email, rating, review_text, language, status, is_demo)
            VALUES (?, ?, ?, ?, ?, 'pending', 0)
        `);
        const result = stmt.run(cleanName, cleanEmail, intRating, cleanText, cleanLang);

        res.status(201).json({
            success: true,
            id: result.lastInsertRowid,
            message: cleanLang === 'en'
                ? 'Thank you for sharing your feedback! Your review will appear after approval.'
                : 'شكرًا ليك على تقييمك ❤️ رأيك مهم عندنا، وهيظهر بعد ما فريق يدوي يراجعه.'
        });
    } catch (err) {
        console.error('Error submitting review:', err);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

// ADMIN — GET all customer reviews with counts, filtering & search
router.get('/admin/reviews', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const { status, search, sort } = req.query;

        const counts = {
            all: db.prepare("SELECT COUNT(*) as c FROM customer_reviews").get().c,
            pending: db.prepare("SELECT COUNT(*) as c FROM customer_reviews WHERE status = 'pending'").get().c,
            approved: db.prepare("SELECT COUNT(*) as c FROM customer_reviews WHERE status = 'approved'").get().c,
            hidden: db.prepare("SELECT COUNT(*) as c FROM customer_reviews WHERE status = 'hidden'").get().c,
            rejected: db.prepare("SELECT COUNT(*) as c FROM customer_reviews WHERE status = 'rejected'").get().c
        };

        let sql = "SELECT * FROM customer_reviews WHERE 1=1";
        const params = [];

        if (status && ['pending', 'approved', 'hidden', 'rejected'].includes(status)) {
            sql += " AND status = ?";
            params.push(status);
        }

        if (search && search.trim()) {
            sql += " AND (customer_name LIKE ? OR customer_email LIKE ? OR review_text LIKE ?)";
            const s = `%${search.trim()}%`;
            params.push(s, s, s);
        }

        if (sort === 'oldest') {
            sql += " ORDER BY id ASC";
        } else if (sort === 'rating_high') {
            sql += " ORDER BY rating DESC, id DESC";
        } else if (sort === 'rating_low') {
            sql += " ORDER BY rating ASC, id DESC";
        } else {
            sql += " ORDER BY id DESC";
        }

        const reviews = db.prepare(sql).all(...params);
        res.json({ reviews, counts });
    } catch (err) {
        console.error('Error fetching admin reviews:', err);
        res.status(500).json({ error: 'Failed to fetch customer reviews' });
    }
});

// ADMIN — PATCH review status (approve, hide, reject, pending)
router.patch('/admin/reviews/:id/status', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        if (!['approved', 'hidden', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid review status' });
        }

        const db = getDb();
        const review = db.prepare("SELECT * FROM customer_reviews WHERE id = ?").get(id);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        db.prepare("UPDATE customer_reviews SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
        const updated = db.prepare("SELECT * FROM customer_reviews WHERE id = ?").get(id);

        res.json({ success: true, review: updated, message: `Review status updated to ${status}` });
    } catch (err) {
        console.error('Error updating review status:', err);
        res.status(500).json({ error: 'Failed to update review status' });
    }
});

// ADMIN — DELETE a review permanently
router.delete('/admin/reviews/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const review = db.prepare("SELECT * FROM customer_reviews WHERE id = ?").get(id);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        db.prepare("DELETE FROM customer_reviews WHERE id = ?").run(id);
        res.json({ success: true, message: `Review #${id} from "${review.customer_name}" was permanently deleted` });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

module.exports = router;
