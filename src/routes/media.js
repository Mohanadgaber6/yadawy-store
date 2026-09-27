const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { recordAudit } = require('../middleware/audit');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Secure storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
        cb(null, safeName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.mp4', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file format. Allowed types: JPG, PNG, WEBP, AVIF, MP4, WEBM'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit
    }
});

// GET /api/media/admin/list
router.get('/admin/list', requireAdmin, (req, res) => {
    try {
        const { search = '', type = '', page = 1, limit = 30 } = req.query;
        const db = getDb();
        const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (search.trim()) {
            whereClause += ' AND (original_name LIKE ? OR filename LIKE ? OR alt_text LIKE ?)';
            const term = `%${search.trim()}%`;
            params.push(term, term, term);
        }

        if (type && type !== 'all') {
            whereClause += ' AND media_type = ?';
            params.push(type);
        }

        const total = db.prepare(`SELECT COUNT(*) as count FROM media ${whereClause}`).get(...params).count;

        const items = db.prepare(`
            SELECT * FROM media
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `).all(...params, parseInt(limit), offset);

        res.json({
            media: items,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error fetching media:', err);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
});

// POST /api/media/admin/upload
router.post('/admin/upload', requireAdmin, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const db = getDb();
        const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        const filePath = `/uploads/${req.file.filename}`;

        const result = db.prepare(`
            INSERT INTO media (filename, original_name, mime_type, file_size, file_path, media_type, alt_text)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            req.file.filename,
            req.file.originalname,
            req.file.mimetype,
            req.file.size,
            filePath,
            mediaType,
            req.body.alt_text || req.file.originalname
        );

        recordAudit(req, 'UPLOAD_MEDIA', 'media', result.lastInsertRowid, { filename: req.file.filename });

        res.status(201).json({
            success: true,
            media: {
                id: result.lastInsertRowid,
                filename: req.file.filename,
                original_name: req.file.originalname,
                file_path: filePath,
                media_type: mediaType,
                file_size: req.file.size
            }
        });
    } catch (err) {
        console.error('Error uploading media:', err);
        res.status(500).json({ error: err.message || 'Failed to upload media' });
    }
});

// DELETE /api/media/admin/:id
router.delete('/admin/:id', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const item = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);

        if (!item) {
            return res.status(404).json({ error: 'Media not found' });
        }

        // Delete physical file safely
        const physicalPath = path.join(uploadsDir, item.filename);
        if (fs.existsSync(physicalPath)) {
            try { fs.unlinkSync(physicalPath); } catch (e) {}
        }

        db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
        recordAudit(req, 'DELETE_MEDIA', 'media', req.params.id, { filename: item.filename });

        res.json({ success: true, message: 'Media deleted successfully' });
    } catch (err) {
        console.error('Error deleting media:', err);
        res.status(500).json({ error: 'Failed to delete media' });
    }
});

module.exports = router;
