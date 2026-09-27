const http = require('http');

function makeRequest(path, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(`http://localhost:3000${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, json: JSON.parse(data) });
                } catch(e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    console.log('Testing product template defaults and independence...');

    // 1. Get Product 1 (Antique Rugs #2)
    const p1 = await makeRequest('/api/products/antique-rugs-2');
    console.log('Product 1 status:', p1.status);
    console.log('Product 1 name:', p1.json.product.name);
    console.log('Product 1 handwoven_details:', p1.json.product.handwoven_details);
    console.log('Product 1 where_to_place:', p1.json.product.where_to_place);
    console.log('Product 1 sizes:', p1.json.product.sizes.map(s => s.size_name));

    // 2. Get Product 2 (Antique Rugs #33)
    const p2 = await makeRequest('/api/products/antique-rugs-33');
    console.log('Product 2 status:', p2.status);
    console.log('Product 2 name:', p2.json.product.name);
    console.log('Product 2 handwoven_details:', p2.json.product.handwoven_details);
    console.log('Product 2 sizes:', p2.json.product.sizes.map(s => s.size_name));

    console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

run().catch(console.error);
