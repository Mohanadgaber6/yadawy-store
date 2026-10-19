// ============================================================
// YADAWY REUSABLE COMPONENTS
// ============================================================

function renderPlaceholder() {
    return '<div class="placeholder-image">✦</div>';
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatAccordionText(raw) {
    if (!raw) return '';
    let str = String(raw).trim();
    if (str.startsWith('{') && str.endsWith('}')) {
        try {
            const obj = JSON.parse(str);
            return Object.entries(obj)
                .map(([k, v]) => `
                    <div class="spec-row">
                        <span class="spec-label">${escapeHtml(k)}</span>
                        <span class="spec-val">${escapeHtml(v)}</span>
                    </div>
                `).join('');
        } catch (e) {}
    }

    const lines = str.split(/\r?\n|\\n|<br\s*\/?>/i);
    return lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx > 0 && colonIdx < 35 && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
            const key = trimmed.substring(0, colonIdx).trim();
            const val = trimmed.substring(colonIdx + 1).trim();
            return `
                <div class="spec-row">
                    <span class="spec-label">${escapeHtml(key)}</span>
                    <span class="spec-val">${escapeHtml(val)}</span>
                </div>
            `;
        }
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            const bulletText = trimmed.replace(/^[•\-]\s*/, '');
            return `
                <div class="spec-bullet">
                    <span class="spec-bullet-icon">✦</span>
                    <span>${escapeHtml(bulletText)}</span>
                </div>
            `;
        }
        return `<p style="margin:0 0 10px 0; line-height:1.7; font-size:13.5px;">${escapeHtml(trimmed)}</p>`;
    }).filter(Boolean).join('');
}

// ============================================================
// PROFESSIONAL SVG ICONS (NO EMOJIS)
// ============================================================
const SVG_ICONS = {
    facebook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    instagram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#E1306C" stroke-width="2"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="#E1306C" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="#E1306C"/></svg>`,
    whatsapp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.301-.15-1.782-.88-2.059-.981-.277-.101-.478-.15-.679.15-.201.3-.778.981-.954 1.182-.175.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.301.301-.502.101-.201.05-.377-.025-.527-.075-.15-.679-1.637-.93-2.246-.244-.593-.493-.513-.679-.522-.175-.009-.377-.009-.578-.009s-.527.075-.803.377c-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.145 4.549.719.311 1.28.497 1.718.636.722.23 1.378.198 1.898.12.579-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.076-.126-.277-.201-.578-.351zM12.04 2C6.518 2 2.037 6.48 2.037 12c0 1.84.498 3.567 1.365 5.053L2 22l5.105-1.339C8.536 21.464 10.24 21.96 12.04 21.96c5.522 0 10.003-4.48 10.003-10S17.562 2 12.04 2zm0 18.234c-1.573 0-3.08-.43-4.394-1.229l-.315-.19-3.264.856.871-3.181-.207-.33c-.88-1.399-1.354-3.018-1.354-4.693 0-4.664 3.795-8.459 8.459-8.459 2.259 0 4.383.88 5.981 2.478 1.598 1.598 2.478 3.722 2.478 5.981 0 4.664-3.795 8.459-8.459 8.459z"/></svg>`,
    whatsappWhite: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path fill="#FFFFFF" d="M17.472 14.382c-.301-.15-1.782-.88-2.059-.981-.277-.101-.478-.15-.679.15-.201.3-.778.981-.954 1.182-.175.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.301.301-.502.101-.201.05-.377-.025-.527-.075-.15-.679-1.637-.93-2.246-.244-.593-.493-.513-.679-.522-.175-.009-.377-.009-.578-.009s-.527.075-.803.377c-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.145 4.549.719.311 1.28.497 1.718.636.722.23 1.378.198 1.898.12.579-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.076-.126-.277-.201-.578-.351zM12.04 2C6.518 2 2.037 6.48 2.037 12c0 1.84.498 3.567 1.365 5.053L2 22l5.105-1.339C8.536 21.464 10.24 21.96 12.04 21.96c5.522 0 10.003-4.48 10.003-10S17.562 2 12.04 2zm0 18.234c-1.573 0-3.08-.43-4.394-1.229l-.315-.19-3.264.856.871-3.181-.207-.33c-.88-1.399-1.354-3.018-1.354-4.693 0-4.664 3.795-8.459 8.459-8.459 2.259 0 4.383.88 5.981 2.478 1.598 1.598 2.478 3.722 2.478 5.981 0 4.664-3.795 8.459-8.459 8.459z"/></svg>`,
    phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold, #C5A880)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    truck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold, #C5A880)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    refresh: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold, #C5A880)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
    craft: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold, #C5A880)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    soundOn: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    soundOff: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
    play: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
};
window.SVG_ICONS = SVG_ICONS;

function imgSrc(path) {
    if (!path) return '';
    return path.startsWith('/') || path.startsWith('http') ? path : '/' + path;
}

function isHomePageRoute() {
    const raw = (window.location.hash || '').replace(/^#\/?/, '/');
    const path = raw.split('?')[0].trim();
    return path === '' || path === '/' || path === '/home';
}
window.isHomePageRoute = isHomePageRoute;

function renderAnnouncementBar() {
    return '';
}
window.renderAnnouncementBar = renderAnnouncementBar;

// ============================================================
// HEADER
// ============================================================
function renderHeader() {
    const count = Store.getCartCount();
    const hash = window.location.hash || '#/';
    const isCatalogActive = hash.includes('/shop') || hash.includes('/catalog') || hash.includes('/carpets') || hash.includes('/kilims') || hash.includes('/new-arrivals') || hash.includes('/best-sellers') || hash.includes('/section/');
    const isCustomizeActive = hash.includes('/customize');
    const isWhyActive = hash.includes('/why-yadawy') || hash.includes('/why-us');
    const isGuidesActive = hash.includes('/kilim-guide') || hash.includes('/size-guide') || hash.includes('/care-guide') || hash.includes('/faqs') || hash.includes('/return-policy') || hash.includes('/shipping-policy');
    const isAboutActive = hash.includes('/about') || hash.includes('/story');
    const isContactActive = hash.includes('/contact');

    return `
        <header class="site-header">
            <div class="header-top">
                <button class="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Open Navigation Menu">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
                <a href="#/" class="header-logo" aria-label="${I18N.t('brand_name')}">
                    <img src="/images/logo-light.png?v=55" alt="${I18N.t('brand_name')} — ${I18N.t('brand_tagline')}" class="header-logo-image">
                </a>
                <div class="header-actions">
                    <button class="header-action-btn lang-toggle-btn" onclick="I18N.toggleLang()" aria-label="Switch Language" title="${I18N.t('lang_toggle')}">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="flex-shrink:0;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        <span class="action-label" style="font-weight:700; font-size:12px; letter-spacing:0.5px;">${I18N.t('lang_toggle')}</span>
                    </button>
                    <button class="header-action-btn" onclick="toggleSearch()" aria-label="${I18N.t('nav_search')}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <span class="action-label">${I18N.t('nav_search')}</span>
                    </button>
                    <a href="#/cart" class="header-action-btn" aria-label="${I18N.t('nav_cart')}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        <span class="action-label">${I18N.t('nav_cart')}</span>
                        <span class="cart-count" style="display:${count > 0 ? 'flex' : 'none'}">${count}</span>
                    </a>
                </div>
            </div>
            
            <!-- Main Desktop Navigation -->
            <nav class="header-nav" id="main-nav">
                <!-- 1. ALL PRODUCTS (Dropdown: 5 items) -->
                <div class="nav-item-dropdown">
                    <a href="#/shop" class="nav-dropdown-trigger ${isCatalogActive ? 'active' : ''}">
                        <span>${I18N.t('nav_all_products')}</span>
                        <span class="nav-dropdown-chevron">▼</span>
                    </a>
                    <div class="nav-dropdown-menu">
                        <a href="#/shop" class="nav-dropdown-item">${I18N.t('nav_all_pieces')}</a>
                        <a href="#/shop?section=carpets" class="nav-dropdown-item">${I18N.t('nav_carpets')}</a>
                        <a href="#/shop?section=kilims" class="nav-dropdown-item">${I18N.t('nav_kilims')}</a>
                        <a href="#/new-arrivals" class="nav-dropdown-item">${I18N.t('nav_new_arrivals')}</a>
                        <a href="#/best-sellers" class="nav-dropdown-item">${I18N.t('nav_best_sellers')}</a>
                    </div>
                </div>

                <!-- 2. CUSTOMIZE -->
                <a href="#/customize" class="nav-link nav-link-customize ${isCustomizeActive ? 'active' : ''}">${I18N.t('nav_customize')}</a>

                <!-- 3. WHY YADAWY? -->
                <a href="#/why-yadawy" class="nav-link ${isWhyActive ? 'active' : ''}">${I18N.t('nav_why_yadawy')}</a>

                <!-- 4. GUIDES & CARE (Dropdown) -->
                <div class="nav-item-dropdown">
                    <a href="#/kilim-guide" class="nav-dropdown-trigger ${isGuidesActive ? 'active' : ''}">
                        <span>${I18N.t('nav_guides')}</span>
                        <span class="nav-dropdown-chevron">▼</span>
                    </a>
                    <div class="nav-dropdown-menu">
                        <a href="#/kilim-guide" class="nav-dropdown-item">${I18N.t('nav_what_is_kilim')}</a>
                        <a href="#/size-guide" class="nav-dropdown-item">${I18N.t('nav_size_guide')}</a>
                        <a href="#/care-guide" class="nav-dropdown-item">${I18N.t('nav_care_guide')}</a>
                        <a href="#/faqs" class="nav-dropdown-item">${I18N.t('nav_dropdown_faqs')}</a>
                    </div>
                </div>

                <!-- 5. OUR STORY -->
                <a href="#/about" class="nav-link ${isAboutActive ? 'active' : ''}">${I18N.t('nav_our_story')}</a>

                <!-- 6. CONTACT -->
                <a href="#/contact" class="nav-link ${isContactActive ? 'active' : ''}">${I18N.t('nav_contact')}</a>
            </nav>
        </header>

        <!-- Mobile Drawer Menu -->
        <div class="mobile-menu" id="mobile-menu">
            <div class="mobile-menu-header">
                <!-- 1. Logo on the left -->
                <a href="#/" class="mobile-logo-wrap" onclick="toggleMobileMenu()" aria-label="${I18N.t('brand_name')}">
                    <img src="/images/logo-light.png?v=55" alt="${I18N.t('brand_name')}" class="mobile-logo-image">
                </a>

                <!-- 2. Lang switch & Close (X) button on the far right -->
                <div class="mobile-header-actions">
                    <button class="mobile-lang-btn" onclick="I18N.toggleLang()" aria-label="Switch Language">
                        ${I18N.t('lang_toggle')}
                    </button>
                    <button class="mobile-menu-close" onclick="toggleMobileMenu()" aria-label="Close Navigation Menu">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>

            <!-- Mobile Navigation Links with Compact Nested Accordions -->
            <div class="mobile-nav-links">
                <!-- Accordion 1: ALL PRODUCTS -->
                <div class="mobile-nav-accordion" id="mobile-accordion-products">
                    <button type="button" class="mobile-accordion-trigger" onclick="toggleMobileAccordion(this)" aria-expanded="false">
                        <span class="mobile-accordion-title">${I18N.t('nav_all_products')}</span>
                        <svg class="mobile-accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="mobile-accordion-content">
                        <a href="#/shop" class="mobile-sub-link" onclick="toggleMobileMenu()">${I18N.t('nav_all_pieces')}</a>
                        <a href="#/shop?section=carpets" class="mobile-sub-link" onclick="toggleMobileMenu()">${I18N.t('nav_carpets')}</a>
                        <a href="#/shop?section=kilims" class="mobile-sub-link" onclick="toggleMobileMenu()">${I18N.t('nav_kilims')}</a>
                        <a href="#/new-arrivals" class="mobile-sub-link" onclick="toggleMobileMenu()">${I18N.t('nav_new_arrivals')}</a>
                        <a href="#/best-sellers" class="mobile-sub-link" onclick="toggleMobileMenu()">${I18N.t('nav_best_sellers')}</a>
                    </div>
                </div>

                <!-- Simple Links: CUSTOMIZE & WHY YADAWY -->
                <div class="mobile-nav-simple-group">
                    <a href="#/customize" class="mobile-nav-link mobile-nav-highlight" onclick="toggleMobileMenu()">
                        <span>${I18N.t('nav_customize')}</span>
                        <span class="mobile-new-tag">NEW</span>
                    </a>
                    <a href="#/why-yadawy" class="mobile-nav-link" onclick="toggleMobileMenu()">${I18N.t('nav_why_yadawy')}</a>
                </div>

                <!-- Accordion 2: GUIDES & CARE -->
                <div class="mobile-nav-accordion" id="mobile-accordion-guides">
                    <button type="button" class="mobile-accordion-trigger" onclick="toggleMobileAccordion(this)" aria-expanded="false">
                        <span class="mobile-accordion-title">${I18N.t('nav_guides')}</span>
                        <svg class="mobile-accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="mobile-accordion-content">
                        <a href="#/kilim-guide" class="mobile-sub-link" onclick="toggleMobileMenu()">${I18N.t('nav_what_is_kilim')}</a>
                        <a href="#/size-guide" class="mobile-sub-link" onclick="toggleMobileMenu()">${I18N.t('nav_size_guide')}</a>
                        <a href="#/care-guide" class="mobile-sub-link" onclick="toggleMobileMenu()">${I18N.t('nav_care_guide')}</a>
                        <a href="#/faqs" class="mobile-sub-link" onclick="toggleMobileMenu()">${I18N.t('nav_dropdown_faqs')}</a>
                    </div>
                </div>

                <!-- Simple Links: OUR STORY & CONTACT -->
                <div class="mobile-nav-simple-group">
                    <a href="#/about" class="mobile-nav-link" onclick="toggleMobileMenu()">${I18N.t('nav_our_story')}</a>
                    <a href="#/contact" class="mobile-nav-link" onclick="toggleMobileMenu()">${I18N.t('nav_contact')}</a>
                </div>
            </div>
            <div class="mobile-menu-footer">
                <p class="mobile-tagline">${I18N.t('brand_tagline')}</p>
                <div class="mobile-contact-list">
                    <a href="tel:01069005565" class="mobile-contact-item" style="display:flex; align-items:center; gap:8px;">
                        ${SVG_ICONS.phone}
                        <span>0106 900 5565</span>
                    </a>
                    <a href="tel:01039555155" class="mobile-contact-item" style="display:flex; align-items:center; gap:8px;">
                        ${SVG_ICONS.phone}
                        <span>0103 955 5155</span>
                    </a>
                    <a href="tel:01225910140" class="mobile-contact-item" style="display:flex; align-items:center; gap:8px;">
                        ${SVG_ICONS.phone}
                        <span>0122 591 0140 <small style="opacity:0.8; font-size:11px; margin-left:4px;">(${I18N.t('footer_phone_only')})</small></span>
                    </a>
                    <a href="tel:035427565" class="mobile-contact-item" style="display:flex; align-items:center; gap:8px;">
                        ${SVG_ICONS.phone}
                        <span>${I18N.getLang() === 'ar' ? 'الهاتف الأرضي: 03 542 7565' : 'Landline: 03 542 7565'}</span>
                    </a>
                </div>
                <div class="mobile-social-wrap" style="display:flex; align-items:center; gap:16px; margin-top:14px;">
                    <a href="${(window.YADAWY_CONFIG || {}).social?.instagram || 'https://www.instagram.com/yadawy0/'}" target="_blank" rel="noopener" class="mobile-social-link" style="display:inline-flex; align-items:center; gap:6px;">
                        ${SVG_ICONS.instagram}
                        <span>Instagram</span>
                    </a>
                    <a href="${(window.YADAWY_CONFIG || {}).social?.facebook || 'https://www.facebook.com/share/1EeqnwUzCw/'}" target="_blank" rel="noopener" class="mobile-social-link" style="display:inline-flex; align-items:center; gap:6px;">
                        ${SVG_ICONS.facebook}
                        <span>Facebook</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- Search Overlay Modal -->
        <div class="search-overlay" id="search-overlay">
            <button class="search-overlay-close" onclick="toggleSearch()" aria-label="${I18N.t('search_close')}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="search-overlay-content">
                <div class="search-input-wrapper">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="search-input" placeholder="${I18N.t('search_placeholder')}"
                        oninput="handleSearch(this.value)" autocomplete="off">
                </div>
                <div class="search-results" id="search-results"></div>
            </div>
        </div>
    `;
}

// ============================================================
// FLOATING WHATSAPP BUTTON (ALWAYS ACCESSIBLE)
// ============================================================
function renderFloatingWhatsApp() {
    return `
        <a href="https://wa.me/201069005565" target="_blank" rel="noopener" class="floating-whatsapp-btn" id="floating-whatsapp" aria-label="${I18N.t('floating_wa_tooltip')}">
            <div class="whatsapp-badge-tooltip">${I18N.t('floating_wa_tooltip')}</div>
            <div class="whatsapp-icon-circle">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M17.472 14.382c-.301-.15-1.782-.88-2.059-.981-.277-.101-.478-.15-.679.15-.201.3-.778.981-.954 1.182-.175.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.301.301-.502.101-.201.05-.377-.025-.527-.075-.15-.679-1.637-.93-2.246-.244-.593-.493-.513-.679-.522-.175-.009-.377-.009-.578-.009s-.527.075-.803.377c-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.145 4.549.719.311 1.28.497 1.718.636.722.23 1.378.198 1.898.12.579-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.076-.126-.277-.201-.578-.351zM12.04 2C6.518 2 2.037 6.48 2.037 12c0 1.84.498 3.567 1.365 5.053L2 22l5.105-1.339C8.536 21.464 10.24 21.96 12.04 21.96c5.522 0 10.003-4.48 10.003-10S17.562 2 12.04 2zm0 18.234c-1.573 0-3.08-.43-4.394-1.229l-.315-.19-3.264.856.871-3.181-.207-.33c-.88-1.399-1.354-3.018-1.354-4.693 0-4.664 3.795-8.459 8.459-8.459 2.259 0 4.383.88 5.981 2.478 1.598 1.598 2.478 3.722 2.478 5.981 0 4.664-3.795 8.459-8.459 8.459z"/>
                </svg>
            </div>
        </a>
    `;
}

// ============================================================
// FOOTER (WHITE / OFF-WHITE LUXURY EDITORIAL DESIGN)
// ============================================================
function renderFooter() {
    const config = window.YADAWY_CONFIG || {};

    return `
        <footer class="site-footer">
            <div class="footer-container">
                <div class="footer-grid">
                    <!-- Column 1: Brand & Craftsmanship -->
                    <div class="footer-col footer-col-brand">
                        <a href="#/" class="footer-logo-link" aria-label="${I18N.t('brand_name')}">
                            <img src="/images/logo-dark.png?v=52" alt="${I18N.t('brand_name')}" class="footer-logo-image" onerror="this.onerror=null; this.src='/images/logo.png?v=52';">
                        </a>
                        <p class="footer-brand-tagline">"${I18N.t('brand_tagline')}"</p>
                        <p class="footer-brand-text">
                            ${I18N.t('footer_brand_desc')}
                        </p>
                        <div class="footer-social-wrapper" style="display:flex; align-items:center; gap:12px; margin-top:18px;">
                            <a href="${config.social?.facebook || 'https://www.facebook.com/share/1EeqnwUzCw/'}" target="_blank" rel="noopener" class="footer-social-pill" aria-label="Facebook" style="display:inline-flex; align-items:center; gap:8px; padding:8px 14px; background:#F0F2F5; border-radius:6px; color:#1877F2; text-decoration:none; font-weight:600; font-size:12.5px; transition:transform 0.2s ease;">
                                ${SVG_ICONS.facebook}
                                <span style="color:#1C1E21;">Facebook</span>
                            </a>
                            <a href="${config.social?.instagram || 'https://www.instagram.com/yadawy0/'}" target="_blank" rel="noopener" class="footer-social-pill" aria-label="Instagram" style="display:inline-flex; align-items:center; gap:8px; padding:8px 14px; background:#FAF0F3; border-radius:6px; color:#E1306C; text-decoration:none; font-weight:600; font-size:12.5px; transition:transform 0.2s ease;">
                                ${SVG_ICONS.instagram}
                                <span style="color:#1C1E21;">Instagram</span>
                            </a>
                        </div>
                    </div>

                    <!-- Column 2: Discover & Guides -->
                    <div class="footer-col">
                        <h3 class="footer-heading">${I18N.t('footer_discover')}</h3>
                        <ul class="footer-links-list">
                            <li><a href="#/kilim-guide">${I18N.t('nav_what_is_kilim')}</a></li>
                            <li><a href="#/care-guide">${I18N.t('nav_care_guide')}</a></li>
                            <li><a href="#/size-guide">${I18N.t('nav_size_guide')}</a></li>
                            <li><a href="#/faqs">${I18N.t('nav_faqs')}</a></li>
                            <li><a href="#/about">${I18N.t('nav_our_story')}</a></li>
                            <li><a href="#/why-yadawy">${I18N.t('nav_why_yadawy')}</a></li>
                            <li><a href="#/shop">${I18N.t('nav_all_products')}</a></li>
                        </ul>
                    </div>

                    <!-- Column 3: Our Policies -->
                    <div class="footer-col">
                        <h3 class="footer-heading">${I18N.t('footer_policies')}</h3>
                        <ul class="footer-links-list">
                            <li><a href="#/return-policy">${I18N.getLang() === 'ar' ? 'سياسة الاستبدال والاسترجاع (14 يوماً)' : 'Return & Refund Policy (14 Days)'}</a></li>
                            <li><a href="#/shipping-policy">${I18N.getLang() === 'ar' ? 'سياسة الشحن لكافة المحافظات' : 'Shipping Policy (Egypt Wide)'}</a></li>
                            <li><a href="#/terms">${I18N.getLang() === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}</a></li>
                            <li><a href="#/privacy">${I18N.getLang() === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a></li>
                        </ul>
                    </div>

                    <!-- Column 4: Contact & Inquiries -->
                    <div class="footer-col footer-col-contact">
                        <h3 class="footer-heading">${I18N.t('footer_contact')}</h3>
                        <div class="footer-contact-block">
                            <div class="footer-contact-row" style="display:flex; align-items:flex-start; gap:10px; margin-bottom:8px;">
                                <span style="color:var(--color-maroon); margin-top:2px;">${SVG_ICONS.phone}</span>
                                <div class="footer-contact-phones" style="display:flex; flex-direction:column; gap:4px;">
                                    <a href="tel:01069005565" class="footer-contact-link">0106 900 5565</a>
                                    <a href="tel:01039555155" class="footer-contact-link">0103 955 5155</a>
                                    <a href="tel:01225910140" class="footer-contact-link">0122 591 0140 <span style="font-size:11px; opacity:0.75;">(${I18N.t('footer_phone_only')})</span></a>
                                </div>
                            </div>
                            <div class="footer-contact-row" style="display:flex; align-items:center; gap:10px; margin-top:10px;">
                                <span style="color:var(--color-maroon);">${SVG_ICONS.phone}</span>
                                <div class="footer-contact-phones">
                                    <a href="tel:035427565" class="footer-contact-link">${I18N.getLang() === 'ar' ? 'الهاتف الأرضي: 03 542 7565' : 'Landline: 03 542 7565'}</a>
                                </div>
                            </div>
                            <p class="footer-coverage-note" style="margin-top:16px; font-size:12px; color:#78716C;">
                                ${I18N.getLang() === 'ar' ? 'الشحن والتوصيل لكافة مناطق القاهرة والإسكندرية والجيزة ومختلف محافظات مصر' : 'Shipping across Cairo, Alexandria, Giza & all Egyptian cities'}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Footer Trust Badges -->
                <div class="footer-trust-bar">
                    <div class="footer-trust-item">
                        <span class="footer-trust-icon">${SVG_ICONS.craft}</span>
                        <span>${I18N.getLang() === 'ar' ? 'صناعة يدوية 100% بأنامل مصرية' : '100% Handwoven by Egyptian Artisans'}</span>
                    </div>
                    <div class="footer-trust-sep">•</div>
                    <div class="footer-trust-item">
                        <span class="footer-trust-icon">${SVG_ICONS.shield}</span>
                        <span>${I18N.getLang() === 'ar' ? 'ضمان شامل لمدة عام كامل' : '1-Year Warranty on Every Piece'}</span>
                    </div>
                    <div class="footer-trust-sep">•</div>
                    <div class="footer-trust-item">
                        <span class="footer-trust-icon">${SVG_ICONS.truck}</span>
                        <span>${I18N.getLang() === 'ar' ? 'الدفع نقداً عند الاستلام بكافة المحافظات' : 'Cash on Delivery Across Egypt'}</span>
                    </div>
                    <div class="footer-trust-sep">•</div>
                    <div class="footer-trust-item">
                        <span class="footer-trust-icon">${SVG_ICONS.refresh}</span>
                        <span>${I18N.getLang() === 'ar' ? 'سياسة استبدال واسترجاع 14 يوماً' : '14-Day Return & Exchange Policy'}</span>
                    </div>
                </div>

                <!-- Footer Bottom Bar -->
                <div class="footer-bottom">
                    <div class="footer-bottom-inner">
                        <p class="footer-bottom-text">${I18N.t('footer_rights')}</p>
                        <div class="footer-bottom-links">
                            <a href="#/terms">${I18N.getLang() === 'ar' ? 'الشروط' : 'Terms'}</a>
                            <span class="sep">•</span>
                            <a href="#/privacy">${I18N.getLang() === 'ar' ? 'الخصوصية' : 'Privacy'}</a>
                            <span class="sep">•</span>
                            <a href="#/return-policy">${I18N.getLang() === 'ar' ? 'الاسترجاع' : 'Returns'}</a>
                            <span class="sep">•</span>
                            <a href="#/shipping-policy">${I18N.getLang() === 'ar' ? 'الشحن' : 'Shipping'}</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    `;
}

// ============================================================
// ============================================================
// REUSABLE PRODUCT WHATSAPP INQUIRY COMPONENT
// Directly opens WhatsApp Click-to-Chat without native OS share dialog.
// Prefills professional, product-specific message with verified details.
// ============================================================
const ProductWhatsAppShare = {
    getCompanyPhoneNumber() {
        let raw = '';
        if (typeof Store !== 'undefined' && Store.settings) {
            raw = Store.settings.contact_whatsapp || Store.settings.whatsapp || Store.settings.contact_phone || '';
        }
        if (!raw && typeof window !== 'undefined' && window.YADAWY_CONFIG && window.YADAWY_CONFIG.primaryWhatsapp) {
            raw = window.YADAWY_CONFIG.primaryWhatsapp.number || '';
        }
        if (!raw) {
            raw = '201069005565';
        }
        // Normalize to international digits only (no +, spaces, dashes, or parentheses)
        let digits = String(raw).replace(/[^0-9]/g, '');
        if (digits.startsWith('01') && digits.length === 11) {
            digits = '2' + digits;
        }
        return digits || '201069005565';
    },

    buildEnquiryMessage(product, options = {}) {
        if (!product) return '';
        const isAr = (typeof I18N !== 'undefined' && typeof I18N.getLang === 'function') ? I18N.getLang() === 'ar' : false;

        // 1. Product Name
        const productName = isAr
            ? ((typeof I18N !== 'undefined' && typeof I18N.translateProductName === 'function') ? I18N.translateProductName(product.name) : (product.name || 'قطعة يدوي الحرفية'))
            : (product.name || 'Handcrafted Yadawy Piece');

        // 2. Reference / SKU
        const reference = product.sku || product.reference_code || '';

        // 3. Category
        let category = product.category_name || product.section_name || '';
        if (category && isAr && typeof I18N !== 'undefined' && typeof I18N.translateCategory === 'function') {
            category = I18N.translateCategory(category);
        }

        // 4. Dimensions / Size
        const size = options.size || product.dimensions || '';

        // 5. Price
        const rawPrice = options.price !== undefined
            ? options.price
            : ((product.is_on_sale && product.sale_price) ? product.sale_price : product.price);
        let formattedPrice = '';
        if (rawPrice !== null && rawPrice !== undefined && rawPrice !== '') {
            if (typeof rawPrice === 'number' || (!isNaN(Number(rawPrice)) && typeof rawPrice !== 'boolean')) {
                const num = Number(rawPrice).toLocaleString('en-US');
                formattedPrice = isAr ? `${num} ج.م` : `EGP ${num}`;
            } else {
                formattedPrice = String(rawPrice);
            }
        }

        // 6. Product Link (Absolute public URL)
        const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
        let productUrl = options.productUrl || '';
        if (!productUrl && product.slug) {
            productUrl = `${origin}/#/product/${product.slug}`;
        }
        if (!productUrl && typeof window !== 'undefined' && window.location) {
            productUrl = window.location.href;
        }

        // 7. Optional Customization Details (from bespoke inquiry modal)
        const customDetails = options.customDetails || '';

        if (isAr) {
            const lines = [
                `مرحباً فريق يدوي! 👋`,
                `أنا مهتم بالمنتج التالي:`,
                ``,
                `🧶 المنتج: ${productName}`,
                reference ? `🔖 كود القطعة: ${reference}` : '',
                category ? `📁 التصنيف: ${category}` : '',
                size ? `📏 المقاس: ${size}` : '',
                formattedPrice ? `💰 السعر: ${formattedPrice}` : '',
                productUrl ? `🔗 رابط المنتج: ${productUrl}` : '',
                customDetails ? `\n📋 تفاصيل وتفضيلات خاصة:\n${customDetails}` : '',
                ``,
                `هل يمكن تأكيد توفره وتزويدي بمزيد من التفاصيل؟`,
                `شكراً لكم!`
            ].filter(Boolean);
            return lines.join('\n');
        } else {
            const lines = [
                `Hello Yadawy Team! 👋`,
                `I'm interested in the following product:`,
                ``,
                `🧶 Product: ${productName}`,
                reference ? `🔖 Reference: ${reference}` : '',
                category ? `📁 Category: ${category}` : '',
                size ? `📏 Size: ${size}` : '',
                formattedPrice ? `💰 Price: ${formattedPrice}` : '',
                productUrl ? `🔗 Product Link: ${productUrl}` : '',
                customDetails ? `\n📋 Customization Details:\n${customDetails}` : '',
                ``,
                `Could you please confirm its availability and provide more details?`,
                `Thank you!`
            ].filter(Boolean);
            return lines.join('\n');
        }
    },

    share(product, options = {}) {
        if (!product) return;
        const phone = this.getCompanyPhoneNumber();
        const textMessage = this.buildEnquiryMessage(product, options);
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(textMessage)}`;

        if (options.onComplete && typeof options.onComplete === 'function') {
            try { options.onComplete(); } catch (e) {}
        }

        window.open(waUrl, '_blank', 'noopener,noreferrer');
    },

    shareFromProductPage(product) {
        if (!product) return;
        const selectedSizeBtn = document.querySelector('.size-option.selected');
        const selectedSize = selectedSizeBtn ? (selectedSizeBtn.dataset.size || selectedSizeBtn.textContent.trim()) : (product.dimensions || '');
        const currentPrice = (product.is_on_sale && product.sale_price) ? product.sale_price : product.price;

        this.share(product, {
            size: selectedSize,
            price: currentPrice
        });
    }
};
window.ProductWhatsAppShare = ProductWhatsAppShare;

// ============================================================
// PRODUCT CARD
// ============================================================
function renderProductCard(product) {
    window._productDataMap = window._productDataMap || {};
    window._productDataMap[product.id] = product;

    const hasImage = product.primary_image;
    const hasSecondary = product.secondary_image;
    const isOnSale = product.is_on_sale && product.sale_price;

    const targetUrl = product.custom_link || `/product/${product.slug}`;
    const btnText = I18N.t('view_details');
    const localizedName = I18N.translateProductName(product.name);
    const localizedCategory = I18N.translateCategory(product.category_name || product.section_name || 'Handcrafted');

    return `
        <div class="product-card" onclick="navigateTo('${targetUrl}')">
            <div class="product-card-image-wrap">
                ${hasImage
                    ? `<img src="${imgSrc(product.primary_image)}" class="product-card-image" alt="${escapeHtml(localizedName)}" loading="lazy">`
                    : renderPlaceholder()}
                ${hasSecondary
                    ? `<img src="${imgSrc(product.secondary_image)}" class="product-card-image-secondary" alt="${escapeHtml(localizedName)}" loading="lazy">`
                    : ''}
                <div class="product-badges-wrap">
                    ${isOnSale ? `<div class="product-card-badge sale">${I18N.t('badge_sale')}</div>` : ''}
                    ${product.is_best_seller ? `<div class="product-card-badge best-seller">${I18N.t('nav_best_sellers')}</div>` : ''}
                    ${product.is_new_arrival ? `<div class="product-card-badge new-arrival">${I18N.t('nav_new_arrivals')}</div>` : ''}
                    ${product.is_customizable ? `<div class="product-card-badge customizable">${I18N.t('nav_customize')}</div>` : ''}
                    ${product.inventory_qty <= 0 ? `<div class="product-card-badge out-of-stock">${I18N.t('badge_sold_out')}</div>` : ''}
                </div>
                <div class="product-card-actions">
                    <button class="product-card-add-btn" onclick="event.stopPropagation(); navigateTo('${targetUrl}')">
                        ${btnText}
                    </button>
                    <button class="product-card-wa-btn" onclick="event.stopPropagation(); ProductWhatsAppShare.share(window._productDataMap[${product.id}])" title="${I18N.t('inquire_whatsapp') || 'Contact us on WhatsApp'}" aria-label="Contact us on WhatsApp">
                        ${SVG_ICONS.whatsappWhite || SVG_ICONS.whatsapp}
                    </button>
                </div>
            </div>
            <div class="product-card-info">
                <div class="product-card-type">${product.section_name ? I18N.translateCategory(product.section_name).toUpperCase() + ' • ' : ''}${localizedCategory}</div>
                <h4 class="product-card-name">${escapeHtml(localizedName)}</h4>
                <div class="product-card-price">
                    ${isOnSale
                        ? `<span class="original">${Store.formatPrice(product.price)}</span>
                           <span class="sale">${Store.formatPrice(product.sale_price)}</span>`
                        : Store.formatPrice(product.price)}
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// COLLECTION CARD
// ============================================================
function renderCollectionCard(collection) {
    const link = collection.link_url || `/shop?section=${collection.slug}`;
    const localizedName = I18N.translateCollection(collection.name);
    const ctaText = I18N.getLang() === 'ar' ? `اكتشف ${localizedName} ←` : `EXPLORE ${collection.name} →`;

    return `
        <div class="collection-card" onclick="navigateTo('${link}')">
            ${collection.image
                ? `<img src="${imgSrc(collection.image)}" class="collection-card-image" alt="${escapeHtml(localizedName)}" loading="lazy">`
                : `<div class="collection-card-image">${renderPlaceholder()}</div>`}
            <div class="collection-card-overlay">
                <span class="collection-card-pretitle">${I18N.getLang() === 'ar' ? 'مجموعة' : 'COLLECTION'}</span>
                <h3 class="collection-card-name">${escapeHtml(localizedName)}</h3>
                <span class="collection-card-count">${ctaText}</span>
            </div>
        </div>
    `;
}

// ============================================================
// PRODUCT SHOWCASE SECTION
// ============================================================
function renderProductShowcase(section) {
    if (!section.products || section.products.length === 0) return '';

    return `
        <section class="section">
            <div class="section-header">
                <h2 class="section-title">${section.title || ''}</h2>
                ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
            </div>
            <div class="products-grid">
                ${section.products.slice(0, 4).map(p => renderProductCard(p)).join('')}
            </div>
            ${section.link_text ? `
                <div class="section-cta-wrap">
                    <a href="#${section.link_url || '/shop'}" class="btn-editorial">${section.link_text} →</a>
                </div>
            ` : ''}
        </section>
    `;
}

// ============================================================
// SKELETON LOADERS
// ============================================================
function renderProductCardSkeleton(count = 4) {
    return Array(count).fill('').map(() => `
        <div class="product-card">
            <div class="product-card-image-wrap"><div class="skeleton skeleton-image"></div></div>
            <div class="product-card-info">
                <div class="skeleton skeleton-text" style="width:40%;margin:0 auto 8px"></div>
                <div class="skeleton skeleton-text" style="width:70%;margin:0 auto 8px"></div>
                <div class="skeleton skeleton-text" style="width:30%;margin:0 auto"></div>
            </div>
        </div>
    `).join('');
}

function navigateTo(path) {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const menu = document.getElementById('mobile-menu');
    if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
    }
    if (window.location.hash === '#' + path) {
        // Force re-render if clicking link to current route
        if (typeof handleRoute === 'function') handleRoute();
    } else {
        window.location.hash = path;
    }
}

function toggleMobileMenu(forceClose) {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        if (forceClose === true) {
            menu.classList.remove('open');
        } else {
            menu.classList.toggle('open');
        }
        const isOpen = menu.classList.contains('open');
        document.body.classList.toggle('menu-open', isOpen);
    }
}
window.toggleMobileMenu = toggleMobileMenu;

function toggleMobileAccordion(button) {
    if (!button) return;
    const accordion = button.closest('.mobile-nav-accordion');
    if (!accordion) return;
    const wasOpen = accordion.classList.contains('open');
    
    // Close other accordions in the same mobile menu for neatness
    document.querySelectorAll('.mobile-nav-accordion.open').forEach(acc => {
        if (acc !== accordion) {
            acc.classList.remove('open');
            const btn = acc.querySelector('.mobile-accordion-trigger');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        }
    });

    accordion.classList.toggle('open', !wasOpen);
    button.setAttribute('aria-expanded', !wasOpen ? 'true' : 'false');
}
window.toggleMobileAccordion = toggleMobileAccordion;

function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    if (overlay) {
        overlay.classList.toggle('open');
        if (overlay.classList.contains('open')) {
            const input = document.getElementById('search-input');
            if (input) {
                input.value = '';
                input.focus();
            }
            const res = document.getElementById('search-results');
            if (res) res.innerHTML = '';
        }
    }
}

let searchDebounceTimeout = null;
function handleSearch(query) {
    clearTimeout(searchDebounceTimeout);
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    const trimmed = (query || '').trim();
    if (!trimmed || trimmed.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }

    resultsContainer.innerHTML = '<div style="padding:24px;text-align:center;color:var(--color-gold-light)">Searching catalog...</div>';

    searchDebounceTimeout = setTimeout(async () => {
        try {
            const data = await API.getProducts({ search: trimmed, limit: 6 });
            const products = data.products || [];

            if (products.length === 0) {
                resultsContainer.innerHTML = `
                    <div style="padding:28px;text-align:center;color:rgba(255,255,255,0.7)">
                        <p style="margin-bottom:8px">No authentic pieces found matching "${trimmed}"</p>
                        <a href="#/shop" onclick="toggleSearch()" style="color:var(--color-gold-light);font-size:12px;letter-spacing:1px;text-decoration:underline">EXPLORE FULL CATALOG →</a>
                    </div>
                `;
                return;
            }

            resultsContainer.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:12px;width:100%">
                    <div style="font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,0.6);text-transform:uppercase;margin-bottom:4px">
                        Catalog Results (${data.pagination?.total || products.length})
                    </div>
                    ${products.map(p => `
                        <div style="display:flex;align-items:center;gap:14px;padding:10px;border-radius:4px;background:rgba(255,255,255,0.06);cursor:pointer;transition:background 0.2s;"
                             onmouseover="this.style.background='rgba(255,255,255,0.12)'"
                             onmouseout="this.style.background='rgba(255,255,255,0.06)'"
                             onclick="toggleSearch(); navigateTo('/product/${p.slug}')">
                            <img src="${imgSrc(p.primary_image || p.image)}" alt="${p.name}" style="width:48px;height:48px;object-fit:cover;border-radius:3px;">
                            <div style="flex:1;text-align:left">
                                <div style="color:white;font-weight:600;font-size:14px">${p.name}</div>
                                <div style="color:var(--color-gold-light);font-size:12px">${p.section_name ? p.section_name.toUpperCase() + ' • ' : ''}${p.category_name || ''}</div>
                            </div>
                            <div style="color:white;font-weight:700;font-size:13px">
                                ${Store.formatPrice(p.is_on_sale && p.sale_price ? p.sale_price : p.price)}
                            </div>
                        </div>
                    `).join('')}
                    <div style="text-align:center;margin-top:10px">
                        <a href="#/shop?search=${encodeURIComponent(trimmed)}" onclick="toggleSearch()" style="color:var(--color-gold-light);font-size:12px;letter-spacing:1.5px;font-weight:600;text-decoration:none">
                            VIEW ALL ${data.pagination?.total || products.length} RESULTS →
                        </a>
                    </div>
                </div>
            `;
        } catch (err) {
            resultsContainer.innerHTML = '<div style="padding:20px;text-align:center;color:var(--color-error)">Search failed. Please try again.</div>';
        }
    }, 250);
}
