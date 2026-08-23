const fs = require('fs');

let codeProfile = fs.readFileSync('frontend/js/profile.js', 'utf8');

// Insert fields in form
codeProfile = codeProfile.replace(
    /<div class="md:col-span-2"><label class="text-\[10px\] font-bold mb-0\.5 text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Other Points to Note<\/label><textarea id="edOther_\$\{i\}"/g,
    `<div class="\${m.role==='CAREGIVER'?'block':'hidden-force'} relative"><label class="text-[10px] font-bold mb-0.5 text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Caregiver For</label><input type="text" id="edRelated_\${i}" placeholder="Comma-separated" value="\${m.relatedTrainee || ''}" autocomplete="off" oninput="handleProfileRelatedSearch(\${i}, this.value)" onfocus="handleProfileRelatedSearch(\${i}, this.value)" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"><div id="edRelatedDropdown_\${i}" class="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 hidden-force max-h-48 overflow-y-auto"></div></div>
        <div class="\${m.role==='CAREGIVER'?'block':'hidden-force'}"><label class="text-[10px] font-bold mb-0.5 text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Relationship</label><input type="text" id="edRelation_\${i}" value="\${m.relationship || ''}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"></div>
        <div class="md:col-span-2"><label class="text-[10px] font-bold mb-0.5 text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Other Points to Note</label><textarea id="edOther_\${i}"`
);

// Update save payload
codeProfile = codeProfile.replace(
    /relatedTrainee: loadedFamily\[i\]\.relatedTrainee, \s*relationship: loadedFamily\[i\]\.relationship/g,
    `relatedTrainee: document.getElementById(\`edRelated_\${i}\`) ? document.getElementById(\`edRelated_\${i}\`).value : loadedFamily[i].relatedTrainee, 
 relationship: document.getElementById(\`edRelation_\${i}\`) ? document.getElementById(\`edRelation_\${i}\`).value : loadedFamily[i].relationship`
);

// Add the search functions at the end
codeProfile += `

window.handleProfileRelatedSearch = function(idx, fullQuery) {
    const dd = document.getElementById('edRelatedDropdown_' + idx);
    if(!dd) return;
    
    const parts = (fullQuery || '').split(',');
    const query = parts[parts.length - 1].trim().toLowerCase();
    
    let allP = [];
    if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) {
        allP = loadedFamily; // Only family members in profile
    }
    
    const trainees = allP.filter(p => p.role === 'TRAINEE');
    const results = trainees.filter(t => (t.fullName || '').toLowerCase().includes(query) || (t.shortName || '').toLowerCase().includes(query));
    
    if(results.length === 0) {
        dd.innerHTML = '<div class="p-2 text-xs text-gray-500 text-center">No family trainees found.</div>';
    } else {
        dd.innerHTML = results.map(t => {
            const escName = (t.fullName || '').replace(/'/g, "\\\\'");
            return '<div class="p-2 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onclick="selectProfileRelatedTrainee(' + idx + ', \\'' + escName + '\\')"><div class="font-bold text-xs text-gray-800 dark:text-gray-200">' + t.fullName + '</div><div class="text-[10px] text-gray-500">' + (t.shortName || '-') + '</div></div>';
        }).join('');
    }
    dd.classList.remove('hidden-force');
};

window.selectProfileRelatedTrainee = function(idx, name) {
    const inp = document.getElementById('edRelated_' + idx);
    if(inp) {
        let parts = inp.value.split(',');
        parts.pop();
        parts.push(name);
        inp.value = parts.join(', ') + ', ';
    }
    const dd = document.getElementById('edRelatedDropdown_' + idx);
    if(dd) dd.classList.add('hidden-force');
    setTimeout(() => { if(inp) inp.focus(); }, 10);
};

document.addEventListener('click', function(e) {
    if(e.target.closest('[id^="edRelated_"]')) return;
    if(e.target.closest('[id^="edRelatedDropdown_"]')) return;
    const dds = document.querySelectorAll('[id^="edRelatedDropdown_"]');
    dds.forEach(dd => dd.classList.add('hidden-force'));
});
`;

fs.writeFileSync('frontend/js/profile.js', codeProfile);
