const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
    try {
        const db = getDb();

        const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
        const activeProducts = db.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'active'").get().c;
        const disabledProducts = db.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'disabled'").get().c;
        const draftProducts = db.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'draft'").get().c;

        const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
        const pendingOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'").get().c;
        const confirmedOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'confirmed'").get().c;
        const processingOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'processing'").get().c;
        const shippedOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'shipped'").get().c;
        const deliveredOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'delivered'").get().c;
        const cancelledOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'cancelled'").get().c;

        const totalCustomers = db.prepare('SELECT COUNT(*) as c FROM customers').get().c;
        const revenue = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status NOT IN ('cancelled', 'refunded')").get().total;

        const recentOrders = db.prepare(`
            SELECT o.*, (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
            FROM orders o ORDER BY o.created_at DESC LIMIT 10
        `).all();

        const lowStockProducts = db.prepare(`
            SELECT p.*, (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
            FROM products p WHERE p.status = 'active' AND p.inventory_qty <= 5
            ORDER BY p.inventory_qty ASC LIMIT 10
        `).all();

        const topSellingProducts = db.prepare(`
            SELECT product_name, SUM(quantity) as total_sold, SUM(total_price) as total_revenue
            FROM order_items GROUP BY product_name ORDER BY total_sold DESC LIMIT 5
        `).all();

        // Monthly revenue (last 6 months)
        const monthlyRevenue = db.prepare(`
            SELECT strftime('%Y-%m', created_at) as month, SUM(total) as revenue, COUNT(*) as orders
            FROM orders WHERE status NOT IN ('cancelled', 'refunded')
            AND created_at >= datetime('now', '-6 months')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month ASC
        `).all();

        res.json({
            stats: {
                products: { total: totalProducts, active: activeProducts, disabled: disabledProducts, draft: draftProducts },
                orders: { total: totalOrders, pending: pendingOrders, confirmed: confirmedOrders, processing: processingOrders,
                    shipped: shippedOrders, delivered: deliveredOrders, cancelled: cancelledOrders },
                customers: { total: totalCustomers },
                revenue: { total: revenue }
            },
            recentOrders,
            lowStockProducts,
            topSellingProducts,
            monthlyRevenue
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Customers list
router.get('/customers', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const { page, limit, offset } = require('../middleware/validation').validatePagination(req.query);

        let where = ['1=1'];
        let params = [];
        if (req.query.search) {
            where.push('(c.name LIKE ? OR c.email LIKE ?)');
            const term = `%${req.query.search}%`;
            params.push(term, term);
        }

        const whereClause = where.join(' AND ');
        const { total } = db.prepare(`SELECT COUNT(*) as total FROM customers c WHERE ${whereClause}`).get(...params);
        const customers = db.prepare(`
            SELECT * FROM customers c WHERE ${whereClause} ORDER BY c.created_at DESC LIMIT ? OFFSET ?
        `).all(...params, limit, offset);

        res.json({ customers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch customers' }); }
});

router.get('/customers/:id', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(parseInt(req.params.id));
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        customer.orders = db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC').all(customer.id);
        res.json({ customer });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch customer' }); }
});

module.exports = router;
