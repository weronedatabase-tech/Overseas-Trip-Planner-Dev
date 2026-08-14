const fs = require('fs');
let js = fs.readFileSync('frontend/js/participants.js', 'utf8');

// The original UI block:
// <div class="flex items-center gap-2">
//        <h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg">Participant Roster <span id="rosterTotalCount" class="text-gray-500 font-bold text-sm">(0)</span></h3>
//        <button onclick="showRosterBreakdownModal()" class="text-gray-400 hover:text-primary focus:outline-none transition bg-gray-100 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-blue-900/30 rounded-full p-1" title="View Breakdown">
//            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
//        </button>
//        </div>

const searchRegex = /<div class="flex items-center gap-2">\s*<h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg">Participant Roster <span id="rosterTotalCount" class="text-gray-500 font-bold text-sm">\(0\)<\/span><\/h3>\s*<button onclick="showRosterBreakdownModal\(\)" class="text-gray-400 hover:text-primary focus:outline-none transition bg-gray-100 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-blue-900\/30 rounded-full p-1" title="View Breakdown">\s*<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2\.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h\.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"><\/path><\/svg>\s*<\/button>\s*<\/div>/m;

const replacement = `<div class="flex items-center gap-1.5 shrink-0 whitespace-nowrap min-w-0">
           <h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg truncate shrink-0">Roster</h3>
           <span id="rosterTotalCount" class="text-gray-500 font-black text-[11px] md:text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 shrink-0">(0)</span>
           <button onclick="showRosterBreakdownModal()" class="flex items-center justify-center bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 focus:outline-none transition rounded-lg px-2 py-1 md:px-2.5 md:py-1.5 shadow-sm border border-blue-200 dark:border-blue-800 shrink-0 ml-1" title="View Roster Breakdown">
               <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <span class="text-[10px] md:text-xs font-black ml-1.5 uppercase tracking-wider hidden md:inline">Breakdown</span>
           </button>
       </div>`;

js = js.replace(searchRegex, replacement);
fs.writeFileSync('frontend/js/participants.js', js);
console.log("Patched roster header");
