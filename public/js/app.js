// ============================================================
// YADAWY SPA ROUTER & APP INITIALIZATION
// ============================================================

let appInitialized = false;

async function initApp() {
    if (appInitialized) return;
    appInitialized = true;

    try {
        // Load settings, navigation, and shipping cost in parallel
        const [settingsData, navData, shippingData] = await Promise.all([
            API.getSettings(),
            API.getNavigation(),
            API.getShippingCost().catch(() => ({ cost: 100 }))
        ]);

        Store.settings = settingsData.settings || {};
        Store.navigation = navData.navigation || [];
        Store.shippingCost = (shippingData && shippingData.cost !== undefined) ? shippingData.cost : 100;

        // Set page title
        if (Store.settings.site_title) {
            document.title = Store.settings.site_title;
        }

        // Render shell with Header, Page Content, White Luxury Footer, and Floating WhatsApp
        const app = document.getElementById('app');
        app.innerHTML = `
            ${renderHeader(Store.navigation)}
            <main id="page-content"></main>
            ${renderFooter()}
            ${renderFloatingWhatsApp()}
        `;

        // Update announcement bar if customized in settings
        const announcement = document.getElementById('announcement-bar');
        if (announcement) {
            if (Store.settings.announcement_active === '0') {
                announcement.style.display = 'none';
            } else if (Store.settings.announcement_text) {
                announcement.innerHTML = `<span>${Store.settings.announcement_text}</span>`;
                announcement.style.display = 'block';
            }
        }

        // Hide loading screen
        const loading = document.getElementById('loading-screen');
        if (loading) loading.classList.add('hidden');

        // Update cart UI
        Store.updateCartUI();

        // Handle route
        await handleRoute();

    } catch (err) {
        console.error('App initialization error:', err);
        document.getElementById('app').innerHTML = `
            <div style="text-align:center;padding:100px 20px;font-family:var(--font-brand)">
                <img src="/images/logo.png?v=14" alt="YADAWY" style="height:64px;width:auto;margin:0 auto 20px;display:block;">
                <h1 style="color:var(--color-maroon);letter-spacing:4px;">YADAWY</h1>
                <p style="margin-top:16px;color:var(--color-text-secondary);font-family:var(--font-sans)">Unable to load store. Please check your connection and refresh.</p>
            </div>
        `;
    }
}

async function handleRoute() {
    const hash = window.location.hash.replace('#', '') || '/';
    const path = hash.split('?')[0];
    const content = document.getElementById('page-content');
    if (!content) return;

    // Scroll to top
    window.scrollTo(0, 0);

    // Update active nav indicators
    const isCatalog = path === '/shop' || path === '/catalog' || path === '/carpets' || path === '/kilims' || path.startsWith('/section/') || path.startsWith('/shop') || path.startsWith('/catalog');
    const isContact = path === '/contact';
    const isAbout = path === '/about' || path === '/story' || path === '/our-story';

    document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
        trigger.classList.toggle('active', isCatalog);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href')?.replace('#', '') || '';
        let isActive = false;
        if (href === '/contact' && isContact) isActive = true;
        if ((href === '/about' || href === '/story') && isAbout) isActive = true;
        link.classList.toggle('active', isActive);
    });

    // Show loading state
    content.innerHTML = '<div style="min-height:60vh;display:flex;align-items:center;justify-content:center"><div class="loading-knot" style="font-size:32px;color:var(--color-gold)">✦</div></div>';

    try {
        let html = '';

        if (path === '/' || path === '') {
            html = await renderHomePage();
        } else if (path === '/carpets' || path === '/section/carpets' || path.startsWith('/carpets') || path.startsWith('/section/carpets')) {
            html = await renderShopPage({ defaultSection: 'carpets' });
        } else if (path === '/kilims' || path === '/section/kilims' || path.startsWith('/kilims') || path.startsWith('/section/kilims')) {
            html = await renderShopPage({ defaultSection: 'kilims' });
        } else if (path === '/shop' || path === '/catalog' || path.startsWith('/shop') || path.startsWith('/catalog')) {
            html = await renderShopPage();
        } else if (path.startsWith('/product/')) {
            const slug = path.split('/product/')[1];
            html = await renderProductDetailPage(slug);
        } else if (path === '/cart') {
            html = renderCartPage();
        } else if (path === '/checkout') {
            try {
                const shipRes = await API.getShippingCost();
                if (shipRes && shipRes.cost !== undefined) {
                    Store.shippingCost = shipRes.cost;
                }
            } catch (e) {
                // fallback to Store.getShippingCost()
            }
            html = renderCheckoutPage();
        } else if (path === '/about' || path === '/story' || path === '/our-story') {
            html = renderAboutPage();
        } else if (path === '/contact') {
            html = renderContactPage();
        } else if (path === '/collections') {
            html = await renderCollectionsPage();
        } else if (path === '/return-policy' || path === '/returns' || path === '/return-and-refund-policy') {
            html = renderReturnPolicyPage();
        } else if (path === '/shipping-policy' || path === '/shipping') {
            html = renderShippingPolicyPage();
        } else if (path === '/privacy' || path === '/privacy-policy') {
            html = renderPrivacyPolicyPage();
        } else if (path === '/terms' || path === '/terms-of-service') {
            html = renderTermsPage();
        } else if (path === '/faqs' || path === '/faq') {
            html = renderFaqPage();
        } else if (path === '/kilim-guide' || path === '/what-is-kilim') {
            html = renderKilimGuidePage();
        } else if (path === '/size-guide') {
            html = renderSizeGuidePage();
        } else if (path === '/care-guide') {
            html = renderCareGuidePage();
        } else {
            html = `
                <div class="not-found-page">
                    <div class="not-found-title">404</div>
                    <h2 style="font-family:var(--font-serif);font-size:24px;margin:16px 0">Page Not Found</h2>
                    <p style="color:var(--color-text-muted);margin-bottom:24px">The page you're looking for doesn't exist.</p>
                    <a href="#/" class="section-link">BACK TO HOME</a>
                </div>
            `;
        }

        content.innerHTML = html;
    } catch (err) {
        console.error('Route error:', err);
        content.innerHTML = '<div class="empty-state"><div class="empty-state-icon">!</div><h2 class="empty-state-title">Something went wrong</h2><p class="empty-state-text">Please try again</p></div>';
    }
}

function renderCurrentPage() {
    handleRoute();
}

// Listen for hash changes
window.addEventListener('hashchange', handleRoute);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp);

// Fallback init
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initApp, 10);
}
