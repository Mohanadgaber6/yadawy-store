const { getDb } = require('../src/database/connection');
const db = getDb();
db.prepare(`
    UPDATE homepage_sections 
    SET title = 'OUR COLLECTION', 
        subtitle = 'Discover our two core heritage disciplines: Handcrafted Carpets and Egyptian Kilims' 
    WHERE section_type = 'collections'
`).run();
console.log('Homepage collections section updated successfully.');
