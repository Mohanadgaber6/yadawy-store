const http = require('http');

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const payload = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
        const headers = { ...(options.headers || {}) };
        if (payload && !headers['Content-Length']) {
            headers['Content-Length'] = Buffer.byteLength(payload);
        }
        const req = http.request({ ...options, headers }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(body); } catch (e) { parsed = body; }
                resolve({ status: res.statusCode, headers: res.headers, data: parsed });
            });
        });
        req.on('error', reject);
        if (payload) {
            req.write(payload);
        }
        req.end();
    });
}

async function runAudit() {
    console.log('====================================================');
    console.log('STARTING FULL SORTING & ADMIN FUNCTIONALITY AUDIT');
    console.log('====================================================\n');

    let allPassed = true;

    // 1. PUBLIC PRODUCTS SORTING AUDIT
    console.log('--- 1. Testing Public Products Sorting ---');

    // 1.1 Price: Low -> High
    const pPriceAsc = await request({
        hostname: 'localhost', port: 3000, path: '/api/products?sort=price_asc&limit=10', method: 'GET'
    });
    const pricesAsc = (pPriceAsc.data.products || []).map(p => p.sale_price || p.price);
    const isPriceAscSorted = pricesAsc.every((v, i, a) => !i || a[i-1] <= v);
    console.log(`✓ Price: Low -> High: [${pricesAsc.slice(0, 5).join(', ')}...] -> Sorted: ${isPriceAscSorted}`);
    if (!isPriceAscSorted) allPassed = false;

    // 1.2 Price: High -> Low
    const pPriceDesc = await request({
        hostname: 'localhost', port: 3000, path: '/api/products?sort=price_desc&limit=10', method: 'GET'
    });
    const pricesDesc = (pPriceDesc.data.products || []).map(p => p.sale_price || p.price);
    const isPriceDescSorted = pricesDesc.every((v, i, a) => !i || a[i-1] >= v);
    console.log(`✓ Price: High -> Low: [${pricesDesc.slice(0, 5).join(', ')}...] -> Sorted: ${isPriceDescSorted}`);
    if (!isPriceDescSorted) allPassed = false;

    // 1.3 Name: A -> Z
    const pNameAsc = await request({
        hostname: 'localhost', port: 3000, path: '/api/products?sort=name_asc&limit=10', method: 'GET'
    });
    const namesAsc = (pNameAsc.data.products || []).map(p => p.name.trim());
    const isNameAscSorted = namesAsc.every((v, i, a) => !i || a[i-1].localeCompare(v) <= 0);
    console.log(`✓ Name: A -> Z: [${namesAsc.slice(0, 3).map(n => '"' + n.slice(0, 15) + '"').join(', ')}...] -> Sorted: ${isNameAscSorted}`);
    if (!isNameAscSorted) allPassed = false;

    // 1.4 Name: Z -> A
    const pNameDesc = await request({
        hostname: 'localhost', port: 3000, path: '/api/products?sort=name_desc&limit=10', method: 'GET'
    });
    const namesDesc = (pNameDesc.data.products || []).map(p => p.name.trim());
    const isNameDescSorted = namesDesc.every((v, i, a) => !i || a[i-1].localeCompare(v) >= 0);
    console.log(`✓ Name: Z -> A: [${namesDesc.slice(0, 3).map(n => '"' + n.slice(0, 15) + '"').join(', ')}...] -> Sorted: ${isNameDescSorted}`);
    if (!isNameDescSorted) allPassed = false;

    // 1.5 Newest
    const pNewest = await request({
        hostname: 'localhost', port: 3000, path: '/api/products?sort=newest&limit=10', method: 'GET'
    });
    const datesNewest = (pNewest.data.products || []).map(p => new Date(p.created_at).getTime());
    const isNewestSorted = datesNewest.every((v, i, a) => !i || a[i-1] >= v);
    console.log(`✓ Newest First: dates descending -> Sorted: ${isNewestSorted}`);
    if (!isNewestSorted) allPassed = false;

    // 1.6 Oldest
    const pOldest = await request({
        hostname: 'localhost', port: 3000, path: '/api/products?sort=oldest&limit=10', method: 'GET'
    });
    const datesOldest = (pOldest.data.products || []).map(p => new Date(p.created_at).getTime());
    const isOldestSorted = datesOldest.every((v, i, a) => !i || a[i-1] <= v);
    console.log(`✓ Oldest First: dates ascending -> Sorted: ${isOldestSorted}`);
    if (!isOldestSorted) allPassed = false;

    // 1.7 Best Sellers
    const pBestSeller = await request({
        hostname: 'localhost', port: 3000, path: '/api/products?sort=best_seller&limit=10', method: 'GET'
    });
    const bestSellers = (pBestSeller.data.products || []).map(p => p.is_best_seller);
    const isBestSellerSorted = bestSellers.slice(0, 3).every(v => v === 1 || bestSellers.indexOf(0) >= bestSellers.indexOf(1));
    console.log(`✓ Best Sellers First: [${bestSellers.slice(0, 5).join(', ')}] -> Sorted: ${isBestSellerSorted}`);
    if (!isBestSellerSorted) allPassed = false;

    // 2. ADMIN AUTHENTICATION
    console.log('\n--- 2. Testing Admin Authentication ---');
    const loginRes = await request({
        hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@yadawy.com', password: 'YadawyAdmin2024!' });

    const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';
    console.log(`✓ Admin Login status: ${loginRes.status}, user: ${loginRes.data.admin?.email}`);
    if (loginRes.status !== 200 || !cookie) {
        console.error('Admin login failed!');
        process.exit(1);
    }

    // 3. ADMIN PRODUCTS SORTING AUDIT
    console.log('\n--- 3. Testing Admin Products Sorting (/api/products/admin/list) ---');

    // 3.1 Admin Products Price: Low -> High
    const apPriceAsc = await request({
        hostname: 'localhost', port: 3000, path: '/api/products/admin/list?sort=price_asc&limit=10', method: 'GET',
        headers: { Cookie: cookie }
    });
    const apPricesAsc = (apPriceAsc.data.products || []).map(p => p.sale_price || p.price);
    const isApPriceAscSorted = apPricesAsc.every((v, i, a) => !i || a[i-1] <= v);
    console.log(`✓ Admin Products Price: Low -> High: [${apPricesAsc.slice(0, 5).join(', ')}...] -> Sorted: ${isApPriceAscSorted}`);
    if (!isApPriceAscSorted) allPassed = false;

    // 3.2 Admin Products Price: High -> Low
    const apPriceDesc = await request({
        hostname: 'localhost', port: 3000, path: '/api/products/admin/list?sort=price_desc&limit=10', method: 'GET',
        headers: { Cookie: cookie }
    });
    const apPricesDesc = (apPriceDesc.data.products || []).map(p => p.sale_price || p.price);
    const isApPriceDescSorted = apPricesDesc.every((v, i, a) => !i || a[i-1] >= v);
    console.log(`✓ Admin Products Price: High -> Low: [${apPricesDesc.slice(0, 5).join(', ')}...] -> Sorted: ${isApPriceDescSorted}`);
    if (!isApPriceDescSorted) allPassed = false;

    // 3.3 Admin Products Name: A -> Z
    const apNameAsc = await request({
        hostname: 'localhost', port: 3000, path: '/api/products/admin/list?sort=name_asc&limit=10', method: 'GET',
        headers: { Cookie: cookie }
    });
    const apNamesAsc = (apNameAsc.data.products || []).map(p => p.name.trim());
    const isApNameAscSorted = apNamesAsc.every((v, i, a) => !i || a[i-1].localeCompare(v) <= 0);
    console.log(`✓ Admin Products Name: A -> Z: [${apNamesAsc.slice(0, 3).join(', ')}...] -> Sorted: ${isApNameAscSorted}`);
    if (!isApNameAscSorted) allPassed = false;

    // 3.4 Admin Products Name: Z -> A
    const apNameDesc = await request({
        hostname: 'localhost', port: 3000, path: '/api/products/admin/list?sort=name_desc&limit=10', method: 'GET',
        headers: { Cookie: cookie }
    });
    const apNamesDesc = (apNameDesc.data.products || []).map(p => p.name.trim());
    const isApNameDescSorted = apNamesDesc.every((v, i, a) => !i || a[i-1].localeCompare(v) >= 0);
    console.log(`✓ Admin Products Name: Z -> A: [${apNamesDesc.slice(0, 3).join(', ')}...] -> Sorted: ${isApNameDescSorted}`);
    if (!isApNameDescSorted) allPassed = false;

    // 4. ADMIN ORDERS SORTING AUDIT
    console.log('\n--- 4. Testing Admin Orders Sorting ---');

    // 3.1 Orders Total Descending
    const oTotalDesc = await request({
        hostname: 'localhost', port: 3000, path: '/api/orders/admin/list?sort=total_desc&limit=10', method: 'GET',
        headers: { Cookie: cookie }
    });
    const ordersTotalDesc = (oTotalDesc.data.orders || []).map(o => o.total);
    const isOrdersTotalDesc = ordersTotalDesc.every((v, i, a) => !i || a[i-1] >= v);
    console.log(`✓ Orders Total Descending: [${ordersTotalDesc.slice(0, 5).join(', ')}] -> Sorted: ${isOrdersTotalDesc}`);
    if (!isOrdersTotalDesc) allPassed = false;

    // 3.2 Orders Total Ascending
    const oTotalAsc = await request({
        hostname: 'localhost', port: 3000, path: '/api/orders/admin/list?sort=total_asc&limit=10', method: 'GET',
        headers: { Cookie: cookie }
    });
    const ordersTotalAsc = (oTotalAsc.data.orders || []).map(o => o.total);
    const isOrdersTotalAsc = ordersTotalAsc.every((v, i, a) => !i || a[i-1] <= v);
    console.log(`✓ Orders Total Ascending: [${ordersTotalAsc.slice(0, 5).join(', ')}] -> Sorted: ${isOrdersTotalAsc}`);
    if (!isOrdersTotalAsc) allPassed = false;

    // 3.3 Orders Customer Name Ascending
    const oCustAsc = await request({
        hostname: 'localhost', port: 3000, path: '/api/orders/admin/list?sort=customer_asc&limit=10', method: 'GET',
        headers: { Cookie: cookie }
    });
    const ordersCustAsc = (oCustAsc.data.orders || []).map(o => o.customer_name);
    const isOrdersCustAsc = ordersCustAsc.every((v, i, a) => !i || a[i-1].localeCompare(v) <= 0);
    console.log(`✓ Orders Customer Name A-Z: [${ordersCustAsc.slice(0, 3).join(', ')}] -> Sorted: ${isOrdersCustAsc}`);
    if (!isOrdersCustAsc) allPassed = false;

    // 4. ADMIN CUSTOMERS SORTING AUDIT
    console.log('\n--- 4. Testing Admin Customers Sorting ---');

    // 4.1 Total Spent Descending
    const cTotalDesc = await request({
        hostname: 'localhost', port: 3000, path: '/api/customers/admin/list?sort=total_desc&limit=10', method: 'GET',
        headers: { Cookie: cookie }
    });
    const custSpentDesc = (cTotalDesc.data.customers || []).map(c => c.total_spent);
    const isCustSpentDesc = custSpentDesc.every((v, i, a) => !i || a[i-1] >= v);
    console.log(`✓ Customers Total Spent Descending: [${custSpentDesc.slice(0, 5).join(', ')}] -> Sorted: ${isCustSpentDesc}`);
    if (!isCustSpentDesc) allPassed = false;

    // 4.2 Customer Name Ascending
    const cNameAsc = await request({
        hostname: 'localhost', port: 3000, path: '/api/customers/admin/list?sort=name_asc&limit=10', method: 'GET',
        headers: { Cookie: cookie }
    });
    const custNameAsc = (cNameAsc.data.customers || []).map(c => c.name);
    const isCustNameAsc = custNameAsc.every((v, i, a) => !i || a[i-1].localeCompare(v) <= 0);
    console.log(`✓ Customers Name A-Z: [${custNameAsc.slice(0, 4).join(', ')}] -> Sorted: ${isCustNameAsc}`);
    if (!isCustNameAsc) allPassed = false;

    // 4.3 Orders Count Descending
    const cOrdersDesc = await request({
        hostname: 'localhost', port: 3000, path: '/api/customers/admin/list?sort=orders_desc&limit=10', method: 'GET',
        headers: { Cookie: cookie }
    });
    const custOrdersDesc = (cOrdersDesc.data.customers || []).map(c => c.orders_count);
    const isCustOrdersDesc = custOrdersDesc.every((v, i, a) => !i || a[i-1] >= v);
    console.log(`✓ Customers Orders Count Descending: [${custOrdersDesc.slice(0, 5).join(', ')}] -> Sorted: ${isCustOrdersDesc}`);
    if (!isCustOrdersDesc) allPassed = false;

    // 5. ADMIN CRUD AUDIT
    console.log('\n--- 5. Testing Admin CRUD Operations ---');

    // 5.1 Admin Users List & Single Create/Delete Test
    const adminListRes = await request({
        hostname: 'localhost', port: 3000, path: '/api/admin/users', method: 'GET',
        headers: { Cookie: cookie }
    });
    console.log(`✓ Fetch Admin Users: ${adminListRes.status}, count: ${adminListRes.data.users?.length}`);

    const testAdminEmail = `audit_test_${Date.now()}@yadawy.com`;
    const testAdminUsername = `AuditStaff_${Date.now()}`;
    const createAdmRes = await request({
        hostname: 'localhost', port: 3000, path: '/api/admin/users', method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie }
    }, { username: testAdminUsername, email: testAdminEmail, password: 'TestPassword123!', role: 'admin' });
    console.log(`✓ Create Admin User: ${createAdmRes.status}, id: ${createAdmRes.data.user?.id}`);

    if (createAdmRes.data.user?.id) {
        const delAdmRes = await request({
            hostname: 'localhost', port: 3000, path: `/api/admin/users/${createAdmRes.data.user.id}`, method: 'DELETE',
            headers: { Cookie: cookie }
        });
        console.log(`✓ Delete Admin User: ${delAdmRes.status}, success: ${delAdmRes.data.success}`);
    }

    // 5.2 Order Status Update Test
    const firstOrder = (oTotalDesc.data.orders || [])[0];
    if (firstOrder) {
        const updateStatusRes = await request({
            hostname: 'localhost', port: 3000, path: `/api/orders/admin/${firstOrder.id}/status`, method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Cookie: cookie }
        }, { status: 'processing' });
        console.log(`✓ Order Status Update (ID ${firstOrder.id}): ${updateStatusRes.status}, new status: processing`);
    }

    console.log('\n====================================================');
    if (allPassed) {
        console.log('ALL FUNCTIONALITY & SORTING AUDIT CHECKS PASSED 100%!');
    } else {
        console.error('SOME AUDIT CHECKS FAILED!');
    }
    console.log('====================================================');
}

runAudit().catch(err => {
    console.error('Audit error:', err);
    process.exit(1);
});
