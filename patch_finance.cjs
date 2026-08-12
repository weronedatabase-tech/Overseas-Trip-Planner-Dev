const fs = require('fs');
let code = fs.readFileSync('frontend/js/finance.js', 'utf8');
code = code.replace(
    /const \[finRes, recRes\] = await Promise.all\(\[\s*apiCall\('fetchFinance'\),\s*apiCall\('fetchReceipts'\)\s*\]\);/g,
    `const [finRes, recRes] = await Promise.all([
        apiCall('fetchFinance').catch(e => { console.warn("fetchFinance failed", e); return { data: { options: [], config: {} }, rates: { "SGD": 1 } }; }),
        apiCall('fetchReceipts').catch(e => { console.warn("fetchReceipts failed", e); return { receipts: [] }; })
    ]);`
);
fs.writeFileSync('frontend/js/finance.js', code);
