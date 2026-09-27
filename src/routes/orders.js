const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { validateOrder, validatePagination, sanitize } = require('../middleware/validation');
const { v4: uuidv4 } = require('uuid');
const { sendNewOrderNotification } = require('../services/emailService');

const router = express.Router();

// POST /api/orders — Place order (public)
router.post('/', (req, res) => {
    try {
        const errors = validateOrder(req.body);
        if (errors.length > 0) return res.status(400).json({ errors });

        const db = getDb();
        const data = req.body;

        // Server-side price calculation — NEVER trust client prices
        let subtotal = 0;
        const orderItems = [];

        for (const item of data.items) {
            const product = db.prepare('SELECT * FROM products WHERE id = ? AND status = ?').get(parseInt(item.product_id), 'active');
            if (!product) {
                return res.status(400).json({ error: `Product not found or unavailable: ${item.product_id}` });
            }

            const quantity = Math.max(1, parseInt(item.quantity));
            if (quantity > product.inventory_qty) {
                return res.status(400).json({ error: `Insufficient stock for "${product.name}". Available: ${product.inventory_qty}` });
            }

            let unitPrice = product.is_on_sale && product.sale_price ? product.sale_price : product.price;

            // Size-based price adjustment or custom variant price
            if (item.size) {
                try {
                    const sizeInfo = db.prepare(`
                        SELECT price, price_adjustment FROM product_sizes
                        WHERE product_id = ? AND (size_name = ? OR LOWER(TRIM(size_name)) = LOWER(TRIM(?))) AND is_available = 1
                        LIMIT 1
                    `).get(product.id, item.size, item.size);

                    if (sizeInfo) {
                        if (sizeInfo.price && sizeInfo.price > 0) {
                            unitPrice = sizeInfo.price;
                        } else if (sizeInfo.price_adjustment) {
                            unitPrice += sizeInfo.price_adjustment;
                        }
                    }
                } catch (e) {
                    console.warn('Size price lookup note:', e.message);
                }
            }

            const totalPrice = unitPrice * quantity;
            subtotal += totalPrice;

            // Get primary or first product image
            const img = db.prepare(`
                SELECT image_path, thumbnail_path 
                FROM product_images 
                WHERE product_id = ? 
                ORDER BY is_primary DESC, display_order ASC 
                LIMIT 1
            `).get(product.id);

            const productImage = img ? (img.thumbnail_path || img.image_path) : null;

            orderItems.push({
                product_id: product.id,
                product_name: product.name,
                product_image: productImage,
                size: item.size || null,
                quantity,
                unit_price: unitPrice,
                total_price: totalPrice
            });
        }

        // Coupon validation (server-side)
        let discountAmount = 0;
        let couponId = null;
        let couponCode = null;

        if (data.coupon_code) {
            const coupon = db.prepare(`
                SELECT * FROM coupons WHERE code = ? AND is_active = 1
            `).get(data.coupon_code.trim().toUpperCase());

            if (!coupon) {
                return res.status(400).json({ error: 'Invalid coupon code' });
            }

            const now = new Date().toISOString();
            if (coupon.start_date && now < coupon.start_date) {
                return res.status(400).json({ error: 'Coupon is not yet active' });
            }
            if (coupon.end_date && now > coupon.end_date) {
                return res.status(400).json({ error: 'Coupon has expired' });
            }
            if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
                return res.status(400).json({ error: 'Coupon usage limit reached' });
            }
            if (coupon.min_order_value && subtotal < coupon.min_order_value) {
                return res.status(400).json({ error: `Minimum order value of ${coupon.min_order_value} LE required` });
            }

            if (coupon.discount_type === 'percentage') {
                discountAmount = subtotal * (coupon.discount_value / 100);
                if (coupon.max_discount && discountAmount > coupon.max_discount) {
                    discountAmount = coupon.max_discount;
                }
            } else {
                discountAmount = Math.min(coupon.discount_value, subtotal);
            }

            discountAmount = Math.round(discountAmount * 100) / 100;
            couponId = coupon.id;
            couponCode = coupon.code;
        }

        // Fetch dynamic shipping cost from shipping_settings (default: 100)
        let shippingCost = 100;
        try {
            const shipRow = db.prepare("SELECT cost FROM shipping_settings WHERE id = 1").get()
                || db.prepare("SELECT setting_value as cost FROM site_settings WHERE setting_key = 'shipping_cost'").get();
            if (shipRow && !isNaN(parseFloat(shipRow.cost))) {
                shippingCost = parseFloat(shipRow.cost);
            }
        } catch (e) {
            console.warn('[Orders] Could not read shipping_cost setting:', e.message);
        }

        const total = Math.max(0, Math.round((subtotal + shippingCost - discountAmount) * 100) / 100);
        const orderNumber = 'YDW-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();

        // Use transaction
        const insertOrder = db.transaction(() => {
            // Create/update customer
            let customerId = null;
            const existingCustomer = db.prepare('SELECT id FROM customers WHERE email = ?').get(data.customer_email);
            if (existingCustomer) {
                customerId = existingCustomer.id;
                db.prepare(`
                    UPDATE customers SET name=?, phone=?, address_line1=?, address_line2=?,
                    city=?, state=?, postal_code=?, country=?, orders_count = orders_count + 1,
                    total_spent = total_spent + ?, updated_at=datetime('now') WHERE id=?
                `).run(sanitize(data.customer_name), data.customer_phone || null,
                    data.address_line1, data.address_line2 || null, data.city,
                    data.state || null, data.postal_code || null, data.country, total, customerId);
            } else {
                const custResult = db.prepare(`
                    INSERT INTO customers (name, email, phone, address_line1, address_line2, city, state, postal_code, country, orders_count, total_spent)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
                `).run(sanitize(data.customer_name), data.customer_email, data.customer_phone || null,
                    data.address_line1, data.address_line2 || null, data.city,
                    data.state || null, data.postal_code || null, data.country, total);
                customerId = custResult.lastInsertRowid;
            }

            // Create order
            const orderResult = db.prepare(`
                INSERT INTO orders (order_number, customer_id, customer_name, customer_email, customer_phone,
                    address_line1, address_line2, city, state, postal_code, country,
                    subtotal, discount_amount, shipping_amount, total, coupon_id, coupon_code, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(orderNumber, customerId, sanitize(data.customer_name), data.customer_email,
                data.customer_phone || null, data.address_line1, data.address_line2 || null,
                data.city, data.state || null, data.postal_code || null, data.country,
                subtotal, discountAmount, shippingCost, total, couponId, couponCode, data.notes || null);

            const orderId = orderResult.lastInsertRowid;

            // Insert order items and update inventory
            const itemStmt = db.prepare(`
                INSERT INTO order_items (order_id, product_id, product_name, product_image, size, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const inventoryStmt = db.prepare("UPDATE products SET inventory_qty = inventory_qty - ?, updated_at = datetime('now') WHERE id = ?");

            for (const item of orderItems) {
                itemStmt.run(orderId, item.product_id, item.product_name, item.product_image,
                    item.size, item.quantity, item.unit_price, item.total_price);
                inventoryStmt.run(item.quantity, item.product_id);
            }

            // Record coupon usage
            if (couponId) {
                db.prepare('INSERT INTO coupon_usage (coupon_id, order_id, customer_email, discount_applied) VALUES (?, ?, ?, ?)')
                    .run(couponId, orderId, data.customer_email, discountAmount);
                db.prepare("UPDATE coupons SET usage_count = usage_count + 1, updated_at = datetime('now') WHERE id = ?")
                    .run(couponId);
            }

            return { orderId, orderNumber };
        });

        const result = insertOrder();

        // Trigger order notification email asynchronously
        sendNewOrderNotification({
            order_number: result.orderNumber,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
            address_line1: data.address_line1,
            address_line2: data.address_line2,
            city: data.city,
            state: data.state,
            country: data.country,
            notes: data.notes,
            subtotal,
            discount_amount: discountAmount,
            shipping_amount: shippingCost,
            coupon_code: couponCode,
            total,
            items: orderItems,
            created_at: new Date()
        }).catch(err => console.error('[Order Notification Error]:', err));

        res.status(201).json({
            success: true,
            order: {
                id: result.orderId,
                order_number: result.orderNumber,
                subtotal,
                discount: discountAmount,
                shipping_cost: shippingCost,
                total,
                coupon_code: couponCode
            }
        });
    } catch (err) {
        console.error('Order error:', err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// ADMIN — list orders
router.get('/admin/list', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const { page, limit, offset } = validatePagination(req.query);

        let where = ['1=1'];
        let params = [];

        if (req.query.status) {
            where.push('o.status = ?');
            params.push(req.query.status);
        }
        if (req.query.search) {
            where.push('(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)');
            const term = `%${req.query.search}%`;
            params.push(term, term, term);
        }

        const whereClause = where.join(' AND ');
        const { total } = db.prepare(`SELECT COUNT(*) as total FROM orders o WHERE ${whereClause}`).get(...params);

        let orderBy = 'o.created_at DESC';
        switch (req.query.sort) {
            case 'newest':
            case 'date_desc': orderBy = 'o.created_at DESC'; break;
            case 'oldest':
            case 'date_asc': orderBy = 'o.created_at ASC'; break;
            case 'total_desc': orderBy = 'o.total DESC'; break;
            case 'total_asc': orderBy = 'o.total ASC'; break;
            case 'customer_asc': orderBy = 'o.customer_name ASC'; break;
            case 'customer_desc': orderBy = 'o.customer_name DESC'; break;
            case 'status_asc': orderBy = 'o.status ASC, o.created_at DESC'; break;
            case 'status_desc': orderBy = 'o.status DESC, o.created_at DESC'; break;
        }

        const orders = db.prepare(`
            SELECT o.*, (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
            FROM orders o WHERE ${whereClause}
            ORDER BY ${orderBy} LIMIT ? OFFSET ?
        `).all(...params, limit, offset);

        res.json({ orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// ADMIN — order detail
router.get('/admin/:id', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const id = parseInt(req.params.id);
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
        res.json({ order });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// ADMIN — update order status
router.patch('/admin/:id/status', requireAdmin, (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

        const db = getDb();
        db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?")
            .run(status, parseInt(req.params.id));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// ADMIN — delete order (safe: only deletes the order and order_items)
router.delete('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const order = db.prepare('SELECT id, order_number, customer_name, total FROM orders WHERE id = ?').get(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const deleteTransaction = db.transaction(() => {
            db.prepare('DELETE FROM coupon_usage WHERE order_id = ?').run(id);
            db.prepare('DELETE FROM order_items WHERE order_id = ?').run(id);
            db.prepare('DELETE FROM orders WHERE id = ?').run(id);
        });

        deleteTransaction();

        res.json({ success: true, message: `Order ${order.order_number} deleted successfully` });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

module.exports = router;
