const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(
    /<input type="text" id="landingRecCategory"[^>]*>/,
    '<select id="landingRecCategory" required class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"><option value="" disabled selected>Loading categories...</option></select>'
);
fs.writeFileSync('index.html', index);

let auth = fs.readFileSync('frontend/js/auth.js', 'utf8');
auth = auth.replace(/function toggleLandingReceipt\(\) \{/, 'async function toggleLandingReceipt() {');

// insert fetch logic
const fetchLogic = `
        try {
            const catSelect = document.getElementById('landingRecCategory');
            if (catSelect) {
                catSelect.innerHTML = '<option value="" disabled selected>Loading categories...</option>';
                const finRes = await apiCall('fetchFinance');
                const financeConfig = finRes.data?.config || {};
                const financeOptions = finRes.data?.options || (Array.isArray(finRes.data) ? finRes.data : []);
                
                let optionsHtml = '';
                if (financeConfig.finalOptionId) {
                    const opt = financeOptions.find(o => o.id === financeConfig.finalOptionId);
                    if (opt && opt.fields) {
                        opt.fields.forEach(f => {
                            optionsHtml += \`<option value="\${f.id}">\${f.name}</option>\`;
                        });
                    }
                }
                if (optionsHtml === '') {
                    optionsHtml = '<option value="" disabled selected>No categories available</option>';
                } else {
                    optionsHtml = '<option value="" disabled selected>Select Category</option>' + optionsHtml;
                }
                catSelect.innerHTML = optionsHtml;
            }
        } catch(e) {
            console.error('Failed to fetch finance options', e);
        }
`;

auth = auth.replace(/icon\.classList\.add\('rotate-180'\);/, "icon.classList.add('rotate-180');\n" + fetchLogic);
fs.writeFileSync('frontend/js/auth.js', auth);
