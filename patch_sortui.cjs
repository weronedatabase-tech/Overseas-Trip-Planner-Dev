const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

const regex = /<div id="sortSelector" class="hidden-force absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-40 p-3">/s;
const replacement = `<div id="sortSelector" class="hidden-force fixed left-4 right-4 top-24 md:absolute md:left-auto md:right-0 md:top-auto md:mt-2 md:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[60] p-4 max-h-[80vh] overflow-y-auto">`;

code = code.replace(regex, replacement);

fs.writeFileSync('frontend/js/participants.js', code);
