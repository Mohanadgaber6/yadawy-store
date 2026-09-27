const jwt = require('jsonwebtoken');
const { getDb } = require('../database/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

function generateToken(admin) {
    return jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
}

function requireAdmin(req, res, next) {
    try {
        let token = req.cookies?.admin_token;
        if (!token && req.headers.authorization) {
            token = req.headers.authorization.replace(/^Bearer\s+/i, '');
        }
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const db = getDb();
        const admin = db.prepare('SELECT id, username, email, role, is_active FROM admins WHERE id = ?').get(decoded.id);

        if (!admin || !admin.is_active) {
            return res.status(401).json({ error: 'Invalid or inactive account' });
        }

        req.admin = admin;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Authentication required' });
    }
}

function optionalAdmin(req, res, next) {
    try {
        let token = req.cookies?.admin_token;
        if (!token && req.headers.authorization) {
            token = req.headers.authorization.replace(/^Bearer\s+/i, '');
        }
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.admin = decoded;
        }
    } catch (e) { /* ignore */ }
    next();
}

module.exports = { generateToken, requireAdmin, optionalAdmin, JWT_SECRET };
