const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { sanitize, createSlug } = require('../middleware/validation');
const { uploadImages, processImage, deleteUploadedFile, setUploadDir, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// PUBLIC
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const items = db.prepare('SELECT * FROM collections WHERE is_active = 1 ORDER BY display_order ASC').all();
        res.json({ collections: items });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
});

router.get('/:slug', (req, res) => {
    try {
        const db = getDb();
        const col = db.prepare('SELECT * FROM collections WHERE slug = ? AND is_active = 1').get(req.params.slug);
        if (!col) return res.status(404).json({ error: 'Collection not found' });
        res.json({ collection: col });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch collection' });
    }
});

// ADMIN
router.get('/admin/list', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const items = db.prepare(`
            SELECT col.*, (SELECT COUNT(*) FROM products WHERE collection_id = col.id) as product_count
            FROM collections col ORDER BY col.display_order ASC
        `).all();
        res.json({ collections: items });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
});

router.post('/admin', requireAdmin, setUploadDir('collections'), uploadImages.single('image'), handleUploadError, async (req, res) => {
    try {
        const { name, description, seo_title, seo_description } = req.body;
        if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Name is required' });

        const db = getDb();
        const slug = createSlug(name);
        const existing = db.prepare('SELECT id FROM collections WHERE slug = ?').get(slug);
        if (existing) return res.status(400).json({ error: 'Collection already exists' });

        let imagePath = null;
        if (req.file) {
            const processed = await processImage(req.file.path, 'collections');
            imagePath = processed.imagePath;
        }

        const maxOrder = db.prepare('SELECT MAX(display_order) as m FROM collections').get().m || 0;
        const result = db.prepare(`
            INSERT INTO collections (name, slug, description, image, display_order, seo_title, seo_description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(sanitize(name), slug, description || null, imagePath, maxOrder + 1, seo_title || null, seo_description || null);

        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to create collection' });
    }
});

router.put('/admin/:id', requireAdmin, setUploadDir('collections'), uploadImages.single('image'), handleUploadError, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const existing = db.prepare('SELECT * FROM collections WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Collection not found' });

        const { name, description, display_order, is_active, seo_title, seo_description } = req.body;
        let imagePath = existing.image;
        if (req.file) {
            if (existing.image) deleteUploadedFile(existing.image);
            const processed = await processImage(req.file.path, 'collections');
            imagePath = processed.imagePath;
        }

        const slug = name ? createSlug(name) : existing.slug;

        db.prepare(`
            UPDATE collections SET name=?, slug=?, description=?, image=?, display_order=?,
            is_active=?, seo_title=?, seo_description=?, updated_at=datetime('now') WHERE id=?
        `).run(
            sanitize(name || existing.name), slug,
            description !== undefined ? description : existing.description, imagePath,
            display_order !== undefined ? parseInt(display_order) : existing.display_order,
            is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
            seo_title !== undefined ? seo_title : existing.seo_title,
            seo_description !== undefined ? seo_description : existing.seo_description, id
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to update collection' });
    }
});

router.delete('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const col = db.prepare('SELECT * FROM collections WHERE id = ?').get(id);
        if (!col) return res.status(404).json({ error: 'Collection not found' });
        if (col.image) deleteUploadedFile(col.image);
        db.prepare('UPDATE products SET collection_id = NULL WHERE collection_id = ?').run(id);
        db.prepare('DELETE FROM collections WHERE id = ?').run(id);

        res.json({ success: true, message: `Collection "${col.name}" deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete collection' });
    }
});

module.exports = router;
