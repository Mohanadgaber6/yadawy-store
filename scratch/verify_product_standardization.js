const { getDb } = require('../src/database/connection');

async function testVerification() {
    const db = getDb();
    console.log('=== VERIFYING PRODUCT STANDARDIZATION ===');

    // 1. Verify product_videos is empty
    const videoCount = db.prepare('SELECT COUNT(*) as c FROM product_videos').get().c;
    console.log(`Product videos in DB: ${videoCount} (Expected: 0)`);
    if (videoCount !== 0) throw new Error('Existing videos were not cleared!');

    // 2. Verify products table has new columns
    const cols = db.prepare('PRAGMA table_info(products)').all().map(c => c.name);
    console.log('Has handwoven_details:', cols.includes('handwoven_details'));
    console.log('Has where_to_place:', cols.includes('where_to_place'));
    console.log('Has is_in_stock:', cols.includes('is_in_stock'));

    if (!cols.includes('handwoven_details') || !cols.includes('where_to_place') || !cols.includes('is_in_stock')) {
        throw new Error('Missing columns in products table!');
    }

    // 3. Find a test product or first product
    const product = db.prepare('SELECT * FROM products LIMIT 1').get();
    console.log(`Testing with product ID ${product.id}: "${product.name}" (slug: ${product.slug})`);

    // 4. Update the test product with the standard example data to verify persistence
    const testHandwoven = 'Handwoven with care, each stitch and subtle color variation adds to the unique character of the piece. Finished with hand-tied tassels at both ends.';
    const testPlacement = 'Perfect for the living room, beside the bed, or styled as a hallway runner, adding warmth and texture without overpowering the space.';
    const testDesc = 'A modern take on traditional kilim craftsmanship, featuring geometric motifs in warm red, mustard, and deep blue, set against a soft ivory base.';
    const testSpecs = 'Material: 100% Handspun Wool\nWeave: Flatweave Kilim\nOrigin: Fowwa, Egypt';
    const testCare = 'Vacuum regularly on low suction. Spot clean with damp cloth and mild wool detergent. Professional dry clean recommended.';
    const testShipping = 'Doorstep delivery within 3-5 business days across Egypt. 14-day hassle-free return policy.';

    db.prepare(`
        UPDATE products SET
            handwoven_details = ?,
            where_to_place = ?,
            full_description = ?,
            specifications = ?,
            care_instructions = ?,
            shipping_info = ?,
            is_in_stock = 1
        WHERE id = ?
    `).run(testHandwoven, testPlacement, testDesc, testSpecs, testCare, testShipping, product.id);

    // 5. Add repeatable sizes
    db.prepare('DELETE FROM product_sizes WHERE product_id = ?').run(product.id);
    const insertSizeStmt = db.prepare(`
        INSERT INTO product_sizes (product_id, size_name, price, is_in_stock, is_available, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertSizeStmt.run(product.id, '1.5 × 5 m', 8500, 1, 1, 0);
    insertSizeStmt.run(product.id, '2 × 3 m', 9500, 0, 0, 1);
    insertSizeStmt.run(product.id, '2.5 × 4 m', 12000, 1, 1, 2);

    console.log('Inserted 3 test size variants (including 1 out-of-stock variant).');

    // 6. Verify reading product via sizes query
    const sizes = db.prepare('SELECT * FROM product_sizes WHERE product_id = ? ORDER BY display_order ASC').all(product.id);
    console.log('Retrieved sizes:', sizes.map(s => `${s.size_name} - Price: ${s.price} - In Stock: ${s.is_in_stock}`));

    if (sizes.length !== 3) throw new Error('Size variants count mismatch!');
    if (sizes[1].is_in_stock !== 0) throw new Error('Out of stock variant was not preserved!');

    // 7. Verify stock counts
    const inStockCount = db.prepare('SELECT COUNT(*) as c FROM products WHERE is_in_stock = 1').get().c;
    const outStockCount = db.prepare('SELECT COUNT(*) as c FROM products WHERE is_in_stock = 0').get().c;
    console.log(`In stock products: ${inStockCount}, Out of stock products: ${outStockCount}`);

    console.log('\nALL PRODUCT STANDARDIZATION TESTS PASSED!');
}

testVerification();
