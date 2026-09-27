const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/audit-logs
router.get('/audit-logs', requireAdmin, (req, res) => {
    try {
        const { search = '', resource = '', page = 1, limit = 30 } = req.query;
        const db = getDb();
        const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (search.trim()) {
            whereClause += ' AND (action LIKE ? OR admin_username LIKE ? OR details LIKE ?)';
            const term = `%${search.trim()}%`;
            params.push(term, term, term);
        }

        if (resource && resource !== 'all') {
            whereClause += ' AND resource = ?';
            params.push(resource);
        }

        const total = db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${whereClause}`).get(...params).count;

        const logs = db.prepare(`
            SELECT id, admin_id, admin_username, action, resource, resource_id, details, ip_address, created_at
            FROM audit_logs
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `).all(...params, parseInt(limit), offset);

        res.json({
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error fetching audit logs:', err);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

module.exports = router;
