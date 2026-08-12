const fs = require('fs');
let code = fs.readFileSync('frontend/js/profile.js', 'utf8');

// I will just replace the exact lines
const target = `try { 
    const [profRes, finRes, recRes, logRes] = await Promise.all([
        apiCall('getProfile', { nric: currentUser.nric }),
        apiCall('fetchFinance'),
        apiCall('fetchReceipts'),
        apiCall('fetchLogistics')
    ]);`;

const replacement = `try { 
    const [profRes, finRes, recRes, logRes] = await Promise.all([
        apiCall('getProfile', { nric: currentUser.nric }).catch(e => { console.warn("Failed to load profile:", e); return { family: [] }; }),
        apiCall('fetchFinance').catch(e => { console.warn("Failed to load finance:", e); return { data: { config: {}, options: [] }, rates: { "SGD": 1 } }; }),
        apiCall('fetchReceipts').catch(e => { console.warn("Failed to load receipts:", e); return { receipts: [] }; }),
        apiCall('fetchLogistics').catch(e => { console.warn("Failed to load logistics:", e); return null; })
    ]);`;

code = code.replace(/const \[profRes, finRes, recRes, logRes\] = await Promise.all\(\[\s*apiCall\('getProfile', { nric: currentUser.nric }\),\s*apiCall\('fetchFinance'\),\s*apiCall\('fetchReceipts'\),\s*apiCall\('fetchLogistics'\)\s*\]\);/g, replacement);

fs.writeFileSync('frontend/js/profile.js', code);
