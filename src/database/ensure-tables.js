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

        const prodCols = db.prepare("PRAGMA table_info(products)").all().map(c => c.name);
        if (!prodCols.includes('button_text')) {
            db.prepare("ALTER TABLE products ADD COLUMN button_text TEXT DEFAULT 'VIEW PIECE'").run();
        }
        if (!prodCols.includes('custom_link')) {
            db.prepare("ALTER TABLE products ADD COLUMN custom_link TEXT").run();
        }
        if (!prodCols.includes('is_customizable')) {
            db.prepare("ALTER TABLE products ADD COLUMN is_customizable INTEGER NOT NULL DEFAULT 0").run();
            db.prepare("CREATE INDEX IF NOT EXISTS idx_products_customizable ON products(is_customizable)").run();
        }

        // Ensure indexes for 5 product sections
        db.prepare("CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival)").run();
        db.prepare("CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller)").run();
        db.prepare("CREATE INDEX IF NOT EXISTS idx_products_section_id ON products(section_id)").run();

        // Seed initial customizable products if none exist
        const customCount = db.prepare("SELECT COUNT(*) as c FROM products WHERE is_customizable = 1").get().c;
        if (customCount === 0) {
            // Select authentic products across Carpets (Handmade Rugs - New) and Kilims (Fine Wool, Patterned Wool, New Zealand Wool)
            db.prepare(`
                UPDATE products 
                SET is_customizable = 1 
                WHERE id IN (8, 9, 28, 29, 31, 33, 34, 35, 36, 40, 53)
            `).run();
        }

        // Sync default contact numbers order
        db.prepare("INSERT OR REPLACE INTO site_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)").run('contact_phone', '01069005565', 'text');
        db.prepare("INSERT OR REPLACE INTO site_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)").run('contact_phone_2', '01039555155', 'text');
        db.prepare("INSERT OR REPLACE INTO site_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)").run('contact_phone_3', '01225910140', 'text');
        db.prepare("INSERT OR REPLACE INTO site_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)").run('contact_whatsapp', '201069005565', 'text');
    } catch (e) {
        console.warn('Note on table migrations:', e.message);
    }

    console.log('✅ Audit logs, Media, and Contact Submissions tables verified.');
    closeDb();
}

ensureTables();
