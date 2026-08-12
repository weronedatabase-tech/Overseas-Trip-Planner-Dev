const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

const originalBtn = `<button onclick="window.location.href='medical.html'" class="bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-md hover:bg-red-100 transition shadow-sm focus:outline-none shrink-0 flex items-center gap-1">
               <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zM12 9v6m-3-3h6" /></svg>
               Medical & Diet
           </button>`;

const newBtns = `<button onclick="window.location.href='medical.html'" class="bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-md hover:bg-red-100 transition shadow-sm focus:outline-none shrink-0 flex items-center gap-1">
               <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zM12 9v6m-3-3h6" /></svg>
               Medical
           </button>
           <button onclick="window.location.href='diet.html'" class="bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-md hover:bg-orange-100 transition shadow-sm focus:outline-none shrink-0 flex items-center gap-1">
               <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z M12 7v5l3 3" /></svg>
               Diet
           </button>`;

code = code.replace(originalBtn, newBtns);
fs.writeFileSync('frontend/js/participants.js', code);
