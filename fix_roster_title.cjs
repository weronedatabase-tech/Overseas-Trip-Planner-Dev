const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

const newTitleHtml = `<div class="flex items-center gap-2">
       <h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg">Participant Roster <span id="rosterTotalCount" class="text-gray-500 font-bold text-sm">(0)</span></h3>
       <button onclick="showRosterBreakdownModal()" class="text-gray-400 hover:text-primary focus:outline-none transition bg-gray-100 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-blue-900/30 rounded-full p-1" title="View Breakdown">
           <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
       </button>
       </div>`;

code = code.replace(/<h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg">Participant Roster<\/h3>/, newTitleHtml);

const modalCode = `
window.showRosterBreakdownModal = function() {
    let breakdown = {};
    adminRosterData.forEach(p => {
        const role = p.role || 'UNKNOWN';
        const project = (p.group || 'None').toUpperCase();
        if(!breakdown[project]) breakdown[project] = { TRAINEE: 0, VOLUNTEER: 0, CAREGIVER: 0, total: 0 };
        if(breakdown[project][role] !== undefined) breakdown[project][role]++;
        else breakdown[project][role] = 1;
        breakdown[project].total++;
    });
    
    let html = '<div class="space-y-4">';
    const projKeys = Object.keys(breakdown).sort((a,b) => a.localeCompare(b));
    projKeys.forEach(proj => {
        const bd = breakdown[proj];
        html += \`<div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 class="font-black text-sm text-gray-900 dark:text-white mb-2">\${proj} <span class="text-gray-500 font-medium">(\${bd.total})</span></h4>
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
                <div class="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 p-1.5 rounded font-bold border border-blue-200 dark:border-blue-800">TRN: \${bd.TRAINEE}</div>
                <div class="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 p-1.5 rounded font-bold border border-green-200 dark:border-green-800">VOL: \${bd.VOLUNTEER}</div>
                <div class="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 p-1.5 rounded font-bold border border-purple-200 dark:border-purple-800">CGV: \${bd.CAREGIVER}</div>
            </div>
        </div>\`;
    });
    html += '</div>';
    
    const existing = document.getElementById('rosterBreakdownModal');
    if(existing) existing.remove();
    
    const modalHtml = \`
    <div id="rosterBreakdownModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800 animate-slide-up">
            <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <h3 class="font-black text-lg text-gray-900 dark:text-white tracking-tight">Participant Breakdown</h3>
                <button type="button" onclick="document.getElementById('rosterBreakdownModal').remove()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold px-1 focus:outline-none">&times;</button>
            </div>
            <div class="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                \${html}
            </div>
        </div>
    </div>\`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};
`;

code = code.replace(/function loadParticipantsData\(\) \{/, modalCode + "\nasync function loadParticipantsData() {");

const updateCountCode = `
   const countEl = document.getElementById('rosterTotalCount');
   if(countEl) countEl.innerText = \`(\${adminRosterData.length})\`;
`;
code = code.replace(/renderRosterTable\(\);/, "renderRosterTable();\n" + updateCountCode);

fs.writeFileSync('frontend/js/participants.js', code);
