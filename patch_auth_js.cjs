const fs = require('fs');
let code = fs.readFileSync('frontend/js/auth.js', 'utf8');

code = code.replace(
    /const nric = document\.getElementById\('landingRecNric'\)\.value\.trim\(\)\.toUpperCase\(\);/,
    "const nric = document.getElementById('landingRecNric').value.trim().toUpperCase();\n    const nameField = document.getElementById('landingRecName');\n    const uploaderName = nameField ? nameField.value.trim() : '';"
);

code = code.replace(
    /uploaderNric: nric,/,
    "uploaderNric: nric,\n            uploaderName: uploaderName,"
);

fs.writeFileSync('frontend/js/auth.js', code);
console.log("Updated auth.js");
