const fs = require('fs');

let js = fs.readFileSync('frontend/js/main.js', 'utf8');

js = js.replace(/<p class="font-semibold">\$\{m\.dob\}<\/p>/g, 
                '<p class="font-semibold">${formatDDMmmYYYY(m.dob)}</p>');

js = js.replace(/<p class="font-semibold">\$\{m\.passportExpiry \|\| '-'\}<\/p>/g, 
                '<p class="font-semibold">${m.passportExpiry ? formatDDMmmYYYY(m.passportExpiry) : \'-\'}</p>');

fs.writeFileSync('frontend/js/main.js', js);
console.log("Fixed main.js date format");
