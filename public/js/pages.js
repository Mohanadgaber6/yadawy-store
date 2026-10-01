// ============================================================
// YADAWY PAGE RENDERERS
// ============================================================

// ============================================================
// HOME PAGE
// ============================================================
async function renderHomePage() {
    try {
        const data = await API.getHomepage();
        const sections = data.sections || [];
        let html = '';

        for (const section of sections) {
            switch (section.section_type) {
                case 'hero':
                    let heroMeta = {};
                    try {
                        heroMeta = typeof section.metadata === 'string' ? JSON.parse(section.metadata) : (section.metadata || {});
                    } catch (e) { heroMeta = {}; }

                    const overlayOpacity = heroMeta.overlay_opacity !== undefined ? Number(heroMeta.overlay_opacity) : 0.8;
                    const showVideo = Boolean(heroMeta.show_video && section.video);
                    const linkTarget = section.link_url ? (section.link_url.startsWith('#') || section.link_url.startsWith('http') ? section.link_url : `#${section.link_url}`) : '#/shop';

                    html += `
                        <section class="hero">
                            ${showVideo
                                ? `<video class="hero-image" autoplay muted loop playsinline src="${section.video}"></video>`
                                : (section.image
                                    ? `<img src="${imgSrc(section.image)}" class="hero-image" alt="Hero">`
                                    : '<div class="hero-image" style="background:linear-gradient(135deg,var(--color-maroon),var(--color-maroon-dark))"></div>')}
                            <div class="hero-overlay" style="opacity: ${overlayOpacity};"></div>
                            <div class="hero-content">
                                <h1 class="hero-title">${section.title || ''}</h1>
                                <p class="hero-subtitle">${section.subtitle || ''}</p>
                                ${section.link_text ? `<a href="${linkTarget}" class="hero-cta">${section.link_text}</a>` : ''}
                            </div>
                        </section>
                    `;
                    break;

                case 'collections':
                    if (section.collections && section.collections.length > 0) {
                        html += `
                            <section class="section">
                                <div class="section-header">
                                    <h2 class="section-title">${section.title || 'Our Collections'}</h2>
                                    ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
                                </div>
                                <div class="collections-grid">
                                    ${section.collections.map(c => renderCollectionCard(c)).join('')}
                                </div>
                            </section>
                        `;
                    }
                    break;

                case 'products':
                    html += renderProductShowcase(section);
                    break;

                case 'story':
                    html += `
                        <section class="story-section">
                            <div class="story-image-wrap">
                                ${section.image
                                    ? `<img src="${imgSrc(section.image)}" alt="Our Heritage" loading="lazy">`
                                    : '<div style="width:100%;height:100%;background:var(--color-cream-dark);display:flex;align-items:center;justify-content:center;font-size:48px;color:var(--color-beige)">✦</div>'}
                            </div>
                            <div class="story-content-wrap">
                                <div class="story-badge">${section.subtitle || 'HANDWOVEN ARTISTRY'}</div>
                                <h2 class="story-title">${section.title || 'Our Heritage'}</h2>
                                <p class="story-text">${section.content || ''}</p>
                                ${section.link_text ? `<a href="#${section.link_url || '/about'}" class="story-cta">${section.link_text}</a>` : ''}
                            </div>
                        </section>
                    `;
                    break;

                case 'newsletter':
                    html += `
                        <section class="newsletter-section">
                            <h2 class="newsletter-title">${section.title || 'Stay Connected'}</h2>
                            <p class="newsletter-subtitle">${section.subtitle || ''}</p>
                            <form class="newsletter-form" onsubmit="handleNewsletterSubmit(event)">
                                <input type="email" name="email" placeholder="Enter your email address" required>
                                <button type="submit">SUBSCRIBE</button>
                            </form>
                            <div id="newsletter-msg" style="margin-top:12px;font-size:13px;color:var(--color-gold-light)"></div>
                        </section>
                    `;
                    break;

                case 'testimonials':
                    if (section.testimonials && section.testimonials.length > 0) {
                        html += `
                            <section class="section section-alt">
                                <div class="section-header">
                                    <h2 class="section-title">${section.title || 'What Our Clients Say'}</h2>
                                </div>
                                <div style="display:flex;gap:32px;justify-content:center;flex-wrap:wrap;max-width:var(--max-width);margin:0 auto">
                                    ${section.testimonials.map(t => `
                                        <div style="max-width:350px;text-align:center;padding:24px">
                                            <div style="font-size:20px;color:var(--color-gold);margin-bottom:12px">${'★'.repeat(t.rating)}</div>
                                            <p style="font-style:italic;font-size:14px;line-height:1.8;color:var(--color-text-secondary);margin-bottom:16px">"${t.content}"</p>
                                            <div style="font-weight:600;font-size:13px">${t.author_name}</div>
                                            ${t.author_title ? `<div style="font-size:12px;color:var(--color-text-muted)">${t.author_title}</div>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </section>
                        `;
                    }
                    break;
            }
        }

        return html || '<div class="empty-state"><div class="empty-state-icon">✦</div><h2 class="empty-state-title">Welcome to Yadawy</h2><p class="empty-state-text">Content is being prepared</p></div>';
    } catch (err) {
        console.error('Home error:', err);
        return '<div class="empty-state"><div class="empty-state-icon">!</div><h2 class="empty-state-title">Unable to load content</h2></div>';
    }
}

async function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const msg = document.getElementById('newsletter-msg');
    try {
        await API.subscribe(email);
        msg.textContent = 'Thank you for subscribing!';
        e.target.reset();
    } catch (err) {
        msg.textContent = err.message || 'Failed to subscribe';
    }
}

// ============================================================
// SHOP PAGE WITH DYNAMIC SECTION & CATEGORY FILTERING
// ============================================================
async function renderShopPage(options = {}) {
    const rawHash = window.location.hash || '';
    const hashPath = rawHash.split('?')[0].replace('#', '') || '/shop';
    const urlParams = new URLSearchParams(rawHash.split('?')[1] || '');
    
    // Determine active section from URL path or param
    let currentSection = options.defaultSection || urlParams.get('section') || '';
    if (hashPath === '/carpets' || hashPath === 'carpets') currentSection = 'carpets';
    if (hashPath === '/kilims' || hashPath === 'kilims') currentSection = 'kilims';

    const queryParams = {
        page: urlParams.get('page') || 1,
        limit: 24,
        sort: urlParams.get('sort') || 'newest',
        section: currentSection,
        category: urlParams.get('category') || '',
        collection: urlParams.get('collection') || '',
        type: urlParams.get('type') || '',
        search: urlParams.get('search') || '',
        min_price: urlParams.get('min_price') || '',
        max_price: urlParams.get('max_price') || '',
        on_sale: urlParams.get('on_sale') || '',
        in_stock: urlParams.get('in_stock') || '',
        featured: urlParams.get('featured') || '',
        best_seller: urlParams.get('best_seller') || ''
    };

    // Clean empty params
    Object.keys(queryParams).forEach(k => { if (!queryParams[k]) delete queryParams[k]; });

    try {
        const [productData, catData] = await Promise.all([
            API.getProducts(queryParams),
            API.getCategories(currentSection ? { section: currentSection } : {})
        ]);

        const { products, pagination } = productData;
        const categories = catData.categories || [];

        // Dynamic Section Title & Subtitles
        let sectionTitle = 'All Handwoven Pieces';
        let sectionSubtitle = 'Curated Egyptian Carpets & Authentic Kilims';
        
        if (currentSection === 'carpets') {
            sectionTitle = 'Carpets & Rugs';
            sectionSubtitle = 'Authentic Antique Masterpieces & Artisanal New Handwoven Rugs';
        } else if (currentSection === 'kilims') {
            sectionTitle = 'Authentic Kilims & Flatweaves';
            sectionSubtitle = 'Historic Antique Kilims, Fine Wool, New Zealand Wool & Artistic Tableaux';
        }

        const activeCategory = categories.find(c => c.slug === queryParams.category);
        if (activeCategory) {
            sectionSubtitle = `${activeCategory.name} • ${sectionTitle}`;
        }

        return `
            <div class="shop-page">
                <!-- Section Header Banner -->
                <div class="shop-header">
                    <div>
                        <div class="shop-section-badge">${currentSection ? currentSection.toUpperCase() + ' SECTION' : 'AUTHENTIC CATALOG'}</div>
                        <h1 class="shop-title">${sectionTitle}</h1>
                        <p class="shop-section-desc">${sectionSubtitle}</p>
                        <span class="shop-count">${pagination.total} authentic piece${pagination.total !== 1 ? 's' : ''} available</span>
                    </div>
                    <div class="shop-controls">
                        <div class="shop-sort">
                            <label style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--color-text-muted);margin-right:8px">SORT BY:</label>
                            <select onchange="updateShopFilter('sort', this.value)">
                                <option value="newest" ${queryParams.sort === 'newest' ? 'selected' : ''}>Newest Additions</option>
                                <option value="oldest" ${queryParams.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                                <option value="price_asc" ${queryParams.sort === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
                                <option value="price_desc" ${queryParams.sort === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
                                <option value="name_asc" ${queryParams.sort === 'name_asc' ? 'selected' : ''}>Name: A to Z</option>
                                <option value="name_desc" ${queryParams.sort === 'name_desc' ? 'selected' : ''}>Name: Z to A</option>
                                <option value="best_seller" ${queryParams.sort === 'best_seller' ? 'selected' : ''}>Best Sellers</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Dynamic Category Filter Navigation -->
                <div class="category-filter-bar">
                    <div class="category-pills-container">
                        <button class="category-pill ${!queryParams.category ? 'active' : ''}"
                                onclick="selectShopCategory('')">
                            <span>ALL ${currentSection ? currentSection.toUpperCase() : 'PIECES'}</span>
                            ${!queryParams.category ? `<span class="pill-count">${pagination.total}</span>` : ''}
                        </button>
                        ${categories.map(c => `
                            <button class="category-pill ${queryParams.category === c.slug ? 'active' : ''}"
                                    onclick="selectShopCategory('${c.slug}')">
                                <span>${c.name.toUpperCase()}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Secondary Search & Filter Attributes -->
                <div class="shop-filters">
                    <div class="filter-group">
                        <label>Availability</label>
                        <select onchange="updateShopFilter('in_stock', this.value)">
                            <option value="">All Items</option>
                            <option value="1" ${queryParams.in_stock === '1' ? 'selected' : ''}>In Stock</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Price Min</label>
                        <input type="number" placeholder="Min LE" value="${queryParams.min_price || ''}" onchange="updateShopFilter('min_price', this.value)" style="width:110px">
                    </div>
                    <div class="filter-group">
                        <label>Price Max</label>
                        <input type="number" placeholder="Max LE" value="${queryParams.max_price || ''}" onchange="updateShopFilter('max_price', this.value)" style="width:110px">
                    </div>
                    ${queryParams.category || queryParams.min_price || queryParams.max_price || queryParams.in_stock ? `
                        <button class="clear-filters-btn" onclick="clearShopFilters()">✕ Clear Filters</button>
                    ` : ''}
                </div>

                ${products.length > 0 ? `
                    <div class="products-grid">
                        ${products.map(p => renderProductCard(p)).join('')}
                    </div>

                    ${pagination.totalPages > 1 ? `
                        <div class="pagination">
                            ${Array.from({length: pagination.totalPages}, (_, i) => i + 1).map(p => `
                                <button class="pagination-btn ${p === pagination.page ? 'active' : ''}"
                                    onclick="updateShopFilter('page', ${p})">${p}</button>
                            `).join('')}
                        </div>
                    ` : ''}
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">⌕</div>
                        <h2 class="empty-state-title">No products found in this category</h2>
                        <p class="empty-state-text">Try selecting "All" or adjusting your search criteria</p>
                        <button onclick="clearShopFilters()" class="section-link">SHOW ALL PIECES</button>
                    </div>
                `}
            </div>
        `;
    } catch (err) {
        console.error('Shop error:', err);
        return '<div class="empty-state"><div class="empty-state-icon">!</div><h2 class="empty-state-title">Failed to load products</h2></div>';
    }
}

function selectShopCategory(categorySlug) {
    const rawHash = window.location.hash || '#/shop';
    const hashPath = rawHash.split('?')[0];
    const params = new URLSearchParams(rawHash.split('?')[1] || '');
    
    if (categorySlug) {
        params.set('category', categorySlug);
    } else {
        params.delete('category');
    }
    params.delete('page');
    
    const qs = params.toString();
    window.location.hash = `${hashPath}${qs ? '?' + qs : ''}`;
}

function clearShopFilters() {
    const rawHash = window.location.hash || '#/shop';
    const hashPath = rawHash.split('?')[0];
    const params = new URLSearchParams(rawHash.split('?')[1] || '');
    const section = params.get('section');
    
    const newParams = new URLSearchParams();
    if (section) newParams.set('section', section);
    
    const qs = newParams.toString();
    window.location.hash = `${hashPath}${qs ? '?' + qs : ''}`;
}

function updateShopFilter(key, value) {
    const rawHash = window.location.hash || '#/shop';
    const hashPath = rawHash.split('?')[0];
    const params = new URLSearchParams(rawHash.split('?')[1] || '');
    if (value) {
        params.set(key, value);
    } else {
        params.delete(key);
    }
    if (key !== 'page') params.delete('page');
    const qs = params.toString();
    window.location.hash = `${hashPath}${qs ? '?' + qs : ''}`;
}

// ============================================================
// PRODUCT DETAIL PAGE
// ============================================================
async function renderProductDetailPage(slug) {
    try {
        const data = await API.getProduct(slug);
        const product = data.product;
        if (!product) return '<div class="not-found-page"><div class="not-found-title">404</div><p>Product not found</p></div>';

        const images = product.images || [];
        const mainImage = images.find(img => img.is_primary) || images[0];
        const sizes = product.sizes || [];
        const isOnSale = product.is_on_sale && product.sale_price;
        const related = product.related_products || [];

        // Check stock availability
        const availableSizes = sizes.filter(s => s.is_in_stock !== 0 && s.is_available !== 0);
        const isProductInStock = product.is_in_stock !== 0 && (sizes.length > 0 ? availableSizes.length > 0 : product.inventory_qty > 0);

        // Videos filter: only render if valid video path/URL exists
        const validVideos = (product.videos || []).filter(v => (v.video_path || v.video_url) && (v.video_path || v.video_url).trim().length > 0);

        return `
            <div class="product-detail">
                <div class="product-gallery">
                    <div class="product-gallery-main" id="gallery-main">
                        ${mainImage
                            ? `<img src="${imgSrc(mainImage.image_path)}" alt="${product.name}" id="gallery-main-img">`
                            : renderPlaceholder()}
                    </div>
                    ${images.length > 1 ? `
                        <div class="product-gallery-thumbs">
                            ${images.map((img, i) => `
                                <div class="product-gallery-thumb ${i === 0 ? 'active' : ''}"
                                     onclick="changeGalleryImage('${imgSrc(img.image_path)}', this)">
                                    <img src="${imgSrc(img.thumbnail_path || img.image_path)}" alt="${product.name}" loading="lazy">
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${validVideos.length > 0 ? `
                        <div style="margin-top:24px">
                            <h4 style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--color-text-muted);margin-bottom:12px">VIDEO SHOWCASE</h4>
                            ${validVideos.map(v => `
                                <div style="margin-bottom:12px;border-radius:4px;overflow:hidden;background:#000">
                                    <video controls playsinline style="width:100%;max-height:360px;display:block">
                                        <source src="${imgSrc(v.video_path || v.video_url)}">
                                    </video>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="product-info">
                    <div class="product-breadcrumb">
                        <a href="#/">Home</a>
                        <span class="separator">/</span>
                        ${product.section_name ? `<a href="#/shop?section=${product.section_slug}">${product.section_name}</a><span class="separator">/</span>` : ''}
                        ${product.category_name ? `<a href="#/shop?section=${product.section_slug || ''}&category=${product.category_slug}">${product.category_name}</a><span class="separator">/</span>` : ''}
                        <span>${product.name}</span>
                    </div>

                    ${product.type_name ? `<div class="product-detail-type">${product.type_name}</div>` : ''}
                    <h1 class="product-detail-name">${product.name}</h1>

                    <div class="product-detail-price" id="product-detail-price-display">
                        ${isOnSale
                            ? `<span class="original">${Store.formatPrice(product.price)}</span>
                               <span class="sale">${Store.formatPrice(product.sale_price)}</span>
                               <span class="badge">SALE</span>`
                            : `<span>${Store.formatPrice(product.price)}</span>`}
                    </div>

                    <div class="product-meta">
                        ${product.material ? `<div class="product-meta-item"><span class="product-meta-label">Material</span><span>${product.material}</span></div>` : ''}
                        ${product.dimensions && sizes.length === 0 ? `<div class="product-meta-item"><span class="product-meta-label">Dimensions</span><span>${product.dimensions}</span></div>` : ''}
                        ${product.color ? `<div class="product-meta-item"><span class="product-meta-label">Color</span><span>${product.color}</span></div>` : ''}
                        <div class="product-meta-item">
                            <span class="product-meta-label">Availability</span>
                            <span style="font-weight:600; color:${isProductInStock ? 'var(--color-success, #2e7d32)' : 'var(--color-error, #c62828)'}">
                                ${isProductInStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>

                    ${(product.handwoven_details || product.where_to_place) ? `
                        <div class="product-editorial-highlights" style="margin:20px 0; display:flex; flex-direction:column; gap:12px;">
                            ${product.handwoven_details ? `
                                <div class="product-highlight-card" style="background:#FAF7F2; border-left:3px solid var(--color-gold, #C5A880); padding:14px 18px; border-radius:0 4px 4px 0;">
                                    <div style="font-size:11px; letter-spacing:1.5px; text-transform:uppercase; font-weight:700; color:var(--color-primary, #4A1E23); margin-bottom:4px;">Handwoven Details</div>
                                    <div style="font-size:13.5px; line-height:1.6; color:var(--color-text, #333);">${product.handwoven_details}</div>
                                </div>
                            ` : ''}
                            ${product.where_to_place ? `
                                <div class="product-highlight-card" style="background:#FAF7F2; border-left:3px solid var(--color-gold, #C5A880); padding:14px 18px; border-radius:0 4px 4px 0;">
                                    <div style="font-size:11px; letter-spacing:1.5px; text-transform:uppercase; font-weight:700; color:var(--color-primary, #4A1E23); margin-bottom:4px;">Where to Place It</div>
                                    <div style="font-size:13.5px; line-height:1.6; color:var(--color-text, #333);">${product.where_to_place}</div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${sizes.length > 0 ? `
                        <div class="size-selector">
                            <div class="size-selector-label" style="display:flex; justify-content:space-between; align-items:center;">
                                <span>Size Options</span>
                                <span id="size-availability-status" style="font-size:11.5px; font-weight:600; color:var(--color-text-muted);"></span>
                            </div>
                            <div class="size-options" id="size-options">
                                ${sizes.map((s, i) => {
                                    const isAvailable = s.is_in_stock !== 0 && s.is_available !== 0;
                                    const isDefaultSelected = (availableSizes.length > 0 && availableSizes[0].id === s.id) || (availableSizes.length === 0 && i === 0);
                                    return `
                                        <button class="size-option ${isDefaultSelected && isAvailable ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}"
                                            data-size="${escapeHtml(s.size_name)}"
                                            data-price="${s.price !== null && s.price !== undefined ? s.price : ''}"
                                            data-stock="${isAvailable ? '1' : '0'}"
                                            onclick="selectProductSizeVariant(this, ${product.price})"
                                            ${!isAvailable ? 'disabled title="This size is currently Out of Stock"' : ''}>
                                            <span>${s.size_name}</span>
                                            ${!isAvailable ? `<span class="size-out-tag" style="font-size:10px; color:var(--color-error, #C5221F); margin-left:4px; font-weight:700;">(Out of Stock)</span>` : (s.price ? `<small style="font-size:11px; opacity:0.85;"> • ${Store.formatPrice(s.price)}</small>` : '')}
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="quantity-selector">
                        <span class="quantity-selector-label">Quantity</span>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="changeQty(-1)">−</button>
                            <input type="number" class="quantity-value" id="product-qty" value="1" min="1" max="${product.inventory_qty || 99}" readonly>
                            <button class="quantity-btn" onclick="changeQty(1)">+</button>
                        </div>
                    </div>

                    <button class="add-to-cart-btn" onclick="addProductToCart()" ${!isProductInStock ? 'disabled' : ''} id="add-to-cart-btn">
                        ${isProductInStock ? 'ADD TO CART' : 'OUT OF STOCK'}
                    </button>
                    <button class="buy-now-btn" onclick="buyNow()" ${!isProductInStock ? 'disabled' : ''} id="buy-now-btn">
                        BUY NOW
                    </button>

                    <!-- Four Fixed Product Information Accordions -->
                    <div class="product-accordion">
                        <!-- 1. DESCRIPTION -->
                        <div class="accordion-header open" onclick="toggleAccordion(this)">
                            <span>DESCRIPTION</span><span class="accordion-icon">−</span>
                        </div>
                        <div class="accordion-content open">
                            <div class="accordion-body">
                                <div style="line-height:1.7; font-size:14px; color:var(--color-text);">
                                    ${formatAccordionText(product.full_description || product.short_description || 'Masterfully crafted by Egyptian artisans using centuries-old traditional weaving techniques. Each piece carries unique character, cultural narrative, and enduring natural textures.')}
                                </div>
                            </div>
                        </div>

                        <!-- 2. SPECIFICATIONS -->
                        <div class="accordion-header" onclick="toggleAccordion(this)">
                            <span>SPECIFICATIONS</span><span class="accordion-icon">+</span>
                        </div>
                        <div class="accordion-content">
                            <div class="accordion-body">
                                ${formatAccordionText(product.specifications || `Material: ${product.material || '100% Fine Handspun Wool'}\nDimensions: ${product.dimensions || (sizes.length ? sizes.map(s => s.size_name).join(', ') : 'Custom sizes available')}\nColors: ${product.color || 'Natural vegetable and mineral dyes'}\nOrigin: Handwoven in Egypt`)}
                            </div>
                        </div>

                        <!-- 3. CARE INSTRUCTIONS -->
                        <div class="accordion-header" onclick="toggleAccordion(this)">
                            <span>CARE INSTRUCTIONS</span><span class="accordion-icon">+</span>
                        </div>
                        <div class="accordion-content">
                            <div class="accordion-body">
                                ${formatAccordionText(product.care_instructions || `• Vacuum regularly on low suction without a rotating brush.\n• Blot spills immediately with a clean, dry, un-dyed cloth.\n• Spot clean with mild wool detergent and lukewarm water if necessary.\n• Professional dry cleaning or specialized rug cleaning recommended once a year.\n• Rotate rug periodically to ensure even wear across all sections.`)}
                            </div>
                        </div>

                        <!-- 4. SHIPPING -->
                        <div class="accordion-header" onclick="toggleAccordion(this)">
                            <span>SHIPPING</span><span class="accordion-icon">+</span>
                        </div>
                        <div class="accordion-content">
                            <div class="accordion-body">
                                ${formatAccordionText(product.shipping_info || `• Doorstep delivery within 3-5 business days across Egypt.\n• Each rug is carefully rolled and sealed in protective, water-resistant packaging.\n• 14-day return and exchange policy for complete peace of mind.\n• Tracking information sent via SMS and email upon order dispatch.`)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            ${related.length > 0 ? `
                <section class="section section-alt">
                    <div class="section-header">
                        <h2 class="section-title">You May Also Like</h2>
                    </div>
                    <div class="products-scroll">
                        ${related.map(p => renderProductCard(p)).join('')}
                    </div>
                </section>
            ` : ''}
        `;
    } catch (err) {
        console.error('Product detail error:', err);
        return '<div class="not-found-page"><div class="not-found-title">404</div><p>Product not found</p><a href="#/shop" class="section-link">Back to Shop</a></div>';
    }
}

// Product detail helpers
window._currentProduct = null;

function changeGalleryImage(src, thumb) {
    const mainImg = document.getElementById('gallery-main-img');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.product-gallery-thumb').forEach(t => t.classList.remove('active'));
    if (thumb) thumb.classList.add('active');
}

function selectProductSizeVariant(btn, basePrice) {
    if (btn.classList.contains('unavailable') || btn.disabled) return;
    document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const customPrice = btn.dataset.price;
    const priceDisplay = document.getElementById('product-detail-price-display');
    if (priceDisplay) {
        if (customPrice && !isNaN(customPrice) && Number(customPrice) > 0) {
            priceDisplay.innerHTML = `<span>${Store.formatPrice(parseFloat(customPrice))}</span>`;
        } else if (basePrice) {
            priceDisplay.innerHTML = `<span>${Store.formatPrice(basePrice)}</span>`;
        }
    }
}

function selectSize(btn) {
    selectProductSizeVariant(btn);
}

function changeQty(delta) {
    const input = document.getElementById('product-qty');
    if (!input) return;
    const newVal = Math.max(1, parseInt(input.value) + delta);
    input.value = newVal;
}

function toggleAccordion(header) {
    header.classList.toggle('open');
    const icon = header.querySelector('.accordion-icon');
    const content = header.nextElementSibling;
    if (content) {
        content.classList.toggle('open');
        if (icon) {
            icon.textContent = content.classList.contains('open') ? '−' : '+';
        }
    }
}

async function addProductToCart() {
    const slug = window.location.hash.split('/product/')[1]?.split('?')[0];
    if (!slug) return;
    try {
        const data = await API.getProduct(slug);
        const product = data.product;
        if (!product) return;

        const selectedSizeBtn = document.querySelector('.size-option.selected');
        const size = selectedSizeBtn ? selectedSizeBtn.dataset.size : (product.dimensions || null);
        const customPrice = selectedSizeBtn && selectedSizeBtn.dataset.price ? parseFloat(selectedSizeBtn.dataset.price) : null;
        const qty = parseInt(document.getElementById('product-qty')?.value) || 1;

        Store.addToCart(product, size, qty, customPrice);
    } catch (err) {
        showToast('Failed to add to cart', 'error');
    }
}

function buyNow() {
    addProductToCart();
    setTimeout(() => navigateTo('/cart'), 300);
}

// ============================================================
// CART PAGE
// ============================================================
function renderCartPage() {
    const items = Store.cart;

    if (items.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">♦</div>
                <h2 class="empty-state-title">Your cart is empty</h2>
                <p class="empty-state-text">Discover our collection of handwoven masterpieces</p>
                <a href="#/shop" class="section-link">CONTINUE SHOPPING →</a>
            </div>
        `;
    }

    const subtotal = Store.getSubtotal();

    return `
        <div class="cart-page">
            <h1 style="font-family:var(--font-serif);font-size:28px;margin-bottom:32px">Shopping Cart</h1>
            <div class="cart-layout">
                <div>
                    <div class="cart-items-header">
                        <span>Product</span><span>Size</span><span>Quantity</span><span>Total</span><span></span>
                    </div>
                    ${items.map((item, i) => `
                        <div class="cart-item">
                            <div class="cart-item-info">
                                ${item.image
                                    ? `<img src="${imgSrc(item.image)}" class="cart-item-image" alt="${item.name}">`
                                    : `<div class="cart-item-image" style="background:var(--color-cream-dark)"></div>`}
                                <div>
                                    <div class="cart-item-name">${item.name}</div>
                                    <div class="cart-item-meta">${item.type_name || ''}</div>
                                    <div class="cart-item-meta">${Store.formatPrice(item.price)}</div>
                                </div>
                            </div>
                            <div>${item.size || '—'}</div>
                            <div>
                                <div class="quantity-controls" style="display:inline-flex">
                                    <button class="quantity-btn" onclick="updateCartItem(${i}, ${item.quantity - 1})">−</button>
                                    <div class="quantity-value" style="display:flex;align-items:center;justify-content:center">${item.quantity}</div>
                                    <button class="quantity-btn" onclick="updateCartItem(${i}, ${item.quantity + 1})">+</button>
                                </div>
                            </div>
                            <div style="font-weight:600">${Store.formatPrice(item.price * item.quantity)}</div>
                            <button class="cart-item-remove" onclick="removeCartItem(${i})" aria-label="Remove">✕</button>
                        </div>
                    `).join('')}
                </div>

                <div class="cart-summary">
                    <h3 class="cart-summary-title">Order Summary</h3>
                    <div class="cart-summary-row">
                        <span>Subtotal</span>
                        <span>${Store.formatPrice(subtotal)}</span>
                    </div>
                    <div class="cart-summary-row" id="discount-row" style="display:none">
                        <span>Discount</span>
                        <span id="discount-amount" style="color:var(--color-success)">-0</span>
                    </div>
                    <div class="cart-summary-row">
                        <span>Shipping</span>
                        <span style="color:var(--color-text-muted)">Calculated at checkout</span>
                    </div>
                    <div class="cart-summary-total">
                        <span>Total</span>
                        <span id="cart-total">${Store.formatPrice(subtotal)}</span>
                    </div>

                    <div class="coupon-field">
                        <input type="text" id="coupon-code" placeholder="Promo code">
                        <button onclick="applyCoupon()">APPLY</button>
                    </div>
                    <div id="coupon-msg" style="font-size:12px;margin-bottom:16px"></div>

                    <a href="#/checkout" class="checkout-btn" style="display:block;text-align:center">CHECKOUT</a>
                </div>
            </div>
        </div>
    `;
}

function updateCartItem(index, qty) {
    Store.updateQuantity(index, qty);
    renderCurrentPage();
}

function removeCartItem(index) {
    Store.removeFromCart(index);
    renderCurrentPage();
}

window._appliedCoupon = null;

async function applyCoupon() {
    const code = document.getElementById('coupon-code')?.value.trim();
    const msg = document.getElementById('coupon-msg');
    if (!code) {
        if (msg) {
            msg.innerHTML = '<span style="color:var(--color-error)">Please enter a coupon code</span>';
        }
        return;
    }

    try {
        const result = await API.validateCoupon(code, Store.getSubtotal());
        window._appliedCoupon = {
            code: result.code,
            discount: result.estimated_discount,
            percentage: result.discount_percentage
        };

        if (msg) {
            msg.innerHTML = `<span style="color:var(--color-success)">✓ ${result.message || 'Coupon applied successfully'}: -${Store.formatPrice(result.estimated_discount)}</span>`;
        }

        const discountRow = document.getElementById('discount-row');
        if (discountRow) discountRow.style.display = 'flex';
        const discountAmt = document.getElementById('discount-amount');
        if (discountAmt) discountAmt.textContent = `-${Store.formatPrice(result.estimated_discount)}`;
        const total = document.getElementById('cart-total');
        if (total) total.textContent = Store.formatPrice(Store.getSubtotal() - result.estimated_discount);
    } catch (err) {
        if (msg) {
            msg.innerHTML = `<span style="color:var(--color-error)">✕ ${err.message || 'Invalid coupon code'}</span>`;
        }
        window._appliedCoupon = null;
    }
}

async function applyCheckoutCoupon() {
    const input = document.getElementById('checkout-coupon-code');
    const msg = document.getElementById('checkout-coupon-msg');
    const code = input?.value.trim();

    if (!code) {
        if (msg) {
            msg.innerHTML = '<span style="color:var(--color-error)">Please enter a coupon code</span>';
        }
        return;
    }

    const subtotal = Store.getSubtotal();
    try {
        const result = await API.validateCoupon(code, subtotal);
        window._appliedCoupon = {
            code: result.code,
            discount: result.estimated_discount,
            percentage: result.discount_percentage
        };

        // Re-render checkout page to immediately reflect the discount and recalculated total
        renderCurrentPage();
    } catch (err) {
        if (msg) {
            msg.innerHTML = `<span style="color:var(--color-error)">✕ ${err.message || 'Invalid coupon code'}</span>`;
        }
    }
}

function removeAppliedCoupon() {
    window._appliedCoupon = null;
    renderCurrentPage();
}

// ============================================================
// CHECKOUT PAGE
// ============================================================
function renderCheckoutPage() {
    if (Store.cart.length === 0) {
        return '<div class="empty-state"><h2 class="empty-state-title">Nothing to checkout</h2><a href="#/shop" class="section-link">Continue Shopping</a></div>';
    }

    const subtotal = Store.getSubtotal();
    const shippingCost = Store.getShippingCost();
    let discount = 0;

    // Recalculate discount if coupon is applied
    if (window._appliedCoupon) {
        if (window._appliedCoupon.percentage) {
            discount = Math.round(subtotal * (window._appliedCoupon.percentage / 100) * 100) / 100;
            window._appliedCoupon.discount = discount;
        } else {
            discount = window._appliedCoupon.discount || 0;
        }
    }

    const total = Math.max(0, Math.round((subtotal + shippingCost - discount) * 100) / 100);

    return `
        <div class="checkout-page">
            <h1 style="font-family:var(--font-serif);font-size:28px;margin-bottom:32px">Checkout</h1>
            <div class="checkout-layout">
                <div>
                    <form id="checkout-form" onsubmit="handleCheckout(event)">
                        <div class="checkout-form-section">
                            <h3 class="checkout-form-title">Contact Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Full Name *</label>
                                    <input type="text" class="form-input" name="customer_name" required minlength="2">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email *</label>
                                    <input type="email" class="form-input" name="customer_email" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Phone *</label>
                                <input type="tel" class="form-input" name="customer_phone" required placeholder="01XXXXXXXXX">
                            </div>
                        </div>

                        <div class="checkout-form-section">
                            <h3 class="checkout-form-title">Shipping Address</h3>
                            <div class="form-group">
                                <label class="form-label">Address *</label>
                                <input type="text" class="form-input" name="address_line1" required minlength="5" placeholder="Street address, building, apartment">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Apartment, Suite, Landmark</label>
                                <input type="text" class="form-input" name="address_line2" placeholder="Optional landmark or apartment number">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">City / Area *</label>
                                    <input type="text" class="form-input" name="city" required placeholder="e.g. Cairo / Alexandria">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">State / Governorate</label>
                                    <input type="text" class="form-input" name="state" placeholder="e.g. Giza">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Postal Code</label>
                                    <input type="text" class="form-input" name="postal_code">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Country *</label>
                                    <input type="text" class="form-input" name="country" required value="Egypt" readonly style="background:#FAF7F2;">
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Order Notes</label>
                            <textarea class="form-textarea" name="notes" placeholder="Special requests or delivery instructions..."></textarea>
                        </div>

                        <button type="submit" class="checkout-btn" id="place-order-btn" style="margin-top:24px">PLACE ORDER</button>
                    </form>
                </div>

                <div class="cart-summary">
                    <h3 class="cart-summary-title">Order Summary</h3>
                    ${Store.cart.map(item => `
                        <div style="display:flex;gap:12px;margin-bottom:16px;align-items:center">
                            ${item.image
                                ? `<img src="${imgSrc(item.image)}" style="width:50px;height:65px;object-fit:cover;flex-shrink:0;border-radius:4px;" alt="${item.name}">`
                                : '<div style="width:50px;height:65px;background:var(--color-cream);flex-shrink:0;border-radius:4px;"></div>'}
                            <div style="flex:1">
                                <div style="font-size:13px;font-weight:600">${item.name}</div>
                                <div style="font-size:11.5px;color:var(--color-text-muted)">${item.size ? `Size: ${item.size}` : ''} • Qty: ${item.quantity}</div>
                            </div>
                            <div style="font-weight:700;font-size:13.5px">${Store.formatPrice(item.price * item.quantity)}</div>
                        </div>
                    `).join('')}

                    <!-- Coupon Input Section in Checkout -->
                    <div style="margin:20px 0 16px; padding:14px; background:#FAF7F2; border:1px dashed var(--color-gold); border-radius:6px;">
                        <label for="checkout-coupon-code" style="display:block; font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--color-maroon); margin-bottom:8px;">
                            🏷️ Enter Coupon Code
                        </label>
                        <div style="display:flex; gap:8px;">
                            <input type="text" id="checkout-coupon-code" value="${window._appliedCoupon ? window._appliedCoupon.code : ''}" placeholder="Enter Coupon Code" style="flex:1; padding:9px 12px; border:1px solid #D1D5DB; border-radius:4px; font-size:13px; font-family:'Courier New', monospace; font-weight:700; text-transform:uppercase; background:#FFFFFF;">
                            <button type="button" onclick="applyCheckoutCoupon()" class="btn-primary" style="padding:9px 18px; font-size:12px; font-weight:700; letter-spacing:1px; cursor:pointer;">APPLY</button>
                        </div>
                        <div id="checkout-coupon-msg" style="font-size:12px; margin-top:8px; font-weight:600;">
                            ${window._appliedCoupon ? `<span style="color:var(--color-success);">✓ Coupon applied successfully: -${Store.formatPrice(discount)} <a href="javascript:void(0)" onclick="removeAppliedCoupon()" style="color:var(--color-error); margin-left:8px; text-decoration:underline; font-size:11px;">[Remove]</a></span>` : ''}
                        </div>
                    </div>

                    <!-- Invoice Breakdown -->
                    <div class="cart-summary-row" style="border-top:1px solid var(--color-border);padding-top:16px">
                        <span>Subtotal</span>
                        <span>${Store.formatPrice(subtotal)}</span>
                    </div>
                    <div class="cart-summary-row">
                        <span>Shipping Cost</span>
                        <span style="font-weight:700; color:var(--color-maroon);">${shippingCost > 0 ? Store.formatPrice(shippingCost) : '<span style="color:var(--color-success);">FREE</span>'}</span>
                    </div>
                    ${discount > 0 ? `
                        <div class="cart-summary-row" style="color:var(--color-success);">
                            <span>Coupon Discount (${window._appliedCoupon?.code}${window._appliedCoupon?.percentage ? ` - ${window._appliedCoupon.percentage}%` : ''})</span>
                            <span style="font-weight:700;">-${Store.formatPrice(discount)}</span>
                        </div>
                    ` : ''}
                    <div class="cart-summary-total" style="border-top:2px solid var(--color-maroon); margin-top:12px; padding-top:14px;">
                        <span style="font-weight:700; font-size:16px;">Final Total</span>
                        <span id="checkout-final-total" style="font-weight:800; font-size:19px; color:var(--color-maroon);">${Store.formatPrice(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleCheckout(e) {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.textContent = 'PROCESSING...';

    const formData = new FormData(form);
    const orderData = {
        customer_name: formData.get('customer_name'),
        customer_email: formData.get('customer_email'),
        customer_phone: formData.get('customer_phone'),
        address_line1: formData.get('address_line1'),
        address_line2: formData.get('address_line2'),
        city: formData.get('city'),
        state: formData.get('state'),
        postal_code: formData.get('postal_code'),
        country: formData.get('country'),
        notes: formData.get('notes'),
        coupon_code: window._appliedCoupon?.code || null,
        items: Store.cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            size: item.size
        }))
    };

    try {
        const result = await API.placeOrder(orderData);
        Store.clearCart();
        window._appliedCoupon = null;

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="order-success">
                <div class="order-success-icon">✓</div>
                <h2 class="order-success-title">Thank You for Your Order!</h2>
                <p class="order-success-number">Order #${result.order.order_number}</p>
                <p style="color:var(--color-text-secondary);margin-bottom:24px">
                    We've received your order and will begin processing it shortly.
                    A confirmation has been sent to your email.
                </p>
                <div style="text-align:left;max-width:300px;margin:0 auto;padding:20px;background:var(--color-cream-dark)">
                    <div class="cart-summary-row"><span>Subtotal</span><span>${Store.formatPrice(result.order.subtotal)}</span></div>
                    ${result.order.discount > 0 ? `<div class="cart-summary-row"><span>Discount</span><span style="color:var(--color-success)">-${Store.formatPrice(result.order.discount)}</span></div>` : ''}
                    <div class="cart-summary-total"><span>Total</span><span>${Store.formatPrice(result.order.total)}</span></div>
                </div>
                <a href="#/" class="section-link" style="margin-top:32px">CONTINUE SHOPPING</a>
            </div>
        `;
    } catch (err) {
        showToast(err.message || 'Failed to place order', 'error');
        btn.disabled = false;
        btn.textContent = 'PLACE ORDER';
    }
}

// ============================================================
// ABOUT / OUR STORY PAGE (OFFICIAL DOCUMENT CONTENT)
// ============================================================
// ============================================================
// ABOUT / OUR STORY PAGE (EDITORIAL & VISUAL STORYTELLING)
// ============================================================
function renderAboutPage() {
    const config = window.YADAWY_CONFIG || {};

    // Schedule video autoplay initializer after DOM update
    setTimeout(() => {
        if (typeof window.initStoryBrandVideo === 'function') {
            window.initStoryBrandVideo();
        }
    }, 50);

    return `
        <div class="story-page-wrapper">
            <!-- 1. EDITORIAL HERO HEADER -->
            <header class="story-hero">
                <div class="story-hero-inner">
                    <div class="story-badge">
                        <span class="story-badge-icon">✦</span>
                        <span>THE ART OF EGYPTIAN HANDWEAVING</span>
                        <span class="story-badge-icon">✦</span>
                    </div>
                    <h1 class="story-hero-title">Our Story &amp; Heritage</h1>
                    <p class="story-hero-subtitle">"Yadawy.. A Piece That Tells a Story."</p>
                </div>
            </header>

            <!-- 2. PROMINENT CINEMATIC BRAND FILM -->
            <section class="story-film-section" aria-label="Brand Film">
                <div class="story-film-container">
                    <div class="story-film-frame" id="story-video-wrapper" onclick="handleStoryVideoFrameClick(event)">
                        <video 
                            id="story-brand-video"
                            class="story-film-video"
                            autoplay 
                            playsinline
                            webkit-playsinline
                            loop
                            preload="auto"
                            poster="/images/story/brand_film_poster.jpg"
                        >
                            <source src="/images/story/fixed-video.mp4" type="video/mp4">
                            <source src="/uploads/videos/our_story_brand_film.mp4" type="video/mp4">
                            Your browser does not support HTML5 video.
                        </video>
                        <div class="story-film-overlay">
                            <div class="story-film-tag">
                                <span class="tag-pulse"></span>
                                <span>AUTHENTIC CRAFTSMANSHIP FILM</span>
                            </div>
                            <div class="story-film-controls">
                                <button type="button" id="story-sound-btn" class="story-film-btn" onclick="toggleStoryVideoSound(event, this)" aria-label="Toggle Sound">
                                    <span class="btn-icon">MUTE</span>
                                    <span class="btn-text">UNMUTE SOUND</span>
                                </button>
                                <button type="button" id="story-play-btn" class="story-film-btn paused" onclick="toggleStoryVideoPlay(event, this)" aria-label="Toggle Playback">
                                    <span class="btn-icon">▶</span>
                                    <span class="btn-text">PLAY</span>
                                </button>
                            </div>
                        </div>
                        <div id="story-sound-prompt" class="story-sound-prompt" onclick="enableStoryVideoSound(event)">
                            <span class="prompt-icon">PLAY</span>
                            <span class="prompt-text">PLAY WITH SOUND</span>
                        </div>
                    </div>
                    <div class="story-film-caption">
                        <span class="caption-line"></span>
                        <p class="caption-text">Step inside our workshops: Egyptian master weavers crafting each knot by hand on traditional vertical looms.</p>
                        <span class="caption-line"></span>
                    </div>
                </div>
            </section>

            <div class="story-content-container">
                <!-- 3. LEAD QUOTE & ARTISAN FOUNDATION -->
                <section class="story-quote-section">
                    <div class="story-quote-grid">
                        <div class="story-quote-card">
                            <div class="quote-mark">“</div>
                            <blockquote class="editorial-quote-text">
                                "Every Yadawy piece is 100% handwoven by Egyptian artisans using traditional techniques passed down through generations. Each piece is unique and takes weeks to complete."
                            </blockquote>
                            <div class="quote-signature">
                                <span class="signature-line"></span>
                                <span class="signature-label">YADAWY MASTER ARTISANS</span>
                            </div>
                        </div>
                        <div class="story-quote-image-wrap">
                            <img 
                                src="/images/story/story_artisan_loom.webp" 
                                alt="Egyptian master artisan handweaving on traditional wooden loom" 
                                class="story-quote-image"
                                loading="lazy"
                            />
                            <div class="image-corner-tag">HANDMADE IN EGYPT</div>
                        </div>
                    </div>
                </section>

                <!-- 4. CHAPTER 01: THE STORY BEHIND EGYPTIAN KILIMS (SPLIT LAYOUT) -->
                <section class="story-chapter-split">
                    <div class="story-chapter-text-col">
                        <div class="chapter-eyebrow">
                            <span class="eyebrow-num">01</span>
                            <span class="eyebrow-divider">/</span>
                            <span class="eyebrow-title">HERITAGE &amp; ROOTS</span>
                        </div>
                        <h2 class="editorial-block-title">The Story Behind Egyptian Kilims</h2>
                        <div class="story-paragraphs">
                            <p class="editorial-text">
                                Egyptian kilims are part of a rich tradition of handcraftsmanship rooted in Egyptian culture and heritage.
                                Through their vibrant colors, intricate geometric patterns, and time-honored weaving techniques, each piece reflects the mastery and soul of the artisan who created it.
                            </p>
                            <p class="editorial-text">
                                At <strong>Yadawy</strong>, we celebrate this living craft through authentic handmade pieces, each possessing its own unique character, warmth, and enduring narrative.
                            </p>
                        </div>
                        <div class="story-detail-badges">
                            <div class="detail-badge-item">
                                <span class="detail-icon">✦</span>
                                <div>
                                    <strong>Living Heritage</strong>
                                    <span>Centuries of Egyptian weaving legacy</span>
                                </div>
                            </div>
                            <div class="detail-badge-item">
                                <span class="detail-icon">✦</span>
                                <div>
                                    <strong>One-of-a-Kind</strong>
                                    <span>No two handmade pieces are identical</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="story-chapter-media-col">
                        <div class="story-media-stack">
                            <div class="story-image-frame primary-frame">
                                <img 
                                    src="/images/story/story_editorial_rug_vignette.webp" 
                                    alt="Authentic handcrafted Egyptian kilim rug in a sun-drenched Mediterranean villa setting" 
                                    class="story-photo"
                                    loading="lazy"
                                />
                                <div class="story-photo-caption">Authentic Egyptian kilim handwoven with soul, warmth, and enduring narrative</div>
                            </div>
                            <div class="story-image-frame secondary-inset">
                                <img 
                                    src="/images/story/story_interior_detail.webp" 
                                    alt="Intimate editorial detail of flatweave kilim texture and handcrafted ceramics" 
                                    class="story-photo-inset"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 5. FULL-WIDTH ATMOSPHERIC CRAFT INTERLUDE -->
                <section class="story-visual-break" aria-label="Visual Craftsmanship Showcase">
                    <div class="story-visual-break-inner">
                        <img 
                            src="/images/story/story_workshop_heritage.webp" 
                            alt="Full-width atmospheric showcase of traditional Egyptian weaving atelier" 
                            class="story-visual-break-img"
                            loading="lazy"
                        />
                        <div class="story-visual-break-scrim">
                            <div class="story-break-content">
                                <span class="break-tag">PURE TIMELESS ELEGANCE</span>
                                <h3 class="break-quote">"A tapestry of Egyptian soul, woven to bring warmth into every home."</h3>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 6. CHAPTER 02: MATERIALS & CRAFTSMANSHIP (REVERSE SPLIT) -->
                <section class="story-chapter-split reverse-split">
                    <div class="story-chapter-media-col">
                        <div class="story-media-dual">
                            <div class="dual-image-card">
                                <img 
                                    src="/images/story/story_wool_macro.webp" 
                                    alt="High-detail macro texture of natural Egyptian wool yarns" 
                                    class="story-photo"
                                    loading="lazy"
                                />
                                <span class="dual-caption">High-Grade Egyptian Wool</span>
                            </div>
                            <div class="dual-image-card">
                                <img 
                                    src="/images/story/story_editorial_craft_detail.webp" 
                                    alt="Handcrafted flatweave kilim draped on solid wood bench in soft daylight" 
                                    class="story-photo"
                                    loading="lazy"
                                />
                                <span class="dual-caption">Pure Cotton Foundation</span>
                            </div>
                        </div>
                    </div>
                    <div class="story-chapter-text-col">
                        <div class="chapter-eyebrow">
                            <span class="eyebrow-num">02</span>
                            <span class="eyebrow-divider">/</span>
                            <span class="eyebrow-title">MATERIALS &amp; MASTERY</span>
                        </div>
                        <h2 class="editorial-block-title">Materials &amp; Craftsmanship</h2>
                        <div class="story-paragraphs">
                            <p class="editorial-text">
                                Our kilims and rugs are meticulously made with high-quality Egyptian wool on a durable pure cotton foundation, carefully selected for lasting quality and an authentic handmade touch.
                            </p>
                            <p class="editorial-text">
                                With proper care, a handmade Yadawy kilim is built to last <strong>20 to 50 years or more</strong>. To ensure complete peace of mind, every Yadawy piece comes with a <strong>1-Year Warranty</strong> and access to our specialized rug care &amp; cleaning services.
                            </p>
                        </div>
                        <div class="story-durability-banner">
                            <div class="durability-item">
                                <span class="durability-num">20–50+</span>
                                <span class="durability-label">Years Lifespan</span>
                            </div>
                            <div class="durability-divider"></div>
                            <div class="durability-item">
                                <span class="durability-num">1-Year</span>
                                <span class="durability-label">Official Warranty</span>
                            </div>
                            <div class="durability-divider"></div>
                            <div class="durability-item">
                                <span class="durability-num">100%</span>
                                <span class="durability-label">Natural Fibers</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 7. EDITORIAL 3-IMAGE CRAFT GALLERY -->
                <section class="story-editorial-gallery-section">
                    <div class="gallery-header-row">
                        <span class="gallery-subtitle">VISUAL ARCHIVE</span>
                        <h3 class="gallery-title">The Anatomy of a Handmade Rug</h3>
                        <p class="gallery-desc">Every thread, knot, and color tells an authentic Egyptian story of patience and artistry.</p>
                    </div>
                    <div class="story-editorial-gallery">
                        <div class="story-gallery-card">
                            <div class="gallery-img-container">
                                <img 
                                    src="/images/story/story_wool_macro.webp" 
                                    alt="Vibrant natural wool color palette and dyes" 
                                    class="gallery-img"
                                    loading="lazy"
                                />
                            </div>
                            <div class="gallery-card-content">
                                <span class="gallery-card-num">01</span>
                                <h4 class="gallery-card-title">Natural Egyptian Wool</h4>
                                <p class="gallery-card-text">Rich natural wool fibers hand-dyed to preserve earthy warmth and vibrant resilience.</p>
                            </div>
                        </div>
                        <div class="story-gallery-card">
                            <div class="gallery-img-container">
                                <img 
                                    src="/images/story/story_artisan_loom.webp" 
                                    alt="Traditional vertical wooden loom with warp threads" 
                                    class="gallery-img"
                                    loading="lazy"
                                />
                            </div>
                            <div class="gallery-card-content">
                                <span class="gallery-card-num">02</span>
                                <h4 class="gallery-card-title">The Traditional Wooden Loom</h4>
                                <p class="gallery-card-text">Hand-tensioned cotton warps where master artisans weave each row with deliberate precision.</p>
                            </div>
                        </div>
                        <div class="story-gallery-card">
                            <div class="gallery-img-container">
                                <img 
                                    src="/images/story/story_editorial_lifestyle.webp" 
                                    alt="Finished Yadawy handmade kilim in a warm interior space" 
                                    class="gallery-img"
                                    loading="lazy"
                                />
                            </div>
                            <div class="gallery-card-content">
                                <span class="gallery-card-num">03</span>
                                <h4 class="gallery-card-title">Timeless Living Space</h4>
                                <p class="gallery-card-text">Heirloom masterpieces designed to anchor rooms with warmth, authenticity, and distinction.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 8. BRAND PILLARS GRID -->
                <section class="story-pillars-section">
                    <div class="pillars-section-header">
                        <span class="pillars-badge">OUR COMMITMENT</span>
                        <h3 class="pillars-main-title">The Yadawy Promise</h3>
                    </div>
                    <div class="about-pillars-grid">
                        <div class="about-pillar-card">
                            <div class="pillar-icon-box">
                                <span class="pillar-icon">✦</span>
                            </div>
                            <h3 class="pillar-title">100% Handwoven</h3>
                            <p class="pillar-text">Crafted knot by knot on traditional looms by master Egyptian artisans across Egypt.</p>
                        </div>
                        <div class="about-pillar-card">
                            <div class="pillar-icon-box">
                                <span class="pillar-icon">✦</span>
                            </div>
                            <h3 class="pillar-title">Natural Egyptian Wool</h3>
                            <p class="pillar-text">Authentic high-grade natural wool on a durable pure cotton foundation.</p>
                        </div>
                        <div class="about-pillar-card">
                            <div class="pillar-icon-box">
                                <span class="pillar-icon">✦</span>
                            </div>
                            <h3 class="pillar-title">1-Year Warranty</h3>
                            <p class="pillar-text">Every handmade piece includes a 1-year warranty and professional care support.</p>
                        </div>
                        <div class="about-pillar-card">
                            <div class="pillar-icon-box">
                                <span class="pillar-icon">✦</span>
                            </div>
                            <h3 class="pillar-title">Egypt-Wide Delivery</h3>
                            <p class="pillar-text">Fast delivery within 3–5 business days to Cairo, Alexandria, Giza and all governorates with Cash on Delivery.</p>
                        </div>
                    </div>
                </section>

                <!-- 9. EDITORIAL ACTION & CONCIERGE BAR -->
                <section class="story-cta-section">
                    <div class="story-cta-card">
                        <div class="cta-badge">EXPERIENCE YADAWY</div>
                        <h3 class="cta-title">Bring Home an Authentic Egyptian Piece</h3>
                        <p class="cta-subtitle">Explore our curated collections or consult directly with our kilim specialists.</p>
                        <div class="editorial-cta-bar">
                            <a href="#/kilim-guide" class="editorial-btn">EXPLORE KILIM GUIDE →</a>
                            <a href="#/shop" class="editorial-btn-secondary">BROWSE COLLECTION →</a>
                            <a href="${config.primaryWhatsapp?.url || '#'}" target="_blank" rel="noopener" class="editorial-btn-whatsapp">
                                <span style="display:inline-flex; align-items:center; gap:8px;">${SVG_ICONS.whatsapp}<span>CHAT ON WHATSAPP</span></span>
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;
}

// Global video controls & robust continuous autoplay helper for Our Story page
window.initStoryBrandVideo = function() {
    try {
        const video = document.getElementById('story-brand-video');
        const soundBtn = document.getElementById('story-sound-btn');
        const playBtn = document.getElementById('story-play-btn');
        const soundPrompt = document.getElementById('story-sound-prompt');
        if (!video || typeof video.play !== 'function') return;

        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.controls = false;

        // First attempt autoplay with sound enabled
        video.muted = false;
        video.volume = 1.0;

        const startPlayback = () => {
            try {
                const promise = video.play();
                if (promise !== undefined && promise !== null && typeof promise.then === 'function') {
                    promise.then(() => {
                        if (soundBtn) {
                            const icon = soundBtn.querySelector('.btn-icon');
                            const text = soundBtn.querySelector('.btn-text');
                            if (icon) icon.textContent = 'SOUND ON';
                            if (text) text.textContent = 'SOUND ON';
                            soundBtn.classList.add('active');
                        }
                        if (soundPrompt) soundPrompt.style.display = 'none';
                    }).catch(() => {
                        // Browser restricted audio autoplay; fallback to muted autoplay immediately
                        video.muted = true;
                        video.play().then(() => {
                            if (soundBtn) {
                                const icon = soundBtn.querySelector('.btn-icon');
                                const text = soundBtn.querySelector('.btn-text');
                                if (icon) icon.textContent = 'MUTE';
                                if (text) text.textContent = 'UNMUTE SOUND';
                                soundBtn.classList.remove('active');
                            }
                            if (soundPrompt) soundPrompt.style.display = 'flex';
                        }).catch(() => {});
                    });
                }
            } catch (err) {
                // Ignore playback restriction exceptions
            }
        };

        startPlayback();

        if (typeof video.addEventListener === 'function') {
            video.addEventListener('ended', function() {
                try {
                    video.currentTime = 0;
                    video.play().catch(() => {});
                } catch (e) {}
            });

            video.addEventListener('play', function() {
                if (playBtn) {
                    const icon = playBtn.querySelector('.btn-icon');
                    const text = playBtn.querySelector('.btn-text');
                    if (icon) icon.textContent = '⏸';
                    if (text) text.textContent = 'PAUSE';
                    playBtn.classList.remove('paused');
                }
            });

            video.addEventListener('pause', function() {
                if (playBtn) {
                    const icon = playBtn.querySelector('.btn-icon');
                    const text = playBtn.querySelector('.btn-text');
                    if (icon) icon.textContent = '▶';
                    if (text) text.textContent = 'PLAY';
                    playBtn.classList.add('paused');
                }
            });
        }
    } catch (err) {
        console.warn('initStoryBrandVideo safe handling:', err);
    }
};

window.enableStoryVideoSound = function(e) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    const video = document.getElementById('story-brand-video');
    const soundBtn = document.getElementById('story-sound-btn');
    const soundPrompt = document.getElementById('story-sound-prompt');
    if (!video) return;

    video.muted = false;
    video.volume = 1.0;
    if (video.paused) video.play().catch(() => {});

    if (soundBtn) {
        soundBtn.querySelector('.btn-icon').textContent = 'SOUND ON';
        soundBtn.querySelector('.btn-text').textContent = 'SOUND ON';
        soundBtn.classList.add('active');
    }
    if (soundPrompt) soundPrompt.style.display = 'none';
};

window.toggleStoryVideoSound = function(e, btn) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    const video = document.getElementById('story-brand-video');
    const soundPrompt = document.getElementById('story-sound-prompt');
    if (!video) return;

    if (video.muted) {
        video.muted = false;
        video.volume = 1.0;
        if (btn) {
            btn.querySelector('.btn-icon').textContent = 'SOUND ON';
            btn.querySelector('.btn-text').textContent = 'SOUND ON';
            btn.classList.add('active');
        }
        if (soundPrompt) soundPrompt.style.display = 'none';
    } else {
        video.muted = true;
        if (btn) {
            btn.querySelector('.btn-icon').textContent = 'MUTE';
            btn.querySelector('.btn-text').textContent = 'UNMUTE SOUND';
            btn.classList.remove('active');
        }
    }
};

window.toggleStoryVideoPlay = function(e, btn) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    const video = document.getElementById('story-brand-video');
    if (!video) return;

    if (video.paused) {
        video.play().catch(() => {});
        if (btn) {
            btn.querySelector('.btn-icon').textContent = '⏸';
            btn.querySelector('.btn-text').textContent = 'PAUSE';
            btn.classList.remove('paused');
        }
    } else {
        video.pause();
        if (btn) {
            btn.querySelector('.btn-icon').textContent = '▶';
            btn.querySelector('.btn-text').textContent = 'PLAY';
            btn.classList.add('paused');
        }
    }
};

window.handleStoryVideoFrameClick = function(e) {
    // If user clicked the frame outside of direct buttons, unmute and ensure playback
    const video = document.getElementById('story-brand-video');
    if (!video) return;
    if (video.muted) {
        window.enableStoryVideoSound(e);
    }
};

// ============================================================
// CONTACT US PAGE (OFFICIAL DOCUMENT DATA ONLY)
// ============================================================
function renderContactPage() {
    const config = window.YADAWY_CONFIG || {};

    return `
        <div class="editorial-page-hero">
            <div class="editorial-hero-badge">WE ARE HERE TO ASSIST YOU</div>
            <h1 class="editorial-hero-title">Contact Us</h1>
            <p class="editorial-hero-subtitle">Our Yadawy team is here to help you find the kilim that's right for your home.</p>
        </div>

        <div class="editorial-content-container">
            <div class="contact-grid-layout">
                <!-- Left: Official Contact Cards -->
                <div class="contact-channels-column">
                    <!-- Mobile Phones Card -->
                    <div class="contact-channel-card">
                        <div class="channel-card-header">
                            <span class="channel-card-icon">${SVG_ICONS.whatsapp}</span>
                            <div>
                                <h3 class="channel-card-title">Mobile &amp; WhatsApp</h3>
                                <p class="channel-card-subtitle">Direct inquiries, order support &amp; sizing assistance</p>
                            </div>
                        </div>
                        <div class="channel-links-group">
                            <div class="channel-item">
                                <a href="tel:01069005565" class="channel-phone-link">0106 900 5565</a>
                                <a href="https://wa.me/201069005565" target="_blank" rel="noopener" class="channel-wa-badge">WhatsApp Chat →</a>
                            </div>
                            <div class="channel-item">
                                <a href="tel:01039555155" class="channel-phone-link">0103 955 5155</a>
                                <a href="https://wa.me/201039555155" target="_blank" rel="noopener" class="channel-wa-badge">WhatsApp Chat →</a>
                            </div>
                            <div class="channel-item">
                                <a href="tel:01225910140" class="channel-phone-link">0122 591 0140</a>
                                <span class="channel-phone-badge">Phone Only</span>
                            </div>
                        </div>
                    </div>

                    <!-- Landline Card -->
                    <div class="contact-channel-card">
                        <div class="channel-card-header">
                            <span class="channel-card-icon">${SVG_ICONS.phone}</span>
                            <div>
                                <h3 class="channel-card-title">Landline</h3>
                                <p class="channel-card-subtitle">Direct line assistance</p>
                            </div>
                        </div>
                        <div class="channel-links-group">
                            <a href="tel:035427565" class="channel-phone-link highlight">03 542 7565</a>
                        </div>
                    </div>

                    <!-- Social Media Card -->
                    <div class="contact-channel-card">
                        <div class="channel-card-header">
                            <span class="channel-card-icon">✦</span>
                            <div>
                                <h3 class="channel-card-title">Social Channels</h3>
                                <p class="channel-card-subtitle">Follow our latest collections and artisan stories</p>
                            </div>
                        </div>
                        <div class="contact-social-pills">
                            <a href="https://www.instagram.com/yadawy0/" target="_blank" rel="noopener" class="contact-social-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                                <span>Instagram (@yadawy0)</span>
                            </a>
                            <a href="https://www.facebook.com/share/1EeqnwUzCw/" target="_blank" rel="noopener" class="contact-social-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                                <span>Facebook Page</span>
                            </a>
                        </div>
                    </div>

                    <!-- Services & Delivery Info Card -->
                    <div class="contact-info-banner">
                        <div class="info-banner-item">
                            <strong>Delivery Coverage:</strong> Cairo, Alexandria, Giza &amp; all cities and governorates across Egypt (3–5 business days).
                        </div>
                        <div class="info-banner-item">
                            <strong>Rug Cleaning Service:</strong> We provide professional cleaning services for all types of rugs. Inquire via WhatsApp or phone.
                        </div>
                        <div class="info-banner-item">
                            <strong>Custom Sizes &amp; Consultation:</strong> Send us your room measurements and photos on WhatsApp for personalized recommendations.
                        </div>
                    </div>
                </div>

                <!-- Right: Contact Message Form -->
                <div class="contact-form-column">
                    <div class="contact-form-card">
                        <h3 class="form-card-title">Send Us a Message</h3>
                        <p class="form-card-desc">Leave your details and our team will get back to you promptly.</p>
                        <form id="public-contact-form" onsubmit="handleContactSubmit(event)">
                            <div class="form-group">
                                <label class="form-label">Full Name *</label>
                                <input type="text" class="form-input" name="name" id="contact-name" placeholder="Your name" required minlength="2">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email Address</label>
                                <input type="email" class="form-input" name="email" id="contact-email" placeholder="example@email.com">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Phone Number *</label>
                                <input type="tel" class="form-input" name="phone" id="contact-phone" placeholder="01XXXXXXXXX" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Inquiry Type</label>
                                <select class="form-input" name="inquiry_type" id="contact-inquiry-type">
                                    <option value="General Inquiries & Orders">General Inquiries &amp; Orders</option>
                                    <option value="Size & Space Recommendation">Size &amp; Space Recommendation</option>
                                    <option value="Rug Cleaning Service Booking">Rug Cleaning Service Booking</option>
                                    <option value="Custom Rug Request">Custom Rug Request</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Message *</label>
                                <textarea class="form-textarea" name="message" id="contact-message" placeholder="How can we assist you with our rugs and collections?" rows="4" required minlength="5"></textarea>
                            </div>
                            <button type="submit" id="contact-submit-btn" class="btn-submit" style="width:100%;margin-top:12px">
                                SEND INQUIRY
                            </button>
                        </form>
                        <div id="contact-msg" style="margin-top:16px;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = document.getElementById('contact-submit-btn') || form.querySelector('button[type="submit"]');
    const msgContainer = document.getElementById('contact-msg');

    const name = form.name?.value?.trim();
    const email = form.email?.value?.trim();
    const phone = form.phone?.value?.trim();
    const inquiry_type = form.inquiry_type?.value || 'General Inquiries & Orders';
    const message = form.message?.value?.trim();

    if (!name || name.length < 2) {
        if (msgContainer) {
            msgContainer.innerHTML = `<div style="padding:12px 16px; background:#FCE8E6; border:1px solid #F5C6CB; border-radius:6px; color:#721C24; font-size:13px;">Please enter your full name.</div>`;
        }
        return;
    }

    if (!phone && !email) {
        if (msgContainer) {
            msgContainer.innerHTML = `<div style="padding:12px 16px; background:#FCE8E6; border:1px solid #F5C6CB; border-radius:6px; color:#721C24; font-size:13px;">Please provide a phone number or email address so we can reach you.</div>`;
        }
        return;
    }

    if (!message || message.length < 5) {
        if (msgContainer) {
            msgContainer.innerHTML = `<div style="padding:12px 16px; background:#FCE8E6; border:1px solid #F5C6CB; border-radius:6px; color:#721C24; font-size:13px;">Please enter a message (at least 5 characters).</div>`;
        }
        return;
    }

    // Disable button to prevent duplicate submissions
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
        submitBtn.textContent = 'SENDING INQUIRY...';
        submitBtn.style.opacity = '0.7';
    }

    if (msgContainer) {
        msgContainer.innerHTML = '';
    }

    try {
        const response = await API.submitContact({
            name,
            email: email || null,
            phone: phone || null,
            subject: inquiry_type,
            inquiry_type,
            message
        });

        if (msgContainer) {
            msgContainer.innerHTML = `
                <div style="padding:14px 18px; background:#E6F4EA; border:1px solid #C3E6CB; border-radius:8px; color:#155724; font-size:13.5px; line-height:1.5; text-align:left;">
                    <div style="font-weight:700; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
                        <span>✓</span> Message Sent Successfully!
                    </div>
                    <div>${response.message || 'Thank you for reaching out to Yadawy. Our team has received your submission and will contact you promptly.'}</div>
                </div>
            `;
        }

        form.reset();
    } catch (err) {
        console.error('Contact submission error:', err);
        if (msgContainer) {
            msgContainer.innerHTML = `
                <div style="padding:14px 18px; background:#FCE8E6; border:1px solid #F5C6CB; border-radius:8px; color:#721C24; font-size:13.5px; line-height:1.5; text-align:left;">
                    <div style="font-weight:700; margin-bottom:4px;">Submission Failed</div>
                    <div>${err.message || 'An error occurred while sending your message. Please try again or reach out directly on WhatsApp.'}</div>
                </div>
            `;
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'SEND INQUIRY';
            submitBtn.style.opacity = '1';
        }
    }
}

// ============================================================
// RETURN & REFUND POLICY PAGE (OFFICIAL DOCUMENT CONTENT)
// ============================================================
function renderReturnPolicyPage() {
    return `
        <div class="editorial-page-hero">
            <div class="editorial-hero-badge">CLIENT CARE &amp; ASSURANCE</div>
            <h1 class="editorial-hero-title">Return &amp; Refund Policy</h1>
            <p class="editorial-hero-subtitle">Simple and comfortable shopping from selection to delivery.</p>
        </div>

        <div class="editorial-content-container">
            <div class="policy-card">
                <p class="policy-intro">
                    We want your shopping experience with Yadawy to be simple and comfortable, from choosing your product to having it delivered to your door.
                </p>

                <div class="policy-section-block">
                    <h2 class="policy-heading">14-Day Return Window</h2>
                    <p class="policy-text">
                        You can return your order within <strong>14 days of delivery</strong>, provided the item is unused, in its original condition, with its packaging and tags intact.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Non-Returnable Items</h2>
                    <ul class="policy-list">
                        <li>Custom-made or personalized products.</li>
                        <li>Sale or discounted items, unless defective.</li>
                    </ul>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Damaged or Incorrect Items</h2>
                    <p class="policy-text">
                        Please contact us within <strong>48 hours of delivery</strong> with clear photos if you receive a damaged, defective, or incorrect item.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Refunds</h2>
                    <ul class="policy-list">
                        <li>Once your return is approved and received, your refund will be processed within <strong>7–10 business days</strong> to your original payment method.</li>
                        <li>Return shipping costs are the customer's responsibility, unless the issue was caused by us.</li>
                    </ul>
                </div>

                <div class="policy-contact-box">
                    <h3 class="policy-contact-title">Need Help with a Return?</h3>
                    <p class="policy-contact-desc">Our client care team is ready to assist you:</p>
                    <div class="policy-contact-numbers">
                        <a href="tel:+201069005565" style="font-weight:700; color:var(--color-maroon);">+20 10 69005565</a>
                    </div>
                    <div class="policy-contact-landline">Landline: <a href="tel:035427565">03 542 7565</a></div>
                    <p class="policy-tagline">Yadawy.. A Piece That Tells a Story.</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// SHIPPING POLICY PAGE (OFFICIAL DOCUMENT CONTENT)
// ============================================================
function renderShippingPolicyPage() {
    return `
        <div class="editorial-page-hero">
            <div class="editorial-hero-badge">DELIVERY &amp; FULFILLMENT</div>
            <h1 class="editorial-hero-title">Shipping Policy</h1>
            <p class="editorial-hero-subtitle">Every Yadawy piece has a story, and we make sure it reaches you safely.</p>
        </div>

        <div class="editorial-content-container">
            <div class="policy-card">
                <p class="policy-intro">
                    Every Yadawy piece has a story, and we make sure it reaches you safely and in the best condition.
                </p>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Delivery Coverage &amp; Timeframes</h2>
                    <p class="policy-text">
                        We currently ship within <strong>Egypt only</strong> (Cairo, Alexandria, Giza, and all major cities and governorates across Egypt).
                    </p>
                    <p class="policy-text">
                        Orders are typically delivered within <strong>3–5 business days</strong> for in-stock pieces.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Shipping Fees</h2>
                    <p class="policy-text">
                        Shipping fees are calculated at checkout based on the order weight, delivery address, and shipping provider.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Order Tracking</h2>
                    <p class="policy-text">
                        Once your order is shipped, you'll receive tracking details via <strong>SMS</strong>.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Payment Options</h2>
                    <p class="policy-text">
                        We offer convenient <strong>Cash on Delivery</strong> across Egypt as well as secure online payment methods.
                    </p>
                </div>

                <div class="policy-contact-box">
                    <h3 class="policy-contact-title">Need Help with Your Shipment?</h3>
                    <div class="policy-contact-numbers">
                        <a href="tel:+201069005565" style="font-weight:700; color:var(--color-maroon);">+20 10 69005565</a>
                    </div>
                    <div class="policy-contact-landline">Landline: <a href="tel:035427565">03 542 7565</a></div>
                    <p class="policy-tagline">Yadawy.. A Piece That Tells a Story.</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// FREQUENTLY ASKED QUESTIONS (FAQS) PAGE
// ============================================================
function renderFaqPage() {
    return `
        <div class="editorial-page-hero">
            <div class="editorial-hero-badge">HELP &amp; INQUIRIES</div>
            <h1 class="editorial-hero-title">Frequently Asked Questions</h1>
            <p class="editorial-hero-subtitle">Discover kilims with Yadawy — from their story and materials to choosing the right size and caring for your piece.</p>
        </div>

        <div class="editorial-content-container">
            <!-- Category 1: About Kilims -->
            <div class="faq-category-card">
                <h2 class="faq-category-title">About Our Kilims &amp; Craftsmanship</h2>
                <div class="faq-items-list">
                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>What Is a Kilim?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            A kilim is a flat-woven rug made without knots or pile. Lightweight yet durable, it works beautifully on both floors and walls.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>Are Yadawy Kilims Handmade?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            Absolutely! Every Yadawy kilim is 100% handwoven by Egyptian artisans using traditional techniques passed down through generations. Each piece is unique and takes weeks to complete.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>What Are Kilims Made Of?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            Our kilims are made with high-quality Egyptian wool on a durable cotton foundation, carefully selected for lasting quality and an authentic handmade feel.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>How Long Does a Kilim Last?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            With proper care, a handmade kilim can last 20–50 years or more. Every Yadawy piece comes with a 1-year warranty.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Category 2: Kilim Care & Services -->
            <div class="faq-category-card">
                <h2 class="faq-category-title">Kilim Care &amp; Rug Cleaning Service</h2>
                <div class="faq-items-list">
                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>How do I clean my kilim rug?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            We recommend professional rug cleaning. For small stains, use cold water with a mild, bleach-free detergent. Avoid harsh chemicals and tumble dryers.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>Can I use my kilim rug outdoors?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            Our kilims are made for indoor use. Prolonged exposure to sunlight and moisture can affect the natural fibers and colors.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>Is the rug reversible?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            Yes! Kilims are flat-woven, so both sides can be used. Flipping your rug from time to time can help keep it in good condition.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>Does Yadawy offer rug cleaning services?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            Yes! We clean all types of rugs, not just kilims, and treat each material with the care it needs.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>How can I book a rug cleaning service?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            Contact us through our website, phone, or WhatsApp, and our team will help you with the next steps.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Category 3: Ordering, Shipping & Returns -->
            <div class="faq-category-card">
                <h2 class="faq-category-title">Ordering, Shipping &amp; Returns</h2>
                <div class="faq-items-list">
                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>Do you ship to all cities in Egypt?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            Yes! We ship to Cairo, Alexandria, Giza, and all major cities and governorates across Egypt. Delivery typically takes 3–5 business days for in-stock items.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>Do you offer cash on delivery?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            Yes, we offer cash on delivery across Egypt.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>What is your return policy?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            Returns and exchanges are accepted within 14 days of delivery, as long as the rug is unused and in its original condition with tags attached.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>Are delivery fees refundable?</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            Delivery fees are non-refundable. Exchanges for a different size or design are available at no extra cost.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact Box -->
            <div class="policy-contact-box" style="margin-top:40px">
                <h3 class="policy-contact-title">Still Have Questions?</h3>
                <p class="policy-contact-desc">Can't find the answer you're looking for? Our team is here to help:</p>
                <div class="policy-contact-numbers">
                    <a href="tel:+201069005565" style="font-weight:700; color:var(--color-maroon);">+20 10 69005565</a>
                </div>
                <div class="policy-contact-landline">Landline: <a href="tel:035427565">03 542 7565</a></div>
                <p class="policy-tagline">Yadawy.. A Piece That Tells a Story.</p>
            </div>
        </div>
    `;
}

function toggleFaq(btn) {
    btn.classList.toggle('active');
    const answer = btn.nextElementSibling;
    if (answer) {
        answer.classList.toggle('open');
    }
}

// ============================================================
// KILIM GUIDE PAGE ("WHAT IS A KILIM RUG?")
// ============================================================
function renderKilimGuidePage() {
    return `
        <div class="editorial-page-hero">
            <div class="editorial-hero-badge">THE KILIM GUIDE</div>
            <h1 class="editorial-hero-title">What Is a Kilim Rug?</h1>
            <p class="editorial-hero-subtitle">Distinctive flat-woven art combining cultural heritage and timeless craftsmanship.</p>
        </div>

        <div class="editorial-content-container">
            <div class="guide-article">
                <!-- Section 1 -->
                <div class="guide-section-block">
                    <h2 class="guide-section-title">1. What Is a Kilim Rug?</h2>
                    <p class="guide-section-text">
                        A kilim is a flat-woven rug made without pile or knots. It's lightweight, durable, and combines distinctive patterns with traditional craftsmanship.
                    </p>
                    <p class="guide-section-text">
                        Each kilim has its own character, adding a warm and authentic touch to any space.
                    </p>
                </div>

                <!-- Section 2 -->
                <div class="guide-section-block">
                    <h2 class="guide-section-title">2. Kilim vs. Traditional Rugs: What's the Difference?</h2>
                    <p class="guide-section-text">
                        The main difference between kilims and traditional rugs is how they are made.
                    </p>
                    <p class="guide-section-text">
                        Kilims are flat-woven without pile, making them lighter and easier to move and store. Traditional rugs are usually thicker and have a pile surface.
                    </p>
                    <p class="guide-section-text">
                        The right choice depends on your style, how you plan to use the rug, and your space.
                    </p>
                </div>

                <!-- Section 3 -->
                <div class="guide-section-block">
                    <h2 class="guide-section-title">3. How Are Kilim Rugs Made?</h2>
                    <p class="guide-section-text">
                        Kilim rugs are woven by hand on a loom using warp and weft threads, with each row carefully woven to create the design.
                    </p>
                    <p class="guide-section-text">
                        Once the pattern is complete, the edges are secured and the piece is carefully finished. The process takes time and skill, which is part of what makes every handmade piece special.
                    </p>
                </div>

                <!-- Section 4 -->
                <div class="guide-section-block">
                    <h2 class="guide-section-title">4. How to Care for Your Kilim</h2>
                    <ul class="guide-checklist">
                        <li>✦ Vacuum gently and regularly to remove dust.</li>
                        <li>✦ Blot spills immediately and avoid harsh chemicals.</li>
                        <li>✦ Keep your kilim away from prolonged direct sunlight.</li>
                        <li>✦ Professional cleaning is recommended when needed.</li>
                        <li>✦ When storing, roll your kilim instead of folding it to prevent creases.</li>
                    </ul>
                </div>

                <!-- Section 5 -->
                <div class="guide-section-block">
                    <h2 class="guide-section-title">5. The Story Behind Egyptian Kilims</h2>
                    <p class="guide-section-text">
                        Egyptian kilims are part of a rich tradition of handcraftsmanship rooted in Egyptian culture and heritage.
                        Through their colors, patterns, and weaving techniques, each piece reflects the skill of the artisan who made it.
                    </p>
                    <p class="guide-section-text">
                        At Yadawy, we celebrate this craft through handmade pieces, each with its own details and character.
                    </p>
                </div>

                <div class="policy-contact-box" style="margin-top:40px">
                    <p class="policy-tagline" style="font-size:18px">Yadawy.. A Piece That Tells a Story.</p>
                    <div style="margin-top:16px">
                        <a href="#/shop?section=kilims" class="editorial-btn">EXPLORE KILIMS →</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// SIZE GUIDE PAGE ("WHY DOES KILIM SIZE MATTER?")
// ============================================================
function renderSizeGuidePage() {
    return `
        <div class="editorial-page-hero">
            <div class="editorial-hero-badge">MEASURE &amp; FIT</div>
            <h1 class="editorial-hero-title">Why Does Kilim Size Matter?</h1>
            <p class="editorial-hero-subtitle">Choosing the right kilim size can completely change the look of your space, making it feel warmer and more balanced.</p>
        </div>

        <div class="editorial-content-container">
            <div class="guide-article">
                <p class="guide-section-text" style="font-size:16px;line-height:1.9">
                    Before choosing a size, consider the room size, furniture placement, and how you plan to use the space.
                </p>

                <h2 class="guide-section-title" style="margin-top:36px">Choosing the Right Size by Room</h2>

                <div class="room-size-grid">
                    <!-- Living Room -->
                    <div class="room-size-card">
                        <div class="room-size-header">
                            <span class="room-icon">✦</span>
                            <h3 class="room-name">Living Room</h3>
                        </div>
                        <p class="room-size-desc">
                            A <strong>120 × 180 cm</strong> kilim works well in smaller spaces and under a coffee table, while larger sizes like <strong>150 × 240 cm</strong> are better suited for spacious seating areas.
                        </p>
                    </div>

                    <!-- Dining Room -->
                    <div class="room-size-card">
                        <div class="room-size-header">
                            <span class="room-icon">✦</span>
                            <h3 class="room-name">Dining Room</h3>
                        </div>
                        <p class="room-size-desc">
                            Choose a kilim that extends about <strong>60 cm beyond the table</strong> on each side, so the chairs remain on the rug even when pulled back.
                        </p>
                    </div>

                    <!-- Bedroom -->
                    <div class="room-size-card">
                        <div class="room-size-header">
                            <span class="room-icon">✦</span>
                            <h3 class="room-name">Bedroom</h3>
                        </div>
                        <p class="room-size-desc">
                            A <strong>medium-sized</strong> kilim works well beside the bed, while a larger one can be placed under the lower part of the bed to add warmth to the space.
                        </p>
                    </div>

                    <!-- Entrances & Hallways -->
                    <div class="room-size-card">
                        <div class="room-size-header">
                            <span class="room-icon">✦</span>
                            <h3 class="room-name">Entrances &amp; Hallways</h3>
                        </div>
                        <p class="room-size-desc">
                            A <strong>60 × 180 cm runner</strong> is a great choice for narrow spaces, entryways, and hallways.
                        </p>
                    </div>
                </div>

                <div class="guide-section-block" style="margin-top:40px">
                    <h2 class="guide-section-title">Before You Choose</h2>
                    <p class="guide-section-text">
                        Measure your space and consider your furniture placement. Ideally, the front legs of your sofa and chairs should sit on the kilim to help bring the elements of the room together.
                    </p>
                    <p class="guide-section-text">
                        If you have an unusually shaped space, a custom size may be the best option.
                    </p>
                </div>

                <!-- WhatsApp Consultation Box -->
                <div class="consultation-box">
                    <div class="consultation-icon">✦</div>
                    <h3 class="consultation-title">Need Help Choosing the Right Size?</h3>
                    <p class="consultation-desc">
                        Not sure which size works best for your space? Send us your space measurements and a photo on WhatsApp, and we'll help you choose the right kilim for your space.
                    </p>
                    <div class="consultation-actions">
                        <a href="https://wa.me/2+20 10 39555155" target="_blank" rel="noopener" class="editorial-btn-whatsapp">
                            Send Photos on WhatsApp (+20 10 39555155)
                        </a>
                    </div>
                    <div class="policy-contact-numbers" style="margin-top:16px">
                        +20 10 39555155 | Landline: 035427565
                    </div>
                    <p class="policy-tagline" style="margin-top:16px">Yadawy.. A Piece That Tells a Story.</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// KILIM CARE GUIDE PAGE
// ============================================================
function renderCareGuidePage() {
    return `
        <div class="editorial-page-hero">
            <div class="editorial-hero-badge">PRESERVATION &amp; CARE</div>
            <h1 class="editorial-hero-title">Kilim Care Guide</h1>
            <p class="editorial-hero-subtitle">Simple tips to keep your handmade kilim looking beautiful for decades.</p>
        </div>

        <div class="editorial-content-container">
            <div class="guide-article">
                <!-- Everyday Care -->
                <div class="care-pillar-section">
                    <h2 class="care-section-title">Everyday Care</h2>
                    <ul class="guide-checklist">
                        <li>✦ Gently vacuum your kilim once or twice a week and avoid rotating brushes.</li>
                        <li>✦ Rotate your kilim regularly to distribute wear and help prevent uneven fading.</li>
                        <li>✦ Use a non-slip Rug Pad to reduce friction and protect your kilim.</li>
                        <li>✦ Gently shake your kilim to remove loose dust and dirt.</li>
                    </ul>
                </div>

                <!-- Cleaning -->
                <div class="care-pillar-section">
                    <h2 class="care-section-title">Cleaning Your Kilim</h2>
                    <ul class="guide-checklist">
                        <li>✦ For spills, blot immediately with a clean cloth without rubbing.</li>
                        <li>✦ Use mild soap and water when needed, and test it first on a hidden area.</li>
                        <li>✦ For deep cleaning, we recommend professional cleaning, especially for larger kilims.</li>
                        <li>✦ Avoid bleach, harsh chemicals, steam, soaking, and machine washing.</li>
                    </ul>
                </div>

                <!-- Storage -->
                <div class="care-pillar-section">
                    <h2 class="care-section-title">Storage</h2>
                    <ul class="guide-checklist">
                        <li>✦ Make sure your kilim is completely clean and dry before storing it.</li>
                        <li>✦ Roll it instead of folding it to prevent creases and marks.</li>
                        <li>✦ Use a breathable cotton cloth and avoid plastic.</li>
                        <li>✦ Store it in a cool, dry place.</li>
                    </ul>
                </div>

                <!-- Common Issues -->
                <div class="care-pillar-section">
                    <h2 class="care-section-title">Common Issues</h2>
                    <ul class="guide-checklist">
                        <li>✦ <strong>Shedding:</strong> Some shedding is normal with new kilims and usually decreases with regular cleaning.</li>
                        <li>✦ <strong>Color fading:</strong> Limit direct sunlight and rotate your kilim regularly.</li>
                        <li>✦ <strong>Stubborn stains:</strong> Contact a professional instead of using harsh cleaning products.</li>
                    </ul>
                </div>

                <!-- Warranty & Cleaning Service -->
                <div class="care-pillar-section" style="background:var(--color-cream-light);padding:24px;border-left:3px solid var(--color-gold)">
                    <h2 class="care-section-title" style="margin-top:0">Warranty &amp; Professional Cleaning</h2>
                    <p class="guide-section-text">
                        At Yadawy, every rug comes with a <strong>1-year warranty</strong> from the date of delivery.
                    </p>
                    <p class="guide-section-text">
                        You can also contact us for our professional rug cleaning service, available for different types of rugs.
                    </p>
                </div>

                <div class="policy-contact-box" style="margin-top:40px">
                    <h3 class="policy-contact-title">Book a Professional Rug Cleaning</h3>
                    <div class="policy-contact-numbers">
                        <a href="tel:+201069005565" style="font-weight:700; color:var(--color-maroon);">+20 10 69005565</a>
                    </div>
                    <div class="policy-contact-landline">Landline: <a href="tel:035427565">03 542 7565</a></div>
                    <p class="policy-tagline">Yadawy.. A Piece That Tells a Story.</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// PRIVACY POLICY PAGE (OFFICIAL DOCUMENT CONTENT)
// ============================================================
function renderPrivacyPolicyPage() {
    return `
        <div class="editorial-page-hero">
            <div class="editorial-hero-badge">LEGAL &amp; PRIVACY</div>
            <h1 class="editorial-hero-title">Privacy Policy</h1>
            <p class="editorial-hero-subtitle">At Yadawy, we respect your privacy and are committed to protecting your personal information.</p>
        </div>

        <div class="editorial-content-container">
            <div class="policy-card">
                <p class="policy-intro">
                    At Yadawy, we respect your privacy and are committed to protecting your personal information when you use our website, contact us, or place an order.
                </p>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Information We Collect</h2>
                    <p class="policy-text">We may collect information needed to provide our services, such as:</p>
                    <ul class="policy-list">
                        <li>Your name and contact details, such as phone number and email address.</li>
                        <li>Delivery address and order details.</li>
                        <li>Payment information required to complete your purchase, depending on the payment method used.</li>
                        <li>Information you provide when contacting our customer service or sending an inquiry.</li>
                        <li>Certain technical information about your use of the website, such as your device type and browser, to improve website performance and your experience.</li>
                    </ul>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">How We Use Your Information</h2>
                    <p class="policy-text">We use the information we collect to:</p>
                    <ul class="policy-list">
                        <li>Process, fulfill, and deliver your orders.</li>
                        <li>Contact you regarding your orders or inquiries.</li>
                        <li>Provide customer service and support.</li>
                        <li>Improve our website, products, and shopping experience.</li>
                        <li>Send offers or marketing updates if you have agreed to receive them.</li>
                        <li>Protect our website and prevent fraud or unauthorized use.</li>
                        <li>Comply with applicable legal and regulatory requirements.</li>
                    </ul>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Sharing Your Information</h2>
                    <p class="policy-text">
                        We do not sell or rent your personal information. We may share certain information with trusted service providers who help us operate our business, such as shipping companies, payment providers, or technical service providers, only as necessary to fulfill orders and provide our services.
                    </p>
                    <p class="policy-text">
                        We may also disclose information when required by law or when necessary to protect our rights or the rights of our customers.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Cookies</h2>
                    <p class="policy-text">
                        Our website may use cookies and similar technologies to improve your browsing experience, remember certain preferences, and understand how our website is used. You can control or disable cookies through your browser settings.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Data Security &amp; Retention</h2>
                    <p class="policy-text">
                        We take reasonable measures to help protect your personal information from unauthorized access, use, or alteration. We retain your personal information only for as long as necessary to fulfill the purposes described in this Privacy Policy or as required by applicable laws and regulations.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Your Rights</h2>
                    <p class="policy-text">
                        Depending on applicable laws and regulations, you may have the right to request access to, correction of, or deletion of your personal information, or to ask how your information is being used. For any request related to your personal information, please contact us using the contact details provided on our website.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Third-Party Links &amp; Children's Privacy</h2>
                    <p class="policy-text">
                        Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these websites. Our services are not directed at children, and we do not knowingly collect personal information from children below the legally permitted age.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">Changes to This Privacy Policy</h2>
                    <p class="policy-text">
                        We may update this Privacy Policy from time to time to reflect changes in our services or how we handle personal information. Any updates will be posted on this page.
                    </p>
                </div>

                <div class="policy-contact-box">
                    <h3 class="policy-contact-title">Contact Us Regarding Privacy</h3>
                    <div class="policy-contact-numbers">
                        <a href="tel:+201069005565" style="font-weight:700; color:var(--color-maroon);">+20 10 69005565</a>
                    </div>
                    <div class="policy-contact-landline">Landline: <a href="tel:035427565">03 542 7565</a></div>
                    <p class="policy-tagline">Yadawy.. A Piece That Tells a Story.</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// TERMS OF SERVICE PAGE (OFFICIAL DOCUMENT CONTENT)
// ============================================================
function renderTermsPage() {
    return `
        <div class="editorial-page-hero">
            <div class="editorial-hero-badge">TERMS &amp; CONDITIONS</div>
            <h1 class="editorial-hero-title">Terms of Service</h1>
            <p class="editorial-hero-subtitle">Welcome to Yadawy. Please read these terms carefully.</p>
        </div>

        <div class="editorial-content-container">
            <div class="policy-card">
                <p class="policy-intro">
                    Welcome to Yadawy. By using our website or placing an order through it, you agree to the Terms &amp; Conditions below. Please read them carefully before using the website or completing a purchase.
                </p>

                <div class="policy-section-block">
                    <h2 class="policy-heading">1. Website Use</h2>
                    <p class="policy-text">
                        The Yadawy website is intended for personal and lawful use only. When placing an order, you must provide accurate and complete information. You are responsible for keeping your account information secure, if applicable.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">2. Our Products &amp; Handmade Uniqueness</h2>
                    <p class="policy-text">
                        We do our best to provide accurate product images, descriptions, and information. However, colors or details may appear slightly different depending on your device and screen settings.
                    </p>
                    <p class="policy-text">
                        As Yadawy products are handmade, slight variations in colors, patterns, or details may occur from one piece to another. These variations are part of the nature and uniqueness of handmade products.
                    </p>
                    <p class="policy-text">
                        We reserve the right to update products, prices, or discontinue any product at any time.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">3. Orders</h2>
                    <p class="policy-text">
                        By placing an order, you confirm your intention to purchase the selected products. An order is confirmed after it has been reviewed and payment has been processed. Yadawy reserves the right to refuse or cancel an order in certain cases, such as product unavailability, pricing errors, or incorrect order information.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">4. Pricing &amp; Payment</h2>
                    <p class="policy-text">
                        All prices displayed on the website are in the currency shown at the time of purchase. Prices and promotions may change without prior notice. However, the price applied to your order is the price displayed when the order is placed.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">5. Shipping &amp; Delivery</h2>
                    <p class="policy-text">
                        Orders are delivered according to Yadawy's Shipping &amp; Delivery Policy. Delivery times are estimates and may be affected by factors beyond our control, such as shipping carrier delays or unexpected circumstances.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">6. Returns &amp; Exchanges</h2>
                    <p class="policy-text">
                        All returns and exchanges are subject to the terms of our Return &amp; Refund Policy. Please review the policy for details about eligibility, timeframes, and required procedures.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">7. Intellectual Property</h2>
                    <p class="policy-text">
                        All content on the Yadawy website, including images, text, logos, designs, and product names, is owned by Yadawy or used with permission. You may not copy, reproduce, distribute, or commercially use any website content without our prior written permission.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">8. Information Accuracy &amp; Prohibited Use</h2>
                    <p class="policy-text">
                        We do our best to keep product information, prices, and website content accurate and up to date. You may not use the website for any unlawful purpose, attempt to damage or disrupt the website, or use its content without permission.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">9. Changes to These Terms</h2>
                    <p class="policy-text">
                        We may update these Terms &amp; Conditions from time to time to reflect changes to our services or website. Any updates will be posted on this page.
                    </p>
                </div>

                <div class="policy-contact-box">
                    <h3 class="policy-contact-title">Contact Us Regarding Terms</h3>
                    <div class="policy-contact-numbers">
                        <a href="tel:+201069005565" style="font-weight:700; color:var(--color-maroon);">+20 10 69005565</a>
                    </div>
                    <div class="policy-contact-landline">Landline: <a href="tel:035427565">03 542 7565</a></div>
                    <p class="policy-tagline">Yadawy.. A Piece That Tells a Story.</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// COLLECTIONS PAGE
// ============================================================
async function renderCollectionsPage() {
    try {
        const data = await API.getCollections();
        const collections = data.collections || [];

        return `
            <div class="editorial-page-hero">
                <div class="editorial-hero-badge">HANDWOVEN ARCHIVE</div>
                <h1 class="editorial-hero-title">Our Collections</h1>
                <p class="editorial-hero-subtitle">Curated Egyptian carpets and authentic flatwoven kilims.</p>
            </div>
            <div style="max-width:var(--max-width);margin:0 auto;padding:var(--space-2xl)">
                <div class="collections-grid" style="grid-template-columns:repeat(2,1fr);gap:24px">
                    ${collections.map(c => `
                        <div class="collection-card" style="aspect-ratio:16/9" onclick="navigateTo('/shop?collection=${c.slug}')">
                            ${c.image
                                ? `<img src="${imgSrc(c.image)}" class="collection-card-image" alt="${c.name}" loading="lazy">`
                                : `<div class="collection-card-image" style="background:var(--color-maroon)"></div>`}
                            <div class="collection-card-overlay">
                                <h3 class="collection-card-name" style="font-size:24px">${c.name}</h3>
                                <p style="color:var(--color-beige);font-size:13px;max-width:400px;margin-top:8px">${c.description || ''}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (err) {
        return '<div class="empty-state"><h2 class="empty-state-title">No collections found</h2></div>';
    }
}
