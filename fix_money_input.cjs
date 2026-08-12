const fs = require('fs');
let code = fs.readFileSync('frontend/js/ui.js', 'utf8');

// Replace /[^0-9.]/g with /[^0-9.-]/g
code = code.replace(/input\.value\.replace\(\/\[\^0-9\.\]\/g, ''\)/g, "input.value.replace(/[^0-9.-]/g, '')");

// Ensure minus is only at start
const checkMinus = ` let val = input.value.replace(/[^0-9.-]/g, '');
 if(val !== '') {
     let isNegative = val[0] === '-';
     val = val.replace(/-/g, '');
     if(isNegative) val = '-' + val;
 }`;

code = code.replace(/let val = input\.value\.replace\(\/\[\^0-9\.\-\]\/g, ''\);/, checkMinus);

fs.writeFileSync('frontend/js/ui.js', code);
