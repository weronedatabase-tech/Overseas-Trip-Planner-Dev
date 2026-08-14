const fs = require('fs');
let js = fs.readFileSync('frontend/js/expired.js', 'utf8');

js = js.replace(/buildMedicalUI/g, 'buildExpiredUI');
js = js.replace(/loadMedicalData/g, 'loadExpiredData');
js = js.replace(/renderMedicalTable/g, 'renderExpiredTable');
js = js.replace(/handleMedicalSearch/g, 'handleExpiredSearch');
js = js.replace(/medicalSearchQuery/g, 'expiredSearchQuery');
js = js.replace(/medicalSearch/g, 'expiredSearch');

fs.writeFileSync('frontend/js/expired.js', js);
console.log("Fixed expired functions");
