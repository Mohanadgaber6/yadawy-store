const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { sanitize, validateCoupon } = require('../middleware/validation');

const router = express.Router();

// ============================================================
// PUBLIC: Validate Coupon at Checkout
// POST /api/coupons/validate
// ============================================================
router.post('/validate', (req, res) => {
    try {
        const { code, subtotal } = req.body;
        if (!code || !code.trim()) {
            return res.status(400).json({ error: 'Please enter a coupon code' });
        }

        const db = getDb();
        const cleanCode = code.trim().toUpperCase();
        const coupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = ?').get(cleanCode);

        // 1. Check if coupon exists
        if (!coupon) {
            return res.status(400).json({ error: 'Invalid coupon code' });
        }

        // 2. Check if coupon is active
        if (!coupon.is_active) {
            return res.status(400).json({ error: 'Coupon is currently inactive' });
        }

        const now = new Date().toISOString();

        // 3. Check start date
        if (coupon.start_date && now < coupon.start_date) {
            return res.status(400).json({ error: 'Coupon is not yet active' });
        }

        // 4. Check expiry date
        if (coupon.end_date) {
            // Support both YYYY-MM-DD (end of day) and full ISO strings
            const expiry = coupon.end_date.length === 10 ? `${coupon.end_date}T23:59:59.999Z` : coupon.end_date;
            if (new Date(now) > new Date(expiry)) {
                return res.status(400).json({ error: 'Coupon expired' });
            }
        }

        // 5. Check usage limit
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
        }

        // 6. Check minimum order amount
        const orderSubtotal = parseFloat(subtotal) || 0;
        if (coupon.min_order_value && orderSubtotal < coupon.min_order_value) {
            return res.status(400).json({
                error: `Minimum order amount of ${coupon.min_order_value.toLocaleString()} LE required`
            });
        }

        // 7. Calculate discount
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = orderSubtotal * (coupon.discount_value / 100);
            if (coupon.max_discount && discount > coupon.max_discount) {
                discount = coupon.max_discount;
            }
        } else {
            discount = Math.min(coupon.discount_value, orderSubtotal);
        }

        discount = Math.round(discount * 100) / 100;

        res.json({
            valid: true,
            message: 'Coupon applied successfully',
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_percentage: coupon.discount_type === 'percentage' ? coupon.discount_value : null,
            discount_value: coupon.discount_value,
            estimated_discount: discount,
            min_order_value: coupon.min_order_value || 0
        });
    } catch (err) {
        console.error('Coupon validation error:', err);
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
});

// ============================================================
// ADMIN: List All Coupons
// GET /api/coupons/admin/list
// ============================================================
router.get('/admin/list', requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
        res.json({ coupons });
    } catch (err) {
        console.error('Error fetching coupons:', err);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
});

// ============================================================
// ADMIN: Create New Coupon
// POST /api/coupons/admin
// ============================================================
router.post('/admin', requireAdmin, (req, res) => {
    try {
        const data = req.body;
        const code = (data.code || '').trim().toUpperCase();

        if (!code || code.length < 2) {
            return res.status(400).json({ error: 'Coupon code is required (at least 2 characters)' });
        }

        const discountValue = parseFloat(data.discount_value);
        if (isNaN(discountValue) || discountValue <= 0) {
            return res.status(400).json({ error: 'Discount percentage value must be a positive number' });
        }
        if (discountValue > 100) {
            return res.status(400).json({ error: 'Discount percentage cannot exceed 100%' });
        }

        const db = getDb();
        const existing = db.prepare('SELECT id FROM coupons WHERE UPPER(code) = ?').get(code);
        if (existing) {
            return res.status(400).json({ error: `Coupon code "${code}" already exists` });
        }

        const discountType = data.discount_type || 'percentage';
        const minOrderValue = data.min_order_value ? parseFloat(data.min_order_value) : 0;
        const maxDiscount = data.max_discount ? parseFloat(data.max_discount) : null;
        const startDate = data.start_date ? data.start_date.trim() : null;
        const endDate = data.end_date ? data.end_date.trim() : null;
        const usageLimit = data.usage_limit ? parseInt(data.usage_limit) : null;
        const isActive = data.is_active !== false && data.is_active !== 0 && data.is_active !== '0' ? 1 : 0;

        const result = db.prepare(`
            INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount,
                start_date, end_date, usage_limit, per_customer_limit, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
        `).run(code, discountType, discountValue, minOrderValue, maxDiscount, startDate, endDate, usageLimit, isActive);

        res.status(201).json({
            success: true,
            message: `Coupon "${code}" created successfully`,
            id: result.lastInsertRowid
        });
    } catch (err) {
        console.error('Error creating coupon:', err);
        res.status(500).json({ error: 'Failed to create coupon' });
    }
});

// ============================================================
// ADMIN: Update Existing Coupon
// PUT /api/coupons/admin/:id
// ============================================================
router.put('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const existing = db.prepare('SELECT * FROM coupons WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        const data = req.body;
        const code = data.code ? data.code.trim().toUpperCase() : existing.code;

        if (code !== existing.code) {
            const duplicate = db.prepare('SELECT id FROM coupons WHERE UPPER(code) = ? AND id != ?').get(code, id);
            if (duplicate) {
                return res.status(400).json({ error: `Coupon code "${code}" is already in use by another coupon` });
            }
        }

        const discountValue = data.discount_value !== undefined ? parseFloat(data.discount_value) : existing.discount_value;
        if (isNaN(discountValue) || discountValue <= 0) {
            return res.status(400).json({ error: 'Discount percentage value must be greater than 0' });
        }
        if (discountValue > 100) {
            return res.status(400).json({ error: 'Discount percentage cannot exceed 100%' });
        }

        const minOrderValue = data.min_order_value !== undefined ? (parseFloat(data.min_order_value) || 0) : existing.min_order_value;
        const maxDiscount = data.max_discount !== undefined ? (data.max_discount ? parseFloat(data.max_discount) : null) : existing.max_discount;
        const startDate = data.start_date !== undefined ? (data.start_date ? data.start_date.trim() : null) : existing.start_date;
        const endDate = data.end_date !== undefined ? (data.end_date ? data.end_date.trim() : null) : existing.end_date;
        const usageLimit = data.usage_limit !== undefined ? (data.usage_limit ? parseInt(data.usage_limit) : null) : existing.usage_limit;
        const isActive = data.is_active !== undefined ? (data.is_active ? 1 : 0) : existing.is_active;

        db.prepare(`
            UPDATE coupons SET
                code = ?,
                discount_type = 'percentage',
                discount_value = ?,
                min_order_value = ?,
                max_discount = ?,
                start_date = ?,
                end_date = ?,
                usage_limit = ?,
                is_active = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `).run(code, discountValue, minOrderValue, maxDiscount, startDate, endDate, usageLimit, isActive, id);

        res.json({
            success: true,
            message: `Coupon "${code}" updated successfully`
        });
    } catch (err) {
        console.error('Error updating coupon:', err);
        res.status(500).json({ error: 'Failed to update coupon' });
    }
});

// ============================================================
// ADMIN: Toggle Coupon Active / Inactive Status
// PATCH /api/coupons/admin/:id/status
// ============================================================
router.patch('/admin/:id/status', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { is_active } = req.body;
        const db = getDb();
        const coupon = db.prepare('SELECT id, code FROM coupons WHERE id = ?').get(id);
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        const newStatus = is_active ? 1 : 0;
        db.prepare('UPDATE coupons SET is_active = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newStatus, id);

        res.json({
            success: true,
            message: `Coupon "${coupon.code}" ${newStatus ? 'activated' : 'deactivated'} successfully`
        });
    } catch (err) {
        console.error('Error toggling coupon status:', err);
        res.status(500).json({ error: 'Failed to toggle coupon status' });
    }
});

// ============================================================
// ADMIN: Delete Coupon
// DELETE /api/coupons/admin/:id
// ============================================================
router.delete('/admin/:id', requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const db = getDb();
        const coupon = db.prepare('SELECT * FROM coupons WHERE id = ?').get(id);
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        db.prepare('DELETE FROM coupons WHERE id = ?').run(id);

        res.json({ success: true, message: `Coupon "${coupon.code}" deleted successfully` });
    } catch (err) {
        console.error('Error deleting coupon:', err);
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
});

module.exports = router;
