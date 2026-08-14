const fs = require('fs');

let js = fs.readFileSync('frontend/js/diet.js', 'utf8');
js = js.replace(/id="medicalSearch"/, 'id="dietSearch"');
js = js.replace(/handleMedicalSearch/g, 'handleDietSearch');
js = js.replace(/clearSearch\('medicalSearch'/g, 'clearSearch(\\\'dietSearch\\\'');
fs.writeFileSync('frontend/js/diet.js', js);

js = fs.readFileSync('frontend/js/expired.js', 'utf8');
js = js.replace(/id="medicalSearch"/, 'id="expiredSearch"');
js = js.replace(/handleMedicalSearch/g, 'handleExpiredSearch');
js = js.replace(/clearSearch\('medicalSearch'/g, 'clearSearch(\\\'expiredSearch\\\'');
fs.writeFileSync('frontend/js/expired.js', js);

js = fs.readFileSync('frontend/js/other.js', 'utf8');
js = js.replace(/id="medicalSearch"/, 'id="otherSearch"');
js = js.replace(/handleMedicalSearch/g, 'handleOtherSearch');
js = js.replace(/clearSearch\('medicalSearch'/g, 'clearSearch(\\\'otherSearch\\\'');
// Also verify the input placeholder in other.js
js = js.replace(/placeholder="Search by name, diet, or medical notes..."/, 'placeholder="Search by name or other notes..."');
fs.writeFileSync('frontend/js/other.js', js);

console.log("Fixed search inputs");
