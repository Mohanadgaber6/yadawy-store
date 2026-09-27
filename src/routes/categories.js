const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { sanitize, createSlug } = require('../middleware/validation');
const { uploadImages, processImage, deleteUploadedFile, setUploadDir, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// ===== PUBLIC =====
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const { section } = req.query;
        let query = `
            SELECT c.*, s.name as section_name, s.slug as section_slug 
            FROM categories c 
            LEFT JOIN sections s ON c.section_id = s.id 
            WHERE c.is_active = 1
        `;
        const params = [];
        if (section) {
            query += ' AND (s.slug = ? OR s.id = ?)';
            params.push(section, isNaN(section) ? -1 : parseInt(section));
        }
        query += ' ORDER BY c.display_order ASC';
        const items = db.prepare(query).all(...params);
        res.json({ categories: items });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

router.get('/sections/all', (req, res) => {
    try {
        const db = getDb();
        const sections = db.prepare('SELECT * FROM sections WHERE is_active = 1 ORDER BY display_order ASC').all();
        const categories = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC').all();
        
        const result = sections.map(s => ({
            ...s,
            categories: categories.filter(c => c.section_id === s.id)
        }));
        
        res.json({ sections: result });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sections' });
    }
});

router.get('/:slug', (req, res) => {
    try {
        const db = getDb();
        const category = db.prepare(`
            SELECT c.*, s.name as section_name, s.slug as section_slug 
            FROM categories c 
            LEFT JOIN sections s ON c.section_id = s.id 
            WHERE c.slug = ? AND c.is_active = 1
        `).get(req.params.slug);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json({ category });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// ===== ADMIN =====
router.get('/admin/list', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const items = db.prepare(`
            SELECT c.*, s.name as section_name, s.slug as section_slug,
                   (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
            FROM categories c 
            LEFT JOIN sections s ON c.section_id = s.id
            ORDER BY s.display_order ASC, c.display_order ASC
        `).all();
        res.json({ categories: items });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

router.post('/admin', requireAdmin, setUploadDir('categories'), uploadImages.single('image'), handleUploadError, async (req, res) => {
    try {
        const { name, description, seo_title, seo_description, section_id } = req.body;
        if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Name is required' });

        const db = getDb();
        const slug = createSlug(name);
        const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
        if (existing) return res.status(400).json({ error: 'Category with this name already exists' });

        let imagePath = null;
        if (req.file) {
            const processed = await processImage(req.file.path, 'categories');
            imagePath = processed.imagePath;
        }

        const maxOrder = db.prepare('SELECT MAX(display_order) as m FROM categories').get().m || 0;
        const result = db.prepare(`
            INSERT INTO categories (name, slug, description, image, display_order, seo_title, seo_description, section_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            sanitize(name),
            slug,
            description || null,
            imagePath,
            maxOrder + 1,
            seo_title || null,
            seo_description || null,
            section_id ? parseInt(section_id) : 1
        );

        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

router.put('/admin/:id', requireAdmin, setUploadDir('categories'), uploadImages.single('image'), handleUploadError, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Category not found' });

        const { name, description, display_order, is_active, seo_title, seo_description, section_id } = req.body;

        let imagePath = existing.image;
        if (req.file) {
            if (existing.image) deleteUploadedFile(existing.image);
            const processed = await processImage(req.file.path, 'categories');
            imagePath = processed.imagePath;
        }

        const slug = name ? createSlug(name) : existing.slug;

        db.prepare(`
            UPDATE categories SET name=?, slug=?, description=?, image=?, display_order=?,
            is_active=?, seo_title=?, seo_description=?, section_id=?, updated_at=datetime('now') WHERE id=?
        `).run(
            sanitize(name || existing.name), slug,
            description !== undefined ? description : existing.description,
            imagePath,
            display_order !== undefined ? parseInt(display_order) : existing.display_order,
            is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
            seo_title !== undefined ? seo_title : existing.seo_title,
            seo_description !== undefined ? seo_description : existing.seo_description,
            section_id !== undefined ? (section_id ? parseInt(section_id) : null) : existing.section_id,
            id
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

router.delete('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
        if (!cat) return res.status(404).json({ error: 'Category not found' });
        if (cat.image) deleteUploadedFile(cat.image);
        db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(id);
        db.prepare('DELETE FROM categories WHERE id = ?').run(id);

        res.json({ success: true, message: `Category "${cat.name}" deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

module.exports = router;
