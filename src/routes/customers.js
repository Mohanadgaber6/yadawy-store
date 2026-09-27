const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/customers/admin/list
router.get('/admin/list', requireAdmin, (req, res) => {
    try {
        const { search = '', page = 1, limit = 20, sort = 'total_spent', order = 'DESC' } = req.query;
        const db = getDb();
        const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (search.trim()) {
            whereClause += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR city LIKE ?)';
            const term = `%${search.trim()}%`;
            params.push(term, term, term, term);
        }

        let sortField = 'total_spent';
        let sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        if (sort === 'newest') { sortField = 'created_at'; sortOrder = 'DESC'; }
        else if (sort === 'oldest') { sortField = 'created_at'; sortOrder = 'ASC'; }
        else if (sort === 'name_asc') { sortField = 'name'; sortOrder = 'ASC'; }
        else if (sort === 'name_desc') { sortField = 'name'; sortOrder = 'DESC'; }
        else if (sort === 'total_desc') { sortField = 'total_spent'; sortOrder = 'DESC'; }
        else if (sort === 'total_asc') { sortField = 'total_spent'; sortOrder = 'ASC'; }
        else if (sort === 'orders_desc') { sortField = 'orders_count'; sortOrder = 'DESC'; }
        else if (sort === 'orders_asc') { sortField = 'orders_count'; sortOrder = 'ASC'; }
        else {
            const allowedSorts = ['name', 'email', 'orders_count', 'total_spent', 'created_at'];
            if (allowedSorts.includes(sort)) sortField = sort;
        }

        const total = db.prepare(`SELECT COUNT(*) as count FROM customers ${whereClause}`).get(...params).count;

        const customers = db.prepare(`
            SELECT id, name, email, phone, city, state, country, orders_count, total_spent, created_at
            FROM customers
            ${whereClause}
            ORDER BY ${sortField} ${sortOrder}
            LIMIT ? OFFSET ?
        `).all(...params, parseInt(limit), offset);

        res.json({
            customers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// GET /api/customers/admin/:id
router.get('/admin/:id', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const orders = db.prepare(`
            SELECT id, order_number, total, status, payment_status, created_at
            FROM orders
            WHERE customer_id = ? OR customer_email = ?
            ORDER BY created_at DESC
        `).all(customer.id, customer.email);

        res.json({
            customer,
            orders
        });
    } catch (err) {
        console.error('Error fetching customer details:', err);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

// DELETE /api/customers/admin/:id
router.delete('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        db.prepare('DELETE FROM customers WHERE id = ?').run(id);
        res.json({ success: true, message: `Customer "${customer.name}" deleted successfully` });
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

module.exports = router;
