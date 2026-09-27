const { getDb } = require('../src/database/connection');

function syncDatabaseWithSourceDoc() {
    const db = getDb();
    console.log('🔄 Syncing SQLite database settings and content with document source of truth...');

    // 1. Update site_settings
    const settings = {
        site_title: 'Yadawy — Handwoven Rugs & Kilim',
        site_description: 'Yadawy.. A Piece That Tells a Story. 100% handwoven Egyptian kilims and handcrafted rugs.',
        currency: 'EGP',
        currency_symbol: 'LE',
        contact_email: '',
        contact_phone: '01225910140',
        contact_phone_2: '01039555155',
        contact_phone_3: '01069005565',
        contact_landline: '035427565',
        contact_whatsapp: '201225910140',
        contact_address: 'Shipping across Cairo, Alexandria, Giza & All Egypt',
        social_instagram: 'https://www.instagram.com/yadawy0/',
        social_facebook: 'https://www.facebook.com/share/1EeqnwUzCw/',
        social_pinterest: '',
        announcement_text: 'HANDMADE EGYPTIAN KILIMS & RUGS • 1-YEAR WARRANTY • CASH ON DELIVERY',
        announcement_active: '1',
        shipping_info: 'Delivery within 3–5 business days across Cairo, Alexandria, Giza and all Egyptian governorates. Cash on delivery available.',
        return_policy: 'Returns and exchanges accepted within 14 days of delivery for unused items in original condition with tags.'
    };

    const upsertSetting = db.prepare(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at)
        VALUES (@key, @value, 'text', datetime('now'))
        ON CONFLICT(setting_key) DO UPDATE SET
            setting_value = excluded.setting_value,
            updated_at = datetime('now')
    `);

    for (const [key, value] of Object.entries(settings)) {
        upsertSetting.run({ key, value });
    }
    console.log('✅ Site settings updated with official document numbers and links.');

    // 2. Update brand story homepage section
    db.prepare(`
        UPDATE homepage_sections 
        SET 
            title = 'The Story Behind Egyptian Kilims',
            subtitle = '100% Handwoven Artistry',
            content = 'Egyptian kilims are part of a rich tradition of handcraftsmanship rooted in Egyptian culture and heritage. Every Yadawy piece is 100% handwoven by Egyptian artisans using traditional techniques passed down through generations. Made with high-quality Egyptian wool on a durable cotton foundation, each unique piece is built to last for decades.',
            link_text = 'EXPLORE OUR STORY',
            link_url = '/about'
        WHERE section_key = 'brand_story' OR section_type = 'story'
    `).run();
    console.log('✅ Homepage story section updated.');

    console.log('✨ All database records successfully synchronized!');
}

syncDatabaseWithSourceDoc();
