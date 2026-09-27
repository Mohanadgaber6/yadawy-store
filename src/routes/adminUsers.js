const express = require('express');
const bcrypt = require('bcrypt');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { recordAudit } = require('../middleware/audit');

const router = express.Router();

// GET /api/admin/users
router.get('/users', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const users = db.prepare(`
            SELECT id, username, email, role, is_active, last_login_at, created_at
            FROM admins
            ORDER BY created_at DESC
        `).all();

        res.json({ users });
    } catch (err) {
        console.error('Error fetching admin users:', err);
        res.status(500).json({ error: 'Failed to fetch admin users' });
    }
});

// POST /api/admin/users
router.post('/users', requireAdmin, async (req, res) => {
    try {
        const { username, email, password, role = 'admin', is_active = 1 } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Admin email is required' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = (username && username.trim()) || cleanEmail.split('@')[0];

        const db = getDb();
        const existing = db.prepare('SELECT id FROM admins WHERE LOWER(email) = ? OR LOWER(username) = ?').get(cleanEmail, cleanUsername.toLowerCase());
        if (existing) {
            return res.status(400).json({ error: 'An administrator with this email or username already exists' });
        }

        const password_hash = await bcrypt.hash(password, 12);
        const result = db.prepare(`
            INSERT INTO admins (username, email, password_hash, role, is_active)
            VALUES (?, ?, ?, ?, ?)
        `).run(cleanUsername, cleanEmail, password_hash, role || 'admin', is_active ? 1 : 0);

        recordAudit(req, 'CREATE_ADMIN', 'admins', result.lastInsertRowid, { username: cleanUsername, email: cleanEmail, role: role || 'admin' });

        res.status(201).json({
            success: true,
            message: `Admin account "${cleanEmail}" created successfully`,
            user: { id: result.lastInsertRowid, username: cleanUsername, email: cleanEmail, role: role || 'admin', is_active: 1 }
        });
    } catch (err) {
        console.error('Error creating admin user:', err);
        res.status(500).json({ error: 'Failed to create admin user' });
    }
});

// PUT /api/admin/users/:id
router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { username, email, role, password, is_active } = req.body;
        const db = getDb();

        const user = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Admin user not found' });
        }

        let query = 'UPDATE admins SET username = ?, email = ?, role = ?, is_active = ?, updated_at = datetime(\'now\')';
        const params = [username || user.username, email || user.email, role || user.role, is_active !== undefined ? (is_active ? 1 : 0) : user.is_active];

        if (password && password.trim().length >= 6) {
            const password_hash = await bcrypt.hash(password, 12);
            query += ', password_hash = ?';
            params.push(password_hash);
        }

        query += ' WHERE id = ?';
        params.push(req.params.id);

        db.prepare(query).run(...params);
        recordAudit(req, 'UPDATE_ADMIN', 'admins', req.params.id, { username, email, role });

        res.json({ success: true, message: 'Admin user updated successfully' });
    } catch (err) {
        console.error('Error updating admin user:', err);
        res.status(500).json({ error: 'Failed to update admin user' });
    }
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', requireAdmin, (req, res) => {
    try {
        const { is_active } = req.body;
        const targetId = parseInt(req.params.id);
        const db = getDb();

        if (targetId === req.admin.id) {
            return res.status(400).json({ error: 'Cannot deactivate your own account' });
        }

        if (!is_active) {
            const activeCount = db.prepare('SELECT COUNT(*) as c FROM admins WHERE is_active = 1').get().c;
            if (activeCount <= 1) {
                return res.status(400).json({ error: 'Cannot deactivate the last usable admin account' });
            }
        }

        db.prepare('UPDATE admins SET is_active = ?, updated_at = datetime(\'now\') WHERE id = ?').run(is_active ? 1 : 0, targetId);
        recordAudit(req, 'TOGGLE_ADMIN_STATUS', 'admins', targetId, { is_active });

        res.json({ success: true, message: `Admin account ${is_active ? 'activated' : 'deactivated'}` });
    } catch (err) {
        console.error('Error updating admin status:', err);
        res.status(500).json({ error: 'Failed to update admin status' });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, (req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        const db = getDb();

        if (targetId === req.admin.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const targetAdmin = db.prepare('SELECT id, username, email, role FROM admins WHERE id = ?').get(targetId);
        if (!targetAdmin) {
            return res.status(404).json({ error: 'Admin account not found' });
        }

        if (targetAdmin.id === 1 || targetAdmin.email.toLowerCase() === 'admin@yadawy.com') {
            return res.status(400).json({ error: 'Cannot delete the primary main administrator account' });
        }

        const totalAdmins = db.prepare('SELECT COUNT(*) as c FROM admins').get().c;
        if (totalAdmins <= 1) {
            return res.status(400).json({ error: 'Cannot delete the last administrator account' });
        }

        db.prepare('DELETE FROM admins WHERE id = ?').run(targetId);
        recordAudit(req, 'DELETE_ADMIN', 'admins', targetId, { email: targetAdmin.email, username: targetAdmin.username });

        res.json({ success: true, message: `Admin user "${targetAdmin.email}" deleted successfully` });
    } catch (err) {
        console.error('Error deleting admin user:', err);
        res.status(500).json({ error: 'Failed to delete admin user' });
    }
});

module.exports = router;
