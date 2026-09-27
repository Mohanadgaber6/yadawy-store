const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/analytics/sales
router.get('/analytics/sales', requireAdmin, (req, res) => {
    try {
        const { range = '30d' } = req.query;
        const db = getDb();

        let dateCondition = "created_at >= datetime('now', '-30 days')";
        if (range === 'today') dateCondition = "date(created_at) = date('now')";
        else if (range === 'yesterday') dateCondition = "date(created_at) = date('now', '-1 day')";
        else if (range === '7d') dateCondition = "created_at >= datetime('now', '-7 days')";
        else if (range === 'this_month') dateCondition = "strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')";
        else if (range === 'prev_month') dateCondition = "strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', '-1 month')";

        // Overall metrics in this range
        const metrics = db.prepare(`
            SELECT
                COUNT(*) as total_orders,
                COALESCE(SUM(CASE WHEN payment_status = 'paid' OR status NOT IN ('cancelled', 'refunded') THEN total ELSE 0 END), 0) as total_revenue,
                COALESCE(SUM(discount_amount), 0) as total_discounts,
                COALESCE(SUM(CASE WHEN status IN ('cancelled', 'refunded') THEN 1 ELSE 0 END), 0) as cancelled_orders,
                COALESCE(AVG(CASE WHEN payment_status = 'paid' OR status NOT IN ('cancelled', 'refunded') THEN total ELSE NULL END), 0) as avg_order_value
            FROM orders
            WHERE ${dateCondition}
        `).get();

        // Items sold count
        const itemsSoldCount = db.prepare(`
            SELECT COALESCE(SUM(oi.quantity), 0) as items_sold
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.${dateCondition} AND o.status NOT IN ('cancelled', 'refunded')
        `).get().items_sold;

        // Daily breakdown for chart
        const dailyBreakdown = db.prepare(`
            SELECT
                date(created_at) as order_date,
                COUNT(*) as order_count,
                COALESCE(SUM(total), 0) as daily_revenue
            FROM orders
            WHERE ${dateCondition}
            GROUP BY date(created_at)
            ORDER BY order_date ASC
        `).all();

        // Top 5 products sold
        const topProducts = db.prepare(`
            SELECT
                oi.product_name,
                oi.product_image,
                SUM(oi.quantity) as total_qty,
                SUM(oi.total_price) as total_sales
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.${dateCondition}
            GROUP BY oi.product_name, oi.product_image
            ORDER BY total_sales DESC
            LIMIT 5
        `).all();

        res.json({
            range,
            metrics: {
                ...metrics,
                items_sold: itemsSoldCount
            },
            dailyBreakdown,
            topProducts
        });
    } catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ error: 'Failed to fetch sales analytics' });
    }
});

module.exports = router;
