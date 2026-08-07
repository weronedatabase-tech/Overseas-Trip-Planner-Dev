const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(/<div id="groupListContainer" class="flex-grow overflow-y-auto p-1\.5 md:p-2 custom-scrollbar flex flex-col gap-2 md:gap-3 pb-6"><\/div>/,
`<div class="flex items-center justify-between px-2 py-1.5 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Assigned Groups</span>
                <button onclick="addGroupList()" class="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-[9px] font-bold text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary transition focus:outline-none"><i class="fa-solid fa-plus mr-1"></i>Add</button>
            </div>
            <div id="groupListContainer" class="flex-grow overflow-y-auto p-1.5 md:p-2 custom-scrollbar flex flex-col gap-2 md:gap-3 pb-6"></div>`);

code = code.replace(/<div id="busListContainer" class="flex-grow overflow-y-auto p-1\.5 md:p-2 custom-scrollbar flex flex-col gap-2 md:gap-3 pb-6"><\/div>/,
`<div class="flex items-center justify-between px-2 py-1.5 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Assigned Buses</span>
                <button onclick="addBusList()" class="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-[9px] font-bold text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary transition focus:outline-none"><i class="fa-solid fa-plus mr-1"></i>Add</button>
            </div>
            <div id="busListContainer" class="flex-grow overflow-y-auto p-1.5 md:p-2 custom-scrollbar flex flex-col gap-2 md:gap-3 pb-6"></div>`);

fs.writeFileSync('frontend/js/logistics.js', code);
