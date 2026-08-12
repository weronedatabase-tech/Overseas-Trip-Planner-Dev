const fs = require('fs');
let code = fs.readFileSync('frontend/js/medical.js', 'utf8');

// Replace renderMedicalTable
const renderMedicalTableStr = `function renderMedicalTable() {
let data = medicalRosterData.filter(p => p.medical || p.otherPoints || p.emergencyName || p.emergencyContact);
if (medicalSearchQuery) {
   data = data.filter(p => {
       return (p.fullName && p.fullName.toLowerCase().includes(medicalSearchQuery)) ||
              (p.shortName && p.shortName.toLowerCase().includes(medicalSearchQuery)) ||
              (p.diet && p.diet.toLowerCase().includes(medicalSearchQuery)) ||
              (p.medical && p.medical.toLowerCase().includes(medicalSearchQuery)) ||
              (p.otherPoints && p.otherPoints.toLowerCase().includes(medicalSearchQuery));
   });
}
data.sort((a, b) => {
   let valA = (a.fullName || '').toString().toLowerCase();
   let valB = (b.fullName || '').toString().toLowerCase();
   if (valA < valB) return -1;
   if (valA > valB) return 1;
   return 0;
});

const thead = document.getElementById('medicalTableHead');
let headHtml = \`<tr>
   <th class="p-3 bg-gray-100 dark:bg-gray-800 align-top sticky left-0 z-20 border-r border-gray-200 dark:border-gray-700 shadow-sm w-1/3 text-left">
       <div class="font-bold text-gray-700 dark:text-gray-300">Participant</div>
   </th>
   <th class="p-3 bg-gray-100 dark:bg-gray-800 align-top w-2/3 text-left">
       <div class="font-bold text-gray-700 dark:text-gray-300">Medical & Emergency Details</div>
   </th>
</tr>\`;
thead.innerHTML = headHtml;

const tbody = document.getElementById('medicalTableBody');
let html = '';
data.forEach(p => {
   const roleStr = p.role.substring(0, 3).toUpperCase();
   const roleColor = p.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (p.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');
   const fullNameUpper = (p.fullName || '').toUpperCase();
   const shortNameUpper = (p.shortName || '').toUpperCase();
   const nameClass = 'font-bold text-gray-900 dark:text-gray-100';
   
   html += \`<tr class="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer" data-nric="\${p.nric}">
       <td class="p-3 align-top sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm w-1/3">
           <div class="\${nameClass} text-xs md:text-sm leading-tight whitespace-normal break-words">\${fullNameUpper}</div>
           \${shortNameUpper && shortNameUpper !== fullNameUpper ? \`<div class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium whitespace-normal break-words">\${shortNameUpper}</div>\` : ''}
           <div class="flex items-center gap-1 mt-1 flex-wrap">
               <span class="text-[9px] font-black \${roleColor} bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-wider">\${roleStr}</span>
               <span class="px-1.5 py-0.5 rounded border shadow-sm text-[9px] font-bold \${getProjectColor(p.group)} whitespace-normal break-words inline-block">\${(p.group || 'None').toUpperCase()}</span>
           </div>
           \${p.caregiverFor ? \`<div class="mt-1 font-bold text-purple-600 dark:text-purple-400 text-[10px]">[\${p.caregiverFor.toUpperCase()}]</div>\` : ''}
       </td>
       <td class="p-3 align-top w-2/3 text-xs leading-relaxed whitespace-normal break-words border-l border-gray-100 dark:border-gray-800/50">
           <div class="flex flex-col gap-3">\`;

   const hasMedical = p.medical && p.medical.trim() && p.medical.trim().toLowerCase() !== 'nil' && p.medical.trim().toLowerCase() !== 'none';
   if (hasMedical) {
       html += \`<div><span class="font-bold text-gray-500 uppercase text-[10px] block mb-0.5">Medical & Medications:</span> <span class="text-rose-700 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded inline-block whitespace-pre-wrap">\${p.medical}</span></div>\`;
   }
   
   const hasNotes = p.otherPoints && p.otherPoints.trim() && p.otherPoints.trim().toLowerCase() !== 'nil' && p.otherPoints.trim().toLowerCase() !== 'none';
   if (hasNotes) {
       html += \`<div><span class="font-bold text-gray-500 uppercase text-[10px] block mb-0.5">Other Notes:</span> <span class="text-orange-700 dark:text-orange-400 font-medium whitespace-pre-wrap block">\${p.otherPoints}</span></div>\`;
   }
   
   if (p.emergencyName || p.emergencyContact) {
       html += \`<div class="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
           <div class="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1">Emergency Contact</div>
           <div class="font-bold text-gray-800 dark:text-gray-200">\${(p.emergencyName || '-').toUpperCase()} \${p.emergencyRelation ? \`(\${p.emergencyRelation.toUpperCase()})\` : ''}</div>
           <div class="font-mono text-blue-600 dark:text-blue-400 font-bold mt-0.5">\${p.emergencyContact || '-'}</div>
       </div>\`;
   }

   html += \`</div></td></tr>\`;
});

tbody.innerHTML = html || \`<tr><td colspan="2" class="p-6 text-center text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">No records found matching the criteria.</td></tr>\`;
}
`;

code = code.replace(/function renderMedicalTable\(\) \{[\s\S]*?(?=\n\}\n?)$/m, renderMedicalTableStr + "\n");
fs.writeFileSync('frontend/js/medical.js', code);
console.log("Patched medical.js");
