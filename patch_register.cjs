const fs = require('fs');
let code = fs.readFileSync('register.html', 'utf8');

code = code.replace(
    /<input type="text" id="cgPopupTraineeName"([^>]*)class="([^"]*)"([^>]*)>/,
    `<div class="relative">
               <input type="text" id="cgPopupTraineeName"$1class="$2 pr-8"$3>
               <button type="button" onclick="document.getElementById('cgPopupTraineeName').value=''; filterCgPopupDropdown(); document.getElementById('cgPopupTraineeName').focus();" class="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
           </div>`
);
fs.writeFileSync('register.html', code);
