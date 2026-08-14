const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

code = code.replace(
    /<option value="" disabled selected>Custom Views<\/option>[\s\S]*?<option value="expired\.html">Passports<\/option>/,
    `<option value="" disabled selected>Custom Views</option>
               <option value="medical.html">Medical</option>
               <option value="diet.html">Dietary</option>
               <option value="expired.html">Expired Passports</option>
               <option value="other.html">Other Notes</option>`
);

fs.writeFileSync('frontend/js/participants.js', code);
console.log("Updated participants.js selector");
