// ============================================================
// YADAWY ADMIN DASHBOARD — CORE CONTROLLER & ROUTER
// ============================================================

const AdminApp = {
    currentUser: null,
    currentRoute: '',
    cachedSections: [],
    cachedCategories: [],

    async init() {
        window.addEventListener('hashchange', () => this.handleRoute());

        try {
            const me = await AdminAPI.me();
            this.currentUser = me.admin;
        } catch (e) {
            this.currentUser = null;
        }

        this.handleRoute();
    },

    escapeHtml(str) {
        return AdminPages.escapeHtml(str);
    },

    // ========================================================
    // AUTHENTICATION
    // ========================================================
    renderLoginView() {
        const app = document.getElementById('admin-app');
        if (!app) return;
        app.innerHTML = AdminPages.login();
        const form = document.getElementById('admin-login-form');
        if (form) {
            form.onsubmit = (e) => this.handleLogin(e);
        }
    },

    async handleLogin(e) {
        if (e) e.preventDefault();
        const email = document.getElementById('admin-email')?.value?.trim() || '';
        const password = document.getElementById('admin-password')?.value || '';
        const submitBtn = document.getElementById('login-submit-btn');

        if (!email || !password) {
            adminToast('Please enter your email and password', 'error');
            return;
        }

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Signing in...';
            }
            const res = await AdminAPI.login(email, password);
            this.currentUser = res.admin;
            adminToast('Welcome back, ' + (this.currentUser.username || 'Admin') + '!');
            window.location.hash = '#/categories';
        } catch (err) {
            adminToast(err.message || 'Login failed', 'error');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Sign In to Dashboard</span>';
            }
        }
    },

    async handleLogout() {
        try {
            await AdminAPI.logout();
        } catch (e) {}
        this.currentUser = null;
        adminToast('Signed out successfully');
        window.location.hash = '#/login';
        this.renderLoginView();
    },

    // ========================================================
    // MAIN LAYOUT
    // ========================================================
    renderLayout(contentHtml, activeNav = '') {
        const app = document.getElementById('admin-app');
        if (!app) return;

        app.innerHTML = `
            <div class="admin-layout">
                <!-- Sidebar (Strictly 5 navigation items + logout) -->
                <aside class="admin-sidebar" id="admin-sidebar">
                    <div class="admin-brand">
                        <a href="#/categories" class="admin-logo" style="text-decoration:none;">
                            <img src="/admin/images/logo.png" alt="YADAWY" class="admin-sidebar-logo-img">
                        </a>
                        <span class="admin-badge-tag">ADMIN</span>
                    </div>

                    <nav class="admin-nav">
                        <div class="admin-nav-group-title">STORE MANAGEMENT</div>
                        
                        <!-- 1. Sections & Categories -->
                        <a href="#/categories" class="admin-nav-item ${activeNav === 'categories' ? 'active' : ''}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                            <span>Sections &amp; Categories</span>
                        </a>

                        <!-- 2. Products -->
                        <a href="#/products" class="admin-nav-item ${activeNav === 'products' ? 'active' : ''}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                            <span>Products</span>
                        </a>

                        <!-- 3. Orders -->
                        <a href="#/orders" class="admin-nav-item ${activeNav === 'orders' ? 'active' : ''}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                            <span>Orders</span>
                        </a>

                        <!-- 4. Customers -->
                        <a href="#/customers" class="admin-nav-item ${activeNav === 'customers' ? 'active' : ''}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            <span>Customers</span>
                        </a>

                        <!-- 5. Coupons -->
                        <a href="#/coupons" class="admin-nav-item ${activeNav === 'coupons' ? 'active' : ''}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                            <span>Coupons</span>
                        </a>

                        <!-- 6. Shipping Settings -->
                        <a href="#/shipping" class="admin-nav-item ${['shipping', 'shipping-settings'].includes(activeNav) ? 'active' : ''}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                            <span>Shipping Settings</span>
                        </a>

                        <div class="admin-nav-group-title" style="margin-top:16px;">ADMINISTRATION</div>

                        <!-- 5. Contact Leads -->
                        <a href="#/contact-leads" class="admin-nav-item ${['contact-leads', 'leads', 'contacts', 'admins'].includes(activeNav) ? 'active' : ''}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            <span>Contact Leads</span>
                        </a>

                        <!-- 6. Admin & Account -->
                        <a href="#/account" class="admin-nav-item ${activeNav === 'account' ? 'active' : ''}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            <span>Admin &amp; Account</span>
                        </a>

                        <!-- 7. Logout item -->
                        <a href="javascript:void(0)" onclick="AdminApp.handleLogout()" class="admin-nav-item" style="margin-top:20px; color:#F5C6CB;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            <span>Logout</span>
                        </a>
                    </nav>

                    <div class="admin-sidebar-footer">
                        <a href="/" target="_blank" class="btn btn-outline btn-block text-xs" style="color:var(--adm-cream); border-color:rgba(229,197,131,0.3); width:100%; justify-content:center;">
                            View Live Storefront ↗
                        </a>
                    </div>
                </aside>

                <!-- Main Content Area -->
                <div class="admin-main">
                    <!-- Top Navigation Bar -->
                    <header class="admin-topbar">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <button class="admin-mobile-menu-btn" onclick="document.getElementById('admin-sidebar')?.classList.toggle('open')">☰</button>
                            <div class="admin-topbar-title">
                                <span class="admin-topbar-brand">YADAWY</span> — Store Control Panel
                            </div>
                        </div>
                        <div class="admin-user-nav">
                            <a href="#/account" class="user-greeting" style="color:inherit; text-decoration:none; font-size:13px;">
                                Signed in as: <strong>${this.escapeHtml(this.currentUser?.username || this.currentUser?.email || 'Admin')}</strong>
                            </a>
                            <button class="btn btn-sm btn-outline" onclick="AdminApp.handleLogout()">Sign Out</button>
                        </div>
                    </header>

                    <!-- Page Body -->
                    <div class="admin-content" id="admin-page-content">
                        ${contentHtml}
                    </div>
                </div>
            </div>
        `;
    },

    // ========================================================
    // ROUTE HANDLER
    // ========================================================
    async handleRoute() {
        const hash = window.location.hash || '#/categories';
        const hashClean = hash.replace(/^#\/?/, '');
        const [routePath, queryString] = hashClean.split('?');
        const parts = routePath.split('/');
        const route = parts[0] || 'categories';
        const param = parts[1] || null;

        // Parse query params
        const queryParams = {};
        if (queryString) {
            new URLSearchParams(queryString).forEach((val, key) => {
                queryParams[key] = val;
            });
        }

        // Check authentication
        if (!this.currentUser && route !== 'login') {
            try {
                const me = await AdminAPI.me();
                this.currentUser = me.admin;
            } catch (e) {
                this.renderLoginView();
                return;
            }
        }

        if (route === 'login') {
            if (this.currentUser) {
                window.location.hash = '#/categories';
                return;
            }
            this.renderLoginView();
            return;
        }

        // Fetch common sections and categories cache if needed
        try {
            if (!this.cachedCategories.length) {
                const catRes = await AdminAPI.getCategories();
                this.cachedCategories = catRes.categories || [];
            }
        } catch (e) {}

        switch (route) {
            case 'categories':
            case 'sections':
                await this.renderCategoriesView();
                break;

            case 'products':
                if (param === 'new') {
                    await this.renderProductFormView(null);
                } else if (param === 'edit' && parts[2]) {
                    await this.renderProductFormView(parts[2]);
                } else {
                    await this.renderProductsView(queryParams);
                }
                break;

            case 'orders':
                if (param) {
                    await this.renderOrderDetailView(param);
                } else {
                    await this.renderOrdersView(queryParams);
                }
                break;

            case 'customers':
                await this.renderCustomersView(queryParams);
                break;

            case 'coupons':
            case 'discounts':
                await this.renderCouponsView();
                break;

            case 'shipping':
            case 'shipping-settings':
                await this.renderShippingSettingsView();
                break;

            case 'account':
            case 'profile':
            case 'settings':
                await this.renderAccountView();
                break;

            case 'contact-leads':
            case 'leads':
            case 'contacts':
            case 'admins':
            case 'admin-users':
                await this.renderContactLeadsView(queryParams);
                break;

            default:
                // Default fallback: Categories
                window.location.hash = '#/categories';
                break;
        }
    },

    // ========================================================
    // VIEW 1: SECTIONS & CATEGORIES
    // ========================================================
    async renderCategoriesView() {
        try {
            const catRes = await AdminAPI.getCategories();
            this.cachedCategories = catRes.categories || [];
            const html = AdminPages.categories([], this.cachedCategories);
            this.renderLayout(html, 'categories');
        } catch (err) {
            this.renderLayout(`<div style="color:var(--adm-error); padding:20px;">Failed to load categories: ${this.escapeHtml(err.message)}</div>`, 'categories');
        }
    },

    openAddCategoryModal(defaultSectionId = 1, defaultSectionName = '') {
        const overlay = document.createElement('div');
        overlay.className = 'admin-modal-overlay';
        overlay.innerHTML = `
            <div class="admin-modal" style="max-width:480px;">
                <div class="admin-modal-title" style="color:var(--adm-maroon);">+ Add New Category / Type</div>
                <form id="add-cat-modal-form" onsubmit="event.preventDefault(); AdminApp.submitAddCategory();">
                    <div class="form-group" style="margin-bottom:16px;">
                        <label for="new-cat-section">Main Section <span style="color:var(--adm-error);">*</span></label>
                        <select id="new-cat-section" required style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px;">
                            <option value="1" ${defaultSectionId === 1 ? 'selected' : ''}>CARPETS</option>
                            <option value="2" ${defaultSectionId === 2 ? 'selected' : ''}>KILIMS</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:16px;">
                        <label for="new-cat-name">Category / Type Name <span style="color:var(--adm-error);">*</span></label>
                        <input type="text" id="new-cat-name" required placeholder="e.g. Fine Wool Kilim" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px;">
                    </div>
                    <div class="form-group" style="margin-bottom:20px;">
                        <label for="new-cat-desc">Description (Optional)</label>
                        <textarea id="new-cat-desc" rows="2" placeholder="Brief description..." style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px;"></textarea>
                    </div>
                    <div class="admin-modal-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.admin-modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="add-cat-btn">Save Category</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    },

    async submitAddCategory() {
        const sectionId = document.getElementById('new-cat-section')?.value || 1;
        const name = document.getElementById('new-cat-name')?.value?.trim();
        const desc = document.getElementById('new-cat-desc')?.value?.trim();
        const btn = document.getElementById('add-cat-btn');

        if (!name) {
            adminToast('Category name is required', 'error');
            return;
        }

        try {
            if (btn) btn.disabled = true;
            const fd = new FormData();
            fd.append('name', name);
            fd.append('section_id', sectionId);
            if (desc) fd.append('description', desc);

            await AdminAPI.createCategory(fd);
            adminToast(`Category "${name}" created successfully!`);
            document.querySelector('.admin-modal-overlay')?.remove();
            await this.renderCategoriesView();
        } catch (err) {
            adminToast(err.message || 'Failed to create category', 'error');
            if (btn) btn.disabled = false;
        }
    },

    openEditCategoryModal(id, currentName, currentSectionId, currentDesc, isActive) {
        const overlay = document.createElement('div');
        overlay.className = 'admin-modal-overlay';
        overlay.innerHTML = `
            <div class="admin-modal" style="max-width:480px;">
                <div class="admin-modal-title" style="color:var(--adm-maroon);">Edit / Rename Category</div>
                <form id="edit-cat-modal-form" onsubmit="event.preventDefault(); AdminApp.submitEditCategory(${id});">
                    <div class="form-group" style="margin-bottom:16px;">
                        <label for="edit-cat-section">Main Section</label>
                        <select id="edit-cat-section" required style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px;">
                            <option value="1" ${Number(currentSectionId) === 1 ? 'selected' : ''}>CARPETS</option>
                            <option value="2" ${Number(currentSectionId) === 2 ? 'selected' : ''}>KILIMS</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:16px;">
                        <label for="edit-cat-name">Category / Type Name <span style="color:var(--adm-error);">*</span></label>
                        <input type="text" id="edit-cat-name" value="${this.escapeHtml(currentName)}" required style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px;">
                    </div>
                    <div class="form-group" style="margin-bottom:16px;">
                        <label for="edit-cat-desc">Description (Optional)</label>
                        <textarea id="edit-cat-desc" rows="2" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px;">${this.escapeHtml(currentDesc || '')}</textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:20px;">
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <input type="checkbox" id="edit-cat-active" ${isActive ? 'checked' : ''} style="accent-color:var(--adm-gold);">
                            <span>Active / Visible in Catalog</span>
                        </label>
                    </div>
                    <div class="admin-modal-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.admin-modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="edit-cat-btn">Save Changes</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    },

    async submitEditCategory(id) {
        const sectionId = document.getElementById('edit-cat-section')?.value || 1;
        const name = document.getElementById('edit-cat-name')?.value?.trim();
        const desc = document.getElementById('edit-cat-desc')?.value?.trim();
        const isActive = document.getElementById('edit-cat-active')?.checked;
        const btn = document.getElementById('edit-cat-btn');

        if (!name) {
            adminToast('Category name is required', 'error');
            return;
        }

        try {
            if (btn) btn.disabled = true;
            const fd = new FormData();
            fd.append('name', name);
            fd.append('section_id', sectionId);
            fd.append('description', desc || '');
            fd.append('is_active', isActive ? '1' : '0');

            await AdminAPI.updateCategory(id, fd);
            adminToast(`Category updated successfully!`);
            document.querySelector('.admin-modal-overlay')?.remove();
            await this.renderCategoriesView();
        } catch (err) {
            adminToast(err.message || 'Failed to update category', 'error');
            if (btn) btn.disabled = false;
        }
    },

    async handleDeleteCategory(id, name, productCount) {
        let msg = `Are you sure you want to delete category <strong>"${this.escapeHtml(name)}"</strong>?`;
        if (productCount > 0) {
            msg += `<br><br><strong>Warning:</strong> ${productCount} products belong to this category.`;
        }
        const ok = await confirmDelete(msg, 'Confirm Category Deletion', 'Delete Category');
        if (!ok) return;

        try {
            await AdminAPI.deleteCategory(id);
            adminToast(`Category "${name}" deleted successfully.`);
            await this.renderCategoriesView();
        } catch (err) {
            adminToast(err.message || 'Failed to delete category', 'error');
        }
    },

    async handleDeleteSection(id, name) {
        const ok = await confirmDelete(
            `Are you sure you want to delete section <strong>"${this.escapeHtml(name)}"</strong>?`,
            'Confirm Section Deletion',
            'Delete Section'
        );
        if (!ok) return;

        try {
            await AdminAPI.deleteCollection(id);
            adminToast(`Section "${name}" deleted successfully.`);
            await this.renderCategoriesView();
        } catch (err) {
            adminToast(err.message || 'Failed to delete section', 'error');
        }
    },

    // ========================================================
    // VIEW 2: PRODUCTS LIST
    // ========================================================
    async renderProductsView(queryParams = {}) {
        try {
            const page = parseInt(queryParams.page) || 1;
            const limit = 50;
            const params = {
                page,
                limit,
                search: queryParams.search || '',
                section: queryParams.section || '',
                category: queryParams.category || '',
                status: queryParams.status || '',
                sort: queryParams.sort || 'newest'
            };

            const [prodRes, catRes] = await Promise.all([
                AdminAPI.getProducts(params),
                AdminAPI.getCategories()
            ]);

            this.cachedCategories = catRes.categories || [];
            const products = prodRes.products || [];
            const pagination = prodRes.pagination || { page, limit, total: products.length, totalPages: 1 };

            const sections = [
                { id: 1, name: 'Carpets', slug: 'carpets' },
                { id: 2, name: 'Kilims', slug: 'kilims' }
            ];

            const html = AdminPages.products(products, pagination, queryParams, sections, this.cachedCategories);
            this.renderLayout(html, 'products');
        } catch (err) {
            this.renderLayout(`<div style="color:var(--adm-error); padding:20px;">Failed to load products: ${this.escapeHtml(err.message)}</div>`, 'products');
        }
    },

    onProductSectionFilterChange() {
        const secVal = document.getElementById('prod-section-filter')?.value || '';
        const catSelect = document.getElementById('prod-category-filter');
        if (!catSelect) return;

        // Filter categories in dropdown
        let filteredCats = this.cachedCategories;
        if (secVal === 'carpets') {
            filteredCats = this.cachedCategories.filter(c => c.section_slug === 'carpets' || c.section_id === 1);
        } else if (secVal === 'kilims') {
            filteredCats = this.cachedCategories.filter(c => c.section_slug === 'kilims' || c.section_id === 2);
        }

        catSelect.innerHTML = `<option value="">All Categories</option>` +
            filteredCats.map(c => `<option value="${c.slug}">${this.escapeHtml(c.name)}</option>`).join('');

        this.applyProductFilters();
    },

    applyProductFilters() {
        const search = document.getElementById('prod-search-input')?.value?.trim() || '';
        const section = document.getElementById('prod-section-filter')?.value || '';
        const category = document.getElementById('prod-category-filter')?.value || '';
        const stock_status = document.getElementById('prod-stock-filter')?.value || '';
        const status = document.getElementById('prod-status-filter')?.value || '';
        const sort = document.getElementById('prod-sort-filter')?.value || 'newest';

        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (section) params.set('section', section);
        if (category) params.set('category', category);
        if (stock_status) params.set('stock_status', stock_status);
        if (status) params.set('status', status);
        if (sort && sort !== 'newest') params.set('sort', sort);

        const qs = params.toString();
        window.location.hash = `#/products${qs ? '?' + qs : ''}`;
    },

    toggleProductSort(field) {
        const hash = window.location.hash || '#/products';
        const [base, qs] = hash.split('?');
        const params = new URLSearchParams(qs || '');
        const currentSort = params.get('sort') || 'newest';

        let newSort = 'newest';
        if (field === 'name') {
            newSort = currentSort === 'name_asc' ? 'name_desc' : 'name_asc';
        } else if (field === 'price') {
            newSort = currentSort === 'price_asc' ? 'price_desc' : 'price_asc';
        }
        params.set('sort', newSort);
        params.delete('page');
        window.location.hash = `${base}?${params.toString()}`;
    },

    resetProductFilters() {
        window.location.hash = '#/products';
    },

    goToProductPage(page) {
        const hash = window.location.hash || '#/products';
        const [base, qs] = hash.split('?');
        const params = new URLSearchParams(qs || '');
        params.set('page', page);
        window.location.hash = `${base}?${params.toString()}`;
    },

    async quickToggleProductStatus(id, currentStatus) {
        const nextStatus = currentStatus === 'active' ? 'draft' : 'active';
        try {
            await AdminAPI.toggleProductStatus(id, nextStatus);
            adminToast(`Status updated to ${nextStatus}`);
            await this.handleRoute();
        } catch (err) {
            adminToast(err.message || 'Failed to update status', 'error');
        }
    },

    async quickToggleProductStock(id, currentStock) {
        const nextStock = currentStock ? 0 : 1;
        try {
            await AdminAPI.toggleProductStock(id, nextStock);
            adminToast(`Stock updated to ${nextStock ? 'In Stock' : 'Out of Stock'}`);
            await this.handleRoute();
        } catch (err) {
            adminToast(err.message || 'Failed to update stock status', 'error');
        }
    },

    async handleDeleteProduct(id, name, redirectAfter = false) {
        const ok = await confirmDelete(
            `Are you sure you want to delete product <strong>"${this.escapeHtml(name)}"</strong>?`,
            'Confirm Product Deletion',
            'Delete Product'
        );
        if (!ok) return;

        try {
            await AdminAPI.deleteProduct(id);
            adminToast(`Product "${name}" deleted successfully.`);
            if (redirectAfter) {
                window.location.hash = '#/products';
            } else {
                await this.renderProductsView();
            }
        } catch (err) {
            adminToast(err.message || 'Failed to delete product', 'error');
        }
    },

    // ========================================================
    // SIZE VARIANTS MANAGEMENT
    // ========================================================
    addSizeVariantRow(sizeName = '', price = '', inStock = true) {
        const container = document.getElementById('size-variants-list');
        if (!container) return;

        const placeholder = document.getElementById('no-sizes-placeholder');
        if (placeholder) placeholder.remove();

        const row = document.createElement('div');
        row.className = 'size-variant-row';
        row.style.cssText = 'display:grid; grid-template-columns: 2fr 1.2fr 1.2fr auto; gap:12px; align-items:center; background:#FAF7F2; padding:12px 14px; border:1px solid var(--adm-border); border-radius:4px;';
        row.innerHTML = `
            <div>
                <label style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--adm-maroon); display:block; margin-bottom:4px;">Size Label (e.g. 1.5 × 5 m)</label>
                <input type="text" class="size-var-name" value="${this.escapeHtml(sizeName)}" placeholder="e.g. 1.5 × 5 m" style="padding:8px 10px; font-size:13px; font-weight:600; width:100%;" required>
            </div>
            <div>
                <label style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--adm-text-muted); display:block; margin-bottom:4px;">Price (LE, Optional)</label>
                <input type="number" step="any" class="size-var-price" value="${price !== null && price !== undefined ? price : ''}" placeholder="Base price" style="padding:8px 10px; font-size:13px; width:100%;">
            </div>
            <div>
                <label style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--adm-text-muted); display:block; margin-bottom:4px;">Stock Status</label>
                <select class="size-var-stock" style="padding:8px 10px; font-size:13px; width:100%; font-weight:600;">
                    <option value="1" ${inStock ? 'selected' : ''}>● In Stock</option>
                    <option value="0" ${!inStock ? 'selected' : ''}>○ Out of Stock</option>
                </select>
            </div>
            <div style="display:flex; gap:4px; margin-top:18px;">
                <button type="button" class="btn btn-outline btn-sm" onclick="AdminApp.moveSizeVariantRow(this, -1)" title="Move Up" style="padding:6px 8px;">▲</button>
                <button type="button" class="btn btn-outline btn-sm" onclick="AdminApp.moveSizeVariantRow(this, 1)" title="Move Down" style="padding:6px 8px;">▼</button>
                <button type="button" class="btn btn-danger btn-sm" onclick="AdminApp.removeSizeVariantRow(this)" title="Remove Size" style="padding:6px 9px;">✕</button>
            </div>
        `;
        container.appendChild(row);
    },

    removeSizeVariantRow(btn) {
        const row = btn.closest('.size-variant-row');
        if (row) row.remove();
        const container = document.getElementById('size-variants-list');
        if (container && container.children.length === 0) {
            container.innerHTML = `
                <div id="no-sizes-placeholder" style="padding:16px; text-align:center; color:var(--adm-text-muted); background:var(--adm-bg); border-radius:4px; font-size:13px;">
                    No custom size variants added yet. Click "+ Add Size" to add repeatable sizes.
                </div>
            `;
        }
    },

    moveSizeVariantRow(btn, direction) {
        const row = btn.closest('.size-variant-row');
        if (!row) return;
        if (direction === -1 && row.previousElementSibling && !row.previousElementSibling.id) {
            row.parentNode.insertBefore(row, row.previousElementSibling);
        } else if (direction === 1 && row.nextElementSibling) {
            row.parentNode.insertBefore(row.nextElementSibling, row);
        }
    },

    // ========================================================
    // VIEW 3: PRODUCT FORM (ADD / EDIT)
    // ========================================================
    async renderProductFormView(productId = null) {
        try {
            let product = null;
            const catRes = await AdminAPI.getCategories();
            this.cachedCategories = catRes.categories || [];

            if (productId) {
                const prodRes = await AdminAPI.getProduct(productId);
                product = prodRes.product;
            }

            const sections = [
                { id: 1, name: 'CARPETS', slug: 'carpets' },
                { id: 2, name: 'KILIMS', slug: 'kilims' }
            ];

            const html = AdminPages.productForm(product, sections, this.cachedCategories);
            this.renderLayout(html, 'products');
        } catch (err) {
            this.renderLayout(`<div style="color:var(--adm-error); padding:20px;">Failed to load product: ${this.escapeHtml(err.message)}</div>`, 'products');
        }
    },

    onProductSectionChange(sectionId) {
        const catSelect = document.getElementById('prod-category-select');
        if (!catSelect) return;

        const sId = Number(sectionId);
        const filtered = this.cachedCategories.filter(c => c.section_id === sId || (sId === 1 && (c.section_slug === 'carpets' || !c.section_id)) || (sId === 2 && (c.section_slug === 'kilims' || !c.section_id)));

        catSelect.innerHTML = filtered.map(c => `
            <option value="${c.id}">${this.escapeHtml(c.name)}</option>
        `).join('');
    },

    async submitProductForm() {
        const id = document.getElementById('prod-id')?.value;
        const name = document.getElementById('prod-name')?.value?.trim();
        const price = document.getElementById('prod-price')?.value;
        const salePrice = document.getElementById('prod-sale-price')?.value;
        const isInStock = document.getElementById('prod-in-stock-select')?.value === '1';
        const shortDesc = document.getElementById('prod-short-desc')?.value?.trim();
        const fullDesc = document.getElementById('prod-full-desc')?.value?.trim();
        const handwovenDetails = document.getElementById('prod-handwoven-details')?.value?.trim();
        const whereToPlace = document.getElementById('prod-where-to-place')?.value?.trim();
        const specifications = document.getElementById('prod-specifications')?.value?.trim();
        const careInstructions = document.getElementById('prod-care-instructions')?.value?.trim();
        const shippingInfo = document.getElementById('prod-shipping-info')?.value?.trim();

        const sectionId = document.getElementById('prod-section-select')?.value;
        const categoryId = document.getElementById('prod-category-select')?.value;
        const status = document.getElementById('prod-status-select')?.value || 'active';
        const material = document.getElementById('prod-material')?.value?.trim();
        const color = document.getElementById('prod-color')?.value?.trim();
        const sku = document.getElementById('prod-sku')?.value?.trim();
        const weight = document.getElementById('prod-weight')?.value?.trim();
        const inventoryQty = document.getElementById('prod-inventory')?.value || 1;
        const videoUrl = document.getElementById('prod-video-url')?.value?.trim();

        if (!name) {
            adminToast('Product Name is required', 'error');
            document.getElementById('prod-name')?.focus();
            return;
        }
        if (!price || isNaN(price) || Number(price) < 0) {
            adminToast('Valid Regular Price is required', 'error');
            document.getElementById('prod-price')?.focus();
            return;
        }

        // Collect repeatable size variants
        const sizeRows = document.querySelectorAll('.size-variant-row');
        const sizes = [];
        sizeRows.forEach((row, idx) => {
            const sizeName = row.querySelector('.size-var-name')?.value?.trim();
            const sizePrice = row.querySelector('.size-var-price')?.value;
            const sizeStock = row.querySelector('.size-var-stock')?.value;
            if (sizeName) {
                sizes.push({
                    size_name: sizeName,
                    price: (sizePrice !== '' && sizePrice !== undefined && sizePrice !== null) ? Number(sizePrice) : null,
                    is_in_stock: sizeStock === '1' ? 1 : 0,
                    display_order: idx
                });
            }
        });

        const data = {
            name,
            price: Number(price),
            sale_price: salePrice ? Number(salePrice) : null,
            is_in_stock: isInStock ? 1 : 0,
            short_description: shortDesc || null,
            full_description: fullDesc || null,
            handwoven_details: handwovenDetails || null,
            where_to_place: whereToPlace || null,
            specifications: specifications || null,
            care_instructions: careInstructions || null,
            shipping_info: shippingInfo || null,
            section_id: sectionId ? Number(sectionId) : 1,
            category_id: categoryId ? Number(categoryId) : null,
            status,
            material: material || null,
            color: color || null,
            sku: sku || null,
            weight: weight || null,
            inventory_qty: Number(inventoryQty) || 1,
            sizes,
            video_url: videoUrl !== undefined ? videoUrl : null
        };

        const topBtn = document.getElementById('save-product-top-btn');
        const botBtn = document.getElementById('save-product-bottom-btn');

        try {
            if (topBtn) topBtn.disabled = true;
            if (botBtn) botBtn.disabled = true;

            let targetProductId = id;

            if (id) {
                await AdminAPI.updateProduct(id, data);
                adminToast('Product updated successfully!');
            } else {
                const res = await AdminAPI.createProduct(data);
                targetProductId = res.id;
                adminToast('Product created successfully!');
            }

            window.location.hash = `#/products/edit/${targetProductId}`;
        } catch (err) {
            adminToast(err.message || 'Failed to save product', 'error');
            if (topBtn) topBtn.disabled = false;
            if (botBtn) botBtn.disabled = false;
        }
    },

    async handleProductImageUpload(e) {
        const files = e.target.files;
        const id = document.getElementById('prod-id')?.value;

        if (!files || files.length === 0) return;

        if (!id) {
            adminToast('Please save the product details first before uploading images', 'info');
            return;
        }

        const fd = new FormData();
        for (let i = 0; i < files.length; i++) {
            fd.append('images', files[i]);
        }

        try {
            adminToast('Uploading product images...', 'info');
            await AdminAPI.uploadProductImages(id, fd);
            adminToast('Images uploaded successfully!');
            await this.renderProductFormView(id);
        } catch (err) {
            adminToast(err.message || 'Failed to upload images', 'error');
        }
    },

    async setProductPrimaryImage(productId, imageId) {
        try {
            await AdminAPI.setPrimaryImage(productId, imageId);
            adminToast('Primary image updated! Storefront updated.');
            await this.renderProductFormView(productId);
        } catch (err) {
            adminToast(err.message || 'Failed to set primary image', 'error');
        }
    },

    async moveProductImage(productId, fromIdx, toIdx) {
        try {
            const prodRes = await AdminAPI.getProduct(productId);
            const images = prodRes.product?.images || [];
            if (!images.length) return;

            const order = images.map(img => img.id);
            const moved = order.splice(fromIdx, 1)[0];
            order.splice(toIdx, 0, moved);

            await AdminAPI.reorderImages(productId, order);
            await this.renderProductFormView(productId);
        } catch (err) {
            adminToast(err.message || 'Failed to reorder images', 'error');
        }
    },

    async deleteProductImage(productId, imageId) {
        const ok = await confirmDelete('Are you sure you want to delete this image?');
        if (!ok) return;

        try {
            await AdminAPI.deleteProductImage(productId, imageId);
            adminToast('Image deleted.');
            await this.renderProductFormView(productId);
        } catch (err) {
            adminToast(err.message || 'Failed to delete image', 'error');
        }
    },

    // ========================================================
    // VIEW 4: ORDERS LIST
    // ========================================================
    async renderOrdersView(queryParams = {}) {
        try {
            const page = parseInt(queryParams.page) || 1;
            const limit = 25;
            const params = {
                page,
                limit,
                search: queryParams.search || '',
                status: queryParams.status || '',
                sort: queryParams.sort || 'newest'
            };

            const res = await AdminAPI.getOrders(params);
            const orders = res.orders || [];
            const pagination = res.pagination || { page, limit, total: orders.length, totalPages: 1 };

            const html = AdminPages.orders(orders, pagination, queryParams);
            this.renderLayout(html, 'orders');
        } catch (err) {
            this.renderLayout(`<div style="color:var(--adm-error); padding:20px;">Failed to load orders: ${this.escapeHtml(err.message)}</div>`, 'orders');
        }
    },

    applyOrderFilters() {
        const search = document.getElementById('order-search-input')?.value?.trim() || '';
        const status = document.getElementById('order-status-filter')?.value || '';
        const sort = document.getElementById('order-sort-filter')?.value || 'newest';

        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        if (sort && sort !== 'newest') params.set('sort', sort);

        const qs = params.toString();
        window.location.hash = `#/orders${qs ? '?' + qs : ''}`;
    },

    toggleOrderSort(field) {
        const hash = window.location.hash || '#/orders';
        const [base, qs] = hash.split('?');
        const params = new URLSearchParams(qs || '');
        const currentSort = params.get('sort') || 'newest';

        let newSort = 'newest';
        if (field === 'date') {
            newSort = (currentSort === 'newest' || !currentSort) ? 'oldest' : 'newest';
        } else if (field === 'total') {
            newSort = currentSort === 'total_desc' ? 'total_asc' : 'total_desc';
        } else if (field === 'customer') {
            newSort = currentSort === 'customer_asc' ? 'customer_desc' : 'customer_asc';
        }
        params.set('sort', newSort);
        params.delete('page');
        window.location.hash = `${base}?${params.toString()}`;
    },

    resetOrderFilters() {
        window.location.hash = '#/orders';
    },

    goToOrderPage(page) {
        const hash = window.location.hash || '#/orders';
        const [base, qs] = hash.split('?');
        const params = new URLSearchParams(qs || '');
        params.set('page', page);
        window.location.hash = `${base}?${params.toString()}`;
    },

    // ========================================================
    // VIEW 5: CUSTOMERS LIST
    // ========================================================
    async renderCustomersView(queryParams = {}) {
        try {
            const page = parseInt(queryParams.page) || 1;
            const limit = 20;
            const params = {
                page,
                limit,
                search: queryParams.search || '',
                sort: queryParams.sort || 'total_desc'
            };

            const res = await AdminAPI.getCustomers(params);
            const customers = res.customers || [];
            const pagination = res.pagination || { page, limit, total: customers.length, pages: 1 };

            const html = AdminPages.customers(customers, pagination, queryParams);
            this.renderLayout(html, 'customers');
        } catch (err) {
            this.renderLayout(`<div style="color:var(--adm-error); padding:20px;">Failed to load customers: ${this.escapeHtml(err.message)}</div>`, 'customers');
        }
    },

    applyCustomerFilters() {
        const search = document.getElementById('customer-search-input')?.value?.trim() || '';
        const sort = document.getElementById('customer-sort-filter')?.value || 'total_desc';

        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (sort && sort !== 'total_desc') params.set('sort', sort);

        const qs = params.toString();
        window.location.hash = `#/customers${qs ? '?' + qs : ''}`;
    },

    resetCustomerFilters() {
        window.location.hash = '#/customers';
    },

    toggleCustomerSort(field) {
        const hash = window.location.hash || '#/customers';
        const [base, qs] = hash.split('?');
        const params = new URLSearchParams(qs || '');
        const currentSort = params.get('sort') || 'total_desc';

        let newSort = 'total_desc';
        if (field === 'total') {
            newSort = currentSort === 'total_desc' ? 'total_asc' : 'total_desc';
        } else if (field === 'orders') {
            newSort = currentSort === 'orders_desc' ? 'orders_asc' : 'orders_desc';
        } else if (field === 'name') {
            newSort = currentSort === 'name_asc' ? 'name_desc' : 'name_asc';
        } else if (field === 'date') {
            newSort = currentSort === 'newest' ? 'oldest' : 'newest';
        }
        params.set('sort', newSort);
        params.delete('page');
        window.location.hash = `${base}?${params.toString()}`;
    },

    goToCustomerPage(page) {
        const hash = window.location.hash || '#/customers';
        const [base, qs] = hash.split('?');
        const params = new URLSearchParams(qs || '');
        params.set('page', page);
        window.location.hash = `${base}?${params.toString()}`;
    },

    goToOrderPage(page) {
        const hash = window.location.hash || '#/orders';
        const [base, qs] = hash.split('?');
        const params = new URLSearchParams(qs || '');
        params.set('page', page);
        window.location.hash = `${base}?${params.toString()}`;
    },

    // ========================================================
    // VIEW 5: ORDER DETAILS
    // ========================================================
    async renderOrderDetailView(orderId) {
        try {
            const res = await AdminAPI.getOrder(orderId);
            const order = res.order;
            const html = AdminPages.orderDetail(order);
            this.renderLayout(html, 'orders');
        } catch (err) {
            this.renderLayout(`<div style="color:var(--adm-error); padding:20px;">Failed to load order: ${this.escapeHtml(err.message)}</div>`, 'orders');
        }
    },

    async updateOrderStatusFromPage(orderId) {
        const select = document.getElementById('order-detail-status-select');
        const status = select?.value;
        if (!status) return;

        try {
            await AdminAPI.updateOrderStatus(orderId, status);
            adminToast(`Order status updated to "${status.toUpperCase()}"!`);
            await this.renderOrderDetailView(orderId);
        } catch (err) {
            adminToast(err.message || 'Failed to update order status', 'error');
        }
    },

    async handleDeleteOrder(orderId, orderNumber) {
        const ok = await confirmDelete(
            `Are you sure you want to delete order <strong>${orderNumber}</strong>?`,
            'Confirm Order Deletion',
            'Delete Order'
        );
        if (!ok) return;

        try {
            await AdminAPI.deleteOrder(orderId);
            adminToast(`Order "${orderNumber}" deleted successfully.`);
            window.location.hash = '#/orders';
        } catch (err) {
            adminToast(err.message || 'Failed to delete order', 'error');
        }
    },

    async handleDeleteCustomer(customerId, customerName, customerEmail) {
        const ok = await confirmDelete(
            `Are you sure you want to delete customer <strong>"${this.escapeHtml(customerName)}"</strong> (${this.escapeHtml(customerEmail || '')})?`,
            'Confirm Customer Deletion',
            'Delete Customer'
        );
        if (!ok) return;

        try {
            await AdminAPI.deleteCustomer(customerId);
            adminToast(`Customer "${customerName}" deleted successfully.`);
            await this.renderCustomersView();
        } catch (err) {
            adminToast(err.message || 'Failed to delete customer', 'error');
        }
    },

    // ========================================================
    // ========================================================
    // VIEW 6: ACCOUNT & ADMIN ACCESS MANAGEMENT
    // ========================================================
    async renderAccountView() {
        try {
            const [me, usersRes] = await Promise.all([
                AdminAPI.me(),
                AdminAPI.getAdminUsers()
            ]);
            this.currentUser = me.admin;
            const adminUsers = usersRes.users || [];
            const html = AdminPages.account(this.currentUser, adminUsers);
            this.renderLayout(html, 'account');
        } catch (err) {
            this.renderLayout(`<div style="color:var(--adm-error); padding:20px;">Failed to load account settings: ${this.escapeHtml(err.message)}</div>`, 'account');
        }
    },

    togglePasswordVisibility(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        if (input.type === 'password') {
            input.type = 'text';
            if (btn) btn.textContent = '🔒';
        } else {
            input.type = 'password';
            if (btn) btn.textContent = '👁';
        }
    },

    checkPasswordStrength(val) {
        const hint = document.getElementById('password-strength-hint');
        if (!hint) return;
        if (!val) {
            hint.innerHTML = `<span>🔒</span> Password must be at least 6 characters long.`;
            hint.style.color = 'var(--adm-text-muted)';
        } else if (val.length < 6) {
            hint.innerHTML = `<span style="color:var(--adm-error);">✕ Too short</span> (Minimum 6 characters needed)`;
            hint.style.color = 'var(--adm-error)';
        } else {
            hint.innerHTML = `<span style="color:var(--adm-success);">✓ Valid password length</span>`;
            hint.style.color = 'var(--adm-success)';
        }
    },

    async handleSaveProfile() {
        const username = document.getElementById('acc-username')?.value?.trim();
        const email = document.getElementById('acc-email')?.value?.trim();
        const phone = document.getElementById('acc-phone')?.value?.trim();
        const btn = document.getElementById('save-profile-btn');

        if (!username || !email) {
            adminToast('Username and Email are required', 'error');
            return;
        }

        try {
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Saving Profile...';
            }
            const res = await AdminAPI.updateProfile({ username, email, phone });
            this.currentUser = res.admin;
            adminToast('Profile information saved successfully!');
            await this.renderAccountView();
        } catch (err) {
            adminToast(err.message || 'Failed to update profile', 'error');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Save Profile';
            }
        }
    },

    async handleSavePassword() {
        const current_password = document.getElementById('acc-curr-password')?.value;
        const new_password = document.getElementById('acc-new-password')?.value;
        const confirm_password = document.getElementById('acc-confirm-password')?.value;
        const btn = document.getElementById('save-password-btn');

        if (!current_password || !new_password) {
            adminToast('Please fill in both current and new password', 'error');
            return;
        }
        if (new_password.length < 6) {
            adminToast('New password must be at least 6 characters long', 'error');
            return;
        }
        if (new_password !== confirm_password) {
            adminToast('New password confirmation does not match', 'error');
            return;
        }

        try {
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Updating...';
            }
            await AdminAPI.changePassword({ current_password, new_password });
            adminToast('Password updated successfully!');
            document.getElementById('account-password-form')?.reset();
            const hint = document.getElementById('password-strength-hint');
            if (hint) {
                hint.innerHTML = `<span>🔒</span> Password must be at least 6 characters long.`;
                hint.style.color = 'var(--adm-text-muted)';
            }
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Update Password';
            }
        } catch (err) {
            adminToast(err.message || 'Failed to change password', 'error');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Update Password';
            }
        }
    },

    async handleCreateAdminUser() {
        const email = document.getElementById('admin-new-email')?.value?.trim();
        const password = document.getElementById('admin-new-password')?.value;
        const username = document.getElementById('admin-new-name')?.value?.trim();
        const btn = document.getElementById('create-admin-btn');

        if (!email || !password) {
            adminToast('Admin email and password are required', 'error');
            return;
        }
        if (password.length < 6) {
            adminToast('Admin password must be at least 6 characters long', 'error');
            return;
        }

        try {
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Creating Account...';
            }
            const res = await AdminAPI.createAdminUser({ email, password, username, role: 'admin' });
            adminToast(res.message || `Admin account "${email}" created successfully!`);
            document.getElementById('create-admin-form')?.reset();
            await this.renderAccountView();
        } catch (err) {
            adminToast(err.message || 'Failed to create admin user', 'error');
            if (btn) {
                btn.disabled = false;
                btn.textContent = '➕ Create Admin Account';
            }
        }
    },

    async handleDeleteAdminUser(id, email) {
        if (id === 1 || String(email).toLowerCase() === 'admin@yadawy.com') {
            adminToast('Cannot delete the primary main administrator account', 'error');
            return;
        }
        if (this.currentUser && this.currentUser.id === id) {
            adminToast('You cannot delete your own active administrator account', 'error');
            return;
        }
        const ok = await confirmDelete(
            `Are you sure you want to delete administrator account <strong>${this.escapeHtml(email)}</strong>?<br><br>They will immediately lose access to the admin dashboard.`,
            'Confirm Administrator Deletion',
            'Delete Admin Account'
        );
        if (!ok) return;

        try {
            await AdminAPI.deleteAdminUser(id);
            adminToast(`Admin account "${email}" removed.`);
            await this.renderAccountView();
        } catch (err) {
            adminToast(err.message || 'Failed to delete admin user', 'error');
        }
    },

    // ========================================================
    // VIEW 7: CONTACT LEADS / CONTACT SUBMISSIONS
    // ========================================================
    leadsFilters: {
        search: '',
        status: 'all',
        sort: 'newest',
        page: 1
    },

    async renderContactLeadsView(queryParams = {}) {
        try {
            if (queryParams.search !== undefined) this.leadsFilters.search = queryParams.search;
            if (queryParams.status !== undefined) this.leadsFilters.status = queryParams.status;
            if (queryParams.sort !== undefined) this.leadsFilters.sort = queryParams.sort;
            if (queryParams.page !== undefined) this.leadsFilters.page = parseInt(queryParams.page) || 1;

            const res = await AdminAPI.getContactLeads(this.leadsFilters);
            const leads = res.leads || [];
            const total = res.total || 0;
            const counts = res.counts || {};

            const html = AdminPages.contactLeads(leads, total, counts, this.leadsFilters);
            this.renderLayout(html, 'contact-leads');
        } catch (err) {
            this.renderLayout(`<div style="color:var(--adm-error); padding:20px;">Failed to load contact leads: ${this.escapeHtml(err.message)}</div>`, 'contact-leads');
        }
    },

    filterLeadsByStatus(status) {
        this.leadsFilters.status = status;
        this.leadsFilters.page = 1;
        this.renderContactLeadsView();
    },

    applyLeadsFilters() {
        const searchInput = document.getElementById('leads-search');
        const statusSelect = document.getElementById('leads-status-filter');
        const sortSelect = document.getElementById('leads-sort-filter');

        if (searchInput) this.leadsFilters.search = searchInput.value.trim();
        if (statusSelect) this.leadsFilters.status = statusSelect.value;
        if (sortSelect) this.leadsFilters.sort = sortSelect.value;
        this.leadsFilters.page = 1;

        this.renderContactLeadsView();
    },

    resetLeadsFilters() {
        this.leadsFilters = { search: '', status: 'all', sort: 'newest', page: 1 };
        this.renderContactLeadsView();
    },

    async openLeadDetailModal(leadId) {
        try {
            const res = await AdminAPI.getContactLead(leadId);
            const lead = res.lead;
            if (!lead) {
                adminToast('Contact lead not found', 'error');
                return;
            }

            const overlay = document.createElement('div');
            overlay.className = 'admin-modal-overlay';
            overlay.innerHTML = AdminPages.contactLeadModal(lead);
            document.body.appendChild(overlay);

            overlay.onclick = (e) => {
                if (e.target === overlay) overlay.remove();
            };
        } catch (err) {
            adminToast(err.message || 'Failed to open lead details', 'error');
        }
    },

    async handleSaveLeadDetails(leadId) {
        const statusSelect = document.getElementById('lead-status-select');
        const notesTextarea = document.getElementById('lead-internal-notes');
        const btn = document.getElementById('save-lead-btn');

        const status = statusSelect?.value || 'New';
        const internal_notes = notesTextarea?.value || '';

        try {
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Saving...';
            }
            await AdminAPI.updateContactLead(leadId, { status, internal_notes });
            adminToast(`Lead #${leadId} updated to "${status}"`);
            document.querySelector('.admin-modal-overlay')?.remove();
            await this.renderContactLeadsView();
        } catch (err) {
            adminToast(err.message || 'Failed to update lead', 'error');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Save Changes';
            }
        }
    },

    async handleDeleteLead(leadId, leadName = '', isModal = false) {
        const ok = await confirmDelete(`Are you sure you want to permanently delete the contact submission from "${leadName || ('Lead #' + leadId)}"?`);
        if (!ok) return;

        try {
            await AdminAPI.deleteContactLead(leadId);
            adminToast(`Submission from "${leadName}" removed.`);
            if (isModal) {
                document.querySelector('.admin-modal-overlay')?.remove();
            }
            await this.renderContactLeadsView();
        } catch (err) {
            adminToast(err.message || 'Failed to delete lead', 'error');
        }
    },

    // ========================================================
    // VIEW 8: COUPONS & DISCOUNTS MANAGEMENT
    // ========================================================
    cachedCoupons: [],

    async renderCouponsView() {
        try {
            const res = await AdminAPI.getCoupons();
            this.cachedCoupons = res.coupons || [];
            this.renderLayout(AdminPages.renderCouponsView(this.cachedCoupons), 'coupons');
        } catch (err) {
            console.error('Error fetching coupons:', err);
            adminToast(err.message || 'Failed to load coupons', 'error');
        }
    },

    openCouponModal(couponId = null) {
        let coupon = null;
        if (couponId) {
            coupon = this.cachedCoupons.find(c => c.id === couponId) || null;
        }

        // Remove any open overlays
        document.querySelectorAll('.admin-modal-overlay').forEach(el => el.remove());

        const overlay = document.createElement('div');
        overlay.className = 'admin-modal-overlay';
        overlay.innerHTML = AdminPages.renderCouponModal(coupon);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    },

    async handleSaveCoupon(couponId = null) {
        const form = document.getElementById('coupon-form');
        if (!form) return;

        const btn = document.getElementById('save-coupon-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Saving...';
        }

        const codeInput = document.getElementById('coupon-code-input');
        const valueInput = document.getElementById('coupon-value-input');
        const minOrderInput = document.getElementById('coupon-min-order');
        const limitInput = document.getElementById('coupon-usage-limit');
        const endDateInput = document.getElementById('coupon-end-date');
        const activeInput = document.getElementById('coupon-is-active');

        const code = codeInput?.value.trim().toUpperCase();
        const discount_value = parseFloat(valueInput?.value);
        const min_order_value = minOrderInput?.value ? parseFloat(minOrderInput.value) : 0;
        const usage_limit = limitInput?.value ? parseInt(limitInput.value) : null;
        const end_date = endDateInput?.value ? endDateInput.value : null;
        const is_active = activeInput ? activeInput.checked : true;

        if (!code || code.length < 2) {
            adminToast('Please enter a valid coupon code (min 2 characters)', 'error');
            if (btn) { btn.disabled = false; btn.textContent = couponId ? 'Update Coupon' : 'Create Coupon'; }
            return;
        }

        if (isNaN(discount_value) || discount_value <= 0 || discount_value > 100) {
            adminToast('Discount percentage must be between 0.5% and 100%', 'error');
            if (btn) { btn.disabled = false; btn.textContent = couponId ? 'Update Coupon' : 'Create Coupon'; }
            return;
        }

        const payload = {
            code,
            discount_type: 'percentage',
            discount_value,
            min_order_value,
            usage_limit,
            end_date,
            is_active
        };

        try {
            if (couponId) {
                const res = await AdminAPI.updateCoupon(couponId, payload);
                adminToast(res.message || `Coupon "${code}" updated successfully!`);
            } else {
                const res = await AdminAPI.createCoupon(payload);
                adminToast(res.message || `Coupon "${code}" created successfully!`);
            }

            document.querySelector('.admin-modal-overlay')?.remove();
            await this.renderCouponsView();
        } catch (err) {
            console.error('Error saving coupon:', err);
            adminToast(err.message || 'Failed to save coupon', 'error');
            if (btn) {
                btn.disabled = false;
                btn.textContent = couponId ? 'Update Coupon' : 'Create Coupon';
            }
        }
    },

    async handleToggleCouponStatus(couponId, newStatus) {
        try {
            const res = await AdminAPI.toggleCouponStatus(couponId, newStatus);
            adminToast(res.message || `Coupon ${newStatus ? 'activated' : 'deactivated'}`);
            await this.renderCouponsView();
        } catch (err) {
            console.error('Error toggling coupon status:', err);
            adminToast(err.message || 'Failed to toggle coupon status', 'error');
        }
    },

    async handleDeleteCoupon(couponId, couponCode) {
        const ok = await confirmDelete(
            `Are you sure you want to delete coupon <strong>"${this.escapeHtml(couponCode)}"</strong>?`,
            'Confirm Coupon Deletion',
            'Delete Coupon'
        );
        if (!ok) return;

        try {
            await AdminAPI.deleteCoupon(couponId);
            adminToast(`Coupon "${couponCode}" deleted successfully.`);
            await this.renderCouponsView();
        } catch (err) {
            console.error('Error deleting coupon:', err);
            adminToast(err.message || 'Failed to delete coupon', 'error');
        }
    },

    // ========================================================
    // VIEW: SHIPPING SETTINGS
    // ========================================================
    async renderShippingSettingsView() {
        try {
            const res = await AdminAPI.getShippingCost();
            const shippingCost = res && res.cost !== undefined ? res.cost : 100;
            const html = AdminPages.renderShippingSettingsView(shippingCost);
            this.renderLayout(html, 'shipping');
        } catch (err) {
            console.error('Error loading shipping settings:', err);
            adminToast(err.message || 'Failed to load shipping settings', 'error');
            this.renderLayout(AdminPages.renderShippingSettingsView(100), 'shipping');
        }
    },

    async handleSaveShippingSettings(e) {
        e.preventDefault();
        const input = document.getElementById('shipping-cost-input');
        const btn = document.getElementById('save-shipping-btn');
        if (!input) return;

        const val = parseFloat(input.value);
        if (isNaN(val) || val < 0) {
            adminToast('Please enter a valid shipping cost (0 or greater).', 'error');
            input.focus();
            return;
        }

        try {
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span>⏳</span><span>Saving...</span>';
            }

            const res = await AdminAPI.updateShippingCost(val);
            const savedCost = res && res.cost !== undefined ? res.cost : val;

            adminToast(res?.message || 'Shipping cost updated successfully.', 'success');
            await this.renderShippingSettingsView();
        } catch (err) {
            console.error('Error saving shipping settings:', err);
            adminToast(err.message || 'Failed to save shipping settings', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span>💾</span><span>Save Shipping Settings</span>';
            }
        }
    }
};

// Initialize Admin App on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AdminApp.init();
});
