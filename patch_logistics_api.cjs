const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');
code = code.replace(/await apiCall\('syncAssignments', \{ updates: batch, column: 'group' \}\);/, 
                    `await apiCall('syncAssignments', { updates: batch, column: 'logisticsGroup' });`);
fs.writeFileSync('frontend/js/logistics.js', code);
