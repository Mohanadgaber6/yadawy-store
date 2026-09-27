const fs = require('fs');
const path = require('path');

const adminPagesPath = path.join(__dirname, '..', 'admin', 'js', 'admin-pages.js');
let adminPages = fs.readFileSync(adminPagesPath, 'utf8');

adminPages = adminPages.replace(/📌/g, '');
adminPages = adminPages.replace(/💾\s*/g, '');
adminPages = adminPages.replace(/⚙️\s*/g, '');
adminPages = adminPages.replace(/🚚\s*/g, '');
adminPages = adminPages.replace(/✅\s*/g, '');
adminPages = adminPages.replace(/❌\s*/g, '');
adminPages = adminPages.replace(/📞\s*/g, '');
adminPages = adminPages.replace(/✉️\s*/g, '');

fs.writeFileSync(adminPagesPath, adminPages, 'utf8');
console.log('Cleaned admin-pages.js emojis.');

const adminAppPath = path.join(__dirname, '..', 'admin', 'js', 'admin-app.js');
let adminApp = fs.readFileSync(adminAppPath, 'utf8');
adminApp = adminApp.replace(/📞\s*/g, '');
adminApp = adminApp.replace(/✉️\s*/g, '');
fs.writeFileSync(adminAppPath, adminApp, 'utf8');
console.log('Cleaned admin-app.js emojis.');
