require('dotenv').config();
const { getDb, closeDb } = require('./connection');

async function seedProducts() {
    console.log('🌱 Seeding rich sample products for Yadawy...');
    const db = getDb();

    // Ensure uploads directory exists
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Get categories & collections & types & sizes
    const categories = db.prepare('SELECT id, slug FROM categories').all();
    const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));

    const collections = db.prepare('SELECT id, slug FROM collections').all();
    const colMap = Object.fromEntries(collections.map(c => [c.slug, c.id]));

    const types = db.prepare('SELECT id, slug FROM product_types').all();
    const typeMap = Object.fromEntries(types.map(t => [t.slug, t.id]));

    const sizes = db.prepare('SELECT id, name FROM sizes').all();

    // Check if products already seeded
    const existingCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
    if (existingCount > 0) {
        console.log(`ℹ️ Products already exist (${existingCount} products). Skipping product seeding.`);
        closeDb();
        return;
    }

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
            full_description: 'Crafted with master weavers in the Siwa oasis, this piece carries ancestral Berber symbols of protection and harmony. Woven from 100% locally sourced unbleached wool on traditional horizontal pit looms. The subtle terracotta and rich burgundy patterns bring grounded warmth to any living space or hallway.',
            material: '100% Egyptian Wool & Organic Cotton Warp',
            color: 'Terracotta, Burgundy, Cream',
            dimensions: '120 × 180 cm',
            weight: '3.8 kg',
            care_instructions: 'Vacuum gently without beater brush. Spot clean with mild soap and cold water. Professional dry clean recommended.',
            is_featured: 1,
            is_best_seller: 1,
            is_new_arrival: 0,
            is_on_sale: 1,
            status: 'active',
            images: [
                'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1200&q=80'
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
            full_description: 'Fowwa on the Nile delta has been Egypt’s premier weaving capital for over five centuries. This lightweight yet resilient flatweave features rhythmic diamond lozenges, tightly interlocked using pure combed Egyptian cotton. Reversible design provides double the longevity.',
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
            full_description: 'A contemporary dialogue between modern minimalist interiors and traditional Nubian dye masters. Featuring sunset hues transitioning from deep pomegranate to soft ochre and dune beige. Dense weave ensures comfortable underfoot texture in bedroom and lounge environments.',
            material: '80% Highland Wool, 20% Organic Cotton',
            color: 'Pomegranate, Ochre, Dune Beige',
            dimensions: '150 × 200 cm',
            weight: '4.5 kg',
            care_instructions: 'Professional rug cleaning recommended. Blot spills immediately with clean damp cloth.',
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
            name: 'Sinai Bedouin Tribal Runner',
            slug: 'sinai-bedouin-tribal-runner',
            sku: 'YDW-SIN-004',
            price: 2200,
            sale_price: 1950,
            inventory_qty: 6,
            category_id: catMap['tribal'],
            collection_id: colMap['nomadic-series'],
            type_id: typeMap['wool-kilim'],
            short_description: 'Long corridor runner woven with authentic Bedouin tribal symbols and braided fringe ends.',
            full_description: 'Handcrafted by women weaving cooperatives in the South Sinai mountains. Handspun wool dyed with native desert shrubs, pomegranate peel, and madder root. The narrow runner proportion is tailored for entry hallways, bedside paths, and galley kitchens.',
            material: '100% Handspun Sinai Mountain Wool',
            color: 'Charcoal, Crimson, Oatmeal, Rust',
            dimensions: '70 × 140 cm',
            weight: '2.2 kg',
            care_instructions: 'Spot clean only. Shake outdoors to remove dust. Do not machine wash.',
            is_featured: 0,
            is_best_seller: 1,
            is_new_arrival: 1,
            is_on_sale: 1,
            status: 'active',
            images: [
                'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80'
            ]
        },
        {
            name: 'Karnak Royal Velvet Tapestry Rug',
            slug: 'karnak-royal-velvet-tapestry-rug',
            sku: 'YDW-KAR-005',
            price: 5800,
            sale_price: null,
            inventory_qty: 4,
            category_id: catMap['vintage'],
            collection_id: colMap['heritage-collection'],
            type_id: typeMap['velvet-rug'],
            short_description: 'Sumptuous plush velvet texture embossed with subtle Pharaonic and Islamic architectural reliefs.',
            full_description: 'A luxurious heirloom-grade rug uniting high knot density with a silken velvet finish. Luminous under ambient lighting, creating deep tonal shifts in rich maroon and imperial gold. A centerpiece for grand salons and formal dining spaces.',
            material: 'Egyptian Cotton & Fine Wool Velvet Blend',
            color: 'Imperial Maroon, Antique Gold, Ebony',
            dimensions: '200 × 300 cm',
            weight: '7.2 kg',
            care_instructions: 'Professional dry cleaning only. Keep away from excessive dampness.',
            is_featured: 1,
            is_best_seller: 0,
            is_new_arrival: 0,
            is_on_sale: 0,
            status: 'active',
            images: [
                'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1200&q=80'
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
            full_description: 'Minimalist lines meet ancestral weaving technique. Clean chevrons and staggered stepped pyramids created with double-interlocked weft. Sits flat on hardwood, microcement, or polished stone floors with exceptional stability.',
            material: '100% Pure Egyptian Cotton',
            color: 'Charcoal Grey, Off-White, Camel',
            dimensions: '120 × 180 cm',
            weight: '3.0 kg',
            care_instructions: 'Vacuum regularly. Gentle machine wash cold with wool/delicate detergent.',
            is_featured: 1,
            is_best_seller: 1,
            is_new_arrival: 1,
            is_on_sale: 1,
            status: 'active',
            images: [
                'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80'
            ]
        },
        {
            name: 'Coptic Vintage Medallion Kilim',
            slug: 'coptic-vintage-medallion-kilim',
            sku: 'YDW-COP-007',
            price: 4900,
            sale_price: null,
            inventory_qty: 5,
            category_id: catMap['vintage'],
            collection_id: colMap['heritage-collection'],
            type_id: typeMap['wool-kilim'],
            short_description: 'An antique-washed museum quality kilim featuring central floral medallions and intricate fretwork borders.',
            full_description: 'Each Coptic vintage piece undergoes a gentle sun-washing and stone-softening ritual in the desert to bestow that coveted time-burnished patina. Woven from tight combed wool yarns that resist wear across decades of enjoyment.',
            material: '100% Hand-Dyed Vintage Wool',
            color: 'Faded Maroon, Antique Cream, Olive Gold',
            dimensions: '150 × 200 cm',
            weight: '4.8 kg',
            care_instructions: 'Professional vintage rug preservation clean only. Rotate 180 degrees annually.',
            is_featured: 1,
            is_best_seller: 0,
            is_new_arrival: 0,
            is_on_sale: 0,
            status: 'active',
            images: [
                'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=1200&q=80'
            ]
        },
        {
            name: 'Al-Dahab Nomadic Silk-Blend Tapestry',
            slug: 'al-dahab-nomadic-silk-blend-tapestry',
            sku: 'YDW-DAH-008',
            price: 6400,
            sale_price: 5400,
            inventory_qty: 3,
            category_id: catMap['contemporary'],
            collection_id: colMap['nomadic-series'],
            type_id: typeMap['silk-blend'],
            short_description: 'Exquisite silk and wool luster with shimmering golden accents inspired by the Red Sea coast.',
            full_description: 'Fine silk strands interlace with soft fleece wool to create a reflective sheen that captures morning and evening light with equal grace. Perfect as a wall tapestry or statement rug in intimate spaces.',
            material: '60% Fine Wool, 40% Mulberry Silk Blend',
            color: 'Gold Shimmer, Sand Beige, Soft Rust',
            dimensions: '120 × 180 cm',
            weight: '3.2 kg',
            care_instructions: 'Dry clean only with specialist textile conservator.',
            is_featured: 0,
            is_best_seller: 0,
            is_new_arrival: 1,
            is_on_sale: 1,
            status: 'active',
            images: [
                'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80'
            ]
        }
    ];

    const prodInsert = db.prepare(`
        INSERT INTO products (
            name, slug, sku, price, sale_price, inventory_qty,
            category_id, collection_id, type_id,
            short_description, full_description, material, color, dimensions, weight, care_instructions,
            is_featured, is_best_seller, is_new_arrival, is_on_sale, status
        ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?
        )
    `);

    const imgInsert = db.prepare(`
        INSERT INTO product_images (product_id, image_path, display_order, is_primary)
        VALUES (?, ?, ?, ?)
    `);

    const sizeInsert = db.prepare(`
        INSERT INTO product_sizes (product_id, size_id, price_adjustment, inventory_qty, is_available)
        VALUES (?, ?, ?, 5, 1)
    `);

    for (const p of sampleProducts) {
        const info = prodInsert.run(
            p.name, p.slug, p.sku, p.price, p.sale_price, p.inventory_qty,
            p.category_id || null, p.collection_id || null, p.type_id || null,
            p.short_description, p.full_description, p.material, p.color, p.dimensions, p.weight, p.care_instructions,
            p.is_featured, p.is_best_seller, p.is_new_arrival, p.is_on_sale, p.status
        );

        const productId = info.lastInsertRowid;

        // Insert gallery images
        p.images.forEach((imgUrl, idx) => {
            imgInsert.run(productId, imgUrl, idx + 1, idx === 0 ? 1 : 0);
        });

        // Insert sizes
        if (sizes.length > 0) {
            const pickedSizes = sizes.slice(0, 4);
            pickedSizes.forEach((s, idx) => {
                const adj = idx * 600;
                sizeInsert.run(productId, s.id, adj);
            });
        }

        console.log(`  ✓ Product seeded: ${p.name} (ID: ${productId})`);
    }

    // Seed sample promo coupons
    const cpCount = db.prepare('SELECT COUNT(*) as c FROM coupons').get().c;
    if (cpCount === 0) {
        const coupons = [
            { code: 'YADAWY10', discount_type: 'percentage', discount_value: 10, min_order_value: 1000, usage_limit: 500, is_active: 1 },
            { code: 'HERITAGE20', discount_type: 'percentage', discount_value: 20, min_order_value: 5000, usage_limit: 100, is_active: 1 },
            { code: 'WELCOME500', discount_type: 'fixed', discount_value: 500, min_order_value: 3000, usage_limit: 200, is_active: 1 }
        ];
        const cpStmt = db.prepare('INSERT INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit, is_active) VALUES (?, ?, ?, ?, ?, ?)');
        for (const c of coupons) {
            cpStmt.run(c.code, c.discount_type, c.discount_value, c.min_order_value, c.usage_limit, c.is_active);
        }
        console.log('✅ Coupons seeded');
    }

    // Seed sample order
    const orderCount = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
    if (orderCount === 0) {
        const orderRes = db.prepare(`
            INSERT INTO orders (
                order_number, customer_name, customer_email, customer_phone,
                address_line1, city, state, postal_code, country,
                subtotal, discount_amount, shipping_amount, total,
                status, payment_status, notes
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?
            )
        `).run(
            'YDW-2026-1001', 'Tarek Abdelrahman', 'tarek@example.com', '+20 100 123 4567',
            '15 Brazil Street, Zamalek', 'Cairo', 'Cairo Governorate', '11211', 'Egypt',
            3450, 0, 0, 3450,
            'confirmed', 'paid', 'Please deliver after 4 PM'
        );

        const orderId = orderRes.lastInsertRowid;
        const firstProd = db.prepare('SELECT id, name, price, sku FROM products LIMIT 1').get();
        if (firstProd) {
            db.prepare(`
                INSERT INTO order_items (order_id, product_id, product_name, product_image, size, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                orderId, firstProd.id, firstProd.name,
                'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
                '120 × 180 cm', 1, firstProd.price, firstProd.price
            );
        }
        console.log('✅ Sample order seeded');
    }

    closeDb();
    console.log('🎉 Product seeding finished successfully!');
}

seedProducts().catch(err => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
});
