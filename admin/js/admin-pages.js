// ============================================================
// YADAWY ADMIN DASHBOARD — STREAMLINED PAGE RENDERERS
// ============================================================

const AdminPages = {
    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    formatPrice(num) {
        if (!num && num !== 0) return '0 LE';
        return Number(num).toLocaleString('en-US') + ' LE';
    },

    formatDate(dateStr) {
        if (!dateStr) return '—';
        try {
            let s = String(dateStr).trim();
            // If SQLite datetime format "YYYY-MM-DD HH:MM:SS" without timezone or T, treat as UTC
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
                s = s.replace(' ', 'T') + 'Z';
            } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) {
                s = s + 'Z';
            }
            const d = new Date(s);
            if (isNaN(d.getTime())) return String(dateStr);
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return String(dateStr);
        }
    },

    // ========================================================
    // 0. LOGIN
    // ========================================================
    login() {
        return `
            <div class="admin-login-wrapper">
                <div class="admin-login-card">
                    <div class="admin-login-header">
                        <div class="admin-login-logo">
                            <img src="/admin/images/logo-light.png" alt="YADAWY" class="admin-login-logo-img">
                            <span class="admin-logo-tagline" dir="rtl" lang="ar">امتداد الشركة الإيرانية</span>
                        </div>
                        <h1 class="admin-login-title">YADAWY</h1>
                        <p class="admin-login-subtitle">Admin Store Control Center</p>
                    </div>
                    <form id="admin-login-form" class="admin-form">
                        <div class="form-group">
                            <label for="admin-email">Admin Email Address</label>
                            <input type="email" id="admin-email" class="form-control" required placeholder="admin@yadawy.com" autocomplete="email" autofocus>
                        </div>
                        <div class="form-group">
                            <label for="admin-password">Password</label>
                            <input type="password" id="admin-password" class="form-control" required placeholder="••••••••" autocomplete="current-password">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" id="login-submit-btn" style="width:100%; justify-content:center; padding:12px; font-size:14px;">
                            <span>Sign In to Dashboard</span>
                        </button>
                    </form>
                    <div class="admin-login-footer">
                        <p>Secure Administrator Access — Storefront Catalog & Orders</p>
                    </div>
                </div>
            </div>
        `;
    },

    // ========================================================
    // 1. SECTIONS & CATEGORIES
    // ========================================================
    categories(sections = [], allCategories = []) {
        // We know exactly 2 fixed sections: Carpets (id: 1, slug: 'carpets') and Kilims (id: 2, slug: 'kilims')
        const carpetCategories = allCategories.filter(c => c.section_slug === 'carpets' || c.section_id === 1 || (!c.section_id && c.section_name?.toLowerCase().includes('carpet')));
        const kilimCategories = allCategories.filter(c => c.section_slug === 'kilims' || c.section_id === 2 || (!c.section_id && c.section_name?.toLowerCase().includes('kilim')));

        const renderCatItem = (c) => `
            <div class="category-item" id="cat-row-${c.id}">
                <div class="category-main-info">
                    <a href="#/products?category=${encodeURIComponent(c.slug)}" class="category-name-link" title="Click to view all products in this category">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        <strong>${this.escapeHtml(c.name)}</strong>
                    </a>
                    <span class="category-meta-badge">${c.product_count || 0} products</span>
                    ${c.is_active ? '<span class="badge badge-active">Active</span>' : '<span class="badge badge-draft">Disabled</span>'}
                </div>
                <div class="btn-group">
                    <a href="#/products?category=${encodeURIComponent(c.slug)}" class="btn btn-outline btn-sm">
                        View Products ↗
                    </a>
                    <button class="btn btn-outline btn-sm" onclick="AdminApp.openEditCategoryModal(${c.id}, '${this.escapeHtml(c.name).replace(/'/g, "\\'")}', ${c.section_id || 1}, '${this.escapeHtml(c.description || '').replace(/'/g, "\\'")}', ${c.is_active})">
                        Rename / Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="AdminApp.handleDeleteCategory(${c.id}, '${this.escapeHtml(c.name).replace(/'/g, "\\'")}', ${c.product_count || 0})">
                        Delete
                    </button>
                </div>
            </div>
        `;

        return `
            <div class="admin-page-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
                <div>
                    <h1 class="admin-page-title" style="font-size:22px; font-weight:700; color:var(--adm-maroon); font-family:var(--adm-font-brand); letter-spacing:1px; margin-bottom:6px;">Sections &amp; Categories</h1>
                    <p class="admin-page-subtitle" style="color:var(--adm-text-secondary); font-size:13px;">
                        Manage product types and categories across the 2 fixed catalog sections. Click any category to view its products.
                    </p>
                </div>
                <div>
                    <button class="btn btn-primary" onclick="AdminApp.openAddCategoryModal()">+ Add New Category / Type</button>
                </div>
            </div>

            <div style="background:#FFFDF8; border-left:4px solid var(--adm-gold); padding:14px 18px; margin-bottom:24px; border-radius:0 4px 4px 0; font-size:13px; color:var(--adm-text);">
                <strong> Website Structure Notice:</strong> The two main sections (<strong>CARPETS</strong> &amp; <strong>KILIMS</strong>) are permanent architectural sections of the website and cannot be renamed or deleted. You can freely add, rename, and delete the product types/categories inside them.
            </div>

            <!-- CARPETS SECTION -->
            <div class="section-card">
                <div class="section-card-header">
                    <div class="section-card-title">
                        <span>CARPETS</span>
                        <span class="section-fixed-badge">Fixed Section</span>
                    </div>
                    <div>
                        <button class="btn btn-primary btn-sm" onclick="AdminApp.openAddCategoryModal(1, 'Carpets')">+ Add Type to Carpets</button>
                    </div>
                </div>
                <div class="category-list">
                    ${carpetCategories.length ? carpetCategories.map(renderCatItem).join('') : '<div style="padding:24px; text-align:center; color:var(--adm-text-muted);">No categories found in Carpets. Click "+ Add Type to Carpets" to create one.</div>'}
                </div>
            </div>

            <!-- KILIMS SECTION -->
            <div class="section-card">
                <div class="section-card-header">
                    <div class="section-card-title">
                        <span>KILIMS</span>
                        <span class="section-fixed-badge">Fixed Section</span>
                    </div>
                    <div>
                        <button class="btn btn-primary btn-sm" onclick="AdminApp.openAddCategoryModal(2, 'Kilims')">+ Add Type to Kilims</button>
                    </div>
                </div>
                <div class="category-list">
                    ${kilimCategories.length ? kilimCategories.map(renderCatItem).join('') : '<div style="padding:24px; text-align:center; color:var(--adm-text-muted);">No categories found in Kilims. Click "+ Add Type to Kilims" to create one.</div>'}
                </div>
            </div>
        `;
    },

    // ========================================================
    // 2. PRODUCTS LIST
    // ========================================================
    products(products = [], pagination = {}, filters = {}, sections = [], categories = []) {
        const { search = '', section = '', category = '', status = '', stock_status = '', sort = 'newest' } = filters;
        const total = pagination.total ?? products.length;

        // Active breadcrumb label
        let filterBreadcrumb = '';
        if (section || category) {
            const secObj = sections.find(s => s.slug === section || String(s.id) === section);
            const catObj = categories.find(c => c.slug === category || String(c.id) === category);
            filterBreadcrumb = `
                <div style="background:#FAF7F2; padding:8px 16px; border:1px solid var(--adm-border); border-radius:4px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between;">
                    <div style="font-size:13px; font-weight:600; color:var(--adm-maroon);">
                        <span>Filtering: </span>
                        ${secObj ? `<strong>${this.escapeHtml(secObj.name)}</strong>` : ''}
                        ${secObj && catObj ? ` ➔ ` : ''}
                        ${catObj ? `<strong style="color:var(--adm-gold-dark);">${this.escapeHtml(catObj.name)}</strong>` : ''}
                        <span style="color:var(--adm-text-muted); font-weight:400; margin-left:8px;">(${total} products found)</span>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="AdminApp.resetProductFilters()">✕ Clear Filter</button>
                </div>
            `;
        }

        return `
            <div class="admin-page-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
                <div>
                    <h1 class="admin-page-title" style="font-size:22px; font-weight:700; color:var(--adm-maroon); font-family:var(--adm-font-brand); letter-spacing:1px; margin-bottom:6px;">Products Management</h1>
                    <p class="admin-page-subtitle" style="color:var(--adm-text-secondary); font-size:13px;">
                        Complete control over all products displayed on the public website. Add, edit, delete, and manage device image uploads.
                    </p>
                </div>
                <div>
                    <a href="#/products/new" class="btn btn-primary" style="padding:10px 20px; font-size:13px; font-weight:700;">+ Add New Product</a>
                </div>
            </div>

            ${filterBreadcrumb}

            <!-- Filter and Search Toolbar -->
            <div class="admin-card" style="padding:16px; margin-bottom:20px;">
                <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                    <!-- Search -->
                    <div style="flex:1; min-width:200px;">
                        <input type="text" id="prod-search-input" value="${this.escapeHtml(search)}" placeholder="Search products by name, SKU..." style="width:100%; padding:9px 14px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;" onkeyup="if(event.key==='Enter') AdminApp.applyProductFilters()">
                    </div>

                    <!-- Section Filter (Fixed 2 Sections) -->
                    <div style="min-width:140px;">
                        <select id="prod-section-filter" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;" onchange="AdminApp.onProductSectionFilterChange()">
                            <option value="">All Sections</option>
                            <option value="carpets" ${section === 'carpets' ? 'selected' : ''}>Carpets</option>
                            <option value="kilims" ${section === 'kilims' ? 'selected' : ''}>Kilims</option>
                        </select>
                    </div>

                    <!-- Category Filter -->
                    <div style="min-width:160px;">
                        <select id="prod-category-filter" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;" onchange="AdminApp.applyProductFilters()">
                            <option value="">All Categories</option>
                            ${categories.map(c => `<option value="${c.slug}" ${category === c.slug ? 'selected' : ''}>${this.escapeHtml(c.name)}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Stock Status Filter -->
                    <div style="min-width:140px;">
                        <select id="prod-stock-filter" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px; font-weight:600;" onchange="AdminApp.applyProductFilters()">
                            <option value="">All Availability</option>
                            <option value="in_stock" ${stock_status === 'in_stock' ? 'selected' : ''}>In Stock</option>
                            <option value="out_of_stock" ${stock_status === 'out_of_stock' ? 'selected' : ''}>Out of Stock</option>
                        </select>
                    </div>

                    <!-- Status Filter -->
                    <div style="min-width:130px;">
                        <select id="prod-status-filter" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;" onchange="AdminApp.applyProductFilters()">
                            <option value="">All Statuses</option>
                            <option value="active" ${status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="draft" ${status === 'draft' ? 'selected' : ''}>Draft</option>
                            <option value="disabled" ${status === 'disabled' ? 'selected' : ''}>Disabled</option>
                        </select>
                    </div>

                    <!-- Sort Filter -->
                    <div style="min-width:160px;">
                        <select id="prod-sort-filter" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px; font-weight:600; color:var(--adm-maroon);" onchange="AdminApp.applyProductFilters()">
                            <option value="newest" ${sort === 'newest' ? 'selected' : ''}>Newest First</option>
                            <option value="oldest" ${sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                            <option value="price_asc" ${sort === 'price_asc' ? 'selected' : ''}>Price: Low → High</option>
                            <option value="price_desc" ${sort === 'price_desc' ? 'selected' : ''}>Price: High → Low</option>
                            <option value="name_asc" ${sort === 'name_asc' ? 'selected' : ''}>Name: A → Z</option>
                            <option value="name_desc" ${sort === 'name_desc' ? 'selected' : ''}>Name: Z → A</option>
                            <option value="best_seller" ${sort === 'best_seller' ? 'selected' : ''}>Best Sellers</option>
                        </select>
                    </div>

                    <button class="btn btn-secondary" onclick="AdminApp.applyProductFilters()" style="padding:9px 16px;">Filter</button>
                    ${(search || section || category || status || stock_status || (sort && sort !== 'newest')) ? `<button class="btn btn-outline" onclick="AdminApp.resetProductFilters()" style="padding:9px 14px;">Reset</button>` : ''}
                </div>
            </div>

            <!-- Products Table Card -->
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">Products Catalog (${total} total)</div>
                </div>

                ${products.length === 0 ? `
                    <div style="padding:48px; text-align:center;">
                        <p style="color:var(--adm-text-muted); font-size:15px; margin-bottom:16px;">No products match your selected filters.</p>
                        <button class="btn btn-outline" onclick="AdminApp.resetProductFilters()">Clear All Filters</button>
                    </div>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th style="width:70px;">Image</th>
                                    <th>
                                        <button onclick="AdminApp.toggleProductSort('name')" style="background:none;border:none;font-weight:700;font-size:12px;color:var(--adm-maroon);cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:0;">
                                             Product Name ${sort === 'name_asc' ? '▲' : sort === 'name_desc' ? '▼' : '↕'}
                                        </button>
                                    </th>
                                    <th>Section</th>
                                    <th>Category</th>
                                    <th>
                                        <button onclick="AdminApp.toggleProductSort('price')" style="background:none;border:none;font-weight:700;font-size:12px;color:var(--adm-maroon);cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:0;">
                                            Price ${sort === 'price_asc' ? '▲' : sort === 'price_desc' ? '▼' : '↕'}
                                        </button>
                                    </th>
                                    <th>Sizes</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th style="text-align:right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${products.map(p => {
                                    const primaryImg = p.primary_image || '/images/placeholder.jpg';
                                    const secName = p.section_name || (p.section_id === 1 ? 'Carpets' : p.section_id === 2 ? 'Kilims' : '—');
                                    const catName = p.category_name || 'Unassigned';
                                    const priceText = this.formatPrice(p.price);
                                    const saleText = p.sale_price ? `<div style="color:var(--adm-error); font-weight:700; font-size:11px;">Sale: ${this.formatPrice(p.sale_price)}</div>` : '';
                                    const sizeInfo = p.size_count ? `${p.size_count} size${p.size_count > 1 ? 's' : ''}` : (p.dimensions || '—');

                                    let statusBadge = `<span class="badge badge-draft">Draft</span>`;
                                    if (p.status === 'active') statusBadge = `<span class="badge badge-active">Active</span>`;
                                    if (p.status === 'disabled') statusBadge = `<span class="badge badge-disabled">Disabled</span>`;

                                    const isInStock = p.is_in_stock !== 0;

                                    return `
                                        <tr id="product-row-${p.id}">
                                            <td>
                                                <a href="#/products/edit/${p.id}">
                                                    <img src="${primaryImg}" alt="${this.escapeHtml(p.name)}" style="width:52px; height:52px; object-fit:cover; border-radius:4px; border:1px solid var(--adm-border);">
                                                </a>
                                            </td>
                                            <td>
                                                <a href="#/products/edit/${p.id}" style="font-weight:600; color:var(--adm-maroon); text-decoration:none;">
                                                    ${this.escapeHtml(p.name)}
                                                </a>
                                                ${p.sku ? `<div style="font-size:11px; color:var(--adm-text-muted); font-family:monospace;">SKU: ${this.escapeHtml(p.sku)}</div>` : ''}
                                            </td>
                                            <td>
                                                <span style="font-weight:600; font-size:12px; color:var(--adm-text);">${this.escapeHtml(secName)}</span>
                                            </td>
                                            <td>
                                                <span class="category-meta-badge" style="background:#FAF7F2;">${this.escapeHtml(catName)}</span>
                                            </td>
                                            <td>
                                                <div style="font-weight:600;">${priceText}</div>
                                                ${saleText}
                                            </td>
                                            <td style="font-size:12.5px; color:var(--adm-text-secondary);">
                                                <span style="font-weight:600; color:var(--adm-maroon);">${this.escapeHtml(sizeInfo)}</span>
                                            </td>
                                            <td>
                                                <button onclick="AdminApp.quickToggleProductStock(${p.id}, ${isInStock ? 1 : 0})" style="background:none; border:none; cursor:pointer; padding:0;" title="Click to toggle Stock Status">
                                                    ${isInStock 
                                                        ? `<span class="badge" style="background:#E6F4EA; color:#137333; font-weight:700; padding:4px 8px; border-radius:12px; font-size:11px; display:inline-flex; align-items:center; gap:4px;"><span style="font-size:8px;">●</span> In Stock</span>` 
                                                        : `<span class="badge" style="background:#FCE8E6; color:#C5221F; font-weight:700; padding:4px 8px; border-radius:12px; font-size:11px; display:inline-flex; align-items:center; gap:4px;"><span style="font-size:8px;">○</span> Out of Stock</span>`}
                                                </button>
                                            </td>
                                            <td>
                                                <button onclick="AdminApp.quickToggleProductStatus(${p.id}, '${p.status}')" style="background:none; border:none; cursor:pointer; padding:0;" title="Click to toggle Visibility">
                                                    ${statusBadge}
                                                </button>
                                            </td>
                                            <td style="text-align:right;">
                                                <div class="btn-group" style="justify-content:flex-end;">
                                                    <a href="#/products/edit/${p.id}" class="btn btn-outline btn-sm">Edit</a>
                                                    <a href="/#/product/${p.slug}" target="_blank" class="btn btn-outline btn-sm" title="View on live website">Live ↗</a>
                                                    <button class="btn btn-danger btn-sm" onclick="AdminApp.handleDeleteProduct(${p.id}, '${this.escapeHtml(p.name).replace(/'/g, "\\'")}')">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>

                    ${pagination.totalPages > 1 ? `
                        <div class="admin-pagination">
                            <button ${pagination.page <= 1 ? 'disabled' : ''} onclick="AdminApp.goToProductPage(${pagination.page - 1})">‹ Prev</button>
                            <span style="margin: 0 12px; font-size:13px; font-weight:600;">Page ${pagination.page} of ${pagination.totalPages}</span>
                            <button ${pagination.page >= pagination.totalPages ? 'disabled' : ''} onclick="AdminApp.goToProductPage(${pagination.page + 1})">Next ›</button>
                        </div>
                    ` : ''}
                `}
            </div>
        `;
    },

    // ========================================================
    // 3. PRODUCT FORM (ADD / EDIT)
    // ========================================================
    productForm(product = null, sections = [], categories = []) {
        const isEdit = Boolean(product && product.id);
        const title = isEdit ? `Edit Product: ${this.escapeHtml(product.name)}` : 'Add New Product';
        const p = product || {
            name: '',
            price: '',
            sale_price: '',
            sku: '',
            dimensions: '1.5 × 5 m',
            material: '100% Handspun Egyptian Wool',
            color: '',
            weight: '',
            inventory_qty: 1,
            is_in_stock: 1,
            status: 'active',
            short_description: 'A modern take on traditional kilim craftsmanship, featuring three rows of geometric motifs in warm red, mustard, and deep blue, set against a soft ivory base.',
            full_description: 'A modern take on traditional kilim craftsmanship, featuring three rows of geometric motifs in warm red, mustard, and deep blue, set against a soft ivory base.',
            handwoven_details: 'Handwoven with care, each stitch and subtle color variation adds to the unique character of the piece. Finished with hand-tied tassels at both ends.',
            where_to_place: 'Perfect for the living room, beside the bed, or styled as a hallway runner, adding warmth and texture without overpowering the space.',
            care_instructions: 'Vacuum regularly on low suction without a beater bar. Spot clean immediately with a damp cloth and mild wool detergent. Professional rug cleaning recommended for deep cleans. Rotate every 6 months for even wear.',
            shipping_info: 'Standard doorstep delivery within 3-5 business days across Egypt. Carefully rolled and packaged in protective water-resistant wrapping. 14-day hassle-free inspection and exchange guarantee.',
            specifications: 'Material: 100% Handspun Egyptian Wool\nWeave: Traditional Flatweave Kilim\nOrigin: Fowwa, Egypt\nKnot Density: High precision flatweave',
            section_id: 1,
            category_id: '',
            images: [],
            videos: [],
            sizes: [
                { size_name: '1.5 × 5 m', price: '', is_in_stock: 1, display_order: 0 }
            ]
        };

        const currentSectionId = p.section_id || 1;
        const currentCategoryId = p.category_id || '';
        const sizesList = (p.sizes && p.sizes.length > 0) ? p.sizes : (!isEdit ? [{ size_name: '1.5 × 5 m', price: '', is_in_stock: 1, display_order: 0 }] : []);

        return `
            <div style="margin-bottom:20px;">
                <a href="#/products" style="display:inline-flex; align-items:center; gap:6px; color:var(--adm-text-secondary); text-decoration:none; font-weight:600; font-size:13px;">
                    ← Back to Products List
                </a>
            </div>

            <div class="admin-page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
                <div>
                    <h1 class="admin-page-title" style="font-size:22px; font-weight:700; color:var(--adm-maroon); font-family:var(--adm-font-brand); letter-spacing:1px; margin-bottom:4px;">${title}</h1>
                    <p class="admin-page-subtitle" style="color:var(--adm-text-secondary); font-size:13px;">
                        ${isEdit ? 'Update standardized product fields, images, video, sizes, and accordion details.' : 'Enter product information below. Every field is standardized and independently editable.'}
                    </p>
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn-outline" onclick="window.location.hash='#/products'">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="AdminApp.submitProductForm()" id="save-product-top-btn" style="padding:10px 24px; font-size:13px; font-weight:700;">Save Changes</button>
                </div>
            </div>

            <form id="product-editor-form" class="admin-form" style="max-width:100%;" onsubmit="event.preventDefault(); AdminApp.submitProductForm();">
                <input type="hidden" id="prod-id" value="${p.id || ''}">

                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
                    <!-- LEFT COLUMN: Main Details -->
                    <div>
                        <!-- Card 1: Basic Info -->
                        <div class="admin-card" style="padding:24px; margin-bottom:24px;">
                            <h3 style="font-size:16px; font-weight:700; color:var(--adm-maroon); margin-bottom:18px; border-bottom:1px solid var(--adm-border); padding-bottom:10px;">
                                1. Basic Information
                            </h3>

                            <div class="form-group">
                                <label for="prod-name">Product Name / Title <span style="color:var(--adm-error);">*</span></label>
                                <input type="text" id="prod-name" value="${this.escapeHtml(p.name)}" required placeholder="e.g. Desert Diamonds Kilim" style="font-size:15px; font-weight:600;">
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="prod-price">Base Price (LE) <span style="color:var(--adm-error);">*</span></label>
                                    <input type="number" step="any" id="prod-price" value="${p.price !== undefined ? p.price : ''}" required placeholder="e.g. 8500">
                                </div>
                                <div class="form-group">
                                    <label for="prod-sale-price">Sale Price (LE, Optional)</label>
                                    <input type="number" step="any" id="prod-sale-price" value="${p.sale_price || ''}" placeholder="Leave blank if not on sale">
                                </div>
                                <div class="form-group">
                                    <label for="prod-in-stock-select">Product Stock Status <span style="color:var(--adm-error);">*</span></label>
                                    <select id="prod-in-stock-select" style="font-weight:600;">
                                        <option value="1" ${p.is_in_stock !== 0 ? 'selected' : ''}>● In Stock</option>
                                        <option value="0" ${p.is_in_stock === 0 ? 'selected' : ''}>○ Out of Stock</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="prod-short-desc">Short Summary / Description</label>
                                <textarea id="prod-short-desc" rows="3" placeholder="A modern take on traditional kilim craftsmanship, featuring geometric motifs in warm tones...">${this.escapeHtml(p.short_description || '')}</textarea>
                                <span style="font-size:11.5px; color:var(--adm-text-muted);">Lead summary displayed on catalog cards and top of product page.</span>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="prod-button-text">Product Button Text</label>
                                    <input type="text" id="prod-button-text" value="${this.escapeHtml(p.button_text || 'VIEW DETAILS')}" placeholder="e.g. VIEW DETAILS or BUY NOW">
                                    <span style="font-size:11.5px; color:var(--adm-text-muted);">Text shown on the product card button across the storefront.</span>
                                </div>
                                <div class="form-group">
                                    <label for="prod-custom-link">Product Link / Custom URL (Optional)</label>
                                    <input type="text" id="prod-custom-link" value="${this.escapeHtml(p.custom_link || '')}" placeholder="Leave blank for default product page">
                                    <span style="font-size:11.5px; color:var(--adm-text-muted);">Optional custom redirect link (e.g. /shop, or leave blank).</span>
                                </div>
                            </div>
                        </div>

                        <!-- Card 2: Handwoven Details & Where to Place It -->
                        <div class="admin-card" style="padding:24px; margin-bottom:24px;">
                            <div style="margin-bottom:18px; border-bottom:1px solid var(--adm-border); padding-bottom:10px;">
                                <h3 style="font-size:16px; font-weight:700; color:var(--adm-maroon); margin:0 0 4px 0;">
                                    2. Editorial Highlights
                                </h3>
                                <span style="font-size:12px; color:var(--adm-text-secondary);">Standardized editorial feature cards rendered on the product detail page</span>
                            </div>

                            <div class="form-group">
                                <label for="prod-handwoven-details">Handwoven Details</label>
                                <textarea id="prod-handwoven-details" rows="3" placeholder="Handwoven with care, each stitch and subtle color variation adds to the unique character of the piece. Finished with hand-tied tassels at both ends.">${this.escapeHtml(p.handwoven_details || '')}</textarea>
                                <span style="font-size:11.5px; color:var(--adm-text-muted);">Specific notes on weave, knotting, tassels, texture, or artisan touch.</span>
                            </div>

                            <div class="form-group" style="margin-top:16px;">
                                <label for="prod-where-to-place">Where to Place It</label>
                                <textarea id="prod-where-to-place" rows="3" placeholder="Perfect for the living room, beside the bed, or styled as a hallway runner, adding warmth and texture without overpowering the space.">${this.escapeHtml(p.where_to_place || '')}</textarea>
                                <span style="font-size:11.5px; color:var(--adm-text-muted);">Styling and interior placement recommendations for customers.</span>
                            </div>
                        </div>

                        <!-- Card 3: Repeatable Size Variants -->
                        <div class="admin-card" style="padding:24px; margin-bottom:24px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid var(--adm-border); padding-bottom:10px;">
                                <div>
                                    <h3 style="font-size:16px; font-weight:700; color:var(--adm-maroon); margin:0 0 4px 0;">
                                        3. Sizes &amp; Variants
                                    </h3>
                                    <span style="font-size:12px; color:var(--adm-text-secondary);">Add multiple sizes with custom prices and independent stock status per size</span>
                                </div>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="AdminApp.addSizeVariantRow()">+ Add Size</button>
                            </div>

                            <div id="size-variants-list" style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
                                ${sizesList.length ? sizesList.map((s, idx) => `
                                    <div class="size-variant-row" style="display:grid; grid-template-columns: 2fr 1.2fr 1.2fr auto; gap:12px; align-items:center; background:#FAF7F2; padding:12px 14px; border:1px solid var(--adm-border); border-radius:4px;">
                                        <div>
                                            <label style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--adm-maroon); display:block; margin-bottom:4px;">Size Label (e.g. 1.5 × 5 m)</label>
                                            <input type="text" class="size-var-name" value="${this.escapeHtml(s.size_name || '')}" placeholder="e.g. 1.5 × 5 m" style="padding:8px 10px; font-size:13px; font-weight:600; width:100%;" required>
                                        </div>
                                        <div>
                                            <label style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--adm-text-muted); display:block; margin-bottom:4px;">Price (LE, Optional)</label>
                                            <input type="number" step="any" class="size-var-price" value="${s.price !== null && s.price !== undefined ? s.price : ''}" placeholder="Base price" style="padding:8px 10px; font-size:13px; width:100%;">
                                        </div>
                                        <div>
                                            <label style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--adm-text-muted); display:block; margin-bottom:4px;">Stock Status</label>
                                            <select class="size-var-stock" style="padding:8px 10px; font-size:13px; width:100%; font-weight:600;">
                                                <option value="1" ${s.is_in_stock !== 0 ? 'selected' : ''}>● In Stock</option>
                                                <option value="0" ${s.is_in_stock === 0 ? 'selected' : ''}>○ Out of Stock</option>
                                            </select>
                                        </div>
                                        <div style="display:flex; gap:4px; margin-top:18px;">
                                            <button type="button" class="btn btn-outline btn-sm" onclick="AdminApp.moveSizeVariantRow(this, -1)" title="Move Up" style="padding:6px 8px;">▲</button>
                                            <button type="button" class="btn btn-outline btn-sm" onclick="AdminApp.moveSizeVariantRow(this, 1)" title="Move Down" style="padding:6px 8px;">▼</button>
                                            <button type="button" class="btn btn-danger btn-sm" onclick="AdminApp.removeSizeVariantRow(this)" title="Remove Size" style="padding:6px 9px;">✕</button>
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div id="no-sizes-placeholder" style="padding:16px; text-align:center; color:var(--adm-text-muted); background:var(--adm-bg); border-radius:4px; font-size:13px;">
                                        No custom size variants added yet. Click "+ Add Size" to add repeatable sizes.
                                    </div>
                                `}
                            </div>
                        </div>

                        <!-- Card 4: Four Fixed Accordion Sections -->
                        <div class="admin-card" style="padding:24px; margin-bottom:24px;">
                            <div style="margin-bottom:18px; border-bottom:1px solid var(--adm-border); padding-bottom:10px;">
                                <h3 style="font-size:16px; font-weight:700; color:var(--adm-maroon); margin:0 0 4px 0;">
                                    4. Product Information Accordions
                                </h3>
                                <span style="font-size:12px; color:var(--adm-text-secondary);">The 4 section titles below are permanent on the storefront. Edit the specific content inside each section:</span>
                            </div>

                            <!-- Accordion 1: Description -->
                            <div class="form-group" style="margin-bottom:18px; background:#FAF7F2; padding:14px; border:1px solid var(--adm-border); border-radius:4px;">
                                <div style="font-weight:700; font-size:12.5px; color:var(--adm-maroon); letter-spacing:1px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                                    <span>▾ 1. DESCRIPTION</span>
                                    <span style="font-size:10.5px; font-weight:400; color:var(--adm-text-muted);">(Fixed section title)</span>
                                </div>
                                <textarea id="prod-full-desc" rows="4" placeholder="Detailed story, craftsmanship, cultural inspiration, weaving heritage...">${this.escapeHtml(p.full_description || '')}</textarea>
                            </div>

                            <!-- Accordion 2: Specifications -->
                            <div class="form-group" style="margin-bottom:18px; background:#FAF7F2; padding:14px; border:1px solid var(--adm-border); border-radius:4px;">
                                <div style="font-weight:700; font-size:12.5px; color:var(--adm-maroon); letter-spacing:1px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                                    <span>▾ 2. SPECIFICATIONS</span>
                                    <span style="font-size:10.5px; font-weight:400; color:var(--adm-text-muted);">(Fixed section title)</span>
                                </div>
                                <textarea id="prod-specifications" rows="4" placeholder="Material: 100% Handspun Egyptian Wool&#10;Weave: Traditional Flatweave Kilim&#10;Origin: Fowwa, Egypt&#10;Knot Density: High precision flatweave">${this.escapeHtml(p.specifications || '')}</textarea>
                            </div>

                            <!-- Accordion 3: Care Instructions -->
                            <div class="form-group" style="margin-bottom:18px; background:#FAF7F2; padding:14px; border:1px solid var(--adm-border); border-radius:4px;">
                                <div style="font-weight:700; font-size:12.5px; color:var(--adm-maroon); letter-spacing:1px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                                    <span>▾ 3. CARE INSTRUCTIONS</span>
                                    <span style="font-size:10.5px; font-weight:400; color:var(--adm-text-muted);">(Fixed section title)</span>
                                </div>
                                <textarea id="prod-care-instructions" rows="4" placeholder="Vacuum regularly on low suction without a beater bar. Spot clean immediately with a damp cloth and mild wool detergent. Professional rug cleaning recommended for deep cleans. Rotate every 6 months for even wear.">${this.escapeHtml(p.care_instructions || '')}</textarea>
                            </div>

                            <!-- Accordion 4: Shipping -->
                            <div class="form-group" style="background:#FAF7F2; padding:14px; border:1px solid var(--adm-border); border-radius:4px;">
                                <div style="font-weight:700; font-size:12.5px; color:var(--adm-maroon); letter-spacing:1px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                                    <span>▾ 4. SHIPPING</span>
                                    <span style="font-size:10.5px; font-weight:400; color:var(--adm-text-muted);">(Fixed section title)</span>
                                </div>
                                <textarea id="prod-shipping-info" rows="4" placeholder="Standard doorstep delivery within 3-5 business days across Egypt. Carefully rolled and packaged in protective water-resistant wrapping. 14-day hassle-free inspection and exchange guarantee.">${this.escapeHtml(p.shipping_info || '')}</textarea>
                            </div>
                        </div>

                        <!-- Card 5: Images Manager -->
                        <div class="admin-card" style="padding:24px; margin-bottom:24px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid var(--adm-border); padding-bottom:10px;">
                                <h3 style="font-size:16px; font-weight:700; color:var(--adm-maroon); margin:0;">
                                    5. Product Images (Live Gallery)
                                </h3>
                                <span style="font-size:12px; color:var(--adm-text-secondary);">The primary image is shown on catalog cards and homepage</span>
                            </div>

                            <!-- Image Upload Zone -->
                            <div class="image-upload-zone" onclick="document.getElementById('prod-images-file-input').click()" style="margin-bottom:20px; padding:24px;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--adm-maroon); margin-bottom:8px;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                <div style="font-weight:600; color:var(--adm-maroon); font-size:14px;">Click to Upload Product Images</div>
                                <div style="font-size:12px; color:var(--adm-text-muted); margin-top:4px;">Supports multiple files (JPG, PNG, WebP). Max 10MB each.</div>
                                <input type="file" id="prod-images-file-input" multiple accept="image/*" onchange="AdminApp.handleProductImageUpload(event)" style="display:none;">
                            </div>

                            <!-- Uploaded Images Grid -->
                            <div id="product-images-gallery" class="image-grid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:16px;">
                                ${p.images && p.images.length ? p.images.map((img, idx) => `
                                    <div class="product-image-card ${img.is_primary ? 'is-primary' : ''}" id="img-card-${img.id}">
                                        <img src="${img.image_path}" alt="Product Image">
                                        ${img.is_primary ? `<div class="primary-indicator-badge">★ PRIMARY</div>` : ''}
                                        <div class="image-controls-bar">
                                            ${!img.is_primary ? `
                                                <button type="button" class="img-ctrl-btn" onclick="AdminApp.setProductPrimaryImage(${p.id}, ${img.id})" title="Set as Main Storefront Image">
                                                    ★ Primary
                                                </button>
                                            ` : ''}
                                            ${idx > 0 ? `
                                                <button type="button" class="img-ctrl-btn" onclick="AdminApp.moveProductImage(${p.id}, ${idx}, ${idx - 1})" title="Move Left">
                                                    ◀
                                                </button>
                                            ` : ''}
                                            ${idx < p.images.length - 1 ? `
                                                <button type="button" class="img-ctrl-btn" onclick="AdminApp.moveProductImage(${p.id}, ${idx}, ${idx + 1})" title="Move Right">
                                                    ▶
                                                </button>
                                            ` : ''}
                                            <button type="button" class="img-ctrl-btn btn-del" onclick="AdminApp.deleteProductImage(${p.id}, ${img.id})" title="Delete Image">
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div style="grid-column:1/-1; padding:20px; text-align:center; color:var(--adm-text-muted); background:var(--adm-bg); border-radius:4px;">
                                        No images uploaded yet. Click the upload area above to add images.
                                    </div>
                                `}
                            </div>
                        </div>

                        <!-- Card 6: Product Video -->
                        <div class="admin-card" style="padding:24px; margin-bottom:24px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid var(--adm-border); padding-bottom:10px;">
                                <h3 style="font-size:16px; font-weight:700; color:var(--adm-maroon); margin:0;">
                                    6. Product Video (Optional)
                                </h3>
                                ${p.videos && p.videos.length ? `<button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('prod-video-url').value=''; adminToast('Video field cleared. Click Save Changes to apply.', 'info');">Clear Video</button>` : ''}
                            </div>
                            <div class="form-group">
                                <label for="prod-video-url">Video URL or MP4 Path</label>
                                <input type="text" id="prod-video-url" value="${p.videos && p.videos.length ? this.escapeHtml(p.videos[0].video_url || p.videos[0].video_path) : ''}" placeholder="e.g. /uploads/products/video.mp4 or direct video URL">
                                <span style="font-size:11.5px; color:var(--adm-text-muted);">When provided, a video showcase player appears on the product detail page. If left empty, no video container will be shown.</span>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN: Categorization & Specs -->
                    <div>
                        <!-- Categorization Card (Fixed 2 Sections) -->
                        <div class="admin-card" style="padding:24px; margin-bottom:24px;">
                            <h3 style="font-size:16px; font-weight:700; color:var(--adm-maroon); margin-bottom:18px; border-bottom:1px solid var(--adm-border); padding-bottom:10px;">
                                Categorization
                            </h3>

                            <!-- Section Dropdown (Fixed 2 Sections) -->
                            <div class="form-group">
                                <label for="prod-section-select">Top-Level Section <span style="color:var(--adm-error);">*</span></label>
                                <select id="prod-section-select" required onchange="AdminApp.onProductSectionChange(this.value)" style="font-weight:700;">
                                    <option value="1" ${Number(currentSectionId) === 1 ? 'selected' : ''}>CARPETS</option>
                                    <option value="2" ${Number(currentSectionId) === 2 ? 'selected' : ''}>KILIMS</option>
                                </select>
                                <span style="font-size:11px; color:var(--adm-text-muted);">The two top-level sections are fixed.</span>
                            </div>

                            <!-- Category Dropdown (Dynamically Filtered) -->
                            <div class="form-group" style="margin-top:16px;">
                                <label for="prod-category-select">Category / Type <span style="color:var(--adm-error);">*</span></label>
                                <select id="prod-category-select" required>
                                    ${categories.filter(c => c.section_id === Number(currentSectionId) || (Number(currentSectionId) === 1 && (c.section_slug === 'carpets' || !c.section_id)) || (Number(currentSectionId) === 2 && (c.section_slug === 'kilims' || !c.section_id))).map(c => `
                                        <option value="${c.id}" ${Number(currentCategoryId) === Number(c.id) ? 'selected' : ''}>
                                            ${this.escapeHtml(c.name)}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>

                            <!-- Visibility / Status -->
                            <div class="form-group" style="margin-top:16px;">
                                <label for="prod-status-select">Visibility Status <span style="color:var(--adm-error);">*</span></label>
                                <select id="prod-status-select" required>
                                    <option value="active" ${p.status === 'active' ? 'selected' : ''}>Active (Visible on Website)</option>
                                    <option value="draft" ${p.status === 'draft' ? 'selected' : ''}>Draft (Hidden from Storefront)</option>
                                    <option value="disabled" ${p.status === 'disabled' ? 'selected' : ''}>Disabled (Archived)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Specifications Card -->
                        <div class="admin-card" style="padding:24px; margin-bottom:24px;">
                            <h3 style="font-size:16px; font-weight:700; color:var(--adm-maroon); margin-bottom:18px; border-bottom:1px solid var(--adm-border); padding-bottom:10px;">
                                Attributes
                            </h3>

                            <div class="form-group">
                                <label for="prod-material">Material / Weave</label>
                                <input type="text" id="prod-material" value="${this.escapeHtml(p.material || '')}" placeholder="e.g. 100% Handspun Wool">
                            </div>

                            <div class="form-group">
                                <label for="prod-color">Primary Colors</label>
                                <input type="text" id="prod-color" value="${this.escapeHtml(p.color || '')}" placeholder="e.g. Warm Red, Mustard, Ivory">
                            </div>

                            <div class="form-group">
                                <label for="prod-sku">SKU / Item Code</label>
                                <input type="text" id="prod-sku" value="${this.escapeHtml(p.sku || '')}" placeholder="e.g. FWK-012">
                            </div>

                            <div class="form-group">
                                <label for="prod-weight">Weight (Optional)</label>
                                <input type="text" id="prod-weight" value="${this.escapeHtml(p.weight || '')}" placeholder="e.g. 4.5 kg">
                            </div>

                            <div class="form-group">
                                <label for="prod-inventory">Stock Units Count</label>
                                <input type="number" id="prod-inventory" value="${p.inventory_qty !== undefined ? p.inventory_qty : 1}" min="0">
                            </div>
                        </div>

                        <!-- Save Actions -->
                        <div class="admin-card" style="padding:20px;">
                            <button type="button" class="btn btn-primary btn-block" onclick="AdminApp.submitProductForm()" id="save-product-bottom-btn" style="width:100%; justify-content:center; padding:14px; font-size:14px; font-weight:700;">
                                Save Changes
                            </button>
                            ${isEdit ? `
                                <button type="button" class="btn btn-danger btn-block" onclick="AdminApp.handleDeleteProduct(${p.id}, '${this.escapeHtml(p.name).replace(/'/g, "\\'")}', true)" style="width:100%; justify-content:center; margin-top:12px; padding:10px;">
                                    Delete This Product
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </form>
        `;
    },

    // ========================================================
    // 4. ORDERS LIST
    // ========================================================
    orders(orders = [], pagination = {}, filters = {}) {
        const { search = '', status = '', sort = 'newest' } = filters;
        const total = pagination.total ?? orders.length;

        const getStatusBadge = (st) => {
            const s = (st || 'pending').toLowerCase();
            switch (s) {
                case 'processing': return `<span class="status-badge-pill status-processing">Processing</span>`;
                case 'shipped': return `<span class="status-badge-pill status-shipped">Shipped</span>`;
                case 'delivered': return `<span class="status-badge-pill status-delivered">Delivered</span>`;
                case 'cancelled': return `<span class="status-badge-pill status-cancelled">Cancelled</span>`;
                default: return `<span class="status-badge-pill status-pending">Pending</span>`;
            }
        };

        return `
            <div class="admin-page-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
                <div>
                    <h1 class="admin-page-title" style="font-size:22px; font-weight:700; color:var(--adm-maroon); font-family:var(--adm-font-brand); letter-spacing:1px; margin-bottom:6px;">Customer Orders</h1>
                    <p class="admin-page-subtitle" style="color:var(--adm-text-secondary); font-size:13px;">
                        Manage customer purchases, update fulfillment statuses (Processing → Shipped → Delivered), and view customer details.
                    </p>
                </div>
            </div>

            <!-- Toolbar & Filter Tabs -->
            <div class="admin-card" style="padding:16px; margin-bottom:20px;">
                <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                    <!-- Search Input -->
                    <div style="flex:1; min-width:220px;">
                        <input type="text" id="order-search-input" value="${this.escapeHtml(search)}" placeholder="Search by Order ID, Customer Name, or Phone..." style="width:100%; padding:9px 14px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;" onkeyup="if(event.key==='Enter') AdminApp.applyOrderFilters()">
                    </div>

                    <!-- Status Filter Tabs -->
                    <div style="min-width:170px;">
                        <select id="order-status-filter" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;" onchange="AdminApp.applyOrderFilters()">
                            <option value="">All Orders Statuses</option>
                            <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>

                    <!-- Sort Filter -->
                    <div style="min-width:170px;">
                        <select id="order-sort-filter" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px; font-weight:600; color:var(--adm-maroon);" onchange="AdminApp.applyOrderFilters()">
                            <option value="newest" ${sort === 'newest' ? 'selected' : ''}>Date: Newest First</option>
                            <option value="oldest" ${sort === 'oldest' ? 'selected' : ''}>Date: Oldest First</option>
                            <option value="total_desc" ${sort === 'total_desc' ? 'selected' : ''}>Total: High → Low</option>
                            <option value="total_asc" ${sort === 'total_asc' ? 'selected' : ''}>Total: Low → High</option>
                            <option value="customer_asc" ${sort === 'customer_asc' ? 'selected' : ''}>Customer: A → Z</option>
                            <option value="customer_desc" ${sort === 'customer_desc' ? 'selected' : ''}>Customer: Z → A</option>
                            <option value="status_asc" ${sort === 'status_asc' ? 'selected' : ''}>Status (A-Z)</option>
                        </select>
                    </div>

                    <button class="btn btn-secondary" onclick="AdminApp.applyOrderFilters()" style="padding:9px 16px;">Search</button>
                    ${(search || status || (sort && sort !== 'newest')) ? `<button class="btn btn-outline" onclick="AdminApp.resetOrderFilters()" style="padding:9px 14px;">Reset</button>` : ''}
                </div>
            </div>

            <!-- Orders Table Card -->
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">All Customer Orders (${total} total)</div>
                </div>

                ${orders.length === 0 ? `
                    <div style="padding:48px; text-align:center;">
                        <p style="color:var(--adm-text-muted); font-size:15px; margin-bottom:12px;">No orders found matching your search.</p>
                        ${(search || status || sort !== 'newest') ? `<button class="btn btn-outline" onclick="AdminApp.resetOrderFilters()">Clear Filters</button>` : ''}
                    </div>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>
                                        <button onclick="AdminApp.toggleOrderSort('customer')" style="background:none;border:none;font-weight:700;font-size:12px;color:var(--adm-maroon);cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:0;">
                                            Customer Name ${sort === 'customer_asc' ? '▲' : sort === 'customer_desc' ? '▼' : '↕'}
                                        </button>
                                    </th>
                                    <th>Phone</th>
                                    <th>
                                        <button onclick="AdminApp.toggleOrderSort('date')" style="background:none;border:none;font-weight:700;font-size:12px;color:var(--adm-maroon);cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:0;">
                                            Date ${sort === 'oldest' ? '▲' : (sort === 'newest' || !sort) ? '▼' : '↕'}
                                        </button>
                                    </th>
                                    <th>Items</th>
                                    <th>
                                        <button onclick="AdminApp.toggleOrderSort('total')" style="background:none;border:none;font-weight:700;font-size:12px;color:var(--adm-maroon);cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:0;">
                                            Total Amount ${sort === 'total_asc' ? '▲' : sort === 'total_desc' ? '▼' : '↕'}
                                        </button>
                                    </th>
                                    <th>Status</th>
                                    <th style="text-align:right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orders.map(o => `
                                    <tr id="order-row-${o.id}">
                                        <td>
                                            <a href="#/orders/${o.id}" style="font-weight:700; color:var(--adm-maroon); text-decoration:none; font-family:monospace; font-size:13px;">
                                                ${this.escapeHtml(o.order_number)}
                                            </a>
                                        </td>
                                        <td>
                                            <strong>${this.escapeHtml(o.customer_name)}</strong>
                                            ${o.customer_email ? `<div style="font-size:11.5px; color:var(--adm-text-muted);">${this.escapeHtml(o.customer_email)}</div>` : ''}
                                        </td>
                                        <td style="font-size:13px; font-weight:500;">
                                            ${o.customer_phone ? `<a href="tel:${this.escapeHtml(o.customer_phone)}" style="color:inherit; text-decoration:none;">${this.escapeHtml(o.customer_phone)}</a>` : '—'}
                                        </td>
                                        <td style="font-size:12.5px; color:var(--adm-text-secondary);">
                                            <div style="font-weight:600; color:#2A2325;">${this.formatDate(o.created_at)}</div>
                                            ${o.updated_at && o.updated_at !== o.created_at ? `<div style="font-size:11px; color:var(--adm-text-muted);" title="Last Updated">Updated: ${this.formatDate(o.updated_at)}</div>` : ''}
                                        </td>
                                        <td>
                                            <span class="category-meta-badge">${o.item_count || 1} items</span>
                                        </td>
                                        <td>
                                            <strong style="color:var(--adm-maroon); font-size:14px;">${this.formatPrice(o.total)}</strong>
                                        </td>
                                        <td>
                                            ${getStatusBadge(o.status)}
                                        </td>
                                        <td style="text-align:right;">
                                            <div class="btn-group" style="justify-content:flex-end;">
                                                <a href="#/orders/${o.id}" class="btn btn-primary btn-sm">
                                                    View Details →
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    ${pagination.totalPages > 1 ? `
                        <div class="admin-pagination">
                            <button ${pagination.page <= 1 ? 'disabled' : ''} onclick="AdminApp.goToOrderPage(${pagination.page - 1})">‹ Prev</button>
                            <span style="margin: 0 12px; font-size:13px; font-weight:600;">Page ${pagination.page} of ${pagination.totalPages}</span>
                            <button ${pagination.page >= pagination.totalPages ? 'disabled' : ''} onclick="AdminApp.goToOrderPage(${pagination.page + 1})">Next ›</button>
                        </div>
                    ` : ''}
                `}
            </div>
        `;
    },

    // ========================================================
    // 5. ORDER DETAILS
    // ========================================================
    orderDetail(order) {
        if (!order) return `<div style="padding:32px; text-align:center;">Order not found. <a href="#/orders">Back to Orders</a></div>`;

        const items = order.items || [];
        const currentStatus = (order.status || 'pending').toLowerCase();

        return `
            <div style="margin-bottom:20px;">
                <a href="#/orders" style="display:inline-flex; align-items:center; gap:6px; color:var(--adm-text-secondary); text-decoration:none; font-weight:600; font-size:13px;">
                    ← Back to Orders List
                </a>
            </div>

            <!-- Header with Order Number & Live Status Changer -->
            <div class="status-changer-card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                <div>
                    <div style="font-size:12px; font-weight:700; color:var(--adm-text-muted); text-transform:uppercase; letter-spacing:1px;">Order Information</div>
                    <h1 style="font-size:24px; font-weight:700; color:var(--adm-maroon); font-family:monospace; margin:4px 0;">
                        ${this.escapeHtml(order.order_number)}
                    </h1>
                    <div style="display:flex; flex-wrap:wrap; gap:16px; margin-top:6px; font-size:12.5px; color:var(--adm-text-secondary);">
                        <div>Order Date: <strong style="color:#2A2325;">${this.formatDate(order.created_at)}</strong></div>
                        ${order.updated_at && order.updated_at !== order.created_at ? `<div>Last Updated: <strong style="color:#2A2325;">${this.formatDate(order.updated_at)}</strong></div>` : ''}
                    </div>
                </div>

                <!-- Fast Status Updater -->
                <div style="display:flex; align-items:center; gap:12px;">
                    <label for="order-detail-status-select" style="font-weight:700; font-size:13px; color:var(--adm-maroon); margin:0;">
                        Order Status:
                    </label>
                    <select id="order-detail-status-select" style="padding:10px 16px; border:2px solid var(--adm-gold); border-radius:4px; font-size:14px; font-weight:700; background:white; color:var(--adm-maroon); cursor:pointer;">
                        <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>⏳ PENDING</option>
                        <option value="processing" ${currentStatus === 'processing' ? 'selected' : ''}>PROCESSING</option>
                        <option value="shipped" ${currentStatus === 'shipped' ? 'selected' : ''}>SHIPPED</option>
                        <option value="delivered" ${currentStatus === 'delivered' ? 'selected' : ''}>DELIVERED</option>
                        <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>CANCELLED</option>
                    </select>
                    <button class="btn btn-primary" onclick="AdminApp.updateOrderStatusFromPage(${order.id})" style="padding:10px 20px; font-size:13px; font-weight:700;">
                        Update Status
                    </button>
                </div>
            </div>

            <!-- Two-Column Order Content -->
            <div class="order-details-grid">
                <!-- LEFT COLUMN: Ordered Items & Total -->
                <div>
                    <div class="info-card">
                        <div class="info-card-title">
                            <span>Ordered Products (${items.length} items)</span>
                        </div>

                        <div style="overflow-x:auto;">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th style="width:60px;">Image</th>
                                        <th>Product</th>
                                        <th>Size / Spec</th>
                                        <th>Qty</th>
                                        <th>Unit Price</th>
                                        <th style="text-align:right;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${items.map(item => `
                                        <tr>
                                            <td>
                                                <img src="${item.product_image || '/images/placeholder.jpg'}" alt="${this.escapeHtml(item.product_name)}" style="width:48px; height:48px; object-fit:cover; border-radius:4px; border:1px solid var(--adm-border);">
                                            </td>
                                            <td>
                                                <strong>${this.escapeHtml(item.product_name)}</strong>
                                            </td>
                                            <td style="font-size:12.5px; color:var(--adm-text-secondary);">
                                                ${item.size ? this.escapeHtml(item.size) : 'Standard'}
                                            </td>
                                            <td style="font-weight:600;">
                                                × ${item.quantity}
                                            </td>
                                            <td>
                                                ${this.formatPrice(item.unit_price)}
                                            </td>
                                            <td style="text-align:right; font-weight:700; color:var(--adm-maroon);">
                                                ${this.formatPrice(item.total_price || (item.unit_price * item.quantity))}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <!-- Financial Summary -->
                        <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--adm-border); max-width:320px; margin-left:auto;">
                            <div class="info-row">
                                <span class="info-label">Subtotal:</span>
                                <span class="info-val">${this.formatPrice(order.subtotal || order.total)}</span>
                            </div>
                            ${order.discount_amount ? `
                                <div class="info-row" style="color:var(--adm-error);">
                                    <span class="info-label" style="color:var(--adm-error);">Discount ${order.coupon_code ? `(${this.escapeHtml(order.coupon_code)})` : ''}:</span>
                                    <span class="info-val" style="color:var(--adm-error);">- ${this.formatPrice(order.discount_amount)}</span>
                                </div>
                            ` : ''}
                            <div class="info-row">
                                <span class="info-label">Shipping:</span>
                                <span class="info-val" style="font-weight:700; color:var(--adm-maroon);">
                                    ${order.shipping_amount !== undefined && order.shipping_amount !== null && order.shipping_amount > 0 
                                        ? this.formatPrice(order.shipping_amount) 
                                        : (order.shipping_amount === 0 ? '<span style="color:var(--adm-success);">Free Delivery</span>' : this.formatPrice(100))}
                                </span>
                            </div>
                            <div class="info-row" style="font-size:16px; border-top:2px solid var(--adm-maroon); padding-top:10px; margin-top:6px;">
                                <span class="info-label" style="color:var(--adm-maroon); font-weight:700;">Total Amount:</span>
                                <span class="info-val" style="color:var(--adm-maroon); font-size:18px; font-weight:700;">${this.formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT COLUMN: Customer & Shipping Details -->
                <div>
                    <!-- Customer Information Card -->
                    <div class="info-card">
                        <div class="info-card-title">
                            <span>Customer Information</span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">Full Name:</span>
                            <span class="info-val"><strong>${this.escapeHtml(order.customer_name)}</strong></span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Phone:</span>
                            <span class="info-val">
                                ${order.customer_phone ? `<a href="tel:${this.escapeHtml(order.customer_phone)}" style="color:var(--adm-maroon); font-weight:700;">${this.escapeHtml(order.customer_phone)}</a>` : '—'}
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-val">
                                ${order.customer_email ? `<a href="mailto:${this.escapeHtml(order.customer_email)}" style="color:var(--adm-maroon);">${this.escapeHtml(order.customer_email)}</a>` : '—'}
                            </span>
                        </div>
                    </div>

                    <!-- Shipping Address Card -->
                    <div class="info-card">
                        <div class="info-card-title">
                            <span>Shipping Address</span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">Address Line 1:</span>
                            <span class="info-val">${this.escapeHtml(order.address_line1 || '—')}</span>
                        </div>
                        ${order.address_line2 ? `
                            <div class="info-row">
                                <span class="info-label">Address Line 2:</span>
                                <span class="info-val">${this.escapeHtml(order.address_line2)}</span>
                            </div>
                        ` : ''}
                        <div class="info-row">
                            <span class="info-label">City / Governorate:</span>
                            <span class="info-val"><strong>${this.escapeHtml(order.city || 'Cairo')}</strong></span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Area / State:</span>
                            <span class="info-val">${this.escapeHtml(order.state || '—')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Country:</span>
                            <span class="info-val">${this.escapeHtml(order.country || 'Egypt')}</span>
                        </div>
                        ${order.notes ? `
                            <div style="margin-top:14px; padding:12px; background:var(--adm-bg); border-radius:4px; font-size:12.5px;">
                                <strong>Customer Order Notes:</strong><br>
                                ${this.escapeHtml(order.notes)}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Safety Delete Order Card -->
                    <div class="info-card" style="background:#FFF8F8; border-color:#F5C6CB;">
                        <div style="font-size:13px; font-weight:700; color:var(--adm-error); margin-bottom:8px;">
                            Order Safety &amp; Management
                        </div>
                        <p style="font-size:12px; color:var(--adm-text-secondary); margin-bottom:12px;">
                            Deleting an order removes only the order record. Customer data and product catalog are preserved.
                        </p>
                        <button type="button" class="btn btn-danger btn-sm" onclick="AdminApp.handleDeleteOrder(${order.id}, '${this.escapeHtml(order.order_number)}')">
                            Delete Order Record
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // ========================================================
    // 5. CUSTOMERS LIST
    // ========================================================
    customers(customers = [], pagination = {}, filters = {}) {
        const { search = '', sort = 'total_desc' } = filters;
        const total = pagination.total ?? customers.length;

        return `
            <div class="admin-page-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
                <div>
                    <h1 class="admin-page-title" style="font-size:22px; font-weight:700; color:var(--adm-maroon); font-family:var(--adm-font-brand); letter-spacing:1px; margin-bottom:6px;">Customers</h1>
                    <p class="admin-page-subtitle" style="color:var(--adm-text-secondary); font-size:13px;">
                        Directory of registered clients and repeat buyers across Egypt with their order history and total lifetime value.
                    </p>
                </div>
            </div>

            <!-- Toolbar & Filter -->
            <div class="admin-card" style="padding:16px; margin-bottom:20px;">
                <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                    <!-- Search Input -->
                    <div style="flex:1; min-width:220px;">
                        <input type="text" id="customer-search-input" value="${this.escapeHtml(search)}" placeholder="Search customers by name, email, phone, city..." style="width:100%; padding:9px 14px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;" onkeyup="if(event.key==='Enter') AdminApp.applyCustomerFilters()">
                    </div>

                    <!-- Sort Filter -->
                    <div style="min-width:180px;">
                        <select id="customer-sort-filter" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px; font-weight:600; color:var(--adm-maroon);" onchange="AdminApp.applyCustomerFilters()">
                            <option value="total_desc" ${sort === 'total_desc' ? 'selected' : ''}>Total Spent: High → Low</option>
                            <option value="total_asc" ${sort === 'total_asc' ? 'selected' : ''}>Total Spent: Low → High</option>
                            <option value="orders_desc" ${sort === 'orders_desc' ? 'selected' : ''}>Orders: Most → Least</option>
                            <option value="orders_asc" ${sort === 'orders_asc' ? 'selected' : ''}>Orders: Least → Most</option>
                            <option value="name_asc" ${sort === 'name_asc' ? 'selected' : ''}>Name: A → Z</option>
                            <option value="name_desc" ${sort === 'name_desc' ? 'selected' : ''}>Name: Z → A</option>
                            <option value="newest" ${sort === 'newest' ? 'selected' : ''}>Newest First</option>
                            <option value="oldest" ${sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                        </select>
                    </div>

                    <button class="btn btn-secondary" onclick="AdminApp.applyCustomerFilters()" style="padding:9px 16px;">Search</button>
                    ${(search || (sort && sort !== 'total_desc')) ? `<button class="btn btn-outline" onclick="AdminApp.resetCustomerFilters()" style="padding:9px 14px;">Reset</button>` : ''}
                </div>
            </div>

            <!-- Customers Table Card -->
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">All Registered Customers (${total} total)</div>
                </div>

                ${customers.length === 0 ? `
                    <div style="padding:48px; text-align:center;">
                        <p style="color:var(--adm-text-muted); font-size:15px; margin-bottom:12px;">No customers found matching your search.</p>
                        ${(search || sort !== 'total_desc') ? `<button class="btn btn-outline" onclick="AdminApp.resetCustomerFilters()">Clear Filters</button>` : ''}
                    </div>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>
                                        <button onclick="AdminApp.toggleCustomerSort('name')" style="background:none;border:none;font-weight:700;font-size:12px;color:var(--adm-maroon);cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:0;">
                                            Customer Name ${sort === 'name_asc' ? '▲' : sort === 'name_desc' ? '▼' : '↕'}
                                        </button>
                                    </th>
                                    <th>Contact Info</th>
                                    <th>Location</th>
                                    <th>
                                        <button onclick="AdminApp.toggleCustomerSort('orders')" style="background:none;border:none;font-weight:700;font-size:12px;color:var(--adm-maroon);cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:0;">
                                            Orders ${sort === 'orders_asc' ? '▲' : sort === 'orders_desc' ? '▼' : '↕'}
                                        </button>
                                    </th>
                                    <th>
                                        <button onclick="AdminApp.toggleCustomerSort('total')" style="background:none;border:none;font-weight:700;font-size:12px;color:var(--adm-maroon);cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:0;">
                                            Total Spent ${sort === 'total_asc' ? '▲' : sort === 'total_desc' ? '▼' : '↕'}
                                        </button>
                                    </th>
                                    <th>
                                        <button onclick="AdminApp.toggleCustomerSort('date')" style="background:none;border:none;font-weight:700;font-size:12px;color:var(--adm-maroon);cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:0;">
                                            Joined ${sort === 'oldest' ? '▲' : sort === 'newest' ? '▼' : '↕'}
                                        </button>
                                    </th>
                                    <th style="text-align:right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${customers.map(c => `
                                    <tr id="customer-row-${c.id}">
                                        <td>
                                            <strong style="color:var(--adm-maroon); font-size:14px;">${this.escapeHtml(c.name || 'Anonymous Client')}</strong>
                                        </td>
                                        <td>
                                            ${c.email ? `<div style="font-size:13px;"><a href="mailto:${this.escapeHtml(c.email)}" style="color:inherit;">${this.escapeHtml(c.email)}</a></div>` : ''}
                                            ${c.phone ? `<div style="font-size:12px; color:var(--adm-text-secondary); margin-top:2px;"><a href="tel:${this.escapeHtml(c.phone)}" style="color:inherit;">${this.escapeHtml(c.phone)}</a></div>` : ''}
                                        </td>
                                        <td style="font-size:13px;">
                                            ${this.escapeHtml(c.city || 'Egypt')}
                                            ${c.state ? `<span style="color:var(--adm-text-muted); font-size:11.5px;">, ${this.escapeHtml(c.state)}</span>` : ''}
                                        </td>
                                        <td>
                                            <span class="category-meta-badge">${c.orders_count || 0} order${c.orders_count !== 1 ? 's' : ''}</span>
                                        </td>
                                        <td>
                                            <strong style="color:var(--adm-maroon); font-size:14px;">${this.formatPrice(c.total_spent || 0)}</strong>
                                        </td>
                                        <td style="font-size:12px; color:var(--adm-text-muted);">
                                            ${this.formatDate(c.created_at)}
                                        </td>
                                        <td style="text-align:right;">
                                            <div class="btn-group" style="justify-content:flex-end;">
                                                <a href="#/orders?search=${encodeURIComponent(c.email || c.name || '')}" class="btn btn-outline btn-sm">
                                                    View Orders →
                                                </a>
                                                <button type="button" class="btn btn-danger btn-sm" onclick="AdminApp.handleDeleteCustomer(${c.id}, '${this.escapeHtml(c.name || 'Customer').replace(/'/g, "\\'")}', '${this.escapeHtml(c.email || '').replace(/'/g, "\\'")}')">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    ${pagination.pages > 1 ? `
                        <div class="admin-pagination">
                            <button ${pagination.page <= 1 ? 'disabled' : ''} onclick="AdminApp.goToCustomerPage(${pagination.page - 1})">‹ Prev</button>
                            <span style="margin: 0 12px; font-size:13px; font-weight:600;">Page ${pagination.page} of ${pagination.pages}</span>
                            <button ${pagination.page >= pagination.pages ? 'disabled' : ''} onclick="AdminApp.goToCustomerPage(${pagination.page + 1})">Next ›</button>
                        </div>
                    ` : ''}
                `}
            </div>
        `;
    },

    // ========================================================
    // 7. ACCOUNT SETTINGS
    // ========================================================
    // ========================================================
    // 7. ACCOUNT SETTINGS (REDESIGNED & PROFESSIONAL)
    // ========================================================
    account(user = {}, adminUsers = [], isSuperAdmin = false) {
        const username = user.username || 'Admin';
        const email = user.email || '';
        const phone = user.phone || '';
        const role = user.role || 'admin';
        const isSuper = isSuperAdmin || (user && (
            user.is_superadmin === true ||
            user.role === 'superadmin' ||
            String(user.email).toLowerCase() === 'admin@yadawy.com' ||
            user.id === 1
        ));
        const initials = username.substring(0, 2).toUpperCase() || 'AD';
        const createdDate = this.formatDate(user.created_at);
        const lastLogin = user.last_login_at ? this.formatDate(user.last_login_at) : 'Current Session';

        return `
            <div class="admin-page-header" style="margin-bottom:24px;">
                <h1 class="admin-page-title" style="font-size:22px; font-weight:700; color:var(--adm-maroon); font-family:var(--adm-font-brand); letter-spacing:1px; margin-bottom:6px;">
                    ${isSuper ? 'Account &amp; Admin Management' : 'My Account &amp; Profile'}
                </h1>
                <p class="admin-page-subtitle" style="color:var(--adm-text-secondary); font-size:13px;">
                    ${isSuper 
                        ? 'Manage your administrator profile, security credentials, and system admin accounts with full store access.' 
                        : 'Manage your personal profile information and security credentials.'}
                </p>
            </div>

            <div class="account-settings-container">
                <!-- 1. Profile Information Card -->
                <div class="account-card">
                    <div class="account-card-header">
                        <div class="account-card-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            <span>My Profile Information</span>
                        </div>
                        <span class="role-badge ${isSuper ? 'role-superadmin' : 'role-manager'}">${this.escapeHtml(isSuper ? 'SUPERADMIN' : role.toUpperCase())}</span>
                    </div>

                    <div class="account-avatar-section">
                        <div class="account-avatar-circle">${this.escapeHtml(initials)}</div>
                        <div class="account-avatar-info">
                            <div class="account-avatar-name">${this.escapeHtml(username)}</div>
                            <div class="account-avatar-role">
                                <span>✦</span> ${isSuper ? 'Primary Super Administrator' : 'Verified Administrator'}
                            </div>
                            <div style="font-size:11.5px; color:var(--adm-text-muted); margin-top:3px;">
                                Account active since ${createdDate}
                            </div>
                        </div>
                    </div>

                    <form id="account-profile-form" onsubmit="event.preventDefault(); AdminApp.handleSaveProfile();">
                        <div class="form-group" style="margin-bottom:16px;">
                            <label for="acc-username" style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--adm-text-secondary);">
                                Display Username <span style="color:var(--adm-error);">*</span>
                            </label>
                            <input type="text" id="acc-username" required value="${this.escapeHtml(username)}" placeholder="e.g. Sarah" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;">
                        </div>

                        <div class="form-group" style="margin-bottom:16px;">
                            <label for="acc-email" style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--adm-text-secondary);">
                                Email Address <span style="color:var(--adm-error);">*</span>
                            </label>
                            <input type="email" id="acc-email" required value="${this.escapeHtml(email)}" placeholder="admin@yadawy.com" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;">
                        </div>

                        <div class="form-group" style="margin-bottom:16px;">
                            <label for="acc-phone" style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--adm-text-secondary);">
                                Phone / Contact Number
                            </label>
                            <input type="tel" id="acc-phone" value="${this.escapeHtml(phone)}" placeholder="01XXXXXXXXX" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;">
                        </div>

                        <div class="form-group" style="margin-bottom:22px;">
                            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--adm-text-secondary);">
                                Assigned Permissions
                            </label>
                            <input type="text" value="FULL ADMINISTRATOR ACCESS (Products, Orders, Customers, Content)" disabled style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:12.5px; background:#F5F3EF; color:#776B6D; font-weight:600;">
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:4px;">
                            <div style="font-size:11.5px; color:var(--adm-text-muted);">
                                Last sign-in: <strong>${lastLogin}</strong>
                            </div>
                            <button type="submit" class="btn btn-primary" id="save-profile-btn" style="padding:9px 20px;">
                                Save Profile
                            </button>
                        </div>
                    </form>
                </div>

                <!-- 2. Security & Password Card -->
                <div class="account-card">
                    <div class="account-card-header">
                        <div class="account-card-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            <span>Security &amp; Password</span>
                        </div>
                        <span style="font-size:11px; color:var(--adm-text-muted); font-weight:600;">Bcrypt Enforced</span>
                    </div>

                    <form id="account-password-form" onsubmit="event.preventDefault(); AdminApp.handleSavePassword();">
                        <div class="form-group" style="margin-bottom:16px;">
                            <label for="acc-curr-password" style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--adm-text-secondary);">
                                Current Password <span style="color:var(--adm-error);">*</span>
                            </label>
                            <div class="input-group-password">
                                <input type="password" id="acc-curr-password" required placeholder="Enter current password" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;">
                                <button type="button" class="btn-toggle-password" onclick="AdminApp.togglePasswordVisibility('acc-curr-password', this)" title="Show/Hide Password">👁</button>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom:16px;">
                            <label for="acc-new-password" style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--adm-text-secondary);">
                                New Password <span style="color:var(--adm-error);">*</span>
                            </label>
                            <div class="input-group-password">
                                <input type="password" id="acc-new-password" required minlength="6" placeholder="Minimum 6 characters" oninput="AdminApp.checkPasswordStrength(this.value)" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;">
                                <button type="button" class="btn-toggle-password" onclick="AdminApp.togglePasswordVisibility('acc-new-password', this)" title="Show/Hide Password">👁</button>
                            </div>
                            <div id="password-strength-hint" class="password-hints">
                                <span>🔒</span> Password must be at least 6 characters long.
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom:22px;">
                            <label for="acc-confirm-password" style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--adm-text-secondary);">
                                Confirm New Password <span style="color:var(--adm-error);">*</span>
                            </label>
                            <div class="input-group-password">
                                <input type="password" id="acc-confirm-password" required minlength="6" placeholder="Repeat new password" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;">
                                <button type="button" class="btn-toggle-password" onclick="AdminApp.togglePasswordVisibility('acc-confirm-password', this)" title="Show/Hide Password">👁</button>
                            </div>
                        </div>

                        <div style="display:flex; justify-content:flex-end; gap:10px;">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('account-password-form').reset()">Reset</button>
                            <button type="submit" class="btn btn-primary" id="save-password-btn" style="padding:9px 20px;">
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>

                ${isSuper ? `
                <!-- 3. Admin Account Management Section (Super Admin Only) -->
                <div class="account-card" style="grid-column: 1 / -1;">
                    <div class="account-card-header" style="border-bottom: 1px solid var(--adm-border); padding-bottom: 14px; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
                        <div>
                            <div class="account-card-title" style="display:flex; align-items:center; gap:8px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                <span style="font-size:16px; font-weight:700; color:var(--adm-maroon);">Admin Access &amp; Account Management</span>
                            </div>
                            <p style="font-size:12.5px; color:var(--adm-text-secondary); margin-top:4px; margin-bottom:0;">
                                Create additional administrator accounts. Added admins can sign in to the control panel and have full permissions (products, orders, customers, content).
                            </p>
                        </div>
                        <span class="role-badge role-superadmin" style="display:inline-flex; align-items:center; gap:5px; font-size:11px; padding:4px 10px;">
                            <span>🔐</span> Primary Admin Only
                        </span>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:24px;">
                        <!-- Left Column: Create New Admin Form -->
                        <div style="background:#FAF7F2; border:1px solid var(--adm-border); border-radius:8px; padding:20px;">
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
                                <span style="font-size:16px;">➕</span>
                                <h3 style="font-size:14px; font-weight:700; color:var(--adm-maroon); margin:0;">Add New Admin Account</h3>
                            </div>

                            <form id="create-admin-form" onsubmit="event.preventDefault(); AdminApp.handleCreateAdminUser();">
                                <div class="form-group" style="margin-bottom:14px;">
                                    <label for="admin-new-email" style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--adm-text-secondary);">
                                        Admin Email <span style="color:var(--adm-error);">*</span>
                                    </label>
                                    <input type="email" id="admin-new-email" required placeholder="newadmin@yadawy.com" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px; background:white;">
                                </div>

                                <div class="form-group" style="margin-bottom:14px;">
                                    <label for="admin-new-password" style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--adm-text-secondary);">
                                        Admin Password <span style="color:var(--adm-error);">*</span>
                                    </label>
                                    <div class="input-group-password">
                                        <input type="password" id="admin-new-password" required minlength="6" placeholder="Minimum 6 characters" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px; background:white;">
                                        <button type="button" class="btn-toggle-password" onclick="AdminApp.togglePasswordVisibility('admin-new-password', this)" title="Show/Hide Password">👁</button>
                                    </div>
                                    <div style="font-size:11px; color:var(--adm-text-muted); margin-top:4px;">
                                        Stored securely with salted bcrypt cryptographic hashing.
                                    </div>
                                </div>

                                <div class="form-group" style="margin-bottom:18px;">
                                    <label for="admin-new-name" style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--adm-text-secondary);">
                                        Admin Name <span style="font-weight:normal; color:var(--adm-text-muted);">(Optional)</span>
                                    </label>
                                    <input type="text" id="admin-new-name" placeholder="e.g. Ahmed Mahmoud" style="width:100%; padding:9px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px; background:white;">
                                </div>

                                <button type="submit" class="btn btn-primary" id="create-admin-btn" style="width:100%; justify-content:center; padding:11px; font-size:13px; font-weight:700;">
                                    <span>➕ Create Admin Account</span>
                                </button>
                            </form>
                        </div>

                        <!-- Right Column: Active Admin Accounts List -->
                        <div style="background:white; border:1px solid var(--adm-border); border-radius:8px; padding:20px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span style="font-size:16px;">👥</span>
                                    <h3 style="font-size:14px; font-weight:700; color:var(--adm-maroon); margin:0;">Active Administrators</h3>
                                </div>
                                <span class="category-meta-badge" style="font-size:11px;">${adminUsers.length} Accounts</span>
                            </div>

                            <div style="overflow-x:auto;">
                                <table class="admin-table" style="font-size:12.5px; width:100%;">
                                    <thead>
                                        <tr>
                                            <th>Admin</th>
                                            <th>Permissions</th>
                                            <th>Date Added</th>
                                            <th style="text-align:right;">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${adminUsers.map(adm => {
                                            const isMe = user.id === adm.id || user.email === adm.email;
                                            return `
                                                <tr>
                                                    <td>
                                                        <div style="font-weight:700; color:var(--adm-maroon);">${this.escapeHtml(adm.username || 'Admin')} ${isMe ? '<span style="font-size:9.5px; background:rgba(91,14,45,0.1); color:var(--adm-maroon); padding:1px 6px; border-radius:10px; font-weight:700; margin-left:4px;">YOU</span>' : ''}</div>
                                                        <div style="font-size:11.5px; color:var(--adm-text-muted); font-family:monospace;">${this.escapeHtml(adm.email)}</div>
                                                    </td>
                                                    <td>
                                                        <span class="role-badge ${adm.role === 'superadmin' ? 'role-superadmin' : 'role-manager'}" style="font-size:10px; padding:2px 7px;">${this.escapeHtml(adm.role === 'superadmin' ? 'PRIMARY ADMIN' : 'ADMINISTRATOR')}</span>
                                                    </td>
                                                    <td style="font-size:11.5px; color:var(--adm-text-secondary);">
                                                        ${this.formatDate(adm.created_at)}
                                                    </td>
                                                    <td style="text-align:right;">
                                                        ${isMe ? `
                                                             <span style="font-size:11px; color:var(--adm-text-muted); font-style:italic;">Current Account</span>
                                                        ` : `
                                                            <button type="button" class="btn btn-outline btn-sm" style="color:var(--adm-error); border-color:#FECACA; padding:4px 8px; font-size:11px;" onclick="AdminApp.handleDeleteAdminUser(${adm.id}, '${this.escapeHtml(adm.email)}')">
                                                                🗑 Delete
                                                            </button>
                                                        `}
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
            </div>
        `;
    },

    // ========================================================
    // 8. CONTACT LEADS / CONTACT SUBMISSIONS
    // ========================================================
    contactLeads(leads = [], total = 0, counts = {}, filters = {}) {
        const activeSearch = filters.search || '';
        const activeStatus = filters.status || 'all';
        const activeSort = filters.sort || 'newest';

        const getStatusBadge = (status) => {
            switch (status) {
                case 'New':
                    return `<span class="status-badge-pill status-new"><span class="status-pulse-dot"></span> New</span>`;
                case 'Contacted':
                    return `<span class="status-badge-pill status-contacted">Contacted</span>`;
                case 'In Progress':
                    return `<span class="status-badge-pill status-in-progress">In Progress</span>`;
                case 'Closed':
                    return `<span class="status-badge-pill status-closed">Closed</span>`;
                default:
                    return `<span class="status-badge-pill status-new">${this.escapeHtml(status || 'New')}</span>`;
            }
        };

        return `
            <div class="admin-page-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
                <div>
                    <h1 class="admin-page-title" style="font-size:22px; font-weight:700; color:var(--adm-maroon); font-family:var(--adm-font-brand); letter-spacing:1px; margin-bottom:6px;">
                        Contact Leads &amp; Inquiries
                    </h1>
                    <p class="admin-page-subtitle" style="color:var(--adm-text-secondary); font-size:13px;">
                        View and manage inquiries submitted by customers through the website Contact form.
                    </p>
                </div>
                <div>
                    <a href="/#/contact" target="_blank" class="btn btn-outline" style="font-size:12px; gap:6px;">
                        <span>↗ Open Public Contact Form</span>
                    </a>
                </div>
            </div>

            <!-- Summary Chips Bar -->
            <div class="leads-summary-bar">
                <div class="lead-stat-chip ${activeStatus === 'all' ? 'active' : ''}" onclick="AdminApp.filterLeadsByStatus('all')">
                    <div class="lead-stat-label">Total Leads</div>
                    <div class="lead-stat-num">${counts.total || 0}</div>
                </div>
                <div class="lead-stat-chip ${activeStatus === 'New' ? 'active' : ''}" onclick="AdminApp.filterLeadsByStatus('New')">
                    <div class="lead-stat-label" style="color:#B78103;">● New Inquiries</div>
                    <div class="lead-stat-num" style="color:#B78103;">${counts.new || 0}</div>
                </div>
                <div class="lead-stat-chip ${activeStatus === 'Contacted' ? 'active' : ''}" onclick="AdminApp.filterLeadsByStatus('Contacted')">
                    <div class="lead-stat-label" style="color:#0277BD;">Contacted</div>
                    <div class="lead-stat-num" style="color:#0277BD;">${counts.contacted || 0}</div>
                </div>
                <div class="lead-stat-chip ${activeStatus === 'In Progress' ? 'active' : ''}" onclick="AdminApp.filterLeadsByStatus('In Progress')">
                    <div class="lead-stat-label" style="color:#5E35B1;">In Progress</div>
                    <div class="lead-stat-num" style="color:#5E35B1;">${counts.in_progress || 0}</div>
                </div>
                <div class="lead-stat-chip ${activeStatus === 'Closed' ? 'active' : ''}" onclick="AdminApp.filterLeadsByStatus('Closed')">
                    <div class="lead-stat-label" style="color:#2E7D32;">Closed</div>
                    <div class="lead-stat-num" style="color:#2E7D32;">${counts.closed || 0}</div>
                </div>
            </div>

            <!-- Search, Filter & Sort Controls -->
            <div class="leads-filter-bar">
                <div class="leads-filter-inputs">
                    <div style="position:relative; flex:1; min-width:240px;">
                        <input 
                            type="text" 
                            id="leads-search" 
                            class="leads-search-input" 
                            placeholder="Search by name, email, phone, or message..." 
                            value="${this.escapeHtml(activeSearch)}"
                            onkeydown="if(event.key === 'Enter') AdminApp.applyLeadsFilters()"
                        >
                    </div>

                    <select id="leads-status-filter" class="leads-select-filter" onchange="AdminApp.applyLeadsFilters()">
                        <option value="all" ${activeStatus === 'all' ? 'selected' : ''}>All Statuses</option>
                        <option value="New" ${activeStatus === 'New' ? 'selected' : ''}>New Only</option>
                        <option value="Contacted" ${activeStatus === 'Contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="In Progress" ${activeStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Closed" ${activeStatus === 'Closed' ? 'selected' : ''}>Closed</option>
                    </select>

                    <select id="leads-sort-filter" class="leads-select-filter" onchange="AdminApp.applyLeadsFilters()">
                        <option value="newest" ${activeSort === 'newest' ? 'selected' : ''}>Sort: Newest First</option>
                        <option value="oldest" ${activeSort === 'oldest' ? 'selected' : ''}>Sort: Oldest First</option>
                    </select>

                    <button class="btn btn-primary" onclick="AdminApp.applyLeadsFilters()" style="padding:8px 16px;">
                        Search
                    </button>
                    ${activeSearch || activeStatus !== 'all' || activeSort !== 'newest' ? `
                        <button class="btn btn-outline" onclick="AdminApp.resetLeadsFilters()" style="padding:8px 14px;">
                            Reset
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Leads Table Card -->
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">
                        <span>Contact Submissions</span>
                        <span style="font-size:13px; font-weight:400; color:var(--adm-text-muted); margin-left:8px;">
                            (${leads.length} of ${total} record${total !== 1 ? 's' : ''})
                        </span>
                    </div>
                </div>

                ${leads.length === 0 ? `
                    <div style="padding:48px 24px; text-align:center; color:var(--adm-text-muted);">
                        <div style="font-size:36px; margin-bottom:12px;">✉️</div>
                        <h3 style="font-size:16px; font-weight:700; color:var(--adm-maroon); margin-bottom:6px;">No Contact Submissions Found</h3>
                        <p style="font-size:13px; max-width:420px; margin:0 auto 16px;">
                            ${activeSearch || activeStatus !== 'all' 
                                ? 'No leads matched your search or filter criteria. Try adjusting your filters or resetting them.'
                                : 'Customer submissions from the website Contact form will automatically appear here.'}
                        </p>
                        ${activeSearch || activeStatus !== 'all' ? `
                            <button class="btn btn-outline" onclick="AdminApp.resetLeadsFilters()">Clear Filters</button>
                        ` : ''}
                    </div>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Client / Sender</th>
                                    <th>Contact Info</th>
                                    <th>Inquiry Subject</th>
                                    <th>Status</th>
                                    <th>Submitted Date</th>
                                    <th style="text-align:right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${leads.map(lead => {
                                    const shortMsg = lead.message?.length > 70 ? lead.message.substring(0, 70) + '...' : lead.message;
                                    const phoneClean = lead.phone ? lead.phone.replace(/[^0-9+]/g, '') : '';
                                    return `
                                        <tr id="lead-row-${lead.id}" style="cursor:pointer;" onclick="AdminApp.openLeadDetailModal(${lead.id})">
                                            <td>
                                                <div style="font-weight:700; color:var(--adm-maroon); font-size:13.5px;">
                                                    ${this.escapeHtml(lead.name)}
                                                </div>
                                                <div style="font-size:12px; color:var(--adm-text-muted); margin-top:2px;">
                                                    ${this.escapeHtml(shortMsg)}
                                                </div>
                                            </td>
                                            <td style="font-size:13px;" onclick="event.stopPropagation()">
                                                ${lead.email ? `
                                                    <div>
                                                        <a href="mailto:${this.escapeHtml(lead.email)}" style="color:inherit; text-decoration:underline;">
                                                            ${this.escapeHtml(lead.email)}
                                                        </a>
                                                    </div>
                                                ` : ''}
                                                ${lead.phone ? `
                                                    <div style="margin-top:2px; display:flex; align-items:center; gap:6px;">
                                                        <a href="tel:${this.escapeHtml(phoneClean)}" style="color:var(--adm-text-secondary); font-weight:600;">
                                                            ${this.escapeHtml(lead.phone)}
                                                        </a>
                                                        <a href="https://wa.me/${phoneClean.replace(/^\+?20/, '20')}" target="_blank" rel="noopener" class="badge" style="background:#E6F4EA; color:#137333; font-size:10px; font-weight:700; padding:2px 6px;" title="Open WhatsApp Chat">
                                                            WA ↗
                                                        </a>
                                                    </div>
                                                ` : ''}
                                            </td>
                                            <td>
                                                <span class="category-meta-badge" style="background:#FAF7F2; border:1px solid #E8DFD5; font-size:11.5px; font-weight:600;">
                                                    ${this.escapeHtml(lead.subject || 'General Inquiry')}
                                                </span>
                                            </td>
                                            <td>
                                                ${getStatusBadge(lead.status)}
                                            </td>
                                            <td style="font-size:12px; color:var(--adm-text-muted); white-space:nowrap;">
                                                ${this.formatDate(lead.created_at)}
                                            </td>
                                            <td style="text-align:right;" onclick="event.stopPropagation()">
                                                <div class="btn-group" style="justify-content:flex-end;">
                                                    <button class="btn btn-outline btn-sm" onclick="AdminApp.openLeadDetailModal(${lead.id})">
                                                        Details
                                                    </button>
                                                    <button class="btn btn-danger btn-sm" onclick="AdminApp.handleDeleteLead(${lead.id}, '${this.escapeHtml(lead.name).replace(/'/g, "\\'")}')" title="Delete Submission">
                                                        ×
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    },

    // Lead Details Modal Renderer
    contactLeadModal(lead) {
        const phoneClean = lead.phone ? lead.phone.replace(/[^0-9+]/g, '') : '';
        const waLink = phoneClean ? `https://wa.me/${phoneClean.replace(/^\+?20/, '20')}` : '';

        return `
            <div class="admin-modal" style="max-width:620px; max-height:90vh; overflow-y:auto;">
                <div class="admin-modal-title" style="color:var(--adm-maroon); display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--adm-border); padding-bottom:12px; margin-bottom:16px;">
                    <div>
                        <span>Contact Lead #${lead.id}</span>
                        <div style="font-size:12px; font-weight:400; color:var(--adm-text-muted); margin-top:2px;">
                            Submitted on ${this.formatDate(lead.created_at)}
                        </div>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm" onclick="this.closest('.admin-modal-overlay').remove()">✕</button>
                </div>

                <!-- Sender Information Box -->
                <div style="background:#FAF7F2; border:1px solid var(--adm-border); border-radius:6px; padding:16px; margin-bottom:18px;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; font-size:13px;">
                        <div>
                            <span style="font-size:11px; text-transform:uppercase; color:var(--adm-text-muted); font-weight:700; display:block;">Full Name</span>
                            <strong style="color:var(--adm-maroon); font-size:15px;">${this.escapeHtml(lead.name)}</strong>
                        </div>
                        <div>
                            <span style="font-size:11px; text-transform:uppercase; color:var(--adm-text-muted); font-weight:700; display:block;">Inquiry Type</span>
                            <span style="font-weight:600; color:var(--adm-gold-dark);">${this.escapeHtml(lead.subject || 'General Inquiry')}</span>
                        </div>
                        <div>
                            <span style="font-size:11px; text-transform:uppercase; color:var(--adm-text-muted); font-weight:700; display:block;">Email Address</span>
                            ${lead.email ? `
                                <a href="mailto:${this.escapeHtml(lead.email)}" style="color:var(--adm-maroon); font-weight:600; text-decoration:underline;">
                                    ${this.escapeHtml(lead.email)} ↗
                                </a>
                            ` : '<span style="color:var(--adm-text-muted); font-style:italic;">Not provided</span>'}
                        </div>
                        <div>
                            <span style="font-size:11px; text-transform:uppercase; color:var(--adm-text-muted); font-weight:700; display:block;">Phone Number</span>
                            ${lead.phone ? `
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <a href="tel:${this.escapeHtml(phoneClean)}" style="color:var(--adm-maroon); font-weight:700;">
                                        ${this.escapeHtml(lead.phone)}
                                    </a>
                                    ${waLink ? `
                                        <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-sm btn-primary" style="padding:2px 8px; font-size:11px;">
                                            WhatsApp ↗
                                        </a>
                                    ` : ''}
                                </div>
                            ` : '<span style="color:var(--adm-text-muted); font-style:italic;">Not provided</span>'}
                        </div>
                    </div>
                </div>

                <!-- Client Message Box -->
                <div style="margin-bottom:20px;">
                    <label style="display:block; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--adm-text-secondary); margin-bottom:6px;">
                        Full Client Message
                    </label>
                    <div style="background:#FFFFFF; border:1.5px solid var(--adm-border); border-radius:6px; padding:16px; font-size:14px; line-height:1.6; color:var(--adm-text); white-space:pre-wrap; max-height:220px; overflow-y:auto;">
                        ${this.escapeHtml(lead.message)}
                    </div>
                </div>

                <!-- Status & Internal Notes Form -->
                <form id="update-lead-form" onsubmit="event.preventDefault(); AdminApp.handleSaveLeadDetails(${lead.id});">
                    <div class="form-group" style="margin-bottom:16px;">
                        <label for="lead-status-select" style="display:block; font-size:12px; font-weight:700; color:var(--adm-text-secondary); margin-bottom:6px;">
                            Lead Status <span style="color:var(--adm-error);">*</span>
                        </label>
                        <select id="lead-status-select" style="width:100%; padding:9px 12px; border:1.5px solid var(--adm-gold); border-radius:4px; font-size:13.5px; font-weight:600; background:#FFFDF8;">
                            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>● New (Needs Attention)</option>
                            <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted (Reached Out via Phone/WA)</option>
                            <option value="In Progress" ${lead.status === 'In Progress' ? 'selected' : ''}>In Progress (Negotiating / Sizing / Custom)</option>
                            <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed (Resolved / Completed)</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-bottom:20px;">
                        <label for="lead-internal-notes" style="display:block; font-size:12px; font-weight:700; color:var(--adm-text-secondary); margin-bottom:6px;">
                            Internal Admin Notes (Private — Not shown to customer)
                        </label>
                        <textarea id="lead-internal-notes" rows="3" placeholder="e.g. Sent room size advice on WhatsApp, customer wants 2x3m antique kilim..." style="width:100%; padding:10px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px; font-family:inherit;">${this.escapeHtml(lead.internal_notes || '')}</textarea>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--adm-border); padding-top:16px;">
                        <button type="button" class="btn btn-danger btn-sm" onclick="AdminApp.handleDeleteLead(${lead.id}, '${this.escapeHtml(lead.name).replace(/'/g, "\\'")}', true)">
                            Delete Lead
                        </button>
                        <div style="display:flex; gap:10px;">
                            <button type="button" class="btn btn-outline" onclick="this.closest('.admin-modal-overlay').remove()">Close</button>
                            <button type="submit" class="btn btn-primary" id="save-lead-btn" style="padding:9px 20px;">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
    },

    // ========================================================
    // VIEW: COUPONS & DISCOUNTS MANAGEMENT
    // ========================================================
    renderCouponsView(coupons = []) {
        const totalCoupons = coupons.length;
        const activeCoupons = coupons.filter(c => c.is_active).length;
        const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);

        return `
            <div class="admin-page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; margin-bottom:24px;">
                <div>
                    <h1 class="admin-page-title" style="display:flex; align-items:center; gap:10px; font-family:var(--font-serif); font-size:24px; color:var(--adm-maroon); margin:0 0 6px 0;">
                        <span>🏷️</span>
                        <span>Coupons &amp; Discounts</span>
                    </h1>
                    <p class="admin-page-subtitle" style="color:var(--adm-text-secondary); margin:0; font-size:13.5px;">
                        Create and manage promotional discount percentage codes, usage quotas, and active status.
                    </p>
                </div>
                <div>
                    <button type="button" class="btn btn-primary" onclick="AdminApp.openCouponModal()" style="display:inline-flex; align-items:center; gap:8px; padding:10px 20px; font-weight:700;">
                        <span style="font-size:18px; line-height:1;">+</span>
                        <span>Create New Coupon</span>
                    </button>
                </div>
            </div>

            <!-- Stats Overview -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
                <div class="info-card" style="padding:16px 20px; background:#FFFFFF; border:1px solid var(--adm-border); border-left:4px solid var(--adm-maroon); border-radius:8px;">
                    <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--adm-text-secondary); margin-bottom:4px;">Total Coupons</div>
                    <div style="font-size:24px; font-weight:800; color:var(--adm-maroon); font-family:var(--font-serif);">${totalCoupons}</div>
                </div>
                <div class="info-card" style="padding:16px 20px; background:#FFFFFF; border:1px solid var(--adm-border); border-left:4px solid var(--adm-success); border-radius:8px;">
                    <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--adm-text-secondary); margin-bottom:4px;">Active Coupons</div>
                    <div style="font-size:24px; font-weight:800; color:var(--adm-success); font-family:var(--font-serif);">${activeCoupons}</div>
                </div>
                <div class="info-card" style="padding:16px 20px; background:#FFFFFF; border:1px solid var(--adm-border); border-left:4px solid var(--adm-gold); border-radius:8px;">
                    <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--adm-text-secondary); margin-bottom:4px;">Total Uses / Redemptions</div>
                    <div style="font-size:24px; font-weight:800; color:var(--adm-gold); font-family:var(--font-serif);">${totalRedemptions}</div>
                </div>
            </div>

            <!-- Coupons Table Card -->
            <div class="info-card" style="background:#FFFFFF; border:1px solid var(--adm-border); border-radius:8px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                <div style="padding:18px 24px; border-bottom:1px solid var(--adm-border); display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-family:var(--font-serif); font-size:17px; color:var(--adm-maroon);">
                        Active &amp; Inactive Promo Codes
                    </h3>
                    <span style="font-size:12px; color:var(--adm-text-secondary);">
                        ${totalCoupons} code${totalCoupons !== 1 ? 's' : ''} configured
                    </span>
                </div>

                ${totalCoupons === 0 ? `
                    <div style="text-align:center; padding:60px 20px;">
                        <div style="font-size:48px; margin-bottom:16px;">🏷️</div>
                        <h3 style="font-family:var(--font-serif); font-size:18px; color:var(--adm-maroon); margin-bottom:8px;">No Coupons Created Yet</h3>
                        <p style="font-size:13.5px; color:var(--adm-text-secondary); max-width:400px; margin:0 auto 20px;">
                            Create discount percentage promo codes for customers to apply at checkout.
                        </p>
                        <button type="button" class="btn btn-primary" onclick="AdminApp.openCouponModal()">
                            + Create First Coupon
                        </button>
                    </div>
                ` : `
                    <div class="table-responsive" style="overflow-x:auto;">
                        <table class="admin-table" style="width:100%; border-collapse:collapse; text-align:left;">
                            <thead>
                                <tr style="background:#FAF7F2; border-bottom:1.5px solid var(--adm-border);">
                                    <th style="padding:14px 16px; font-size:11.5px; text-transform:uppercase; letter-spacing:1px; color:var(--adm-maroon);">Coupon Code</th>
                                    <th style="padding:14px 16px; font-size:11.5px; text-transform:uppercase; letter-spacing:1px; color:var(--adm-maroon);">Discount</th>
                                    <th style="padding:14px 16px; font-size:11.5px; text-transform:uppercase; letter-spacing:1px; color:var(--adm-maroon);">Usage Count</th>
                                    <th style="padding:14px 16px; font-size:11.5px; text-transform:uppercase; letter-spacing:1px; color:var(--adm-maroon);">Min. Order</th>
                                    <th style="padding:14px 16px; font-size:11.5px; text-transform:uppercase; letter-spacing:1px; color:var(--adm-maroon);">Expiry Date</th>
                                    <th style="padding:14px 16px; font-size:11.5px; text-transform:uppercase; letter-spacing:1px; color:var(--adm-maroon); text-align:center;">Status</th>
                                    <th style="padding:14px 16px; font-size:11.5px; text-transform:uppercase; letter-spacing:1px; color:var(--adm-maroon); text-align:right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${coupons.map(c => {
                                    const now = new Date().toISOString();
                                    const isExpired = c.end_date && (c.end_date.length === 10 ? `${c.end_date}T23:59:59.999Z` : c.end_date) < now;
                                    const isLimitReached = c.usage_limit && c.usage_count >= c.usage_limit;

                                    return `
                                        <tr style="border-bottom:1px solid #F0EAE1; transition:background 0.15s ease;">
                                            <!-- Code -->
                                            <td style="padding:14px 16px; vertical-align:middle;">
                                                <div style="display:flex; align-items:center; gap:8px;">
                                                    <span style="display:inline-block; font-family:'Courier New', monospace; font-size:14px; font-weight:800; background:#FAF3E8; color:var(--adm-maroon); padding:4px 10px; border-radius:4px; border:1px dashed var(--adm-gold); letter-spacing:1px;">
                                                        ${this.escapeHtml(c.code)}
                                                    </span>
                                                </div>
                                            </td>

                                            <!-- Discount -->
                                            <td style="padding:14px 16px; vertical-align:middle;">
                                                <span style="font-weight:700; color:var(--adm-maroon); font-size:14px;">
                                                    ${c.discount_value}% OFF
                                                </span>
                                                <div style="font-size:11px; color:var(--adm-text-secondary); text-transform:capitalize;">
                                                    Percentage Discount
                                                </div>
                                            </td>

                                            <!-- Usage Count -->
                                            <td style="padding:14px 16px; vertical-align:middle;">
                                                <div style="font-size:13px; font-weight:600; color:var(--adm-text);">
                                                    ${c.usage_count || 0} used
                                                </div>
                                                <div style="font-size:11.5px; color:${isLimitReached ? 'var(--adm-error)' : 'var(--adm-text-secondary)'};">
                                                    ${c.usage_limit ? `Limit: ${c.usage_limit}` : 'Unlimited'}
                                                    ${isLimitReached ? ' (Quota Full)' : ''}
                                                </div>
                                            </td>

                                            <!-- Min Order -->
                                            <td style="padding:14px 16px; vertical-align:middle; font-size:13px; color:var(--adm-text);">
                                                ${c.min_order_value ? `${this.formatPrice(c.min_order_value)}` : '<span style="color:#A8A29E; font-size:12px;">No Min.</span>'}
                                            </td>

                                            <!-- Expiry -->
                                            <td style="padding:14px 16px; vertical-align:middle; font-size:13px;">
                                                ${c.end_date ? `
                                                    <div style="font-weight:600; color:${isExpired ? 'var(--adm-error)' : 'var(--adm-text)'};">
                                                        ${c.end_date.slice(0, 10)}
                                                    </div>
                                                    ${isExpired ? '<span style="font-size:10.5px; color:var(--adm-error); font-weight:700; text-transform:uppercase;">EXPIRED</span>' : '<span style="font-size:11px; color:var(--adm-text-secondary);">Active expiry</span>'}
                                                ` : '<span style="color:#A8A29E; font-size:12px;">No Expiry (Never)</span>'}
                                            </td>

                                            <!-- Status -->
                                            <td style="padding:14px 16px; vertical-align:middle; text-align:center;">
                                                <button type="button" onclick="AdminApp.handleToggleCouponStatus(${c.id}, ${c.is_active ? 0 : 1})" style="cursor:pointer; background:none; border:none; padding:0; outline:none;" title="Click to ${c.is_active ? 'deactivate' : 'activate'}">
                                                    <span class="badge ${c.is_active ? 'badge-success' : 'badge-inactive'}" style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; font-size:11.5px; font-weight:700; border-radius:20px; transition:all 0.2s ease;">
                                                        <span style="font-size:8px;">●</span>
                                                        ${c.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </button>
                                            </td>

                                            <!-- Actions -->
                                            <td style="padding:14px 16px; vertical-align:middle; text-align:right;">
                                                <div style="display:flex; justify-content:flex-end; gap:8px;">
                                                    <button type="button" class="btn btn-sm btn-outline" onclick="AdminApp.openCouponModal(${c.id})" style="padding:5px 10px; font-size:12px;">
                                                        Edit
                                                    </button>
                                                    <button type="button" class="btn btn-sm btn-danger" onclick="AdminApp.handleDeleteCoupon(${c.id}, '${this.escapeHtml(c.code)}')" style="padding:5px 10px; font-size:12px;">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    },

    /**
     * Render Create / Edit Coupon Modal
     */
    renderCouponModal(coupon = null) {
        const isEdit = !!coupon;
        const title = isEdit ? `Edit Coupon: ${this.escapeHtml(coupon.code)}` : 'Create New Discount Coupon';

        return `
            <div class="admin-modal" style="max-width: 520px; width: 100%; border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--adm-border); padding-bottom:14px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:20px;">🏷️</span>
                        <h3 style="margin:0; font-family:var(--font-serif); font-size:18px; color:var(--adm-maroon);">
                            ${title}
                        </h3>
                    </div>
                    <button type="button" class="btn-icon" onclick="this.closest('.admin-modal-overlay').remove()" style="font-size:18px; color:var(--adm-text-secondary); background:none; border:none; cursor:pointer;">✕</button>
                </div>

                <form id="coupon-form" onsubmit="event.preventDefault(); AdminApp.handleSaveCoupon(${coupon ? coupon.id : 'null'});">
                    <!-- Coupon Code -->
                    <div class="form-group" style="margin-bottom:16px;">
                        <label for="coupon-code-input" style="display:block; font-size:12.5px; font-weight:700; color:var(--adm-text-secondary); margin-bottom:6px;">
                            Coupon Code <span style="color:var(--adm-error);">*</span>
                        </label>
                        <input type="text" id="coupon-code-input" name="code" value="${coupon ? this.escapeHtml(coupon.code) : ''}" placeholder="e.g. SAVE10" style="width:100%; padding:10px 12px; border:1.5px solid var(--adm-gold); border-radius:4px; font-family:'Courier New', monospace; font-size:15px; font-weight:700; text-transform:uppercase; letter-spacing:1px; background:#FFFDF9;" required minlength="2">
                        <span style="display:block; font-size:11px; color:var(--adm-text-secondary); margin-top:4px;">
                            Customers will enter this code at checkout to receive the discount.
                        </span>
                    </div>

                    <!-- Discount Value (Percentage) -->
                    <div class="form-group" style="margin-bottom:16px;">
                        <label for="coupon-value-input" style="display:block; font-size:12.5px; font-weight:700; color:var(--adm-text-secondary); margin-bottom:6px;">
                            Discount Percentage (%) <span style="color:var(--adm-error);">*</span>
                        </label>
                        <div style="display:flex; align-items:center; position:relative;">
                            <input type="number" id="coupon-value-input" name="discount_value" value="${coupon ? coupon.discount_value : ''}" placeholder="e.g. 10 for 10% discount" min="0.5" max="100" step="0.5" style="width:100%; padding:10px 36px 10px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:14px; font-weight:600;" required>
                            <span style="position:absolute; right:12px; font-weight:700; color:var(--adm-maroon); font-size:15px;">%</span>
                        </div>
                    </div>

                    <!-- Expiry Date & Usage Limit Row -->
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
                        <div class="form-group">
                            <label for="coupon-end-date" style="display:block; font-size:12px; font-weight:700; color:var(--adm-text-secondary); margin-bottom:6px;">
                                Expiry Date (Optional)
                            </label>
                            <input type="date" id="coupon-end-date" name="end_date" value="${coupon && coupon.end_date ? coupon.end_date.slice(0, 10) : ''}" style="width:100%; padding:9px 10px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px; font-family:inherit;">
                            <span style="display:block; font-size:10.5px; color:var(--adm-text-secondary); margin-top:3px;">
                                Leave blank for no expiration
                            </span>
                        </div>
                        <div class="form-group">
                            <label for="coupon-usage-limit" style="display:block; font-size:12px; font-weight:700; color:var(--adm-text-secondary); margin-bottom:6px;">
                                Usage Limit (Optional)
                            </label>
                            <input type="number" id="coupon-usage-limit" name="usage_limit" value="${coupon && coupon.usage_limit ? coupon.usage_limit : ''}" placeholder="e.g. 100" min="1" step="1" style="width:100%; padding:9px 10px; border:1px solid var(--adm-border); border-radius:4px; font-size:13px;">
                            <span style="display:block; font-size:10.5px; color:var(--adm-text-secondary); margin-top:3px;">
                                Leave blank for unlimited uses
                            </span>
                        </div>
                    </div>

                    <!-- Minimum Order Amount -->
                    <div class="form-group" style="margin-bottom:18px;">
                        <label for="coupon-min-order" style="display:block; font-size:12.5px; font-weight:700; color:var(--adm-text-secondary); margin-bottom:6px;">
                            Minimum Order Amount (Optional)
                        </label>
                        <div style="display:flex; align-items:center; position:relative;">
                            <input type="number" id="coupon-min-order" name="min_order_value" value="${coupon && coupon.min_order_value ? coupon.min_order_value : ''}" placeholder="e.g. 1000 (LE)" min="0" step="50" style="width:100%; padding:10px 40px 10px 12px; border:1px solid var(--adm-border); border-radius:4px; font-size:13.5px;">
                            <span style="position:absolute; right:12px; font-weight:600; color:var(--adm-text-secondary); font-size:13px;">LE</span>
                        </div>
                    </div>

                    <!-- Status Checkbox -->
                    <div class="form-group" style="margin-bottom:24px; background:#FAF7F2; padding:12px 14px; border-radius:6px; border:1px solid var(--adm-border);">
                        <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:13.5px; font-weight:600; color:var(--adm-text); margin:0;">
                            <input type="checkbox" id="coupon-is-active" name="is_active" ${coupon ? (coupon.is_active ? 'checked' : '') : 'checked'} style="width:18px; height:18px; accent-color:var(--adm-maroon);">
                            <span>Active (Available for customer redemption at checkout)</span>
                        </label>
                    </div>

                    <!-- Actions -->
                    <div style="display:flex; justify-content:flex-end; gap:10px; border-top:1px solid var(--adm-border); padding-top:16px;">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.admin-modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="save-coupon-btn" style="padding:10px 24px; font-weight:700;">
                            ${isEdit ? 'Update Coupon' : 'Create Coupon'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    // ========================================================
    // VIEW: SHIPPING SETTINGS
    // ========================================================
    renderShippingSettingsView(shippingCost = 100) {
        const costNum = !isNaN(parseFloat(shippingCost)) ? parseFloat(shippingCost) : 100;

        return `
            <div class="admin-page-header" style="margin-bottom:24px;">
                <h1 class="admin-page-title" style="display:flex; align-items:center; gap:10px; font-family:var(--font-serif); font-size:24px; color:var(--adm-maroon); margin:0 0 6px 0;">
                    <span>🚚</span>
                    <span>Shipping Settings</span>
                </h1>
                <p class="admin-page-subtitle" style="color:var(--adm-text-secondary); margin:0; font-size:13.5px;">
                    Configure storewide flat shipping fees applied automatically to all customer checkout orders.
                </p>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:24px; max-width:1050px;">
                <!-- Left: Form to update rate -->
                <div class="info-card" style="background:#FFFFFF; border:1px solid var(--adm-border); border-radius:8px; padding:24px; box-shadow:0 4px 16px rgba(0,0,0,0.03);">
                    <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--adm-border); padding-bottom:14px; margin-bottom:20px;">
                        <h3 style="margin:0; font-family:var(--font-serif); font-size:17px; color:var(--adm-maroon); font-weight:700;">
                            Configure Flat Shipping Rate
                        </h3>
                        <span class="badge" style="background:rgba(91,14,45,0.08); color:var(--adm-maroon); font-weight:700; padding:4px 10px; border-radius:12px; font-size:11.5px;">
                            Storewide Rate
                        </span>
                    </div>

                    <form id="shipping-settings-form" onsubmit="AdminApp.handleSaveShippingSettings(event)">
                        <div class="form-group" style="margin-bottom:20px;">
                            <label for="shipping-cost-input" style="display:block; font-size:13px; font-weight:700; color:var(--adm-maroon); margin-bottom:8px;">
                                Shipping Cost (EGP) *
                            </label>
                            <div style="display:flex; align-items:center; position:relative; max-width:280px;">
                                <input type="number" id="shipping-cost-input" name="shipping_cost" value="${costNum}" min="0" step="1" required style="width:100%; padding:12px 50px 12px 14px; border:2px solid var(--adm-gold); border-radius:6px; font-size:16px; font-weight:700; color:var(--adm-maroon); background:#FFFFFF;" oninput="document.getElementById('preview-shipping-val').textContent = '+ ' + (parseFloat(this.value)||0).toLocaleString() + ' LE'; document.getElementById('preview-total-val').textContent = ((10000 + (parseFloat(this.value)||0) - 1000).toLocaleString()) + ' LE';">
                                <span style="position:absolute; right:14px; font-weight:700; color:var(--adm-text-secondary); font-size:13px;">EGP</span>
                            </div>
                            <span style="display:block; font-size:11.5px; color:var(--adm-text-secondary); margin-top:6px;">
                                Current shipping cost: <strong id="current-shipping-cost-label">${costNum.toLocaleString()} EGP</strong>
                            </span>
                        </div>

                        <div style="background:#FAF7F2; border:1px solid var(--adm-border); border-left:4px solid var(--adm-gold); border-radius:6px; padding:14px 16px; margin-bottom:24px;">
                            <div style="font-weight:700; font-size:12.5px; color:var(--adm-maroon); margin-bottom:4px;">
                                ℹ️ System Behavior Notice
                            </div>
                            <ul style="margin:0; padding-left:18px; font-size:12px; color:var(--adm-text-secondary); line-height:1.6;">
                                <li>The new shipping price applies automatically to all future checkout orders.</li>
                                <li>Existing past orders preserve their original recorded shipping fee.</li>
                                <li>Set to <strong>0</strong> if you wish to offer complimentary free storewide delivery.</li>
                            </ul>
                        </div>

                        <button type="submit" class="btn btn-primary" id="save-shipping-btn" style="padding:12px 28px; font-weight:700; font-size:14px; display:inline-flex; align-items:center; gap:8px;">
                            <span>💾</span>
                            <span>Save Shipping Settings</span>
                        </button>
                    </form>
                </div>

                <!-- Right: Live Calculation Preview Card -->
                <div class="info-card" style="background:#FAF7F2; border:1px solid var(--adm-border); border-radius:8px; padding:24px;">
                    <h3 style="margin:0 0 16px 0; font-family:var(--font-serif); font-size:17px; color:var(--adm-maroon); font-weight:700;">
                        Live Checkout Calculation Preview
                    </h3>

                    <div style="background:#FFFFFF; border:1px solid var(--adm-border); border-radius:6px; padding:18px; margin-bottom:18px;">
                        <div style="font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--adm-text-secondary); margin-bottom:12px;">
                            Sample Order Formula
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
                            <span style="color:var(--adm-text-secondary);">Subtotal:</span>
                            <span style="font-weight:600;">10,000 LE</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
                            <span style="color:var(--adm-text-secondary);">+ Shipping Fee:</span>
                            <span style="font-weight:700; color:var(--adm-maroon);" id="preview-shipping-val">+ ${costNum.toLocaleString()} LE</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:var(--adm-success);">
                            <span>- Coupon Discount (e.g. 10%):</span>
                            <span style="font-weight:600;">- 1,000 LE</span>
                        </div>
                        <div style="border-top:2px solid var(--adm-maroon); padding-top:10px; margin-top:10px; display:flex; justify-content:space-between; font-size:15px; font-weight:800; color:var(--adm-maroon);">
                            <span>= Final Order Total:</span>
                            <span id="preview-total-val">${(10000 + costNum - 1000).toLocaleString()} LE</span>
                        </div>
                    </div>

                    <div style="font-size:12px; color:var(--adm-text-secondary); line-height:1.5;">
                        This updated fee is automatically included in customer checkout totals, invoice breakdowns, admin order details, and official email receipts.
                    </div>
                </div>
            </div>
        `;
    },

    // ========================================================
    // 7. HERO SECTION MANAGEMENT
    // ========================================================
    heroManagement(hero = {}) {
        let meta = {};
        try {
            meta = typeof hero.metadata === 'string' ? JSON.parse(hero.metadata) : (hero.metadata || {});
        } catch (e) { meta = {}; }

        const title = hero.title || 'The Art of Handwoven Rugs';
        const subtitle = hero.subtitle || 'Curated masterpieces woven with tradition, designed for modern living';
        const image = hero.image || '';
        const overlayOpacity = meta.overlay_opacity !== undefined ? Number(meta.overlay_opacity) : 0.8;

        return `
            <div class="admin-page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                <div>
                    <h1 class="admin-page-title" style="font-size:24px; font-weight:700; color:var(--adm-maroon); font-family:var(--adm-font-brand); letter-spacing:1px; margin-bottom:4px;">
                        Hero Section Management
                    </h1>
                    <p class="admin-page-subtitle" style="color:var(--adm-text-secondary); font-size:13px;">
                        Manage the homepage hero background image, headings, and dark luxury overlay in real time.
                    </p>
                </div>
                <div class="btn-group">
                    <a href="/#/" target="_blank" class="btn btn-outline" style="display:inline-flex; align-items:center; gap:6px;">
                        <span>View Live Storefront</span> ↗
                    </a>
                    <button type="button" class="btn btn-primary" onclick="AdminApp.saveHeroSection()" id="hero-save-top-btn" style="padding:10px 24px; font-size:13px; font-weight:700;">
                        Save Hero Changes
                    </button>
                </div>
            </div>

            <!-- LIVE REAL-TIME HERO PREVIEW CARD -->
            <div class="admin-card" style="margin-bottom:28px; padding:24px; background:#FFFFFF; border:1px solid var(--adm-border); border-radius:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#28a745;"></span>
                        <h3 style="font-size:15px; font-weight:700; color:var(--adm-maroon); margin:0; text-transform:uppercase; letter-spacing:1px;">
                            Live Hero Visual Preview
                        </h3>
                    </div>
                    <span style="font-size:12px; color:var(--adm-text-muted);">Simulates real-time appearance on the website</span>
                </div>

                <!-- Simulation Viewport -->
                <div id="hero-preview-container" style="position:relative; height:340px; border-radius:6px; overflow:hidden; background:var(--adm-maroon); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(0,0,0,0.18);">
                    <!-- Background Image Element -->
                    <img id="hero-preview-img" src="${image || ''}" alt="Hero Preview" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:${image ? 'block' : 'none'}; opacity:0.65;">

                    <!-- Background Fallback Gradient -->
                    <div id="hero-preview-gradient" style="position:absolute; inset:0; background:linear-gradient(135deg,var(--adm-maroon),var(--adm-maroon-dark)); display:${!image ? 'block' : 'none'};"></div>

                    <!-- Adjustable Dark Overlay Layer -->
                    <div id="hero-preview-overlay" style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(24, 4, 7, 0.72) 0%, rgba(35, 6, 12, 0.78) 50%, rgba(24, 4, 7, 0.90) 100%); opacity:${overlayOpacity}; transition:opacity 0.2s ease;"></div>

                    <!-- Hero Content Container -->
                    <div style="position:relative; z-index:2; text-align:center; padding:20px; max-width:650px; color:#FAF7F2;">
                        <h2 id="hero-preview-title" style="font-family:'Cormorant Garamond', Georgia, serif; font-size:32px; font-weight:400; line-height:1.2; margin-bottom:10px; text-shadow:0 2px 14px rgba(0,0,0,0.6); color:#FAF7F2;">
                            ${this.escapeHtml(title)}
                        </h2>
                        <p id="hero-preview-subtitle" style="font-family:'Inter', sans-serif; font-size:12px; font-weight:500; letter-spacing:1px; text-transform:uppercase; margin-bottom:0; opacity:0.95; line-height:1.6; color:#FAF7F2;">
                            ${this.escapeHtml(subtitle)}
                        </p>
                    </div>
                </div>
            </div>

            <!-- 2-COLUMN SETTINGS GRID -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
                <!-- LEFT COLUMN: Background Image -->
                <div>
                    <!-- Card 1: Background Image Management -->
                    <div class="admin-card" style="padding:24px; margin-bottom:24px;">
                        <h3 style="font-size:16px; font-weight:700; color:var(--adm-maroon); margin-bottom:16px; border-bottom:1px solid var(--adm-border); padding-bottom:10px; display:flex; align-items:center; gap:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            1. Background Image Management
                        </h3>

                        <!-- Image File Upload Zone -->
                        <div class="image-upload-zone" onclick="document.getElementById('hero-image-file-input').click()" style="padding:24px; text-align:center; border:2px dashed var(--adm-border); border-radius:6px; cursor:pointer; background:#FAF7F2; margin-bottom:16px; transition:border-color 0.2s ease;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--adm-maroon); margin-bottom:8px;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <div style="font-weight:700; color:var(--adm-maroon); font-size:14px;">Upload Image from Device</div>
                            <div style="font-size:12px; color:var(--adm-text-muted); margin-top:4px;">Supports JPG, PNG, WebP, AVIF from Computer or Mobile</div>
                            <input type="file" id="hero-image-file-input" accept="image/*" onchange="AdminApp.handleHeroImageFileSelect(event)" style="display:none;">
                        </div>

                        <!-- Current Image Status & Actions -->
                        <div style="background:#FFFFFF; border:1px solid var(--adm-border); border-radius:6px; padding:14px; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; gap:12px;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div id="hero-img-thumb" style="width:60px; height:45px; border-radius:4px; overflow:hidden; background:#29050C; border:1px solid var(--adm-border); flex-shrink:0;">
                                    ${image ? `<img src="${image}" style="width:100%; height:100%; object-fit:cover;">` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#A89F91; font-size:10px;">None</div>`}
                                </div>
                                <div>
                                    <div style="font-weight:600; font-size:13px; color:var(--adm-text);" id="hero-img-label">${image ? 'Background image active' : 'No image selected'}</div>
                                    <div style="font-size:11px; color:var(--adm-text-muted);" id="hero-img-sublabel">${image ? image.split('/').pop() : 'Default luxury gradient is used'}</div>
                                </div>
                            </div>
                            <div style="display:flex; gap:8px;">
                                <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('hero-image-file-input').click()">
                                    Replace
                                </button>
                                <button type="button" class="btn btn-danger btn-sm" onclick="AdminApp.removeHeroImage()" id="hero-delete-img-btn" ${!image ? 'disabled' : ''}>
                                    Delete
                                </button>
                            </div>
                        </div>

                        <!-- Overlay Opacity Slider -->
                        <div class="form-group" style="margin-bottom:8px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <label for="hero-overlay-range" style="font-weight:700; font-size:13px; color:var(--adm-maroon); margin:0;">
                                    Dark Overlay Opacity
                                </label>
                                <span id="hero-overlay-val" style="font-weight:700; font-size:13px; background:var(--adm-maroon); color:var(--adm-gold); padding:2px 8px; border-radius:10px;">
                                    ${Math.round(overlayOpacity * 100)}%
                                </span>
                            </div>
                            <input type="range" id="hero-overlay-range" min="0" max="1" step="0.05" value="${overlayOpacity}" oninput="AdminApp.onHeroOverlayInput(this.value)" style="width:100%; accent-color:var(--adm-maroon); cursor:pointer;">
                            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--adm-text-muted); margin-top:4px;">
                                <span>0% (Transparent)</span>
                                <span>50% (Balanced)</span>
                                <span>100% (Solid Dark)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT COLUMN: Text Content & Save -->
                <div>
                    <!-- Card 2: Hero Content Editor -->
                    <div class="admin-card" style="padding:24px; margin-bottom:24px;">
                        <h3 style="font-size:16px; font-weight:700; color:var(--adm-maroon); margin-bottom:18px; border-bottom:1px solid var(--adm-border); padding-bottom:10px; display:flex; align-items:center; gap:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            2. Hero Text Headings
                        </h3>

                        <div class="form-group" style="margin-bottom:16px;">
                            <label for="hero-title-input" style="font-weight:700; font-size:13px; color:var(--adm-maroon);">
                                Main Heading <span style="color:var(--adm-error);">*</span>
                            </label>
                            <input type="text" id="hero-title-input" value="${this.escapeHtml(title)}" placeholder="e.g. The Art of Handwoven Rugs" oninput="AdminApp.onHeroTitleInput(this.value)" style="font-size:15px; font-weight:600; width:100%; padding:10px 14px; border:1px solid var(--adm-border); border-radius:4px;" required>
                            <span style="font-size:11.5px; color:var(--adm-text-muted); margin-top:4px; display:block;">
                                Primary hero headline displayed in elegant serif font.
                            </span>
                        </div>

                        <div class="form-group" style="margin-bottom:8px;">
                            <label for="hero-subtitle-input" style="font-weight:700; font-size:13px; color:var(--adm-maroon);">
                                Subtitle Text
                            </label>
                            <textarea id="hero-subtitle-input" rows="3" placeholder="e.g. Curated masterpieces woven with tradition, designed for modern living" oninput="AdminApp.onHeroSubtitleInput(this.value)" style="font-size:13px; width:100%; padding:10px 14px; border:1px solid var(--adm-border); border-radius:4px; line-height:1.5;">${this.escapeHtml(subtitle)}</textarea>
                            <span style="font-size:11.5px; color:var(--adm-text-muted); margin-top:4px; display:block;">
                                Secondary description displayed below the main heading.
                            </span>
                        </div>
                    </div>

                    <!-- Card 3: Save & Apply -->
                    <div class="admin-card" style="padding:24px;">
                        <button type="button" class="btn btn-primary btn-block" onclick="AdminApp.saveHeroSection()" id="hero-save-bottom-btn" style="width:100%; justify-content:center; padding:14px; font-size:14px; font-weight:700; letter-spacing:0.5px;">
                            Save Hero Changes
                        </button>
                        <p style="font-size:12px; color:var(--adm-text-muted); text-align:center; margin-top:12px;">
                            Changes will immediately update the live homepage hero section for all visitors.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
};

