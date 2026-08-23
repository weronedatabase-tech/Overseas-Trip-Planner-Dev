const fs = require('fs');
let code = fs.readFileSync('./frontend/js/registration.js', 'utf8');

const target1 = '<input required type="text" class="reg-f-nric w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg uppercase bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary">';
const rep1 = '<div class="dup-warn hidden-force text-xs text-red-500 font-bold mb-1"></div><input required type="text" onblur="checkDuplicateField(this, \'nric\')" class="reg-f-nric w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg uppercase bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary">';

const target2 = '<input required type="text" class="reg-f-pass w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg uppercase bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary">';
const rep2 = '<div class="dup-warn hidden-force text-xs text-red-500 font-bold mb-1"></div><input required type="text" onblur="checkDuplicateField(this, \'passport\')" class="reg-f-pass w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg uppercase bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary">';

code = code.replace(target1, rep1);
code = code.replace(target2, rep2);

fs.writeFileSync('./frontend/js/registration.js', code);
console.log("Updated inputs");
