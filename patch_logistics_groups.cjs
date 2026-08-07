const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

const logGroupsDiv = `<div id="log-groups" class="hidden-force flex-1 mt-2 w-full"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Group builder coming soon...</p></div></div>`;
const logBusesDiv = `<div id="log-buses" class="hidden-force flex-1 mt-2 w-full"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Bus Allocation coming soon...</p></div></div>`;

const newLogGroupsDiv = `<div id="log-groups" class="hidden-force flex-1 flex flex-col min-h-0 w-full relative">
    <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-2 md:p-3 shrink-0 flex flex-col gap-2 shadow-sm sticky top-0 z-30">
        <div class="flex justify-between items-center px-1">
            <div class="flex flex-wrap items-center gap-1 md:gap-1.5">
                <h3 class="text-xs md:text-base font-black text-gray-900 dark:text-white tracking-tight mr-1 shrink-0">Groups</h3>
                <button onclick="autoGroup()" class="bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 text-[9px] md:text-xs font-bold px-1.5 py-1 md:px-2 md:py-1.5 rounded shadow-sm hover:bg-blue-100 transition focus:outline-none flex items-center gap-0.5 md:gap-1" title="Auto Group">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <span class="whitespace-nowrap">Auto Group</span>
                </button>
                <button onclick="resetGroupAssignments()" class="bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800 text-[9px] md:text-xs font-bold px-1.5 py-1 md:px-2 md:py-1.5 rounded shadow-sm hover:bg-orange-100 transition focus:outline-none flex items-center gap-0.5 md:gap-1" title="Clear all Assignments">
                    <svg class="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    <span class="whitespace-nowrap">Clear</span>
                </button>
            </div>
            <button onclick="manualSyncGroups(this)" class="btn-sync-groups text-[10px] md:text-xs px-2 py-1 rounded-md font-bold transition flex items-center justify-center border shadow-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 focus:outline-none shrink-0">
                <span class="btn-text">Saved</span><i class="fa-solid fa-circle-notch fa-spin btn-spinner hidden ml-1"></i>
            </button>
        </div>
        <div class="relative w-full flex items-center gap-2">
            <div class="relative flex-1">
                <input type="text" id="groupSearchInput" oninput="renderGroups()" placeholder="Search..." class="w-full p-1.5 pl-7 pr-8 border border-gray-300 dark:border-gray-700 rounded text-[10px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition">
                <i class="fa-solid fa-search absolute left-2.5 top-2 text-gray-400 text-[10px]"></i>
            </div>
        </div>
    </div>
    <div class="flex flex-row flex-1 min-h-0 w-full overflow-hidden relative">
        <div class="flex-1 min-w-0 flex flex-col h-full overflow-hidden transition-colors border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <h4 class="font-black text-[10px] py-1.5 shrink-0 text-center uppercase tracking-widest shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50">Unassigned (<span id="groupUnassignedCount">0</span>)</h4>
            <div id="groupUnassignedPool" class="space-y-1.5 flex-grow overflow-y-auto p-1.5 md:p-2 custom-scrollbar pb-6"></div>
        </div>
        <div class="flex-1 min-w-0 flex flex-col h-full overflow-hidden transition-colors bg-white dark:bg-gray-950">
            <div id="groupListContainer" class="flex-grow overflow-y-auto p-1.5 md:p-2 custom-scrollbar flex flex-col gap-2 md:gap-3 pb-6"></div>
        </div>
    </div>
</div>`;

const newLogBusesDiv = `<div id="log-buses" class="hidden-force flex-1 flex flex-col min-h-0 w-full relative">
    <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-2 md:p-3 shrink-0 flex flex-col gap-2 shadow-sm sticky top-0 z-30">
        <div class="flex justify-between items-center px-1">
            <div class="flex flex-wrap items-center gap-1 md:gap-1.5">
                <h3 class="text-xs md:text-base font-black text-gray-900 dark:text-white tracking-tight mr-1 shrink-0">Buses</h3>
                <button onclick="autoBus()" class="bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 text-[9px] md:text-xs font-bold px-1.5 py-1 md:px-2 md:py-1.5 rounded shadow-sm hover:bg-blue-100 transition focus:outline-none flex items-center gap-0.5 md:gap-1" title="Auto Bus">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <span class="whitespace-nowrap">Auto Bus</span>
                </button>
                <button onclick="resetBusAssignments()" class="bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800 text-[9px] md:text-xs font-bold px-1.5 py-1 md:px-2 md:py-1.5 rounded shadow-sm hover:bg-orange-100 transition focus:outline-none flex items-center gap-0.5 md:gap-1" title="Clear all Assignments">
                    <svg class="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    <span class="whitespace-nowrap">Clear</span>
                </button>
            </div>
            <button onclick="manualSyncBuses(this)" class="btn-sync-buses text-[10px] md:text-xs px-2 py-1 rounded-md font-bold transition flex items-center justify-center border shadow-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 focus:outline-none shrink-0">
                <span class="btn-text">Saved</span><i class="fa-solid fa-circle-notch fa-spin btn-spinner hidden ml-1"></i>
            </button>
        </div>
        <div class="relative w-full flex items-center gap-2">
            <div class="relative flex-1">
                <input type="text" id="busSearchInput" oninput="renderBuses()" placeholder="Search..." class="w-full p-1.5 pl-7 pr-8 border border-gray-300 dark:border-gray-700 rounded text-[10px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition">
                <i class="fa-solid fa-search absolute left-2.5 top-2 text-gray-400 text-[10px]"></i>
            </div>
        </div>
    </div>
    <div class="flex flex-row flex-1 min-h-0 w-full overflow-hidden relative">
        <div class="flex-1 min-w-0 flex flex-col h-full overflow-hidden transition-colors border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <h4 class="font-black text-[10px] py-1.5 shrink-0 text-center uppercase tracking-widest shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50">Unassigned (<span id="busUnassignedCount">0</span>)</h4>
            <div id="busUnassignedPool" class="space-y-1.5 flex-grow overflow-y-auto p-1.5 md:p-2 custom-scrollbar pb-6"></div>
        </div>
        <div class="flex-1 min-w-0 flex flex-col h-full overflow-hidden transition-colors bg-white dark:bg-gray-950">
            <div id="busListContainer" class="flex-grow overflow-y-auto p-1.5 md:p-2 custom-scrollbar flex flex-col gap-2 md:gap-3 pb-6"></div>
        </div>
    </div>
</div>`;

code = code.replace(logGroupsDiv, newLogGroupsDiv);
code = code.replace(logBusesDiv, newLogBusesDiv);

fs.writeFileSync('frontend/js/logistics.js', code);
