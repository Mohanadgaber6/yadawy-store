require('dotenv').config();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { getDb, closeDb } = require('./connection');

function initDatabaseSync(databaseInstance) {
    const db = databaseInstance || getDb();
    console.log('🗄️ Initializing Yadawy database synchronously...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);

    // Seed admin user
    const adminExists = db.prepare('SELECT id FROM admins LIMIT 1').get();
    if (!adminExists) {
        const email = process.env.ADMIN_EMAIL || 'admin@yadawy.com';
        const password = process.env.ADMIN_PASSWORD || 'YadawyAdmin2024!';
        const hash = bcrypt.hashSync(password, 10);

        db.prepare(`
            INSERT INTO admins (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        `).run('admin', email, hash, 'superadmin');
    }

    // Seed categories
    const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
    if (catCount === 0) {
        const categories = [
            { name: 'Traditional', slug: 'traditional', description: 'Timeless handwoven pieces rooted in centuries of tradition', order: 1 },
            { name: 'Contemporary', slug: 'contemporary', description: 'Modern interpretations of classic weaving techniques', order: 2 },
            { name: 'Geometric', slug: 'geometric', description: 'Bold patterns featuring striking geometric motifs', order: 3 },
            { name: 'Tribal', slug: 'tribal', description: 'Authentic tribal designs from master weavers', order: 4 },
            { name: 'Vintage', slug: 'vintage', description: 'Carefully curated vintage and antique pieces', order: 5 },
        ];
        const stmt = db.prepare('INSERT INTO categories (name, slug, description, display_order) VALUES (?, ?, ?, ?)');
        for (const cat of categories) {
            stmt.run(cat.name, cat.slug, cat.description, cat.order);
        }
    }

    // Seed collections
    const colCount = db.prepare('SELECT COUNT(*) as c FROM collections').get().c;
    if (colCount === 0) {
        const collections = [
            { name: 'Heritage Collection', slug: 'heritage-collection', description: 'Our finest heritage pieces, handcrafted with time-honored techniques passed down through generations.', order: 1 },
            { name: 'Modern Artisan', slug: 'modern-artisan', description: 'Contemporary designs that blend traditional craftsmanship with modern aesthetics.', order: 2 },
            { name: 'Nomadic Series', slug: 'nomadic-series', description: 'Inspired by the nomadic traditions of the Middle East, each piece tells a story of journey and culture.', order: 3 },
            { name: 'Seasonal Sale', slug: 'seasonal-sale', description: 'Exceptional handwoven pieces at special prices for a limited time.', order: 4 },
        ];
        const stmt = db.prepare('INSERT INTO collections (name, slug, description, display_order) VALUES (?, ?, ?, ?)');
        for (const col of collections) {
            stmt.run(col.name, col.slug, col.description, col.order);
        }
    }

    // Seed product types
    const typeCount = db.prepare('SELECT COUNT(*) as c FROM product_types').get().c;
    if (typeCount === 0) {
        const types = [
            { name: 'Cotton Kilim', slug: 'cotton-kilim' },
            { name: 'Wool Kilim', slug: 'wool-kilim' },
            { name: 'Velvet Rug', slug: 'velvet-rug' },
            { name: 'Tapestry', slug: 'tapestry' },
            { name: 'Flatweave', slug: 'flatweave' },
            { name: 'Silk Blend', slug: 'silk-blend' },
        ];
        const stmt = db.prepare('INSERT INTO product_types (name, slug) VALUES (?, ?)');
        for (const type of types) {
            stmt.run(type.name, type.slug);
        }
    }

    // Seed sizes
    const sizeCount = db.prepare('SELECT COUNT(*) as c FROM sizes').get().c;
    if (sizeCount === 0) {
        const sizes = [
            { name: '60 × 90 cm', width: '60', height: '90', unit: 'cm', order: 1 },
            { name: '70 × 140 cm', width: '70', height: '140', unit: 'cm', order: 2 },
            { name: '100 × 150 cm', width: '100', height: '150', unit: 'cm', order: 3 },
            { name: '120 × 180 cm', width: '120', height: '180', unit: 'cm', order: 4 },
            { name: '150 × 200 cm', width: '150', height: '200', unit: 'cm', order: 5 },
            { name: '200 × 300 cm', width: '200', height: '300', unit: 'cm', order: 6 },
            { name: '250 × 350 cm', width: '250', height: '350', unit: 'cm', order: 7 },
            { name: '300 × 400 cm', width: '300', height: '400', unit: 'cm', order: 8 },
        ];
        const stmt = db.prepare('INSERT INTO sizes (name, width, height, unit, display_order) VALUES (?, ?, ?, ?, ?)');
        for (const size of sizes) {
            stmt.run(size.name, size.width, size.height, size.unit, size.order);
        }
    }

    // Seed navigation
    const navCount = db.prepare('SELECT COUNT(*) as c FROM navigation_items').get().c;
    if (navCount === 0) {
        const navItems = [
            { label: 'HOME', url: '/', order: 1, location: 'main' },
            { label: 'SHOP', url: '/shop', order: 2, location: 'main' },
            { label: 'COLLECTIONS', url: '/collections', order: 3, location: 'main' },
            { label: 'OUR STORY', url: '/about', order: 4, location: 'main' },
            { label: 'CONTACT', url: '/contact', order: 5, location: 'main' },
        ];
        const stmt = db.prepare('INSERT INTO navigation_items (label, url, display_order, location) VALUES (?, ?, ?, ?)');
        for (const nav of navItems) {
            stmt.run(nav.label, nav.url, nav.order, nav.location);
        }
    }

    // Seed homepage sections
    const hpCount = db.prepare('SELECT COUNT(*) as c FROM homepage_sections').get().c;
    if (hpCount === 0) {
        const sections = [
            {
                key: 'hero',
                type: 'hero',
                title: 'The Art of Handwoven Rugs',
                subtitle: 'Curated masterpieces woven with tradition, designed for modern living',
                link_text: 'EXPLORE COLLECTION',
                link_url: '/shop',
                order: 1
            },
            {
                key: 'collections_grid',
                type: 'collections',
                title: 'Our Collections',
                subtitle: 'Discover handcrafted pieces for every space',
                order: 2
            },
            {
                key: 'best_sellers',
                type: 'products',
                title: 'Best Sellers',
                subtitle: 'Our most loved handwoven pieces',
                link_text: 'SEE ALL',
                link_url: '/shop?sort=best_seller',
                product_source: 'best_seller',
                max_products: 10,
                order: 3
            },
            {
                key: 'featured_products',
                type: 'products',
                title: 'Featured',
                subtitle: 'Hand-picked by our curators',
                link_text: 'SEE ALL',
                link_url: '/shop?filter=featured',
                product_source: 'featured',
                max_products: 10,
                order: 4
            },
            {
                key: 'brand_story',
                type: 'story',
                title: 'The Story Behind Egyptian Kilims',
                subtitle: '100% Handwoven Artistry',
                content: 'Egyptian kilims are part of a rich tradition of handcraftsmanship rooted in Egyptian culture and heritage. Every Yadawy piece is 100% handwoven by Egyptian artisans using traditional techniques passed down through generations.',
                link_text: 'EXPLORE OUR STORY',
                link_url: '/about',
                order: 5
            },
            {
                key: 'new_arrivals',
                type: 'products',
                title: 'New Arrivals',
                subtitle: 'Fresh additions to our collection',
                link_text: 'SEE ALL',
                link_url: '/shop?sort=newest',
                product_source: 'new_arrival',
                max_products: 10,
                order: 6
            },
            {
                key: 'newsletter',
                type: 'newsletter',
                title: 'Stay Connected',
                subtitle: 'Subscribe to receive updates on new arrivals, exclusive offers, and the stories behind our craft.',
                order: 7
            }
        ];

        const stmt = db.prepare(`
            INSERT INTO homepage_sections (section_key, section_type, title, subtitle, content, link_text, link_url, product_source, max_products, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const s of sections) {
            stmt.run(s.key, s.type, s.title || null, s.subtitle || null, s.content || null,
                s.link_text || null, s.link_url || null, s.product_source || null, s.max_products || null, s.order);
        }
    }

    // Seed site settings
    const settingsCount = db.prepare('SELECT COUNT(*) as c FROM site_settings').get().c;
    if (settingsCount === 0) {
        const settings = [
            { key: 'site_title', value: 'Yadawy — Handwoven Rugs & Kilim', type: 'text' },
            { key: 'site_description', value: 'Yadawy.. A Piece That Tells a Story. 100% handwoven Egyptian kilims and handcrafted rugs.', type: 'text' },
            { key: 'currency', value: 'EGP', type: 'text' },
            { key: 'currency_symbol', value: 'LE', type: 'text' },
            { key: 'contact_email', value: '', type: 'text' },
            { key: 'contact_phone', value: '01225910140', type: 'text' },
            { key: 'contact_phone_2', value: '01039555155', type: 'text' },
            { key: 'contact_phone_3', value: '01069005565', type: 'text' },
            { key: 'contact_landline', value: '035427565', type: 'text' },
            { key: 'contact_whatsapp', value: '201225910140', type: 'text' },
            { key: 'contact_address', value: 'Shipping across Cairo, Alexandria, Giza & All Egypt', type: 'text' },
            { key: 'social_instagram', value: 'https://www.instagram.com/yadawy0/', type: 'text' },
            { key: 'social_facebook', value: 'https://www.facebook.com/share/1EeqnwUzCw/', type: 'text' },
            { key: 'social_pinterest', value: '', type: 'text' },
            { key: 'announcement_text', value: 'HANDMADE EGYPTIAN KILIMS & RUGS • 1-YEAR WARRANTY • CASH ON DELIVERY', type: 'text' },
            { key: 'announcement_active', value: '1', type: 'boolean' },
            { key: 'shipping_info', value: 'Delivery within 3–5 business days across Cairo, Alexandria, Giza and all governorates in Egypt. Cash on delivery available.', type: 'text' },
            { key: 'return_policy', value: 'Returns and exchanges accepted within 14 days of delivery for unused items in original condition with tags.', type: 'text' },
        ];
        const stmt = db.prepare('INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)');
        for (const s of settings) {
            stmt.run(s.key, s.value, s.type);
        }
    }

    // Seed shipping_settings
    db.exec(`
        CREATE TABLE IF NOT EXISTS shipping_settings (
            id INTEGER PRIMARY KEY DEFAULT 1,
            cost REAL NOT NULL DEFAULT 100,
            currency TEXT NOT NULL DEFAULT 'EGP',
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        INSERT OR IGNORE INTO shipping_settings (id, cost, currency) VALUES (1, 100, 'EGP');
    `);

    // Seed sample products
    const existingProdCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
    if (existingProdCount === 0) {
        const catMap = Object.fromEntries(db.prepare('SELECT id, slug FROM categories').all().map(c => [c.slug, c.id]));
        const colMap = Object.fromEntries(db.prepare('SELECT id, slug FROM collections').all().map(c => [c.slug, c.id]));
        const typeMap = Object.fromEntries(db.prepare('SELECT id, slug FROM product_types').all().map(t => [t.slug, t.id]));
        const allSizes = db.prepare('SELECT id, name FROM sizes').all();

        const sampleProducts = [
            {
                name: 'Siwa Oasis Handwoven Kilim',
                slug: 'siwa-oasis-handwoven-kilim',
                sku: 'YDW-SIW-001',
                price: 3450,
                sale_price: 2950,
                inventory_qty: 14,
                category_id: catMap['traditional'],
                collection_id: colMap['heritage-collection'],
                type_id: typeMap['wool-kilim'],
                short_description: 'An authentic Siwa oasis geometric motif woven with natural unbleached wool and earthy terracotta dyes.',
                full_description: 'Crafted with master weavers in the Siwa oasis, this piece carries ancestral Berber symbols of protection and harmony. Woven from 100% locally sourced unbleached wool on traditional horizontal pit looms.',
                material: '100% Egyptian Wool & Organic Cotton Warp',
                color: 'Terracotta, Burgundy, Cream',
                dimensions: '120 × 180 cm',
                weight: '3.8 kg',
                care_instructions: 'Vacuum gently without beater brush. Spot clean with mild soap and cold water.',
                is_featured: 1,
                is_best_seller: 1,
                is_new_arrival: 0,
                is_on_sale: 1,
                status: 'active',
                images: [
                    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                name: 'Fowwa Artisan Flatweave Kilim',
                slug: 'fowwa-artisan-flatweave-kilim',
                sku: 'YDW-FOW-002',
                price: 2800,
                sale_price: null,
                inventory_qty: 8,
                category_id: catMap['traditional'],
                collection_id: colMap['heritage-collection'],
                type_id: typeMap['cotton-kilim'],
                short_description: 'Traditional Egyptian flatweave with timeless diamond grid patterns, handcrafted in historic Fowwa.',
                full_description: 'Fowwa on the Nile delta has been Egypt’s premier weaving capital for over five centuries. This lightweight yet resilient flatweave features rhythmic diamond lozenges.',
                material: '100% Egyptian Combed Cotton',
                color: 'Deep Maroon, Warm Ivory, Mustard Gold',
                dimensions: '100 × 150 cm',
                weight: '2.5 kg',
                care_instructions: 'Machine washable on cold delicate cycle. Hang to air dry flat.',
                is_featured: 1,
                is_best_seller: 1,
                is_new_arrival: 0,
                is_on_sale: 0,
                status: 'active',
                images: [
                    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                name: 'Nubian Sunset Wool Kilim',
                slug: 'nubian-sunset-wool-kilim',
                sku: 'YDW-NUB-003',
                price: 4200,
                sale_price: 3750,
                inventory_qty: 12,
                category_id: catMap['contemporary'],
                collection_id: colMap['modern-artisan'],
                type_id: typeMap['wool-kilim'],
                short_description: 'Striking gradient colorways echoing the sunset over Lake Nasser and the Golden Nile.',
                full_description: 'A contemporary dialogue between modern minimalist interiors and traditional Nubian dye masters. Featuring sunset hues transitioning from deep pomegranate to soft ochre.',
                material: '80% Highland Wool, 20% Organic Cotton',
                color: 'Pomegranate, Ochre, Dune Beige',
                dimensions: '150 × 200 cm',
                weight: '4.5 kg',
                care_instructions: 'Professional rug cleaning recommended. Blot spills immediately.',
                is_featured: 1,
                is_best_seller: 0,
                is_new_arrival: 1,
                is_on_sale: 1,
                status: 'active',
                images: [
                    'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                name: 'Dakhla Geometric Flatweave',
                slug: 'dakhla-geometric-flatweave',
                sku: 'YDW-DAK-006',
                price: 3100,
                sale_price: 2650,
                inventory_qty: 11,
                category_id: catMap['geometric'],
                collection_id: colMap['modern-artisan'],
                type_id: typeMap['flatweave'],
                short_description: 'Crisp Scandinavian-inspired geometry harmonized with historic Egyptian desert motifs.',
                full_description: 'Minimalist lines meet ancestral weaving technique. Clean chevrons and staggered stepped pyramids created with double-interlocked weft.',
                material: '100% Pure Egyptian Cotton',
                color: 'Charcoal Grey, Off-White, Camel',
                dimensions: '120 × 180 cm',
                weight: '3.0 kg',
                care_instructions: 'Vacuum regularly. Gentle machine wash cold with delicate detergent.',
                is_featured: 1,
                is_best_seller: 1,
                is_new_arrival: 1,
                is_on_sale: 1,
                status: 'active',
                images: [
                    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80'
                ]
            }
        ];

        const insertProductStmt = db.prepare(`
            INSERT INTO products (name, slug, sku, price, sale_price, inventory_qty, category_id, collection_id, type_id, short_description, full_description, material, color, dimensions, weight, care_instructions, is_featured, is_best_seller, is_new_arrival, is_on_sale, status)
            VALUES (@name, @slug, @sku, @price, @sale_price, @inventory_qty, @category_id, @collection_id, @type_id, @short_description, @full_description, @material, @color, @dimensions, @weight, @care_instructions, @is_featured, @is_best_seller, @is_new_arrival, @is_on_sale, @status)
        `);

        const insertImageStmt = db.prepare(`
            INSERT INTO product_images (product_id, image_path, is_primary, display_order)
            VALUES (?, ?, ?, ?)
        `);

        const insertSizeStmt = db.prepare(`
            INSERT INTO product_sizes (product_id, size_name, is_available)
            VALUES (?, ?, 1)
        `);

        for (const p of sampleProducts) {
            const result = insertProductStmt.run(p);
            const productId = result.lastInsertRowid;

            if (p.images && p.images.length > 0) {
                p.images.forEach((img, idx) => {
                    insertImageStmt.run(productId, img, idx === 0 ? 1 : 0, idx + 1);
                });
            }

            allSizes.slice(0, 4).forEach(s => {
                insertSizeStmt.run(productId, s.name);
            });
        }
    }

    console.log('🎉 Database sync initialization complete!');
}

async function initDatabase() {
    initDatabaseSync();
}

if (require.main === module) {
    initDatabaseSync();
}

module.exports = { initDatabase, initDatabaseSync };
