const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { uploadImages, processImage, deleteUploadedFile, setUploadDir, handleUploadError } = require('../middleware/upload');
const { sanitize, sanitizeRichText, createSlug, validateProduct, validatePagination } = require('../middleware/validation');
const path = require('path');

const router = express.Router();

// ===== PUBLIC ROUTES =====

// GET /api/products — list products with filtering, sorting, pagination
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const { page, limit, offset } = validatePagination(req.query);

        let where = ['p.status = ?'];
        let params = ['active'];

        // Search
        if (req.query.search) {
            where.push('(p.name LIKE ? OR p.short_description LIKE ? OR p.material LIKE ?)');
            const term = `%${req.query.search}%`;
            params.push(term, term, term);
        }

        // Section filter
        if (req.query.section) {
            where.push('(s.slug = ? OR s.id = ?)');
            params.push(req.query.section, isNaN(req.query.section) ? -1 : parseInt(req.query.section));
        }

        // Category filter
        if (req.query.category) {
            where.push('c.slug = ?');
            params.push(req.query.category);
        }

        // Collection filter
        if (req.query.collection) {
            where.push('col.slug = ?');
            params.push(req.query.collection);
        }

        // Type filter
        if (req.query.type) {
            where.push('pt.slug = ?');
            params.push(req.query.type);
        }

        // Price range
        if (req.query.min_price) {
            where.push('COALESCE(p.sale_price, p.price) >= ?');
            params.push(parseFloat(req.query.min_price));
        }
        if (req.query.max_price) {
            where.push('COALESCE(p.sale_price, p.price) <= ?');
            params.push(parseFloat(req.query.max_price));
        }

        // Featured
        if (req.query.featured === '1') {
            where.push('p.is_featured = 1');
        }

        // Best sellers
        if (req.query.best_seller === '1') {
            where.push('p.is_best_seller = 1');
        }

        // New arrivals
        if (req.query.new_arrival === '1') {
            where.push('p.is_new_arrival = 1');
        }

        // On sale
        if (req.query.on_sale === '1') {
            where.push('p.is_on_sale = 1 AND p.sale_price IS NOT NULL');
        }

        // In stock / Stock Status filter
        if (req.query.stock_status === 'in_stock' || req.query.in_stock === '1') {
            where.push('p.is_in_stock = 1');
        } else if (req.query.stock_status === 'out_of_stock' || req.query.in_stock === '0') {
            where.push('p.is_in_stock = 0');
        }

        const whereClause = where.join(' AND ');

        // Sorting
        let orderBy = 'p.created_at DESC';
        switch (req.query.sort) {
            case 'price_asc': orderBy = 'COALESCE(p.sale_price, p.price) ASC'; break;
            case 'price_desc': orderBy = 'COALESCE(p.sale_price, p.price) DESC'; break;
            case 'name_asc': orderBy = 'p.name ASC'; break;
            case 'name_desc': orderBy = 'p.name DESC'; break;
            case 'newest': orderBy = 'p.created_at DESC'; break;
            case 'oldest': orderBy = 'p.created_at ASC'; break;
            case 'best_seller': orderBy = 'p.is_best_seller DESC, p.created_at DESC'; break;
        }

        // Count total
        const countSql = `
            SELECT COUNT(*) as total FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN sections s ON (c.section_id = s.id OR p.section_id = s.id)
            LEFT JOIN collections col ON p.collection_id = col.id
            LEFT JOIN product_types pt ON p.type_id = pt.id
            WHERE ${whereClause}
        `;
        const { total } = db.prepare(countSql).get(...params);

        // Get products
        const sql = `
            SELECT p.*,
                c.name as category_name, c.slug as category_slug,
                s.name as section_name, s.slug as section_slug,
                col.name as collection_name, col.slug as collection_slug,
                pt.name as type_name, pt.slug as type_slug,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
                (SELECT thumbnail_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_thumbnail,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 0 ORDER BY display_order LIMIT 1) as secondary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN sections s ON (c.section_id = s.id OR p.section_id = s.id)
            LEFT JOIN collections col ON p.collection_id = col.id
            LEFT JOIN product_types pt ON p.type_id = pt.id
            WHERE ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;

        const products = db.prepare(sql).all(...params, limit, offset);

        res.json({
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/featured — get featured products
router.get('/featured', (req, res) => {
    try {
        const db = getDb();
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const products = db.prepare(`
            SELECT p.*,
                c.name as category_name, pt.name as type_name,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
                (SELECT thumbnail_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_thumbnail,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 0 ORDER BY display_order LIMIT 1) as secondary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_types pt ON p.type_id = pt.id
            WHERE p.status = 'active' AND p.is_featured = 1
            ORDER BY p.created_at DESC
            LIMIT ?
        `).all(limit);

        res.json({ products });
    } catch (err) {
        console.error('Error fetching featured products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/best-sellers
router.get('/best-sellers', (req, res) => {
    try {
        const db = getDb();
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const products = db.prepare(`
            SELECT p.*,
                c.name as category_name, pt.name as type_name,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
                (SELECT thumbnail_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_thumbnail,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 0 ORDER BY display_order LIMIT 1) as secondary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_types pt ON p.type_id = pt.id
            WHERE p.status = 'active' AND p.is_best_seller = 1
            ORDER BY p.created_at DESC
            LIMIT ?
        `).all(limit);

        res.json({ products });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/new-arrivals
router.get('/new-arrivals', (req, res) => {
    try {
        const db = getDb();
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const products = db.prepare(`
            SELECT p.*,
                c.name as category_name, pt.name as type_name,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
                (SELECT thumbnail_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_thumbnail,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 0 ORDER BY display_order LIMIT 1) as secondary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_types pt ON p.type_id = pt.id
            WHERE p.status = 'active' AND p.is_new_arrival = 1
            ORDER BY p.created_at DESC
            LIMIT ?
        `).all(limit);

        res.json({ products });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/:slug — single product detail
router.get('/:slug', (req, res) => {
    try {
        const db = getDb();
        const product = db.prepare(`
            SELECT p.*,
                c.name as category_name, c.slug as category_slug,
                s.name as section_name, s.slug as section_slug,
                col.name as collection_name, col.slug as collection_slug,
                pt.name as type_name, pt.slug as type_slug,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN sections s ON (c.section_id = s.id OR p.section_id = s.id)
            LEFT JOIN collections col ON p.collection_id = col.id
            LEFT JOIN product_types pt ON p.type_id = pt.id
            WHERE p.slug = ? AND p.status = 'active'
        `).get(req.params.slug);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Get images
        product.images = db.prepare(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC'
        ).all(product.id);

        // Get videos
        product.videos = db.prepare(
            'SELECT * FROM product_videos WHERE product_id = ? ORDER BY display_order ASC'
        ).all(product.id);

        // Get sizes
        product.sizes = db.prepare(`
            SELECT id, product_id, size_name, price, price_adjustment, is_in_stock, inventory_qty, is_available, display_order
            FROM product_sizes
            WHERE product_id = ?
            ORDER BY display_order ASC, id ASC
        `).all(product.id);

        // Get related products
        const related = db.prepare(`
            SELECT p.*,
                c.name as category_name, pt.name as type_name,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
                (SELECT thumbnail_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_thumbnail,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 0 ORDER BY display_order LIMIT 1) as secondary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_types pt ON p.type_id = pt.id
            WHERE p.status = 'active' AND p.id != ?
            AND (p.category_id = ? OR p.collection_id = ? OR p.type_id = ?)
            ORDER BY RANDOM()
            LIMIT 8
        `).all(product.id, product.category_id, product.collection_id, product.type_id);

        product.related_products = related;

        res.json({ product });
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});


// ===== ADMIN ROUTES =====

// GET /api/admin/products — list all products (including disabled)
router.get('/admin/list', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const { page, limit, offset } = validatePagination(req.query);

        let where = ['1=1'];
        let params = [];

        if (req.query.status) {
            where.push('p.status = ?');
            params.push(req.query.status);
        }

        if (req.query.stock_status === 'in_stock') {
            where.push('p.is_in_stock = 1');
        } else if (req.query.stock_status === 'out_of_stock') {
            where.push('p.is_in_stock = 0');
        }

        if (req.query.search) {
            where.push('(p.name LIKE ? OR p.sku LIKE ? OR p.material LIKE ?)');
            const term = `%${req.query.search}%`;
            params.push(term, term, term);
        }

        // Section filter
        if (req.query.section) {
            where.push('(s.slug = ? OR s.id = ? OR p.section_id = ?)');
            const sVal = isNaN(req.query.section) ? -1 : parseInt(req.query.section);
            params.push(req.query.section, sVal, sVal);
        }

        // Category filter
        if (req.query.category) {
            where.push('(c.slug = ? OR c.id = ?)');
            const cVal = isNaN(req.query.category) ? -1 : parseInt(req.query.category);
            params.push(req.query.category, cVal);
        }

        if (req.query.category_id) {
            where.push('p.category_id = ?');
            params.push(parseInt(req.query.category_id));
        }

        if (req.query.collection_id) {
            where.push('p.collection_id = ?');
            params.push(parseInt(req.query.collection_id));
        }

        const whereClause = where.join(' AND ');

        // Dynamic Sorting
        let orderBy = 'p.created_at DESC';
        switch (req.query.sort) {
            case 'price_asc': orderBy = 'COALESCE(p.sale_price, p.price) ASC'; break;
            case 'price_desc': orderBy = 'COALESCE(p.sale_price, p.price) DESC'; break;
            case 'name_asc': orderBy = 'p.name ASC'; break;
            case 'name_desc': orderBy = 'p.name DESC'; break;
            case 'newest': orderBy = 'p.created_at DESC'; break;
            case 'oldest': orderBy = 'p.created_at ASC'; break;
            case 'best_seller': orderBy = 'p.is_best_seller DESC, p.created_at DESC'; break;
            default: orderBy = 'p.created_at DESC'; break;
        }

        const countSql = `
            SELECT COUNT(*) as total FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN sections s ON (c.section_id = s.id OR p.section_id = s.id)
            LEFT JOIN collections col ON p.collection_id = col.id
            LEFT JOIN product_types pt ON p.type_id = pt.id
            WHERE ${whereClause}
        `;
        const { total } = db.prepare(countSql).get(...params);

        const products = db.prepare(`
            SELECT p.*,
                c.name as category_name,
                s.name as section_name, s.slug as section_slug,
                col.name as collection_name,
                pt.name as type_name,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
                (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count,
                (SELECT COUNT(*) FROM product_sizes WHERE product_id = p.id) as size_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN sections s ON (c.section_id = s.id OR p.section_id = s.id)
            LEFT JOIN collections col ON p.collection_id = col.id
            LEFT JOIN product_types pt ON p.type_id = pt.id
            WHERE ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `).all(...params, limit, offset);

        res.json({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/admin/products/:id
router.get('/admin/:id', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

        const product = db.prepare(`
            SELECT p.*,
                c.name as category_name,
                col.name as collection_name,
                pt.name as type_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN collections col ON p.collection_id = col.id
            LEFT JOIN product_types pt ON p.type_id = pt.id
            WHERE p.id = ?
        `).get(id);

        if (!product) return res.status(404).json({ error: 'Product not found' });

        product.images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC').all(id);
        product.videos = db.prepare('SELECT * FROM product_videos WHERE product_id = ? ORDER BY display_order ASC').all(id);
        product.sizes = db.prepare(`
            SELECT id, product_id, size_name, price, price_adjustment, is_in_stock, inventory_qty, is_available, display_order
            FROM product_sizes
            WHERE product_id = ?
            ORDER BY display_order ASC, id ASC
        `).all(id);

        res.json({ product });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST /api/admin/products — create product
router.post('/admin', requireAdmin, (req, res) => {
    try {
        const errors = validateProduct(req.body);
        if (errors.length > 0) return res.status(400).json({ errors });

        const db = getDb();
        const data = req.body;
        const slug = data.slug || createSlug(data.name);

        // Check slug uniqueness
        const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
        if (existing) {
            return res.status(400).json({ error: 'A product with this name already exists' });
        }

        const inStock = data.is_in_stock !== undefined ? (data.is_in_stock ? 1 : 0) : 1;
        const defaultDesc = 'A modern take on traditional kilim craftsmanship, featuring three rows of geometric motifs in warm red, mustard, and deep blue, set against a soft ivory base.';
        const defaultHandwoven = 'Handwoven with care, each stitch and subtle color variation adds to the unique character of the piece. Finished with hand-tied tassels at both ends.';
        const defaultWhereToPlace = 'Perfect for the living room, beside the bed, or styled as a hallway runner, adding warmth and texture without overpowering the space.';

        const result = db.prepare(`
            INSERT INTO products (name, slug, short_description, full_description, handwoven_details, where_to_place,
                price, sale_price, sku, category_id, collection_id, type_id, section_id, material, color, dimensions, weight,
                inventory_qty, is_in_stock, status, is_featured, is_best_seller, is_new_arrival, is_on_sale,
                care_instructions, shipping_info, specifications, seo_title, seo_description, seo_keywords,
                button_text, custom_link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            sanitize(data.name), slug,
            data.short_description !== undefined && data.short_description !== null ? sanitizeRichText(data.short_description) : defaultDesc,
            data.full_description !== undefined && data.full_description !== null ? sanitizeRichText(data.full_description) : defaultDesc,
            data.handwoven_details !== undefined && data.handwoven_details !== null ? sanitizeRichText(data.handwoven_details) : defaultHandwoven,
            data.where_to_place !== undefined && data.where_to_place !== null ? sanitizeRichText(data.where_to_place) : defaultWhereToPlace,
            parseFloat(data.price),
            data.sale_price ? parseFloat(data.sale_price) : null,
            data.sku || null,
            data.category_id ? parseInt(data.category_id) : null,
            data.collection_id ? parseInt(data.collection_id) : null,
            data.type_id ? parseInt(data.type_id) : null,
            data.section_id ? parseInt(data.section_id) : null,
            data.material || '100% Handspun Egyptian Wool', data.color || null,
            data.dimensions || '1.5 × 5 m', data.weight || null,
            parseInt(data.inventory_qty) || 1,
            inStock,
            data.status || 'active',
            data.is_featured ? 1 : 0,
            data.is_best_seller ? 1 : 0,
            data.is_new_arrival ? 1 : 0,
            data.is_on_sale ? 1 : 0,
            data.care_instructions || null,
            data.shipping_info || null,
            data.specifications || null,
            data.seo_title || null,
            data.seo_description || null,
            data.seo_keywords || null,
            data.button_text ? sanitize(data.button_text) : 'VIEW DETAILS',
            data.custom_link ? sanitize(data.custom_link) : null
        );

        const newId = result.lastInsertRowid;

        // Handle repeatable sizes
        const sizesToInsert = (data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0)
            ? data.sizes
            : [{ size_name: '1.5 × 5 m', price: null, price_adjustment: 0, is_in_stock: 1, inventory_qty: 1, is_available: 1, display_order: 0 }];

        const sizeStmt = db.prepare(`
            INSERT INTO product_sizes (product_id, size_name, price, price_adjustment, is_in_stock, inventory_qty, is_available, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        sizesToInsert.forEach((s, idx) => {
            if (s.size_name && s.size_name.trim()) {
                const sizeInStock = (s.is_in_stock === undefined || s.is_in_stock === null) ? 1 : (s.is_in_stock ? 1 : 0);
                const sizePrice = s.price !== undefined && s.price !== '' && s.price !== null ? parseFloat(s.price) : null;
                const sizeAdj = s.price_adjustment !== undefined && s.price_adjustment !== '' ? parseFloat(s.price_adjustment) : 0;
                sizeStmt.run(
                    newId,
                    s.size_name.trim(),
                    sizePrice,
                    sizeAdj,
                    sizeInStock,
                    sizeInStock,
                    sizeInStock,
                    s.display_order !== undefined ? parseInt(s.display_order) : idx
                );
            }
        });

        // Handle product video
        if (data.video_url && data.video_url.trim()) {
            db.prepare(`
                INSERT INTO product_videos (product_id, video_url, title, display_order, is_featured)
                VALUES (?, ?, ?, 0, 1)
            `).run(newId, data.video_url.trim(), data.video_title || '');
        }

        res.status(201).json({ success: true, id: newId, slug });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT /api/admin/products/:id — update product
router.put('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

        const errors = validateProduct(req.body, true);
        if (errors.length > 0) return res.status(400).json({ errors });

        const db = getDb();
        const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Product not found' });

        const data = req.body;
        const slug = data.slug || (data.name ? createSlug(data.name) : existing.slug);

        // Check slug uniqueness
        const slugConflict = db.prepare('SELECT id FROM products WHERE slug = ? AND id != ?').get(slug, id);
        if (slugConflict) {
            return res.status(400).json({ error: 'A product with this name already exists' });
        }

        db.prepare(`
            UPDATE products SET
                name = ?, slug = ?, short_description = ?, full_description = ?,
                handwoven_details = ?, where_to_place = ?,
                price = ?, sale_price = ?, sku = ?,
                category_id = ?, collection_id = ?, type_id = ?, section_id = ?,
                material = ?, color = ?, dimensions = ?, weight = ?,
                inventory_qty = ?, is_in_stock = ?, status = ?,
                is_featured = ?, is_best_seller = ?, is_new_arrival = ?, is_on_sale = ?,
                care_instructions = ?, shipping_info = ?, specifications = ?,
                seo_title = ?, seo_description = ?, seo_keywords = ?,
                button_text = ?, custom_link = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `).run(
            sanitize(data.name || existing.name), slug,
            data.short_description !== undefined ? sanitizeRichText(data.short_description) : existing.short_description,
            data.full_description !== undefined ? sanitizeRichText(data.full_description) : existing.full_description,
            data.handwoven_details !== undefined ? sanitizeRichText(data.handwoven_details) : existing.handwoven_details,
            data.where_to_place !== undefined ? sanitizeRichText(data.where_to_place) : existing.where_to_place,
            parseFloat(data.price ?? existing.price),
            data.sale_price !== undefined ? (data.sale_price ? parseFloat(data.sale_price) : null) : existing.sale_price,
            data.sku !== undefined ? data.sku : existing.sku,
            data.category_id !== undefined ? (data.category_id ? parseInt(data.category_id) : null) : existing.category_id,
            data.collection_id !== undefined ? (data.collection_id ? parseInt(data.collection_id) : null) : existing.collection_id,
            data.type_id !== undefined ? (data.type_id ? parseInt(data.type_id) : null) : existing.type_id,
            data.section_id !== undefined ? (data.section_id ? parseInt(data.section_id) : null) : existing.section_id,
            data.material !== undefined ? data.material : existing.material,
            data.color !== undefined ? data.color : existing.color,
            data.dimensions !== undefined ? data.dimensions : existing.dimensions,
            data.weight !== undefined ? data.weight : existing.weight,
            data.inventory_qty !== undefined ? parseInt(data.inventory_qty) : existing.inventory_qty,
            data.is_in_stock !== undefined ? (data.is_in_stock ? 1 : 0) : existing.is_in_stock,
            data.status || existing.status,
            data.is_featured !== undefined ? (data.is_featured ? 1 : 0) : existing.is_featured,
            data.is_best_seller !== undefined ? (data.is_best_seller ? 1 : 0) : existing.is_best_seller,
            data.is_new_arrival !== undefined ? (data.is_new_arrival ? 1 : 0) : existing.is_new_arrival,
            data.is_on_sale !== undefined ? (data.is_on_sale ? 1 : 0) : existing.is_on_sale,
            data.care_instructions !== undefined ? data.care_instructions : existing.care_instructions,
            data.shipping_info !== undefined ? data.shipping_info : existing.shipping_info,
            data.specifications !== undefined ? data.specifications : existing.specifications,
            data.seo_title !== undefined ? data.seo_title : existing.seo_title,
            data.seo_description !== undefined ? data.seo_description : existing.seo_description,
            data.seo_keywords !== undefined ? data.seo_keywords : existing.seo_keywords,
            data.button_text !== undefined ? sanitize(data.button_text) : existing.button_text,
            data.custom_link !== undefined ? sanitize(data.custom_link) : existing.custom_link,
            id
        );

        // Update repeatable sizes
        if (data.sizes && Array.isArray(data.sizes)) {
            db.prepare('DELETE FROM product_sizes WHERE product_id = ?').run(id);
            const sizeStmt = db.prepare(`
                INSERT INTO product_sizes (product_id, size_name, price, price_adjustment, is_in_stock, inventory_qty, is_available, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            data.sizes.forEach((s, idx) => {
                if (s.size_name && s.size_name.trim()) {
                    const sizeInStock = (s.is_in_stock === undefined || s.is_in_stock === null) ? 1 : (s.is_in_stock ? 1 : 0);
                    const sizePrice = s.price !== undefined && s.price !== '' && s.price !== null ? parseFloat(s.price) : null;
                    const sizeAdj = s.price_adjustment !== undefined && s.price_adjustment !== '' ? parseFloat(s.price_adjustment) : 0;
                    sizeStmt.run(
                        id,
                        s.size_name.trim(),
                        sizePrice,
                        sizeAdj,
                        sizeInStock,
                        sizeInStock,
                        sizeInStock,
                        s.display_order !== undefined ? parseInt(s.display_order) : idx
                    );
                }
            });
        }

        // Update video if supplied
        if (data.video_url !== undefined) {
            db.prepare('DELETE FROM product_videos WHERE product_id = ?').run(id);
            if (data.video_url && data.video_url.trim()) {
                db.prepare(`
                    INSERT INTO product_videos (product_id, video_url, title, display_order, is_featured)
                    VALUES (?, ?, ?, 0, 1)
                `).run(id, data.video_url.trim(), data.video_title || '');
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// PATCH /api/admin/products/:id/stock — quick toggle stock status
router.patch('/admin/:id/stock', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { is_in_stock } = req.body;
        const stockVal = is_in_stock ? 1 : 0;
        const db = getDb();
        db.prepare("UPDATE products SET is_in_stock = ?, updated_at = datetime('now') WHERE id = ?").run(stockVal, id);
        res.json({ success: true, is_in_stock: stockVal });
    } catch (err) {
        console.error('Error updating stock status:', err);
        res.status(500).json({ error: 'Failed to update stock status' });
    }
});

// PATCH /api/admin/products/:id/status — toggle status
router.patch('/admin/:id/status', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        if (!['active', 'disabled', 'draft'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const db = getDb();
        db.prepare("UPDATE products SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// DELETE /api/admin/products/:id
router.delete('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();

        const product = db.prepare('SELECT id, name, sku, price FROM products WHERE id = ?').get(id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Delete associated images from disk
        const images = db.prepare('SELECT image_path, thumbnail_path FROM product_images WHERE product_id = ?').all(id);
        for (const img of images) {
            if (img.image_path) deleteUploadedFile(img.image_path);
            if (img.thumbnail_path) deleteUploadedFile(img.thumbnail_path);
        }

        db.prepare('DELETE FROM products WHERE id = ?').run(id);

        res.json({ success: true, message: `Product "${product.name}" deleted successfully` });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// POST /api/admin/products/:id/duplicate
router.post('/admin/:id/duplicate', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();

        const p = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        if (!p) return res.status(404).json({ error: 'Product not found' });

        const newName = `${p.name} (Copy)`;
        const baseSlug = `${p.slug}-copy`;
        let newSlug = baseSlug;
        let suffix = 1;
        while (db.prepare('SELECT id FROM products WHERE slug = ?').get(newSlug)) {
            newSlug = `${baseSlug}-${suffix++}`;
        }

        const newSku = p.sku ? `${p.sku}-CPY-${Date.now().toString().slice(-4)}` : null;

        const result = db.prepare(`
            INSERT INTO products (
                name, slug, short_description, full_description, price, sale_price,
                sku, category_id, collection_id, type_id, material, color,
                dimensions, weight, inventory_qty, status, is_featured, is_best_seller,
                is_new_arrival, is_on_sale, care_instructions, shipping_info,
                specifications, seo_title, seo_description, seo_keywords
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            newName, newSlug, p.short_description, p.full_description, p.price, p.sale_price,
            newSku, p.category_id, p.collection_id, p.type_id, p.material, p.color,
            p.dimensions, p.weight, p.inventory_qty, 'draft', 0, 0,
            0, p.is_on_sale, p.care_instructions, p.shipping_info,
            p.specifications, p.seo_title, p.seo_description, p.seo_keywords
        );

        const newId = result.lastInsertRowid;

        // Copy images
        const images = db.prepare('SELECT image_path, thumbnail_path, alt_text, display_order, is_primary FROM product_images WHERE product_id = ?').all(id);
        for (const img of images) {
            db.prepare('INSERT INTO product_images (product_id, image_path, thumbnail_path, alt_text, display_order, is_primary) VALUES (?, ?, ?, ?, ?, ?)').run(
                newId, img.image_path, img.thumbnail_path, img.alt_text, img.display_order, img.is_primary
            );
        }

        // Copy sizes
        const sizes = db.prepare('SELECT size_name, price, price_adjustment, is_in_stock, inventory_qty, is_available, display_order FROM product_sizes WHERE product_id = ?').all(id);
        for (const sz of sizes) {
            db.prepare('INSERT INTO product_sizes (product_id, size_name, price, price_adjustment, is_in_stock, inventory_qty, is_available, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
                newId, sz.size_name, sz.price, sz.price_adjustment, sz.is_in_stock, sz.inventory_qty, sz.is_available, sz.display_order
            );
        }

        res.status(201).json({ success: true, product_id: newId, slug: newSlug });
    } catch (err) {
        console.error('Error duplicating product:', err);
        res.status(500).json({ error: 'Failed to duplicate product' });
    }
});

// ===== IMAGE MANAGEMENT =====

// POST /api/admin/products/:id/images
router.post('/admin/:id/images', requireAdmin, setUploadDir('products'),
    uploadImages.array('images', 20), handleUploadError, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();

        const product = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const existingCount = db.prepare('SELECT COUNT(*) as c FROM product_images WHERE product_id = ?').get(id).c;
        const results = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const processed = await processImage(file.path, 'products');

            const isPrimary = existingCount === 0 && i === 0 ? 1 : 0;
            const order = existingCount + i;

            const result = db.prepare(`
                INSERT INTO product_images (product_id, image_path, thumbnail_path, alt_text, display_order, is_primary)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(id, processed.imagePath, processed.thumbnailPath, req.body.alt_text || '', order, isPrimary);

            results.push({ id: result.lastInsertRowid, ...processed, is_primary: isPrimary });
        }

        db.prepare("UPDATE products SET updated_at = datetime('now') WHERE id = ?").run(id);
        res.json({ success: true, images: results });
    } catch (err) {
        console.error('Error uploading images:', err);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

// PUT /api/admin/products/:id/images/reorder
router.put('/admin/:id/images/reorder', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { order } = req.body; // array of image IDs in desired order
        if (!Array.isArray(order)) return res.status(400).json({ error: 'Order must be an array' });

        const db = getDb();
        const stmt = db.prepare('UPDATE product_images SET display_order = ? WHERE id = ? AND product_id = ?');
        for (let i = 0; i < order.length; i++) {
            stmt.run(i, parseInt(order[i]), id);
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to reorder images' });
    }
});

// PATCH /api/admin/products/:id/images/:imageId/primary
router.patch('/admin/:id/images/:imageId/primary', requireAdmin, (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const imageId = parseInt(req.params.imageId);
        const db = getDb();

        db.prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?').run(productId);
        db.prepare('UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?').run(imageId, productId);
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to set primary image' });
    }
});

// DELETE /api/admin/products/:id/images/:imageId
router.delete('/admin/:id/images/:imageId', requireAdmin, (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const imageId = parseInt(req.params.imageId);
        const db = getDb();

        const image = db.prepare('SELECT * FROM product_images WHERE id = ? AND product_id = ?').get(imageId, productId);
        if (!image) return res.status(404).json({ error: 'Image not found' });

        deleteUploadedFile(image.image_path);
        if (image.thumbnail_path) deleteUploadedFile(image.thumbnail_path);

        db.prepare('DELETE FROM product_images WHERE id = ?').run(imageId);

        // If was primary, make next image primary
        if (image.is_primary) {
            const next = db.prepare('SELECT id FROM product_images WHERE product_id = ? ORDER BY display_order LIMIT 1').get(productId);
            if (next) {
                db.prepare('UPDATE product_images SET is_primary = 1 WHERE id = ?').run(next.id);
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// ===== VIDEO MANAGEMENT =====

// POST /api/admin/products/:id/videos
router.post('/admin/:id/videos', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const { video_url, title } = req.body;

        if (!video_url) return res.status(400).json({ error: 'Video URL is required' });

        const count = db.prepare('SELECT COUNT(*) as c FROM product_videos WHERE product_id = ?').get(id).c;
        const result = db.prepare(`
            INSERT INTO product_videos (product_id, video_url, title, display_order, is_featured)
            VALUES (?, ?, ?, ?, ?)
        `).run(id, video_url, title || '', count, count === 0 ? 1 : 0);

        res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to add video' });
    }
});

// DELETE /api/admin/products/:id/videos/:videoId
router.delete('/admin/:id/videos/:videoId', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const video = db.prepare('SELECT * FROM product_videos WHERE id = ? AND product_id = ?').get(parseInt(req.params.videoId), parseInt(req.params.id));
        if (!video) return res.status(404).json({ error: 'Video not found' });

        db.prepare('DELETE FROM product_videos WHERE id = ? AND product_id = ?')
            .run(parseInt(req.params.videoId), parseInt(req.params.id));

        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

module.exports = router;
