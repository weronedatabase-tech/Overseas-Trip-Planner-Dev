const fs = require('fs');

// patch profile.js
let codeProfile = fs.readFileSync('frontend/js/profile.js', 'utf8');
codeProfile = codeProfile.replace(
    /<div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-\[9px\] uppercase tracking-wider mb-0\.5">Medical Conditions and Medications to take note of<\/p><p class="font-semibold">\$\{m\.medical \|\| 'None'\}<\/p><\/div>/g,
    `\${m.role === 'TRAINEE' ? \`<div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Medical Conditions and Medications to take note of</p><p class="font-semibold">\${m.medical || 'None'}</p></div>\` : ''}`
);
codeProfile = codeProfile.replace(
    /<div class="md:col-span-2"><label class="text-\[10px\] font-bold mb-0\.5 text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Medical Conditions and Medications to take note of<\/label><textarea id="edMedical_\$\{i\}"/g,
    `<div class="\${m.role === 'TRAINEE' ? 'md:col-span-2' : 'hidden-force'}"><label class="text-[10px] font-bold mb-0.5 text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Medical Conditions and Medications to take note of</label><textarea id="edMedical_\${i}"`
);
fs.writeFileSync('frontend/js/profile.js', codeProfile);

// patch main.js
let codeMain = fs.readFileSync('frontend/js/main.js', 'utf8');
codeMain = codeMain.replace(
    /<div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-\[9px\] uppercase tracking-wider mb-0\.5">Medical Conditions and Medications to take note of<\/p><p class="font-semibold">\$\{m\.medical \|\| 'None'\}<\/p><\/div>/g,
    `\${m.role === 'TRAINEE' ? \`<div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Medical Conditions and Medications to take note of</p><p class="font-semibold">\${m.medical || 'None'}</p></div>\` : ''}`
);
codeMain = codeMain.replace(
    /<div class="md:col-span-2"><label class="text-\[10px\] font-bold mb-0\.5 text-gray-500 block uppercase">Medical Conditions<\/label><textarea id="gpmMedical"/g,
    `<div class="\${m.role === 'TRAINEE' ? 'md:col-span-2' : 'hidden-force'}"><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Medical Conditions</label><textarea id="gpmMedical"`
);
fs.writeFileSync('frontend/js/main.js', codeMain);
