const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

function getDb() {
    if (db) return db;

    const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    let dbPath = process.env.DB_PATH;

    if (!dbPath) {
        if (isVercel) {
            dbPath = '/tmp/yadawy.db';
            const bundledDb = path.join(__dirname, '..', '..', 'data', 'yadawy.db');
            if (!fs.existsSync(dbPath) && fs.existsSync(bundledDb)) {
                try {
                    fs.copyFileSync(bundledDb, dbPath);
                } catch (e) {
                    console.warn('Could not copy bundled DB:', e.message);
                }
            }
        } else {
            dbPath = path.resolve('./data/yadawy.db');
        }
    } else {
        dbPath = path.resolve(dbPath);
    }

    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);

    // Enable WAL mode for better concurrent read performance
    if (!isVercel) {
        db.pragma('journal_mode = WAL');
    }
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');

    // Ensure database tables and authentic catalog exist synchronously
    const hasTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'").get();
    let hasAuthenticCatalog = false;
    if (hasTables) {
        try {
            const checkProd = db.prepare("SELECT COUNT(*) as c FROM products WHERE name LIKE 'Antique Rugs%'").get();
            hasAuthenticCatalog = checkProd && checkProd.c > 0;
        } catch (e) {
            hasAuthenticCatalog = false;
        }
    }
    if (!hasTables || !hasAuthenticCatalog) {
        const { initDatabaseSync } = require('./init');
        initDatabaseSync(db);
    }

    // Ensure deletion_requests table exists for email approval workflow
    db.exec(`
        CREATE TABLE IF NOT EXISTS deletion_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT NOT NULL UNIQUE,
            item_type TEXT NOT NULL,
            item_id INTEGER NOT NULL,
            item_name TEXT,
            item_details TEXT,
            item_image TEXT,
            requested_by_id INTEGER,
            requested_by_email TEXT,
            requested_by_name TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            requested_at TEXT NOT NULL DEFAULT (datetime('now')),
            resolved_at TEXT,
            resolved_by TEXT,
            rejection_reason TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_deletion_requests_token ON deletion_requests(token);
        CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);
    `);

    // Ensure customer_reviews table exists for Why Yadawy page and review moderation
    db.exec(`
        CREATE TABLE IF NOT EXISTS customer_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            review_text TEXT NOT NULL,
            language TEXT NOT NULL DEFAULT 'ar',
            status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'hidden', 'rejected')),
            is_demo INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON customer_reviews(status);
        CREATE INDEX IF NOT EXISTS idx_customer_reviews_created ON customer_reviews(created_at);
    `);

    // Seed approved demo reviews on localhost if table is empty
    try {
        const count = db.prepare("SELECT COUNT(*) as c FROM customer_reviews").get().c;
        if (count === 0) {
            const insertDemo = db.prepare(`
                INSERT INTO customer_reviews (customer_name, customer_email, rating, review_text, language, status, is_demo, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'approved', 1, ?, ?)
            `);
            insertDemo.run('Mariam Ahmed', 'demo-mariam@yadawy.local', 5, 'التصميمات شيك جدًا بجد 😍 والألوان جميلة أوي، تحس إن كل قطعة ليها روح مختلفة ❤️', 'ar', '2026-10-15 14:20:00', '2026-10-15 14:20:00');
            insertDemo.run('Ahmed Hassan', 'demo-ahmed@yadawy.local', 5, 'من الحاجات اللي عجبتني التفاصيل في التصميم 👌 شكلها مميز فعلًا.', 'ar', '2026-10-16 11:15:00', '2026-10-16 11:15:00');
            insertDemo.run('Nada Mohamed', 'demo-nada@yadawy.local', 5, 'بحب الحاجات الهاند ميد، والتصميمات هنا مختلفة وجميلة أوي ✨', 'ar', '2026-10-16 19:40:00', '2026-10-16 19:40:00');
            insertDemo.run('Mona Khaled', 'demo-mona@yadawy.local', 5, 'الألوان والتفاصيل تحفة ❤️ ومناسبة جدًا لذوقي.', 'ar', '2026-10-17 09:30:00', '2026-10-17 09:30:00');
        } else {
            // Ensure existing localhost demo records have English first and last names
            db.prepare("UPDATE customer_reviews SET customer_name = 'Mariam Ahmed' WHERE id = 1 AND is_demo = 1").run();
            db.prepare("UPDATE customer_reviews SET customer_name = 'Ahmed Hassan' WHERE id = 2 AND is_demo = 1").run();
            db.prepare("UPDATE customer_reviews SET customer_name = 'Nada Mohamed' WHERE id = 3 AND is_demo = 1").run();
            db.prepare("UPDATE customer_reviews SET customer_name = 'Mona Khaled' WHERE id = 4 AND is_demo = 1").run();
        }
    } catch (e) {
        console.warn('Note on customer_reviews demo seed:', e.message);
    }

    // Ensure is_customizable column and 5-section indexing on products
    try {
        const prodCols = db.prepare("PRAGMA table_info(products)").all().map(c => c.name);
        if (!prodCols.includes('is_customizable')) {
            db.prepare("ALTER TABLE products ADD COLUMN is_customizable INTEGER NOT NULL DEFAULT 0").run();
        }
        db.prepare("CREATE INDEX IF NOT EXISTS idx_products_customizable ON products(is_customizable)").run();
        db.prepare("CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival)").run();
        db.prepare("CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller)").run();
        db.prepare("CREATE INDEX IF NOT EXISTS idx_products_section_id ON products(section_id)").run();

        const customCount = db.prepare("SELECT COUNT(*) as c FROM products WHERE is_customizable = 1").get().c;
        if (customCount === 0) {
            db.prepare(`
                UPDATE products 
                SET is_customizable = 1 
                WHERE id IN (8, 9, 28, 29, 31, 33, 34, 35, 36, 40, 53)
            `).run();
        }
    } catch (e) {
        console.warn('Note on products is_customizable migration:', e.message);
    }

    return db;
}

function closeDb() {
    if (db) {
        db.close();
        db = null;
    }
}

module.exports = { getDb, closeDb };
