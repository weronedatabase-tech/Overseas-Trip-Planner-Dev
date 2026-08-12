const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

const expiredBtn = `
           <button onclick="window.location.href='expired.html'" class="bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-md hover:bg-purple-100 transition shadow-sm focus:outline-none shrink-0 flex items-center gap-1">
               <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               Passports
           </button>`;

code = code.replace(/(<button onclick="window\.location\.href='diet\.html'[^>]*>[\s\S]*?<\/button>)/, "$1" + expiredBtn);
fs.writeFileSync('frontend/js/participants.js', code);
