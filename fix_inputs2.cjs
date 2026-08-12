const fs = require('fs');
let code = fs.readFileSync('frontend/js/finance.js', 'utf8');

code = code.replace(/queueFinanceUpdate\(\);\n\}/g, "queueFinanceUpdate();\nrenderFeeTracker();\n}");
// wait, I need to make sure I only replace it in updateFeeDeviation.
