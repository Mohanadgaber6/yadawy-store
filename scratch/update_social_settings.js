const { getDb } = require('../src/database/connection.js');

function run() {
    const db = getDb();
    console.log('Updating site_settings in database...');

    const update = db.prepare('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?');
    update.run('201039555155', 'contact_whatsapp');
    update.run('+20 10 39555155', 'contact_phone');
    update.run('+20 10 39555155', 'contact_phone_2');
    update.run('+20 10 39555155', 'contact_phone_3');
    update.run('https://www.facebook.com/share/1EeqnwUzCw/', 'social_facebook');
    update.run('https://www.instagram.com/yadawy0/', 'social_instagram');

    const rows = db.prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE '%contact%' OR setting_key LIKE '%social%'").all();
    console.log('Updated settings:', rows);
}

run();
