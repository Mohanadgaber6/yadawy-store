const { getDb } = require('../src/database/connection.js');

const DEFAULT_DESC = 'A modern take on traditional kilim craftsmanship, featuring three rows of geometric motifs in warm red, mustard, and deep blue, set against a soft ivory base.';
const DEFAULT_HANDWOVEN = 'Handwoven with care, each stitch and subtle color variation adds to the unique character of the piece. Finished with hand-tied tassels at both ends.';
const DEFAULT_WHERE_TO_PLACE = 'Perfect for the living room, beside the bed, or styled as a hallway runner, adding warmth and texture without overpowering the space.';

const DEFAULT_SPECS = 'Material: 100% Handspun Egyptian Wool\nWeave: Traditional Flatweave Kilim\nOrigin: Fowwa, Egypt\nCraft: Handwoven Artisan Quality\nCondition: Pristine Authentic';

const DEFAULT_CARE = '• Vacuum regularly on low suction without a beater bar.\n• Spot clean immediately with a damp cloth and mild wool detergent.\n• Professional rug cleaning recommended for deep cleans.\n• Rotate every 6 months for even wear.';

const DEFAULT_SHIPPING = '• Standard doorstep delivery within 3-5 business days across Egypt.\n• Carefully rolled and packaged in protective water-resistant wrapping.\n• 14-day hassle-free inspection and exchange guarantee.';

function run() {
    const db = getDb();
    console.log('Cleaning up specifications and formatting for all products in DB...');

    const products = db.prepare('SELECT id, specifications, care_instructions, shipping_info FROM products').all();

    const updateStmt = db.prepare(`
        UPDATE products
        SET specifications = ?,
            care_instructions = ?,
            shipping_info = ?
        WHERE id = ?
    `);

    const updateMany = db.transaction(() => {
        for (const p of products) {
            let newSpecs = p.specifications;
            if (!newSpecs || newSpecs.trim().startsWith('{')) {
                newSpecs = DEFAULT_SPECS;
            }

            let newCare = p.care_instructions;
            if (!newCare || !newCare.trim()) {
                newCare = DEFAULT_CARE;
            }

            let newShipping = p.shipping_info;
            if (!newShipping || !newShipping.trim()) {
                newShipping = DEFAULT_SHIPPING;
            }

            updateStmt.run(newSpecs, newCare, newShipping, p.id);
        }
    });

    updateMany();
    console.log(`Successfully formatted all ${products.length} products in database.`);
}

run();
