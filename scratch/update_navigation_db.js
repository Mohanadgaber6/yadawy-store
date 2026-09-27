const { getDb } = require('../src/database/connection');
const db = getDb();

db.exec(`
    DELETE FROM navigation_items WHERE location = 'main';

    INSERT INTO navigation_items (label, url, display_order, is_active, location)
    VALUES 
        ('ALL PRODUCTS', '/shop', 1, 1, 'main'),
        ('CONTACT', '/contact', 2, 1, 'main'),
        ('OUR STORY', '/about', 3, 1, 'main');
`);

console.log('Navigation items updated in database:', db.prepare("SELECT * FROM navigation_items WHERE location = 'main'").all());
