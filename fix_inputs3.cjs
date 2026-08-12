const fs = require('fs');
let code = fs.readFileSync('frontend/js/finance.js', 'utf8');

code = code.replace(/function updateFeeDeviation\(poc, field, value\) \{[\s\S]*?queueFinanceUpdate\(\);\n\}/, 
`function updateFeeDeviation(poc, field, value) {
if (!financeConfig.feeDeviations) financeConfig.feeDeviations = {};
if (!financeConfig.feeDeviations[poc]) financeConfig.feeDeviations[poc] = { amount: 0, remarks: '' };
if (field === 'amount') {
    financeConfig.feeDeviations[poc].amount = parseFloat(String(value).replace(/,/g, '')) || 0;
} else {
    financeConfig.feeDeviations[poc].remarks = value;
}
queueFinanceUpdate();
renderFeeTracker();
}`);
fs.writeFileSync('frontend/js/finance.js', code);
