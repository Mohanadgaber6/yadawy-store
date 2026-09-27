const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { sanitize } = require('../middleware/validation');

const router = express.Router();

// PUBLIC
router.get('/', (req, res) => {
    try {
        const db = getDb();
        res.json({ sizes: db.prepare('SELECT * FROM sizes WHERE is_active = 1 ORDER BY display_order ASC').all() });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch sizes' }); }
});

// ADMIN
router.get('/admin/list', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const sizes = db.prepare(`
            SELECT s.*, (SELECT COUNT(*) FROM product_sizes WHERE size_name = s.name) as usage_count
            FROM sizes s ORDER BY s.display_order ASC
        `).all();
        res.json({ sizes });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch sizes' }); }
});

router.post('/admin', requireAdmin, (req, res) => {
    try {
        const { name, width, height, length, unit } = req.body;
        if (!name || name.trim().length < 1) return res.status(400).json({ error: 'Size name is required' });
        const db = getDb();
        const existing = db.prepare('SELECT id FROM sizes WHERE name = ?').get(name.trim());
        if (existing) return res.status(400).json({ error: 'Size already exists' });
        const maxOrder = db.prepare('SELECT MAX(display_order) as m FROM sizes').get().m || 0;
        const result = db.prepare(
            'INSERT INTO sizes (name, width, height, length, unit, display_order) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(sanitize(name), width || null, height || null, length || null, unit || 'cm', maxOrder + 1);
        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(500).json({ error: 'Failed to create size' }); }
});

router.put('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, width, height, length, unit, display_order, is_active } = req.body;
        const db = getDb();
        const existing = db.prepare('SELECT * FROM sizes WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Size not found' });
        db.prepare(`UPDATE sizes SET name=?, width=?, height=?, length=?, unit=?, display_order=?, is_active=? WHERE id=?`)
            .run(sanitize(name || existing.name), width !== undefined ? width : existing.width,
                height !== undefined ? height : existing.height, length !== undefined ? length : existing.length,
                unit || existing.unit, display_order !== undefined ? parseInt(display_order) : existing.display_order,
                is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active, id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to update size' }); }
});

router.delete('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const size = db.prepare('SELECT * FROM sizes WHERE id = ?').get(id);
        if (!size) return res.status(404).json({ error: 'Size not found' });

        db.prepare('DELETE FROM product_sizes WHERE size_name = ?').run(size.name);
        db.prepare('DELETE FROM sizes WHERE id = ?').run(id);

        res.json({ success: true, message: `Size "${size.name}" deleted successfully` });
    } catch (err) { res.status(500).json({ error: 'Failed to delete size' }); }
});

module.exports = router;
