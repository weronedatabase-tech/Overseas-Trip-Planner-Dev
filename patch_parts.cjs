const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');
code = code.replace(
    /const \[rostRes, logRes\] = await Promise.all\(\[\s*apiCall\('fetchAdminRoster'\),\s*apiCall\('fetchLogistics'\)\s*\]\);/g,
    `const [rostRes, logRes] = await Promise.all([
        apiCall('fetchAdminRoster').catch(e => { console.warn("fetchAdminRoster failed", e); return { roster: [] }; }),
        apiCall('fetchLogistics').catch(e => { console.warn("fetchLogistics failed", e); return null; })
    ]);`
);
fs.writeFileSync('frontend/js/participants.js', code);
