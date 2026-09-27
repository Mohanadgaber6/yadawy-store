const { getDb, closeDb } = require('./connection');

function ensureTables() {
    const db = getDb();
    db.exec(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER,
            admin_username TEXT,
            action TEXT NOT NULL,
            resource TEXT NOT NULL,
            resource_id TEXT,
            details TEXT,
            ip_address TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            file_path TEXT NOT NULL,
            media_type TEXT NOT NULL DEFAULT 'image',
            alt_text TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

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

        CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);
        CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
        CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at);
    `);

    // Ensure phone and preferences columns on admins table
    try {
        const columns = db.prepare("PRAGMA table_info(admins)").all().map(c => c.name);
        if (!columns.includes('phone')) {
            db.prepare("ALTER TABLE admins ADD COLUMN phone TEXT").run();
        }
        if (!columns.includes('preferences')) {
            db.prepare("ALTER TABLE admins ADD COLUMN preferences TEXT").run();
        }
    } catch (e) {
        console.warn('Note on admins columns:', e.message);
    }

    console.log('✅ Audit logs, Media, and Contact Submissions tables verified.');
    closeDb();
}

ensureTables();
