const fs = require('fs');

const participantsPath = 'frontend/js/participants.js';
let participantsCode = fs.readFileSync(participantsPath, 'utf8');

const targetStr = `           <button onclick="window.location.href='medical.html'" class="bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-md hover:bg-red-100 transition shadow-sm focus:outline-none shrink-0 flex items-center gap-1">
               <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zM12 9v6m-3-3h6" /></svg>
               Medical
           </button>
           <button onclick="window.location.href='diet.html'" class="bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-md hover:bg-orange-100 transition shadow-sm focus:outline-none shrink-0 flex items-center gap-1">
               <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z M12 7v5l3 3" /></svg>
               Diet
           </button>
           <button onclick="window.location.href='expired.html'" class="bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-md hover:bg-purple-100 transition shadow-sm focus:outline-none shrink-0 flex items-center gap-1">
               <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               Passports
           </button>`;

const replacementStr = `           <select onchange="if(this.value) window.location.href=this.value" class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-md hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer shrink-0">
               <option value="" disabled selected>Custom Views</option>
               <option value="medical.html">Medical</option>
               <option value="diet.html">Dietary</option>
               <option value="expired.html">Passports</option>
           </select>`;

if (participantsCode.includes(targetStr)) {
    participantsCode = participantsCode.replace(targetStr, replacementStr);
    fs.writeFileSync(participantsPath, participantsCode);
    console.log("Successfully replaced buttons in participants.js");
} else {
    console.log("Could not find the target string in participants.js");
}

const dietPath = 'frontend/js/diet.js';
let dietCode = fs.readFileSync(dietPath, 'utf8');
dietCode = dietCode.replace('Medication & Dietary Requirements', 'Dietary Requirements');
fs.writeFileSync(dietPath, dietCode);

const expiredPath = 'frontend/js/expired.js';
let expiredCode = fs.readFileSync(expiredPath, 'utf8');
expiredCode = expiredCode.replace('Medication & Dietary Requirements', 'Expired Passports');
fs.writeFileSync(expiredPath, expiredCode);

