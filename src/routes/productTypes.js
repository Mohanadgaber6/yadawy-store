const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { sanitize, createSlug } = require('../middleware/validation');

const router = express.Router();

// PUBLIC
router.get('/', (req, res) => {
    try {
        const db = getDb();
        res.json({ types: db.prepare('SELECT * FROM product_types WHERE is_active = 1 ORDER BY name ASC').all() });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch product types' }); }
});

// ADMIN
router.get('/admin/list', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const types = db.prepare(`
            SELECT pt.*, (SELECT COUNT(*) FROM products WHERE type_id = pt.id) as product_count
            FROM product_types pt ORDER BY pt.name ASC
        `).all();
        res.json({ types });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch product types' }); }
});

router.post('/admin', requireAdmin, (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Name is required' });
        const db = getDb();
        const slug = createSlug(name);
        const existing = db.prepare('SELECT id FROM product_types WHERE slug = ?').get(slug);
        if (existing) return res.status(400).json({ error: 'Product type already exists' });
        const result = db.prepare('INSERT INTO product_types (name, slug) VALUES (?, ?)').run(sanitize(name), slug);
        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(500).json({ error: 'Failed to create product type' }); }
});

router.put('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, is_active } = req.body;
        const db = getDb();
        const existing = db.prepare('SELECT * FROM product_types WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Product type not found' });
        const slug = name ? createSlug(name) : existing.slug;
        db.prepare('UPDATE product_types SET name=?, slug=?, is_active=? WHERE id=?')
            .run(sanitize(name || existing.name), slug, is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active, id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to update product type' }); }
});

router.delete('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const type = db.prepare('SELECT * FROM product_types WHERE id = ?').get(id);
        if (!type) return res.status(404).json({ error: 'Product type not found' });

        db.prepare('UPDATE products SET type_id = NULL WHERE type_id = ?').run(id);
        db.prepare('DELETE FROM product_types WHERE id = ?').run(id);

        res.json({ success: true, message: `Product type "${type.name}" deleted successfully` });
    } catch (err) { res.status(500).json({ error: 'Failed to delete product type' }); }
});

module.exports = router;
