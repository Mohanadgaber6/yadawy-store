const { getDb } = require('../src/database/connection.js');

const DEFAULT_DESC = 'A modern take on traditional kilim craftsmanship, featuring three rows of geometric motifs in warm red, mustard, and deep blue, set against a soft ivory base.';
const DEFAULT_HANDWOVEN = 'Handwoven with care, each stitch and subtle color variation adds to the unique character of the piece. Finished with hand-tied tassels at both ends.';
const DEFAULT_WHERE_TO_PLACE = 'Perfect for the living room, beside the bed, or styled as a hallway runner, adding warmth and texture without overpowering the space.';
const DEFAULT_SIZE = '1.5 × 5 m';

function run() {
    const db = getDb();
    console.log('Applying default product template to all existing products...');

    // 1. Update all products with default values
    const updateProducts = db.prepare(`
        UPDATE products
        SET short_description = ?,
            full_description = ?,
            handwoven_details = ?,
            where_to_place = ?,
            dimensions = COALESCE(dimensions, ?)
    `);
    const res = updateProducts.run(DEFAULT_DESC, DEFAULT_DESC, DEFAULT_HANDWOVEN, DEFAULT_WHERE_TO_PLACE, DEFAULT_SIZE);
    console.log(`Updated ${res.changes} products in products table.`);

    // 2. Ensure each product has default size 1.5 × 5 m if it has no sizes
    const allProducts = db.prepare('SELECT id FROM products').all();
    const checkSizes = db.prepare('SELECT COUNT(*) as count FROM product_sizes WHERE product_id = ?');
    const insertSize = db.prepare(`
        INSERT INTO product_sizes (product_id, size_name, price, price_adjustment, is_in_stock, inventory_qty, is_available, display_order)
        VALUES (?, ?, NULL, 0, 1, 1, 1, 0)
    `);

    let sizesAdded = 0;
    const insertManySizes = db.transaction(() => {
        for (const p of allProducts) {
            const sizeCount = checkSizes.get(p.id).count;
            if (sizeCount === 0) {
                insertSize.run(p.id, DEFAULT_SIZE);
                sizesAdded++;
            }
        }
    });

    insertManySizes();
    console.log(`Added default size "${DEFAULT_SIZE}" to ${sizesAdded} products.`);
    console.log('Migration completed successfully!');
}

run();
