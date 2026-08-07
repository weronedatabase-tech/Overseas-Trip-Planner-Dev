const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(
    /<input type="text" id="groupSearchInput"[\s\S]*?<i class="fa-solid fa-search absolute left-2.5 top-2 text-gray-400 text-\[10px\]"><\/i>\s*<\/div>/,
    `<input type="text" id="groupSearchInput" oninput="renderGroups()" placeholder="Search..." class="w-full p-1.5 pl-7 pr-8 border border-gray-300 dark:border-gray-700 rounded text-[10px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition">
                <i class="fa-solid fa-search absolute left-2.5 top-2 text-gray-400 text-[10px]"></i>
                <button onclick="clearSearch('groupSearchInput', 'renderGroups')" class="absolute right-1.5 top-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>`
);

code = code.replace(
    /<input type="text" id="busSearchInput"[\s\S]*?<i class="fa-solid fa-search absolute left-2.5 top-2 text-gray-400 text-\[10px\]"><\/i>\s*<\/div>/,
    `<input type="text" id="busSearchInput" oninput="renderBuses()" placeholder="Search..." class="w-full p-1.5 pl-7 pr-8 border border-gray-300 dark:border-gray-700 rounded text-[10px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition">
                <i class="fa-solid fa-search absolute left-2.5 top-2 text-gray-400 text-[10px]"></i>
                <button onclick="clearSearch('busSearchInput', 'renderBuses')" class="absolute right-1.5 top-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>`
);

fs.writeFileSync('frontend/js/logistics.js', code);

let htmlCode = fs.readFileSync('logistics.html', 'utf8');
htmlCode = htmlCode.replace(
    /<div class="p-3 border-b border-gray-200 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-900">\s*<input type="text" id="sheetSearchInput" oninput="filterBottomSheet\(\)" placeholder="Search by name\.\.\." class="w-full p-2\.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-950 font-medium text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white shadow-sm">\s*<\/div>/,
    `<div class="p-3 border-b border-gray-200 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-900 relative">
       <div class="relative w-full">
           <input type="text" id="sheetSearchInput" oninput="filterBottomSheet()" placeholder="Search by name..." class="w-full p-2.5 pl-9 pr-10 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-950 font-medium text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white shadow-sm transition">
           <svg class="w-4 h-4 absolute left-3 top-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           <button onclick="clearSearch('sheetSearchInput', 'filterBottomSheet')" class="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
       </div>
     </div>`
);
fs.writeFileSync('logistics.html', htmlCode);
