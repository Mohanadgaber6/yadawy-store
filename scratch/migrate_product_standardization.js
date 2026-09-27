const { getDb } = require('../src/database/connection');

function migrate() {
    const db = getDb();
    console.log('Starting product database migration...');

    // 1. Add columns to products table if missing
    const productCols = db.prepare('PRAGMA table_info(products)').all().map(c => c.name);
    
    if (!productCols.includes('handwoven_details')) {
        db.prepare('ALTER TABLE products ADD COLUMN handwoven_details TEXT').run();
        console.log('Added handwoven_details column to products.');
    }
    if (!productCols.includes('where_to_place')) {
        db.prepare('ALTER TABLE products ADD COLUMN where_to_place TEXT').run();
        console.log('Added where_to_place column to products.');
    }
    if (!productCols.includes('is_in_stock')) {
        db.prepare('ALTER TABLE products ADD COLUMN is_in_stock INTEGER NOT NULL DEFAULT 1').run();
        console.log('Added is_in_stock column to products.');
    }

    // Set is_in_stock default for existing products
    db.prepare('UPDATE products SET is_in_stock = 1 WHERE is_in_stock IS NULL OR (is_in_stock = 0 AND inventory_qty > 0)').run();

    // 2. Clear all product videos per requirement #4
    const deletedVideos = db.prepare('DELETE FROM product_videos').run();
    console.log(`Cleared ${deletedVideos.changes} existing product video records.`);

    // 3. Migrate product_sizes table
    // Backup existing size links if any
    const oldProductSizes = [];
    try {
        const rows = db.prepare(`
            SELECT ps.*, s.name as size_name
            FROM product_sizes ps
            LEFT JOIN sizes s ON ps.size_id = s.id
        `).all();
        oldProductSizes.push(...rows);
    } catch (e) {
        console.log('Note: could not read old product_sizes:', e.message);
    }

    // Drop and recreate product_sizes with clean, flexible schema
    db.prepare('DROP TABLE IF EXISTS product_sizes').run();
    db.prepare(`
        CREATE TABLE product_sizes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            size_name TEXT NOT NULL,
            price REAL,
            price_adjustment REAL DEFAULT 0,
            is_in_stock INTEGER NOT NULL DEFAULT 1,
            inventory_qty INTEGER DEFAULT 1,
            is_available INTEGER NOT NULL DEFAULT 1,
            display_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
    `).run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_product_sizes_product ON product_sizes(product_id)').run();
    console.log('Recreated product_sizes table with size_name and is_in_stock.');

    // Re-populate from old sizes
    const insertSizeStmt = db.prepare(`
        INSERT INTO product_sizes (product_id, size_name, price, price_adjustment, is_in_stock, inventory_qty, is_available, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const productsWithSizes = new Set();
    for (const old of oldProductSizes) {
        if (old.size_name) {
            insertSizeStmt.run(
                old.product_id,
                old.size_name,
                null,
                old.price_adjustment || 0,
                old.is_available !== 0 ? 1 : 0,
                old.inventory_qty || 1,
                old.is_available !== 0 ? 1 : 0,
                0
            );
            productsWithSizes.add(old.product_id);
        }
    }

    // For products with dimensions but no product_sizes, create default size entry
    const allProducts = db.prepare('SELECT id, dimensions, price FROM products').all();
    let migratedDimensionsCount = 0;
    for (const p of allProducts) {
        if (!productsWithSizes.has(p.id) && p.dimensions && p.dimensions.trim()) {
            insertSizeStmt.run(
                p.id,
                p.dimensions.trim(),
                p.price || null,
                0,
                1,
                1,
                1,
                0
            );
            migratedDimensionsCount++;
        }
    }
    console.log(`Migrated ${migratedDimensionsCount} product dimensions into product_sizes.`);

    console.log('Migration completed successfully!');
}

migrate();
