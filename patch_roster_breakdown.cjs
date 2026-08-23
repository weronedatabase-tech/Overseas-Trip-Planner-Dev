const fs = require('fs');
let content = fs.readFileSync('frontend/js/participants.js', 'utf8');

const regex = /window\.showRosterBreakdownModal = function\(\) \{\s*let breakdown = \{\};\s*adminRosterData\.forEach\(p => \{.*?\n\s*\}\);/s;

let replacement = `window.showRosterBreakdownModal = function() {
    let breakdown = {};
    let totalTrainee = 0;
    let totalVolunteer = 0;
    let totalCaregiver = 0;
    let grandTotal = 0;

    adminRosterData.forEach(p => {
        const role = p.role || 'UNKNOWN';
        const project = (p.group || 'None').toUpperCase();
        if(!breakdown[project]) breakdown[project] = { TRAINEE: 0, VOLUNTEER: 0, CAREGIVER: 0, total: 0 };
        if(breakdown[project][role] !== undefined) breakdown[project][role]++;
        else breakdown[project][role] = 1;
        breakdown[project].total++;
        
        if (role === 'TRAINEE') totalTrainee++;
        else if (role === 'VOLUNTEER') totalVolunteer++;
        else if (role === 'CAREGIVER') totalCaregiver++;
        grandTotal++;
    });

    let totalsHtml = \`
    <div class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg mb-4">
        <h4 class="font-black text-sm text-gray-900 dark:text-white mb-2 flex items-center justify-between">Total Participants <span class="bg-primary text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">\${grandTotal}</span></h4>
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 p-1.5 rounded font-bold border border-green-200 dark:border-green-800 shadow-sm">TRN: \${totalTrainee}</div>
            <div class="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 p-1.5 rounded font-bold border border-orange-200 dark:border-orange-800 shadow-sm">VOL: \${totalVolunteer}</div>
            <div class="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 p-1.5 rounded font-bold border border-purple-200 dark:border-purple-800 shadow-sm">CGV: \${totalCaregiver}</div>
        </div>
    </div>\`;
`;

content = content.replace(regex, replacement);

content = content.replace(/\$\{html\}\s*<\/div>/, '${totalsHtml}\n                ${html}\n            </div>');

fs.writeFileSync('frontend/js/participants.js', content, 'utf8');
