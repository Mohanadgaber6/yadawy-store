const { getDb } = require('../database/connection');

function recordAudit(req, action, resource, resourceId = null, details = null) {
    try {
        const db = getDb();
        const adminId = req.admin ? req.admin.id : null;
        const adminUsername = req.admin ? req.admin.username : 'system';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const detailsStr = typeof details === 'object' && details !== null ? JSON.stringify(details) : (details || '');

        db.prepare(`
            INSERT INTO audit_logs (admin_id, admin_username, action, resource, resource_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(adminId, adminUsername, action, resource, String(resourceId || ''), detailsStr, ip);
    } catch (err) {
        console.error('Failed to write audit log:', err.message);
    }
}

module.exports = { recordAudit };
