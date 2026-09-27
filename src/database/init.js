require('dotenv').config();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { getDb, closeDb } = require('./connection');

async function initDatabase() {
    console.log('🗄️  Initializing Yadawy database...');

    const db = getDb();

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    console.log('✅ Schema created successfully');

    // Seed admin user
    const adminExists = db.prepare('SELECT id FROM admins LIMIT 1').get();
    if (!adminExists) {
        const email = process.env.ADMIN_EMAIL || 'admin@yadawy.com';
        const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
        const hash = await bcrypt.hash(password, 12);

        db.prepare(`
            INSERT INTO admins (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        `).run('admin', email, hash, 'superadmin');
        console.log(`✅ Admin user created: ${email}`);
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
        console.log('✅ Categories seeded');
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
        console.log('✅ Collections seeded');
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
        console.log('✅ Product types seeded');
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
        console.log('✅ Sizes seeded');
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
        console.log('✅ Navigation seeded');
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
        console.log('✅ Homepage sections seeded');
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
        console.log('✅ Site settings seeded');
    }

    console.log('🎉 Database initialization complete!');
}

if (require.main === module) {
    initDatabase().then(() => closeDb()).catch(err => {
        console.error('❌ Database initialization failed:', err);
        process.exit(1);
    });
}

module.exports = { initDatabase };
