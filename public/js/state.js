// ============================================================
// CENTRALIZED SOURCE OF TRUTH (YADAWY BRAND CONFIG)
// ============================================================
const YADAWY_CONFIG = {
    brandName: 'Yadawy',
    brandNameAr: 'يدوي',
    tagline: 'A Piece That Tells a Story.',
    taglineAr: 'يدوي.. قطعة تروي حكاية',
    phone: {
        display: '+20 10 39555155',
        raw: '01039555155',
        intl: '201039555155',
        formatted: '+20 10 39555155',
        telUrl: 'tel:+201039555155'
    },
    primaryWhatsapp: {
        number: '201039555155',
        display: '+20 10 39555155',
        url: 'https://wa.me/201039555155'
    },
    social: {
        instagram: 'https://www.instagram.com/yadawy0/',
        facebook: 'https://www.facebook.com/share/1EeqnwUzCw/'
    },
    coverage: 'Shipping across Cairo, Alexandria, Giza & all governorates in Egypt',
    deliveryTime: '3–5 business days',
    paymentTerms: 'Cash on delivery available across Egypt',
    warranty: '1-Year Warranty on all handmade pieces',
    returnsPeriod: '14-Day Return & Exchange Policy'
};
window.YADAWY_CONFIG = YADAWY_CONFIG;

// Cart State Management
const Store = {
    cart: JSON.parse(localStorage.getItem('yadawy_cart') || '[]'),
    settings: {},
    navigation: [],

    // Cart operations
    addToCart(product, size, quantity = 1, customPrice = null) {
        const existingIdx = this.cart.findIndex(
            item => item.product_id === product.id && item.size === size
        );

        const effectivePrice = (customPrice !== null && customPrice !== undefined && !isNaN(customPrice)) 
            ? Number(customPrice) 
            : (product.is_on_sale && product.sale_price ? product.sale_price : product.price);

        if (existingIdx >= 0) {
            this.cart[existingIdx].quantity += quantity;
        } else {
            this.cart.push({
                product_id: product.id,
                name: product.name,
                slug: product.slug,
                price: effectivePrice,
                original_price: (customPrice !== null && customPrice !== undefined && !isNaN(customPrice)) ? Number(customPrice) : product.price,
                sale_price: product.sale_price,
                is_on_sale: product.is_on_sale,
                image: product.primary_image || (product.images && product.images[0]?.image_path) || '',
                type_name: product.type_name || '',
                size: size,
                quantity: quantity
            });
        }

        this.saveCart();
        this.updateCartUI();
        showToast(`${product.name} added to cart`, 'success');
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartUI();
    },

    updateQuantity(index, quantity) {
        if (quantity < 1) return this.removeFromCart(index);
        this.cart[index].quantity = quantity;
        this.saveCart();
        this.updateCartUI();
    },

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    },

    getSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getCartCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    saveCart() {
        localStorage.setItem('yadawy_cart', JSON.stringify(this.cart));
    },

    updateCartUI() {
        document.querySelectorAll('.cart-count').forEach(el => {
            const count = this.getCartCount();
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    },

    getShippingCost() {
        const val = this.settings && this.settings.shipping_cost !== undefined 
            ? parseFloat(this.settings.shipping_cost) 
            : 100;
        return isNaN(val) ? 100 : val;
    },

    formatPrice(price) {
        const symbol = this.settings.currency_symbol || 'LE';
        return `${Number(price).toLocaleString()} ${symbol}`;
    }
};

// Toast notification system
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
