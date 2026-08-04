const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

const sortableRegex = /const sortableFields = \[/s;
code = code.replace(sortableRegex, `const sortableFields = [
{ id: 'specialSort', label: 'Special (Project>Family>Single>Vol)' },`);

const sortLogicRegex = /data\.sort\(\(a, b\) => \{.+?return 0;\s*\}\);/s;

const newSortLogic = `data.sort((a, b) => {
    // Precompute for special sort if needed
    const getSpecialSortKey = (p) => {
        const poc = p.pocNric || p.nric;
        const famMembers = adminRosterData.filter(x => (x.pocNric || x.nric) === poc);
        const isFamily = famMembers.length > 1 || famMembers.some(x => x.role === 'CAREGIVER');
        
        let catScore = 4;
        if (isFamily) catScore = 1;
        else if (p.role === 'TRAINEE') catScore = 2;
        else if (p.role === 'VOLUNTEER') catScore = 3;
        
        let roleScore = p.role === 'TRAINEE' ? 1 : (p.role === 'CAREGIVER' ? 2 : 3);
        
        return {
            group: (p.group || '').toLowerCase(),
            catScore: catScore,
            poc: poc.toLowerCase(),
            roleScore: roleScore,
            name: (p.fullName || '').toLowerCase()
        };
    };

    for (let rule of rosterSortRules) {
        if (rule.col === 'specialSort') {
            let keyA = getSpecialSortKey(a);
            let keyB = getSpecialSortKey(b);
            
            if (keyA.group < keyB.group) return rule.asc ? -1 : 1;
            if (keyA.group > keyB.group) return rule.asc ? 1 : -1;
            
            if (keyA.catScore < keyB.catScore) return rule.asc ? -1 : 1;
            if (keyA.catScore > keyB.catScore) return rule.asc ? 1 : -1;
            
            if (keyA.catScore === 1) {
                if (keyA.poc < keyB.poc) return rule.asc ? -1 : 1;
                if (keyA.poc > keyB.poc) return rule.asc ? 1 : -1;
            }
            
            if (keyA.roleScore < keyB.roleScore) return rule.asc ? -1 : 1;
            if (keyA.roleScore > keyB.roleScore) return rule.asc ? 1 : -1;
            
            if (keyA.name < keyB.name) return rule.asc ? -1 : 1;
            if (keyA.name > keyB.name) return rule.asc ? 1 : -1;
            continue;
        }

        let valA = a[rule.col] || '';
        let valB = b[rule.col] || '';
        
        if (rule.col === 'passportExpiry' || rule.col === 'dob') {
            valA = new Date(valA).getTime() || 0;
            valB = new Date(valB).getTime() || 0;
        } else {
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
        }
        
        if (valA < valB) return rule.asc ? -1 : 1;
        if (valA > valB) return rule.asc ? 1 : -1;
    }
    return 0;
});`;

code = code.replace(sortLogicRegex, newSortLogic);

fs.writeFileSync('frontend/js/participants.js', code);