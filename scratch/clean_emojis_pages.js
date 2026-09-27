const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'js', 'pages.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original size:', content.length);

// 1. Unify WhatsApp numbers & URLs
content = content.replace(/https:\/\/wa\.me\/201[0-9]{9}(\?[^"]*)?/g, 'https://wa.me/201039555155');
content = content.replace(/01225910140/g, '+20 10 39555155');
content = content.replace(/0122 591 0140/g, '+20 10 39555155');
content = content.replace(/01069005565/g, '+20 10 39555155');
content = content.replace(/0106 900 5565/g, '+20 10 39555155');
content = content.replace(/01039555155/g, '+20 10 39555155');
content = content.replace(/0103 955 5155/g, '+20 10 39555155');

// Clean up duplicate phone sequences like "+20 10 39555155 • +20 10 39555155 • +20 10 39555155"
content = content.replace(/<a href="tel:\+20 10 39555155">\+20 10 39555155<\/a>\s*•\s*<a href="tel:\+20 10 39555155">\+20 10 39555155<\/a>\s*•\s*<a href="tel:\+20 10 39555155">\+20 10 39555155<\/a>/g, '<a href="tel:+201039555155" style="font-weight:700; color:var(--color-maroon);">+20 10 39555155</a>');

content = content.replace(/\+20 10 39555155\s*–\s*\+20 10 39555155\s*–\s*\+20 10 39555155/g, '+20 10 39555155');

// 2. Remove emojis in Our Story
content = content.replace(/<span class="btn-icon">🔇<\/span>/g, '<span class="btn-icon">MUTE</span>');
content = content.replace(/<span class="btn-icon">🔊<\/span>/g, '<span class="btn-icon">SOUND</span>');
content = content.replace(/<span class="prompt-icon">🔊<\/span>/g, '<span class="prompt-icon">PLAY</span>');
content = content.replace(/<span class="detail-icon">🏛️<\/span>/g, '<span class="detail-icon">✦</span>');
content = content.replace(/<span class="detail-icon">✨<\/span>/g, '<span class="detail-icon">✦</span>');
content = content.replace(/<span class="pillar-icon">🐑<\/span>/g, '<span class="pillar-icon">✦</span>');
content = content.replace(/<span class="pillar-icon">🛡️<\/span>/g, '<span class="pillar-icon">✦</span>');
content = content.replace(/<span class="pillar-icon">🚚<\/span>/g, '<span class="pillar-icon">✦</span>');
content = content.replace(/<span>💬 CHAT ON WHATSAPP<\/span>/g, '<span style="display:inline-flex; align-items:center; gap:8px;">${SVG_ICONS.whatsapp}<span>CHAT ON WHATSAPP</span></span>');
content = content.replace(/'🔊'/g, "'SOUND ON'");
content = content.replace(/'🔇'/g, "'MUTE'");

// 3. Remove emojis in Contact page
content = content.replace(/<span class="channel-card-icon">📱<\/span>/g, '<span class="channel-card-icon">${SVG_ICONS.whatsapp}</span>');
content = content.replace(/<span class="channel-card-icon">☎️<\/span>/g, '<span class="channel-card-icon">${SVG_ICONS.phone}</span>');
content = content.replace(/<span class="channel-card-icon">🌐<\/span>/g, '<span class="channel-card-icon">✦</span>');
content = content.replace(/📍 Delivery Coverage:/g, 'Delivery Coverage:');
content = content.replace(/🧼 Rug Cleaning Service:/g, 'Rug Cleaning Service:');
content = content.replace(/📐 Custom Sizes &amp; Consultation:/g, 'Custom Sizes &amp; Consultation:');

// 4. Remove emojis in Guides (Size, Care)
content = content.replace(/<span class="room-icon">🛋️<\/span>/g, '<span class="room-icon">✦</span>');
content = content.replace(/<span class="room-icon">🍽️<\/span>/g, '<span class="room-icon">✦</span>');
content = content.replace(/<span class="room-icon">🛏️<\/span>/g, '<span class="room-icon">✦</span>');
content = content.replace(/<span class="room-icon">🚪<\/span>/g, '<span class="room-icon">✦</span>');
content = content.replace(/<div class="consultation-icon">📐<\/div>/g, '<div class="consultation-icon">✦</div>');
content = content.replace(/💬 Send Photos on WhatsApp \([^)]*\)/g, 'Send Photos on WhatsApp (+20 10 39555155)');

content = content.replace(/✨ Everyday Care/g, 'Everyday Care');
content = content.replace(/🧼 Cleaning Your Kilim/g, 'Cleaning Your Kilim');
content = content.replace(/📦 Storage/g, 'Storage');
content = content.replace(/⚠️ Common Issues/g, 'Common Issues');
content = content.replace(/🛡️ Warranty &amp; Professional Cleaning/g, 'Warranty &amp; Professional Cleaning');

// Fix any malformed tel links
content = content.replace(/href="tel:\+20 10 39555155"/g, 'href="tel:+201039555155"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated public/js/pages.js successfully. New size:', content.length);
