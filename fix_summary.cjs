const fs = require('fs');

let content = fs.readFileSync('frontend/js/main.js', 'utf8');

// 1. Update Date fields to use openDatePicker
content = content.replace(
    /<div><label class="text-\[10px\] font-bold mb-0\.5 text-gray-500 block uppercase">Date of Birth<\/label><input type="text" id="gpmDob" value="\$\{m\.dob\}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="DD Mmm YYYY"><\/div>/,
    '<div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Date of Birth</label><input type="text" id="gpmDob" value="${m.dob}" readonly onclick="openDatePicker(\'gpmDob\', \'dob\')" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-center font-semibold cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" placeholder="DD Mmm YYYY"></div>'
);

content = content.replace(
    /<div><label class="text-\[10px\] font-bold mb-0\.5 text-gray-500 block uppercase">Passport Expiry<\/label><input type="text" id="gpmExp" value="\$\{m\.passportExpiry\}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="DD Mmm YYYY"><\/div>/,
    '<div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Passport Expiry</label><input type="text" id="gpmExp" value="${m.passportExpiry}" readonly onclick="openDatePicker(\'gpmExp\', \'exp\')" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-center font-semibold cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" placeholder="DD Mmm YYYY"></div>'
);

// 2. Update Caregiver For field to have a dropdown wrapper
content = content.replace(
    /<div class="\$\{m\.role==='CAREGIVER'\?'block':'hidden-force'\}"><label class="text-\[10px\] font-bold mb-0\.5 text-gray-500 block uppercase">Caregiver For<\/label><input type="text" id="gpmRelated" value="\$\{m\.relatedTrainee \|\| ''\}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"><\/div>/,
    '<div class="${m.role===\'CAREGIVER\'?\'block\':\'hidden-force\'} relative"><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Caregiver For</label><input type="text" id="gpmRelated" value="${m.relatedTrainee || \'\'}" autocomplete="off" oninput="handleGpmRelatedSearch(this.value)" onfocus="handleGpmRelatedSearch(this.value)" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"><div id="gpmRelatedDropdown" class="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 hidden-force max-h-48 overflow-y-auto"></div></div>'
);

// 3. Add JS functions for live search if not exists
if (!content.includes('window.handleGpmRelatedSearch')) {
    content += `

window.handleGpmRelatedSearch = function(query) {
    const dd = document.getElementById('gpmRelatedDropdown');
    if(!dd) return;
    if(!query || !query.trim()) { dd.classList.add('hidden-force'); return; }
    
    let allP = [];
    if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) {
        allP = adminRosterData;
    } else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) {
        allP = loadedFamily;
    }
    
    const trainees = allP.filter(p => p.role === 'TRAINEE');
    const q = query.toLowerCase().trim();
    const results = trainees.filter(t => (t.fullName || '').toLowerCase().includes(q) || (t.shortName || '').toLowerCase().includes(q));
    
    if(results.length === 0) {
        dd.innerHTML = '<div class="p-2 text-xs text-gray-500 text-center">No trainees found.</div>';
    } else {
        dd.innerHTML = results.map(t => {
            const escName = (t.fullName || '').replace(/'/g, "\\\\'");
            return '<div class="p-2 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onclick="selectGpmRelatedTrainee(\\'' + escName + '\\')"><div class="font-bold text-xs text-gray-800 dark:text-gray-200">' + t.fullName + '</div><div class="text-[10px] text-gray-500">' + (t.shortName || '-') + '</div></div>';
        }).join('');
    }
    dd.classList.remove('hidden-force');
};

window.selectGpmRelatedTrainee = function(name) {
    const inp = document.getElementById('gpmRelated');
    if(inp) inp.value = name;
    const dd = document.getElementById('gpmRelatedDropdown');
    if(dd) dd.classList.add('hidden-force');
};

document.addEventListener('click', function(e) {
    const dd = document.getElementById('gpmRelatedDropdown');
    if(dd && !e.target.closest('#gpmRelated') && !e.target.closest('#gpmRelatedDropdown')) {
        dd.classList.add('hidden-force');
    }
});
`;
}

// 4. Update submit validation
content = content.replace(
    /const p = window\._currentModalParticipant;\s*const upd = \{/,
    `const p = window._currentModalParticipant;
    const roleVal = document.getElementById('gpmRole').value;
    const relatedVal = document.getElementById('gpmRelated') ? document.getElementById('gpmRelated').value.trim() : '';
    
    if (roleVal === 'CAREGIVER' && relatedVal) {
        let allP = [];
        if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) allP = adminRosterData;
        else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) allP = loadedFamily;
        
        const match = allP.find(x => x.role === 'TRAINEE' && (x.fullName || '').toLowerCase() === relatedVal.toLowerCase());
        if(!match) {
            showToast("Caregiver For field must match exactly with an existing Trainee's Full Name.", true);
            setBtnLoading(btn, false);
            return;
        }
    }
    const upd = {`
);

fs.writeFileSync('frontend/js/main.js', content, 'utf8');
