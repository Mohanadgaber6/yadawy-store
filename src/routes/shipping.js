const express = require('express');
const { getDb } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * PUBLIC: Get Current Shipping Cost
 * GET /api/shipping
 */
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const row = db.prepare('SELECT cost, currency, updated_at FROM shipping_settings WHERE id = 1').get();
        const cost = row && !isNaN(parseFloat(row.cost)) ? parseFloat(row.cost) : 100;
        const currency = row?.currency || 'EGP';

        res.json({
            success: true,
            cost,
            shipping_cost: cost,
            currency,
            updated_at: row?.updated_at || new Date().toISOString()
        });
    } catch (err) {
        console.error('[Shipping Route Error]:', err);
        res.status(500).json({ error: 'Failed to retrieve shipping settings' });
    }
});

/**
 * ADMIN: Update Shipping Cost
 * PUT /api/shipping or POST /api/shipping
 */
function handleUpdateShipping(req, res) {
    try {
        const db = getDb();
        const rawVal = req.body.cost !== undefined ? req.body.cost : req.body.shipping_cost;

        if (rawVal === undefined || rawVal === null || rawVal === '') {
            return res.status(400).json({ error: 'Shipping cost value is required' });
        }

        const cost = parseFloat(rawVal);
        if (isNaN(cost) || cost < 0) {
            return res.status(400).json({ error: 'Shipping cost must be a valid number (0 or greater)' });
        }

        // 1. Update dedicated shipping_settings table
        db.prepare(`
            INSERT INTO shipping_settings (id, cost, currency, updated_at)
            VALUES (1, ?, 'EGP', datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
                cost = excluded.cost,
                updated_at = datetime('now')
        `).run(cost);

        // 2. Sync to site_settings table for full consistency
        const siteRow = db.prepare("SELECT id FROM site_settings WHERE setting_key = 'shipping_cost'").get();
        if (siteRow) {
            db.prepare("UPDATE site_settings SET setting_value = ?, updated_at = datetime('now') WHERE setting_key = 'shipping_cost'").run(String(cost));
        } else {
            db.prepare("INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES ('shipping_cost', ?, 'number')").run(String(cost));
        }

        console.log(`[Shipping] Updated shipping cost to ${cost} EGP`);

        res.json({
            success: true,
            cost,
            shipping_cost: cost,
            currency: 'EGP',
            message: 'Shipping cost updated successfully.'
        });
    } catch (err) {
        console.error('[Shipping Update Error]:', err);
        res.status(500).json({ error: 'Failed to update shipping cost' });
    }
}

router.put('/', requireAdmin, handleUpdateShipping);
router.post('/', requireAdmin, handleUpdateShipping);

module.exports = router;
