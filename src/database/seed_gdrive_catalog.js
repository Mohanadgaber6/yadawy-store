require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { getDb, closeDb } = require('./connection');

async function seedGdriveCatalog() {
    console.log('🔄 Starting Authentic Google Drive Catalog Seeding...');
    const db = getDb();

    // 1. Ensure `sections` table exists and categories has `section_id`
    db.exec(`
        CREATE TABLE IF NOT EXISTS sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            display_order INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    // Check if categories has section_id column
    const catCols = db.prepare("PRAGMA table_info(categories)").all();
    const hasSectionId = catCols.some(c => c.name === 'section_id');
    if (!hasSectionId) {
        db.exec("ALTER TABLE categories ADD COLUMN section_id INTEGER REFERENCES sections(id);");
        console.log('✅ Added section_id to categories table');
    }

    // Check if products has section_id column
    const prodCols = db.prepare("PRAGMA table_info(products)").all();
    const prodHasSectionId = prodCols.some(c => c.name === 'section_id');
    if (!prodHasSectionId) {
        db.exec("ALTER TABLE products ADD COLUMN section_id INTEGER REFERENCES sections(id);");
        console.log('✅ Added section_id to products table');
    }

    // 2. Read catalog_data.json
    const catalogJsonPath = path.join(__dirname, '..', '..', 'scratch', 'catalog_data.json');
    if (!fs.existsSync(catalogJsonPath)) {
        console.error('❌ catalog_data.json not found! Run the python processor first.');
        process.exit(1);
    }

    const catalog = JSON.parse(fs.readFileSync(catalogJsonPath, 'utf8'));

    // 3. Clear existing catalog (Preserving customers, admins, orders, settings)
    console.log('🧹 Clearing legacy demo catalog items...');
    db.exec(`
        DELETE FROM product_images;
        DELETE FROM product_videos;
        DELETE FROM product_sizes;
        DELETE FROM products;
        DELETE FROM categories;
        DELETE FROM sections;
    `);

    // 4. Seed Sections & Categories
    const insertSection = db.prepare(`
        INSERT INTO sections (id, name, slug, description, display_order, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
    `);

    const insertCategory = db.prepare(`
        INSERT INTO categories (id, section_id, name, slug, description, display_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    const insertProduct = db.prepare(`
        INSERT INTO products (
            id, name, slug, short_description, full_description,
            price, sale_price, sku, category_id, section_id,
            inventory_qty, status, is_featured, is_best_seller, is_new_arrival,
            specifications, care_instructions, shipping_info
        ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, 'active', ?, ?, ?,
            ?, ?, ?
        )
    `);

    const insertImage = db.prepare(`
        INSERT INTO product_images (product_id, image_path, thumbnail_path, alt_text, display_order, is_primary)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertVideo = db.prepare(`
        INSERT INTO product_videos (product_id, video_path, title, display_order, is_featured)
        VALUES (?, ?, ?, ?, 1)
    `);

    let totalSections = 0;
    let totalCategories = 0;
    let totalProducts = 0;
    let totalImages = 0;
    let totalVideos = 0;

    for (const sec of catalog) {
        insertSection.run(
            sec.id,
            sec.name,
            sec.slug,
            sec.name === 'Carpets' ? 'Masterpiece handwoven carpets crafted with generations of tradition.' : 'Artisanal authentic kilim flatweaves and wall hangings.',
            sec.id
        );
        totalSections++;

        for (const cat of sec.categories) {
            insertCategory.run(
                cat.id,
                cat.section_id,
                cat.name,
                cat.slug,
                cat.description || `Handcrafted ${cat.name} collection.`,
                cat.id
            );
            totalCategories++;

            for (const prod of cat.products) {
                // Generate realistic price based on category
                let basePrice = 4500;
                if (cat.name.includes('Antique Rugs')) basePrice = 14500;
                else if (cat.name.includes('Handmade Rugs')) basePrice = 11500;
                else if (cat.name.includes('Antique Kilims')) basePrice = 8500;
                else if (cat.name.includes('New Zealand')) basePrice = 7200;
                else if (cat.name.includes('Fine Wool')) basePrice = 6400;
                else if (cat.name.includes('Tableaux')) basePrice = 5800;
                else if (cat.name.includes('Cotton')) basePrice = 3800;

                // Deterministic SKU
                const secCode = sec.name.substring(0, 3).toUpperCase();
                const catCode = cat.name.substring(0, 3).toUpperCase();
                const sku = `${secCode}-${catCode}-${String(prod.folder_number).padStart(3, '0')}`;

                const isFeatured = (prod.id % 5 === 0) ? 1 : 0;
                const isBestSeller = (prod.id % 4 === 0) ? 1 : 0;
                const isNewArrival = (prod.id % 3 === 0) ? 1 : 0;

                insertProduct.run(
                    prod.id,
                    prod.name,
                    prod.slug,
                    prod.short_description,
                    prod.full_description,
                    basePrice,
                    null, // No fake sale price
                    sku,
                    cat.id,
                    sec.id,
                    5, // In stock
                    isFeatured,
                    isBestSeller,
                    isNewArrival,
                    JSON.stringify({ "Craft": "Handwoven", "Origin": "Egypt", "Condition": "Pristine Authentic" }),
                    "Vacuum regularly on low suction without beater bar. Spot clean with mild wool-safe detergent and cold water. Professional rug cleaning recommended for deep maintenance.",
                    "Complimentary white-glove insured delivery across Egypt within 3-5 business days. International shipping available upon request."
                );
                totalProducts++;

                // Seed Images
                if (prod.images && prod.images.length > 0) {
                    for (const img of prod.images) {
                        insertImage.run(
                            prod.id,
                            img.image_path,
                            img.thumbnail_path,
                            `${prod.name} - Handwoven`,
                            img.display_order || 0,
                            img.is_primary ? 1 : 0
                        );
                        totalImages++;
                    }
                }

                // Seed Videos
                if (prod.videos && prod.videos.length > 0) {
                    for (let vIdx = 0; vIdx < prod.videos.length; vIdx++) {
                        insertVideo.run(
                            prod.id,
                            prod.videos[vIdx],
                            `${prod.name} Video Showcase`,
                            vIdx
                        );
                        totalVideos++;
                    }
                }
            }
        }
    }

    // 5. Update Navigation Items
    db.exec("DELETE FROM navigation_items WHERE location = 'main';");
    const insertNav = db.prepare(`
        INSERT INTO navigation_items (label, url, display_order, location, is_active)
        VALUES (?, ?, ?, 'main', 1)
    `);

    insertNav.run('CARPETS', '/shop?section=carpets', 1);
    insertNav.run('KILIMS', '/shop?section=kilims', 2);
    insertNav.run('ALL PRODUCTS', '/shop', 3);
    insertNav.run('OUR STORY', '/about', 4);
    insertNav.run('CONTACT', '/contact', 5);

    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`   - Sections:   ${totalSections}`);
    console.log(`   - Categories: ${totalCategories}`);
    console.log(`   - Products:   ${totalProducts}`);
    console.log(`   - Images:     ${totalImages}`);
    console.log(`   - Videos:     ${totalVideos}`);
    console.log(`   - Main Nav:   5 items updated`);

    closeDb();
}

seedGdriveCatalog().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
