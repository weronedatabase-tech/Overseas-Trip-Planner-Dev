const fs = require('fs');

let html = fs.readFileSync('diet.html', 'utf8');
html = html.replace(/id="tab-medical"/, 'id="tab-diet"');
fs.writeFileSync('diet.html', html);

html = fs.readFileSync('other.html', 'utf8');
html = html.replace(/id="tab-medical"/, 'id="tab-other"');
fs.writeFileSync('other.html', html);

html = fs.readFileSync('expired.html', 'utf8');
html = html.replace(/id="tab-medical"/, 'id="tab-expired"');
fs.writeFileSync('expired.html', html);

console.log("Fixed HTML tabs");
