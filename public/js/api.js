// Yadawy API Client
const API = {
    base: '/api',

    async request(path, options = {}) {
        const url = `${this.base}${path}`;
        const config = {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            credentials: 'same-origin',
            ...options
        };

        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        if (config.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        try {
            const res = await fetch(url, config);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.errors?.join(', ') || 'Request failed');
            return data;
        } catch (err) {
            throw err;
        }
    },

    get(path) { return this.request(path); },
    post(path, body) { return this.request(path, { method: 'POST', body }); },
    put(path, body) { return this.request(path, { method: 'PUT', body }); },
    patch(path, body) { return this.request(path, { method: 'PATCH', body }); },
    delete(path) { return this.request(path, { method: 'DELETE' }); },

    upload(path, formData) {
        return this.request(path, {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },

    // Products
    getProducts(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.get(`/products${qs ? '?' + qs : ''}`);
    },
    getProduct(slug) { return this.get(`/products/${slug}`); },
    getFeaturedProducts(limit = 10) { return this.get(`/products/featured?limit=${limit}`); },
    getBestSellers(limit = 10) { return this.get(`/products/best-sellers?limit=${limit}`); },
    getNewArrivals(limit = 10) { return this.get(`/products/new-arrivals?limit=${limit}`); },

    // Categories & Sections
    getCategories(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.get(`/categories${qs ? '?' + qs : ''}`);
    },
    getCategory(slug) { return this.get(`/categories/${slug}`); },
    getSections() { return this.get('/categories/sections/all'); },

    // Collections
    getCollections() { return this.get('/collections'); },
    getCollection(slug) { return this.get(`/collections/${slug}`); },

    // Product Types
    getProductTypes() { return this.get('/product-types'); },

    // Sizes
    getSizes() { return this.get('/sizes'); },

    // Site Content
    getHomepage() { return this.get('/site'); },
    getSettings() { return this.get('/site/settings'); },
    getNavigation() { return this.get('/site/navigation'); },

    // Shipping
    getShippingCost() { return this.get('/shipping'); },

    // Orders
    placeOrder(data) { return this.post('/orders', data); },

    // Coupons
    validateCoupon(code, subtotal) { return this.post('/coupons/validate', { code, subtotal }); },

    // Contact Submissions
    submitContact(data) { return this.post('/site/contact', data); },

    // Newsletter
    subscribe(email) { return this.post('/site/newsletter', { email }); }
};
window.API = API;

