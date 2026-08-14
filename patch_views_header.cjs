const fs = require('fs');

function patchHeader(file, title, iconHtml) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace the header div
    const searchRegex = /<h3 class="font-black.*?<\/h3>\s*<button onclick="loadMedicalData\(\)".*?<\/button>/s;
    const replacement = `<div class="flex items-center gap-2">
           <h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg flex items-center gap-2">
               \${iconHtml}
               \${title}
           </h3>
       </div>
       <div class="flex items-center gap-2">
           <select onchange="if(this.value) window.location.href=this.value" class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-md hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer shrink-0">
               <option value="" disabled selected>Custom Views</option>
               <option value="medical.html">Medical</option>
               <option value="diet.html">Dietary</option>
               <option value="expired.html">Expired Passports</option>
               <option value="other.html">Other Notes</option>
           </select>
           <button onclick="loadMedicalData()" class="p-1.5 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none shadow-sm" title="Refresh">
               <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
           </button>
       </div>`;
       
    code = code.replace(searchRegex, replacement);
    fs.writeFileSync(file, code);
}

patchHeader('frontend/js/medical.js', 'Medical & Medications', '<svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zM12 9v6m-3-3h6" /></svg>');
patchHeader('frontend/js/diet.js', 'Dietary Restrictions', '<svg class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>');
patchHeader('frontend/js/expired.js', 'Expired Passports', '<svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-3.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm3-.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>');

console.log("Patched view headers");
