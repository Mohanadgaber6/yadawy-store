const express = require('express');
const validator = require('validator');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { recordAudit } = require('../middleware/audit');
const { sendContactInquiryNotification } = require('../services/emailService');

const router = express.Router();

// Helper to ensure table exists in case ensureTables hasn't run
function ensureContactTable(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            subject TEXT,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Contacted', 'In Progress', 'Closed')),
            internal_notes TEXT,
            ip_address TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
        CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at);
    `);
}

// ============================================================
// PUBLIC: Submit Contact Form
// POST /api/site/contact and POST /api/contact
// ============================================================
router.post(['/site/contact', '/contact'], (req, res) => {
    try {
        const { name, email, phone, inquiry_type, subject, message } = req.body;
        const sub = subject || inquiry_type || 'General Inquiry';

        const errors = [];
        if (!name || name.trim().length < 2) {
            errors.push('Please provide your name (at least 2 characters).');
        }
        if (!message || message.trim().length < 5) {
            errors.push('Please enter a message (at least 5 characters).');
        }
        if (email && !validator.isEmail(email.trim())) {
            errors.push('Please enter a valid email address.');
        }
        if (!email && !phone) {
            errors.push('Please provide at least a phone number or an email address so we can contact you.');
        }

        if (errors.length > 0) {
            return res.status(400).json({ error: errors.join(' ') });
        }

        const db = getDb();
        ensureContactTable(db);

        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

        const result = db.prepare(`
            INSERT INTO contact_submissions (name, email, phone, subject, message, status, ip_address)
            VALUES (?, ?, ?, ?, ?, 'New', ?)
        `).run(
            name.trim(),
            email ? email.trim() : null,
            phone ? phone.trim() : null,
            sub.trim(),
            message.trim(),
            ip
        );

        // Trigger customer contact / inquiry notification email
        sendContactInquiryNotification({
            name: name.trim(),
            email: email ? email.trim() : null,
            phone: phone ? phone.trim() : null,
            subject: sub.trim(),
            inquiry_type: sub.trim(),
            message: message.trim(),
            created_at: new Date()
        }).catch(err => console.error('[Contact Inquiry Email Error]:', err));

        res.status(201).json({
            success: true,
            message: 'Thank you for reaching out to Yadawy! Your message has been received, and our team will get back to you shortly.',
            id: result.lastInsertRowid
        });
    } catch (err) {
        console.error('Error submitting contact form:', err);
        res.status(500).json({ error: 'Failed to submit your message. Please try again or reach out via WhatsApp/phone.' });
    }
});

// ============================================================
// ADMIN: Get Contact Leads List with Search, Filters, & Sorting
// GET /api/admin/contact-leads
// ============================================================
router.get('/admin/contact-leads', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        ensureContactTable(db);

        const { search, status, sort = 'newest', page = 1, limit = 50 } = req.query;

        let whereClauses = [];
        let params = [];

        // Status Filter
        if (status && status !== 'all' && ['New', 'Contacted', 'In Progress', 'Closed'].includes(status)) {
            whereClauses.push('status = ?');
            params.push(status);
        }

        // Search Filter (Name, Email, Phone, Subject, Message)
        if (search && search.trim()) {
            const searchTerm = `%${search.trim()}%`;
            whereClauses.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR subject LIKE ? OR message LIKE ?)');
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const orderSQL = sort === 'oldest' ? 'ORDER BY created_at ASC' : 'ORDER BY created_at DESC';

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50));
        const offset = (pageNum - 1) * limitNum;

        const countRow = db.prepare(`SELECT COUNT(*) as total FROM contact_submissions ${whereSQL}`).get(...params);
        const total = countRow ? countRow.total : 0;

        const leads = db.prepare(`
            SELECT id, name, email, phone, subject, message, status, internal_notes, ip_address, created_at, updated_at
            FROM contact_submissions
            ${whereSQL}
            ${orderSQL}
            LIMIT ? OFFSET ?
        `).all(...params, limitNum, offset);

        // Calculate summary counts by status
        const countsQuery = db.prepare(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) as new_count,
                SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END) as contacted_count,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed_count
            FROM contact_submissions
        `).get();

        const counts = {
            total: countsQuery?.total || 0,
            new: countsQuery?.new_count || 0,
            contacted: countsQuery?.contacted_count || 0,
            in_progress: countsQuery?.in_progress_count || 0,
            closed: countsQuery?.closed_count || 0
        };

        res.json({
            leads,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            counts
        });
    } catch (err) {
        console.error('Error fetching contact leads:', err);
        res.status(500).json({ error: 'Failed to fetch contact leads' });
    }
});

// ============================================================
// ADMIN: Get Single Contact Lead
// GET /api/admin/contact-leads/:id
// ============================================================
router.get('/admin/contact-leads/:id', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        ensureContactTable(db);

        const lead = db.prepare('SELECT * FROM contact_submissions WHERE id = ?').get(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: 'Contact submission not found' });
        }

        res.json({ lead });
    } catch (err) {
        console.error('Error fetching lead details:', err);
        res.status(500).json({ error: 'Failed to fetch lead details' });
    }
});

// ============================================================
// ADMIN: Update Contact Lead Status & Internal Notes
// PATCH /api/admin/contact-leads/:id
// ============================================================
router.patch('/admin/contact-leads/:id', requireAdmin, (req, res) => {
    try {
        const { status, internal_notes } = req.body;
        const targetId = parseInt(req.params.id);
        const db = getDb();
        ensureContactTable(db);

        const lead = db.prepare('SELECT * FROM contact_submissions WHERE id = ?').get(targetId);
        if (!lead) {
            return res.status(404).json({ error: 'Contact submission not found' });
        }

        let updates = [];
        let params = [];

        if (status !== undefined) {
            if (!['New', 'Contacted', 'In Progress', 'Closed'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status. Must be New, Contacted, In Progress, or Closed.' });
            }
            updates.push('status = ?');
            params.push(status);
        }

        if (internal_notes !== undefined) {
            updates.push('internal_notes = ?');
            params.push(internal_notes);
        }

        updates.push("updated_at = datetime('now')");

        if (updates.length > 1) { // more than just updated_at
            db.prepare(`UPDATE contact_submissions SET ${updates.join(', ')} WHERE id = ?`).run(...params, targetId);
            
            if (recordAudit) {
                recordAudit(req, 'UPDATE_CONTACT_LEAD', 'contact_submissions', targetId, {
                    previous_status: lead.status,
                    new_status: status || lead.status,
                    has_notes: internal_notes !== undefined
                });
            }
        }

        const updatedLead = db.prepare('SELECT * FROM contact_submissions WHERE id = ?').get(targetId);
        res.json({
            success: true,
            message: 'Contact lead updated successfully',
            lead: updatedLead
        });
    } catch (err) {
        console.error('Error updating contact lead:', err);
        res.status(500).json({ error: 'Failed to update contact lead' });
    }
});

// ============================================================
// ADMIN: Delete Contact Lead
// DELETE /api/admin/contact-leads/:id
// ============================================================
router.delete('/admin/contact-leads/:id', requireAdmin, (req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        const db = getDb();
        ensureContactTable(db);

        const lead = db.prepare('SELECT id, name, email, phone FROM contact_submissions WHERE id = ?').get(targetId);
        if (!lead) {
            return res.status(404).json({ error: 'Contact submission not found' });
        }

        db.prepare('DELETE FROM contact_submissions WHERE id = ?').run(targetId);

        if (recordAudit) {
            recordAudit(req, 'DELETE_CONTACT_LEAD', 'contact_submissions', targetId, { name: lead.name, email: lead.email });
        }

        res.json({ success: true, message: 'Contact submission deleted successfully' });
    } catch (err) {
        console.error('Error deleting contact lead:', err);
        res.status(500).json({ error: 'Failed to delete contact lead' });
    }
});

module.exports = router;
