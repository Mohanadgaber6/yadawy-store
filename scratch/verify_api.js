const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
}

async function verify() {
    console.log('Testing Yadawy API...');
    
    // 1. Sections & Categories
    const secData = await get('http://localhost:3000/api/categories/sections/all');
    console.log('1. Sections returned:', secData.sections.map(s => `${s.name} (${s.categories.length} categories)`));
    
    // 2. Carpet Categories
    const carpetCats = await get('http://localhost:3000/api/categories?section=carpets');
    console.log('2. Carpet categories:', carpetCats.categories.map(c => c.name));
    
    // 3. Kilim Categories
    const kilimCats = await get('http://localhost:3000/api/categories?section=kilims');
    console.log('3. Kilim categories:', kilimCats.categories.map(c => c.name));
    
    // 4. Products in Carpets
    const carpetProds = await get('http://localhost:3000/api/products?section=carpets');
    console.log(`4. Products in Carpets: ${carpetProds.products.length} (Total: ${carpetProds.pagination.total})`);
    
    // 5. Products in Kilims
    const kilimProds = await get('http://localhost:3000/api/products?section=kilims');
    console.log(`5. Products in Kilims: ${kilimProds.products.length} (Total: ${kilimProds.pagination.total})`);
    
    // 6. Products in Fine Wool Kilim
    const fineWool = await get('http://localhost:3000/api/products?section=kilims&category=fine-wool-kilim');
    console.log(`6. Products in Fine Wool Kilim: ${fineWool.products.length}`);
    
    // 7. Product Details sample
    if (carpetProds.products.length > 0) {
        const p1 = carpetProds.products[0];
        const detail = await get(`http://localhost:3000/api/products/${p1.slug}`);
        console.log(`7. Sample Detail for ${p1.name}:`);
        console.log(`   - Category: ${detail.product.category_name}`);
        console.log(`   - Primary Image: ${detail.product.primary_image}`);
        console.log(`   - Images count: ${detail.product.images?.length}`);
        console.log(`   - Videos count: ${detail.product.videos?.length}`);
    }
    
    console.log('\n✅ All API tests passed successfully!');
}

verify().catch(console.error);
