const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { getDb } = require('../database/connection');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limit login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Allow sufficient attempts in dev/testing
    message: { error: 'Too many login attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const db = getDb();
        const admin = db.prepare('SELECT * FROM admins WHERE email = ? AND is_active = 1').get(email);

        if (!admin) {
            // Use same message to prevent user enumeration
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, admin.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        db.prepare("UPDATE admins SET last_login_at = datetime('now') WHERE id = ?").run(admin.id);

        const token = generateToken(admin);

        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000 // 8 hours
        });

        const isSuperAdmin = (
            admin.role === 'superadmin' ||
            String(admin.email).toLowerCase() === (process.env.ADMIN_EMAIL || 'admin@yadawy.com').toLowerCase() ||
            admin.id === 1
        );

        res.json({
            success: true,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                is_superadmin: isSuperAdmin
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('admin_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
    const jwt = require('jsonwebtoken');
    const token = req.cookies?.admin_token;
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-me-in-production');
        const db = getDb();
        const admin = db.prepare('SELECT id, username, email, phone, role, preferences, last_login_at, created_at FROM admins WHERE id = ? AND is_active = 1').get(decoded.id);
        if (!admin) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const isSuperAdmin = (
            admin.role === 'superadmin' ||
            String(admin.email).toLowerCase() === (process.env.ADMIN_EMAIL || 'admin@yadawy.com').toLowerCase() ||
            admin.id === 1
        );
        res.json({ admin: { ...admin, is_superadmin: isSuperAdmin } });
    } catch (err) {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
    const jwt = require('jsonwebtoken');
    const token = req.cookies?.admin_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-me-in-production');
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password || new_password.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const db = getDb();
        const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(decoded.id);
        if (!admin) return res.status(401).json({ error: 'Admin not found' });

        const valid = await bcrypt.compare(current_password, admin.password_hash);
        if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

        const newHash = await bcrypt.hash(new_password, 12);
        db.prepare('UPDATE admins SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newHash, admin.id);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// PUT /api/auth/profile
router.put('/profile', (req, res) => {
    const jwt = require('jsonwebtoken');
    const token = req.cookies?.admin_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-me-in-production');
        const { username, email, phone, preferences } = req.body;

        if (!username || !email) return res.status(400).json({ error: 'Username and email are required' });

        const db = getDb();
        const existing = db.prepare('SELECT id FROM admins WHERE (email = ? OR username = ?) AND id != ?').get(email, username, decoded.id);
        if (existing) return res.status(400).json({ error: 'Username or email already in use' });

        const prefStr = typeof preferences === 'object' ? JSON.stringify(preferences) : (preferences !== undefined ? preferences : null);

        db.prepare(`
            UPDATE admins 
            SET username = ?, email = ?, phone = ?, preferences = ?, updated_at = datetime('now') 
            WHERE id = ?
        `).run(username, email, phone || null, prefStr, decoded.id);

        const updatedAdmin = db.prepare('SELECT id, username, email, phone, role, preferences, last_login_at, created_at FROM admins WHERE id = ?').get(decoded.id);

        res.json({ success: true, admin: updatedAdmin });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
