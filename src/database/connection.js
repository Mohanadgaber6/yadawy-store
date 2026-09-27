const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

function getDb() {
    if (db) return db;

    const dbPath = path.resolve(process.env.DB_PATH || './data/yadawy.db');
    const dbDir = path.dirname(dbPath);

    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);

    // Enable WAL mode for better concurrent read performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');

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

    return db;
}

function closeDb() {
    if (db) {
        db.close();
        db = null;
    }
}

module.exports = { getDb, closeDb };
