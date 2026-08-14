const fs = require('fs');
let js = fs.readFileSync('frontend/js/participants.js', 'utf8');

js = js.replace('<h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg truncate shrink-0">Roster</h3>', '<h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg truncate shrink-0"><span class="hidden md:inline">Participant </span>Roster</h3>');

fs.writeFileSync('frontend/js/participants.js', js);
console.log("Patched roster title");
