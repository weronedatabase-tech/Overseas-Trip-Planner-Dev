const fs = require('fs');

function patchRender(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    
    // Find the cell renderer for name
    const anchor = `           <div class="flex items-center gap-1 mt-1 flex-wrap">
               <span class="text-[9px] font-black \${roleColor} bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-wider">\${roleStr}</span>
               <span class="px-1.5 py-0.5 rounded border shadow-sm text-[9px] font-bold \${getProjectColor(p.group)} whitespace-normal break-words inline-block">\${(p.group || 'None').toUpperCase()}</span>
           </div>
       </td>\`;`;
       
    const replacement = `           <div class="flex items-center gap-1 mt-1 flex-wrap">
               <span class="text-[9px] font-black \${roleColor} bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-wider">\${roleStr}</span>
               <span class="px-1.5 py-0.5 rounded border shadow-sm text-[9px] font-bold \${getProjectColor(p.group)} whitespace-normal break-words inline-block">\${(p.group || 'None').toUpperCase()}</span>
           </div>
           \${p.caregiverFor ? \`<div class="mt-1 font-bold text-purple-600 dark:text-purple-400 text-[10px]">[\${p.caregiverFor.toUpperCase()}]</div>\` : ''}
       </td>\`;`;
       
    if (code.includes(anchor)) {
        code = code.replace(anchor, replacement);
        fs.writeFileSync(filepath, code);
        console.log("Patched", filepath);
    } else {
        console.log("Anchor not found in", filepath);
    }
}

patchRender('frontend/js/participants.js');
patchRender('frontend/js/medical.js');
patchRender('frontend/js/diet.js');
patchRender('frontend/js/expired.js');
