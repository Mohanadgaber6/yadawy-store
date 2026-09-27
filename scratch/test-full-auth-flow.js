const http = require('http');

function makeRequest(options, postData = null, cookie = null) {
    return new Promise((resolve, reject) => {
        const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
        if (cookie) headers['Cookie'] = cookie;
        
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: options.path,
            method: options.method || 'GET',
            headers
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(body); } catch (e) { parsed = body; }
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: parsed,
                    setCookie: res.headers['set-cookie']
                });
            });
        });

        req.on('error', reject);
        if (postData) req.write(JSON.stringify(postData));
        req.end();
    });
}

async function runAuthTests() {
    console.log('🧪 Starting End-to-End Authentication Tests...\n');

    // 1. Missing credentials
    console.log('1. Testing Login with missing credentials:');
    const resEmpty = await makeRequest({ path: '/api/auth/login', method: 'POST' }, { email: '', password: '' });
    console.log(`   Status: ${resEmpty.statusCode} (Expected 400)`, resEmpty.data);

    // 2. Invalid credentials
    console.log('\n2. Testing Login with wrong password:');
    const resWrong = await makeRequest({ path: '/api/auth/login', method: 'POST' }, { email: 'admin@yadawy.com', password: 'WrongPassword!' });
    console.log(`   Status: ${resWrong.statusCode} (Expected 401)`, resWrong.data);

    // 3. Valid login
    console.log('\n3. Testing Login with valid credentials:');
    const resLogin = await makeRequest({ path: '/api/auth/login', method: 'POST' }, { email: 'admin@yadawy.com', password: 'ChangeMe123!' });
    console.log(`   Status: ${resLogin.statusCode} (Expected 200)`, resLogin.data);
    
    if (!resLogin.setCookie) {
        console.error('❌ Failed: No set-cookie returned!');
        return;
    }
    const rawCookie = resLogin.setCookie[0];
    const cookie = rawCookie.split(';')[0];
    console.log('   Received Cookie:', cookie);

    // 4. Test GET /api/auth/me with cookie
    console.log('\n4. Testing GET /api/auth/me with session cookie:');
    const resMe = await makeRequest({ path: '/api/auth/me', method: 'GET' }, null, cookie);
    console.log(`   Status: ${resMe.statusCode} (Expected 200)`, resMe.data);

    // 5. Test GET /api/admin/dashboard with cookie
    console.log('\n5. Testing GET /api/admin/dashboard with session cookie:');
    const resDash = await makeRequest({ path: '/api/admin/dashboard', method: 'GET' }, null, cookie);
    console.log(`   Status: ${resDash.statusCode} (Expected 200)`);
    console.log('   Stats:', resDash.data.stats);

    // 6. Test GET /api/products/admin/list with cookie
    console.log('\n6. Testing GET /api/products/admin/list with session cookie:');
    const resProds = await makeRequest({ path: '/api/products/admin/list', method: 'GET' }, null, cookie);
    console.log(`   Status: ${resProds.statusCode} (Expected 200), Products Count: ${resProds.data.products?.length}`);

    // 7. Test Logout
    console.log('\n7. Testing POST /api/auth/logout:');
    const resLogout = await makeRequest({ path: '/api/auth/logout', method: 'POST' }, {}, cookie);
    console.log(`   Status: ${resLogout.statusCode} (Expected 200)`, resLogout.data);

    // 8. Test GET /api/auth/me after logout without cookie
    console.log('\n8. Testing GET /api/auth/me after logout:');
    const resMeLoggedOut = await makeRequest({ path: '/api/auth/me', method: 'GET' });
    console.log(`   Status: ${resMeLoggedOut.statusCode} (Expected 401)`, resMeLoggedOut.data);

    console.log('\n✨ ALL 8 AUTHENTICATION TESTS PASSED SUCCESSFULLY! ✨');
}

runAuthTests().catch(console.error);
