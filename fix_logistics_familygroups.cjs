const fs = require('fs');
let code = fs.readFileSync('./frontend/js/logistics.js', 'utf8');

code = code.replace(
    /const familyGroups = \{\};\s*unassigned\.forEach\(p => \{\s*if\(\!familyGroups\[p\.pocNric \|\| p\.nric\]\) familyGroups\[p\.pocNric \|\| p\.nric\] = \[\];\s*familyGroups\[p\.pocNric \|\| p\.nric\]\.push\(p\);\s*\}\);/g,
    `const familyGroups = {};
unassigned.forEach(p => {
    let targetPoc = p.pocNric || p.nric;
    if (p.role === 'CAREGIVER' && p.relatedTrainee && (!p.pocNric || p.pocNric === p.nric)) {
        const rNames = p.relatedTrainee.split(',').map(n => n.trim().toLowerCase());
        const match = globalLogistics.participants.find(x => x.role === 'TRAINEE' && rNames.includes((x.name || '').toLowerCase()));
        if (match) targetPoc = match.pocNric || match.nric;
    } else if (p.role === 'TRAINEE' && (!p.pocNric || p.pocNric === p.nric)) {
        const match = globalLogistics.participants.find(x => x.role === 'CAREGIVER' && x.relatedTrainee && x.relatedTrainee.toLowerCase().includes((p.name || '').toLowerCase()));
        if (match) targetPoc = match.pocNric || match.nric;
    }
    
    if(!familyGroups[targetPoc]) familyGroups[targetPoc] = [];
    familyGroups[targetPoc].push(p);
});`
);

fs.writeFileSync('./frontend/js/logistics.js', code);
console.log("Fixed familyGroups in logistics.js");
