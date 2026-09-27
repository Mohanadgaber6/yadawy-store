const { getDb } = require('../src/database/connection');

try {
    const db = getDb();
    console.log('--- Testing Dashboard Queries ---');
    const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
    const activeProducts = db.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'active'").get().c;
    const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
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
    console.log('✅ totalProducts:', totalProducts);
    console.log('✅ activeProducts:', activeProducts);
    console.log('✅ totalOrders:', totalOrders);
    console.log('✅ totalCustomers:', totalCustomers);
    console.log('✅ revenue:', revenue);
    console.log('✅ recentOrders count:', recentOrders.length);
    console.log('✅ lowStock count:', lowStockProducts.length);
    console.log('🎉 ALL DASHBOARD QUERIES PASSED WITH FLYING COLORS!');
} catch (err) {
    console.error('❌ SQL Error:', err);
}
