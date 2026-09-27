// Admin API Client
const AdminAPI = {
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
        const res = await fetch(url, config);
        const data = await res.json().catch(() => ({}));
        if (res.status === 401 && path !== '/auth/login' && path !== '/auth/me') {
            window.location.hash = '#/login';
            throw new Error('Session expired');
        }
        if (!res.ok) throw new Error(data.error || data.errors?.join(', ') || 'Request failed');
        return data;
    },

    get(p) { return this.request(p); },
    post(p, b) { return this.request(p, { method: 'POST', body: b }); },
    put(p, b) { return this.request(p, { method: 'PUT', body: b }); },
    patch(p, b) { return this.request(p, { method: 'PATCH', body: b }); },
    del(p) { return this.request(p, { method: 'DELETE' }); },
    upload(p, fd) { return this.request(p, { method: 'POST', body: fd, headers: {} }); },
    uploadPut(p, fd) { return this.request(p, { method: 'PUT', body: fd, headers: {} }); },

    // Auth
    login(email, password) { return this.post('/auth/login', { email, password }); },
    logout() { return this.post('/auth/logout', {}); },
    me() { return this.get('/auth/me'); },

    // Dashboard
    getDashboard() { return this.get('/admin/dashboard'); },

    // Products
    getProducts(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.get(`/products/admin/list${qs ? '?' + qs : ''}`);
    },
    getProduct(id) { return this.get(`/products/admin/${id}`); },
    createProduct(data) { return this.post('/products/admin', data); },
    updateProduct(id, data) { return this.put(`/products/admin/${id}`, data); },
    toggleProductStatus(id, status) { return this.patch(`/products/admin/${id}/status`, { status }); },
    toggleProductStock(id, is_in_stock) { return this.patch(`/products/admin/${id}/stock`, { is_in_stock }); },
    deleteProduct(id) { return this.del(`/products/admin/${id}`); },

    // Product images
    uploadProductImages(id, formData) { return this.upload(`/products/admin/${id}/images`, formData); },
    reorderImages(id, order) { return this.put(`/products/admin/${id}/images/reorder`, { order }); },
    setPrimaryImage(productId, imageId) { return this.patch(`/products/admin/${productId}/images/${imageId}/primary`, {}); },
    deleteProductImage(productId, imageId) { return this.del(`/products/admin/${productId}/images/${imageId}`); },

    // Product videos
    addProductVideo(id, data) { return this.post(`/products/admin/${id}/videos`, data); },
    deleteProductVideo(productId, videoId) { return this.del(`/products/admin/${productId}/videos/${videoId}`); },

    // Categories
    getCategories() { return this.get('/categories/admin/list'); },
    createCategory(fd) { return this.upload('/categories/admin', fd); },
    updateCategory(id, fd) { return this.uploadPut(`/categories/admin/${id}`, fd); },
    deleteCategory(id) { return this.del(`/categories/admin/${id}`); },

    // Collections
    getCollections() { return this.get('/collections/admin/list'); },
    createCollection(fd) { return this.upload('/collections/admin', fd); },
    updateCollection(id, fd) { return this.uploadPut(`/collections/admin/${id}`, fd); },
    deleteCollection(id) { return this.del(`/collections/admin/${id}`); },

    // Product Types
    getProductTypes() { return this.get('/product-types/admin/list'); },
    createProductType(data) { return this.post('/product-types/admin', data); },
    updateProductType(id, data) { return this.put(`/product-types/admin/${id}`, data); },
    deleteProductType(id) { return this.del(`/product-types/admin/${id}`); },

    // Sizes
    getSizes() { return this.get('/sizes/admin/list'); },
    createSize(data) { return this.post('/sizes/admin', data); },
    updateSize(id, data) { return this.put(`/sizes/admin/${id}`, data); },
    deleteSize(id) { return this.del(`/sizes/admin/${id}`); },

    // Orders
    getOrders(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.get(`/orders/admin/list${qs ? '?' + qs : ''}`);
    },
    getOrder(id) { return this.get(`/orders/admin/${id}`); },
    updateOrderStatus(id, status) { return this.patch(`/orders/admin/${id}/status`, { status }); },
    deleteOrder(id) { return this.del(`/orders/admin/${id}`); },

    // Customers
    getCustomers(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.get(`/customers/admin/list${qs ? '?' + qs : ''}`);
    },
    getCustomer(id) { return this.get(`/customers/admin/${id}`); },

    // Coupons
    getCoupons() { return this.get('/coupons/admin/list'); },
    createCoupon(data) { return this.post('/coupons/admin', data); },
    updateCoupon(id, data) { return this.put(`/coupons/admin/${id}`, data); },
    toggleCouponStatus(id, is_active) { return this.patch(`/coupons/admin/${id}/status`, { is_active }); },
    deleteCoupon(id) { return this.del(`/coupons/admin/${id}`); },

    // Media Library
    getMedia(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.get(`/media/admin/list${qs ? '?' + qs : ''}`);
    },
    uploadMedia(formData) { return this.upload('/media/admin/upload', formData); },
    deleteMedia(id) { return this.del(`/media/admin/${id}`); },

    // Analytics
    getSalesAnalytics(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.get(`/admin/analytics/sales${qs ? '?' + qs : ''}`);
    },

    // Admin Users
    getAdminUsers() { return this.get('/admin/users'); },
    createAdminUser(data) { return this.post('/admin/users', data); },
    updateAdminUser(id, data) { return this.put(`/admin/users/${id}`, data); },
    toggleAdminUserStatus(id, is_active) { return this.patch(`/admin/users/${id}/status`, { is_active }); },
    deleteAdminUser(id) { return this.del(`/admin/users/${id}`); },

    // Contact Leads / Submissions
    getContactLeads(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.get(`/admin/contact-leads${qs ? '?' + qs : ''}`);
    },
    getContactLead(id) { return this.get(`/admin/contact-leads/${id}`); },
    updateContactLead(id, data) { return this.patch(`/admin/contact-leads/${id}`, data); },
    deleteContactLead(id) { return this.del(`/admin/contact-leads/${id}`); },

    // Settings & Shipping
    getSettings() { return this.get('/site/settings'); },
    updateSettings(settings) { return this.put('/site/admin/settings', { settings }); },
    getShippingCost() { return this.get('/shipping'); },
    updateShippingCost(cost) { return this.put('/shipping', { cost }); },

    // Deletion Approval System (for Products, Orders, Sections, Categories, Customers)
    requestDeletion(data) { return this.post('/deletion-requests', data); },
    getDeletionLogs() { return this.get('/deletion-requests/admin/logs'); },

    // Audit Logs
    getAuditLogs(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.get(`/admin/audit-logs${qs ? '?' + qs : ''}`);
    },

    // Profile & Password
    changePassword(data) { return this.post('/auth/change-password', data); },
    updateProfile(data) { return this.put('/auth/profile', data); },

    // Site Content
    getHomepageSections() { return this.get('/site/admin/sections'); },
    updateSection(id, fd) { return this.uploadPut(`/site/admin/sections/${id}`, fd); },
    getSettings() { return this.get('/site/admin/settings'); },
    updateSettings(settings) { return this.put('/site/admin/settings', { settings }); },
    getNavigation() { return this.get('/site/admin/navigation'); },
    createNavItem(data) { return this.post('/site/admin/navigation', data); },
    updateNavItem(id, data) { return this.put(`/site/admin/navigation/${id}`, data); },
    deleteNavItem(id) { return this.del(`/site/admin/navigation/${id}`); },

    // Testimonials
    getTestimonials() { return this.get('/site/admin/testimonials'); },
    createTestimonial(data) { return this.post('/site/admin/testimonials', data); },
    updateTestimonial(id, data) { return this.put(`/site/admin/testimonials/${id}`, data); },
    deleteTestimonial(id) { return this.del(`/site/admin/testimonials/${id}`); },

    // Newsletter
    getSubscribers() { return this.get('/site/admin/newsletter'); },
    duplicateProduct(id) { return this.post(`/products/admin/${id}/duplicate`, {}); },
};

function adminToast(msg, type = 'success') {
    let c = document.querySelector('.admin-toast-container');
    if (!c) { c = document.createElement('div'); c.className = 'admin-toast-container'; document.body.appendChild(c); }
    const t = document.createElement('div');
    t.className = `admin-toast admin-toast-${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, 3000);
}

function confirmDelete(msg = 'Are you sure you want to delete this item?', title = 'Confirm Deletion', confirmBtnText = 'Delete') {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'admin-modal-overlay';
        overlay.innerHTML = `
            <div class="admin-modal" style="max-width: 450px; border-radius: 8px; box-shadow: 0 20px 40px rgba(0,0,0,0.25);">
                <div class="admin-modal-title" style="display:flex; align-items:center; gap:8px; font-size:17px; font-weight:700; color:var(--color-maroon);">
                    <span style="font-size:18px;">⚠️</span>
                    <span>${title}</span>
                </div>
                <div class="admin-modal-body" style="font-size:14px; line-height:1.6; color:#374151; padding: 16px 0;">
                    ${msg}
                </div>
                <div class="admin-modal-actions" style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
                    <button type="button" class="btn btn-outline" id="confirm-cancel-btn">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-btn" style="background:#DC2626; color:#FFFFFF; border:none; padding:8px 18px; border-radius:4px; font-weight:600;">${confirmBtnText}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const close = (result) => {
            document.removeEventListener('keydown', handleKeyDown);
            overlay.remove();
            resolve(result);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') close(false);
        };
        document.addEventListener('keydown', handleKeyDown);

        overlay.querySelector('#confirm-delete-btn').onclick = () => close(true);
        overlay.querySelector('#confirm-cancel-btn').onclick = () => close(false);
        overlay.onclick = (e) => { if (e.target === overlay) close(false); };
    });
}
