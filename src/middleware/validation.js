const validator = require('validator');

// Sanitize string input
function sanitize(str) {
    if (typeof str !== 'string') return str;
    return validator.escape(str.trim());
}

// Sanitize but allow some HTML (for rich text descriptions)
function sanitizeRichText(str) {
    if (typeof str !== 'string') return str;
    return str.trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/javascript:/gi, '');
}

// Create URL slug from text
function createSlug(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// Validate product data
function validateProduct(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.name !== undefined) {
        if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
            errors.push('Product name is required (minimum 2 characters)');
        }
    }

    if (data.price !== undefined) {
        const price = parseFloat(data.price);
        if (isNaN(price) || price < 0) {
            errors.push('Price must be a non-negative number');
        }
    } else if (!isUpdate) {
        errors.push('Price is required');
    }

    if (data.sale_price !== undefined && data.sale_price !== null && data.sale_price !== '') {
        const salePrice = parseFloat(data.sale_price);
        if (isNaN(salePrice) || salePrice < 0) {
            errors.push('Sale price must be a non-negative number');
        }
        if (data.price !== undefined && salePrice >= parseFloat(data.price)) {
            errors.push('Sale price must be less than regular price');
        }
    }

    if (data.inventory_qty !== undefined) {
        const qty = parseInt(data.inventory_qty);
        if (isNaN(qty) || qty < 0) {
            errors.push('Inventory quantity must be a non-negative integer');
        }
    }

    if (data.sku !== undefined && data.sku !== null && data.sku !== '') {
        if (typeof data.sku !== 'string' || data.sku.trim().length > 50) {
            errors.push('SKU must be a string (max 50 characters)');
        }
    }

    return errors;
}

// Validate coupon data
function validateCoupon(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.code !== undefined) {
        if (!data.code || typeof data.code !== 'string' || data.code.trim().length < 3) {
            errors.push('Coupon code is required (minimum 3 characters)');
        }
    }

    if (!isUpdate || data.discount_type !== undefined) {
        if (!['percentage', 'fixed'].includes(data.discount_type)) {
            errors.push('Discount type must be "percentage" or "fixed"');
        }
    }

    if (data.discount_value !== undefined) {
        const val = parseFloat(data.discount_value);
        if (isNaN(val) || val <= 0) {
            errors.push('Discount value must be a positive number');
        }
        if (data.discount_type === 'percentage' && val > 100) {
            errors.push('Percentage discount cannot exceed 100%');
        }
    } else if (!isUpdate) {
        errors.push('Discount value is required');
    }

    if (data.min_order_value !== undefined && data.min_order_value !== null) {
        const min = parseFloat(data.min_order_value);
        if (isNaN(min) || min < 0) {
            errors.push('Minimum order value must be non-negative');
        }
    }

    if (data.max_discount !== undefined && data.max_discount !== null) {
        const max = parseFloat(data.max_discount);
        if (isNaN(max) || max < 0) {
            errors.push('Maximum discount must be non-negative');
        }
    }

    return errors;
}

// Validate order data
function validateOrder(data) {
    const errors = [];

    if (!data.customer_name || typeof data.customer_name !== 'string' || data.customer_name.trim().length < 2) {
        errors.push('Customer name is required');
    }

    if (!data.customer_email || !validator.isEmail(data.customer_email)) {
        errors.push('Valid email address is required');
    }

    if (data.customer_phone && !validator.isMobilePhone(data.customer_phone.replace(/[\s\-\+\(\)]/g, ''), 'any')) {
        // Relaxed phone validation — just check it's not too weird
        if (!/^[\d\s\-\+\(\)]{7,20}$/.test(data.customer_phone)) {
            errors.push('Please enter a valid phone number');
        }
    }

    if (!data.address_line1 || data.address_line1.trim().length < 5) {
        errors.push('Address is required');
    }

    if (!data.city || data.city.trim().length < 2) {
        errors.push('City is required');
    }

    if (!data.country || data.country.trim().length < 2) {
        errors.push('Country is required');
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        errors.push('Order must contain at least one item');
    } else {
        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];
            if (!item.product_id || isNaN(parseInt(item.product_id))) {
                errors.push(`Item ${i + 1}: Invalid product ID`);
            }
            if (!item.quantity || parseInt(item.quantity) < 1) {
                errors.push(`Item ${i + 1}: Quantity must be at least 1`);
            }
        }
    }

    return errors;
}

// Validate contact form
function validateContact(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name is required');
    }
    if (!data.email || !validator.isEmail(data.email)) {
        errors.push('Valid email is required');
    }
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Message must be at least 10 characters');
    }

    return errors;
}

// Validate email for newsletter
function validateEmail(email) {
    return email && validator.isEmail(email);
}

// Validate pagination params
function validatePagination(query) {
    let page = parseInt(query.page) || 1;
    let limit = parseInt(query.limit) || 20;

    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;
    return { page, limit, offset };
}

module.exports = {
    sanitize,
    sanitizeRichText,
    createSlug,
    validateProduct,
    validateCoupon,
    validateOrder,
    validateContact,
    validateEmail,
    validatePagination
};
