const fs = require('fs');
let code = fs.readFileSync('frontend/js/main.js', 'utf8');

code = code.replace(
    /window\.handleGpmRelatedSearch = function\(query\) \{[\s\S]*?dd\.classList\.remove\('hidden-force'\);\s*\};/,
    `window.handleGpmRelatedSearch = function(fullQuery) {
    const dd = document.getElementById('gpmRelatedDropdown');
    if(!dd) return;
    
    const parts = (fullQuery || '').split(',');
    const query = parts[parts.length - 1].trim().toLowerCase();
    
    let allP = [];
    if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) {
        allP = adminRosterData;
    } else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) {
        allP = loadedFamily;
    }
    
    const trainees = allP.filter(p => p.role === 'TRAINEE');
    
    if(!query) { 
        // Show all trainees if just trailing comma
        // Actually it's better to hide if they didn't type yet after comma
    }
    
    const results = trainees.filter(t => (t.fullName || '').toLowerCase().includes(query) || (t.shortName || '').toLowerCase().includes(query));
    
    if(results.length === 0) {
        dd.innerHTML = '<div class="p-2 text-xs text-gray-500 text-center">No trainees found.</div>';
    } else {
        dd.innerHTML = results.map(t => {
            const escName = (t.fullName || '').replace(/'/g, "\\\\'");
            return '<div class="p-2 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onclick="selectGpmRelatedTrainee(\\'' + escName + '\\')"><div class="font-bold text-xs text-gray-800 dark:text-gray-200">' + t.fullName + '</div><div class="text-[10px] text-gray-500">' + (t.shortName || '-') + '</div></div>';
        }).join('');
    }
    dd.classList.remove('hidden-force');
};`
);

code = code.replace(
    /window\.selectGpmRelatedTrainee = function\(name\) \{[\s\S]*?dd\.classList\.add\('hidden-force'\);\s*\}\s*\};/,
    `window.selectGpmRelatedTrainee = function(name) {
    const inp = document.getElementById('gpmRelated');
    if(inp) {
        let parts = inp.value.split(',');
        parts.pop();
        parts.push(name);
        inp.value = parts.join(', ') + ', ';
    }
    const dd = document.getElementById('gpmRelatedDropdown');
    if(dd) dd.classList.add('hidden-force');
};`
);
fs.writeFileSync('frontend/js/main.js', code);
