const fs = require('fs');
let code = fs.readFileSync('./frontend/js/logistics.js', 'utf8');

code = code.replace(
    /const targetPoc = p\.pocNric \|\| p\.nric; const familyMembers = globalLogistics\.participants\.filter\(x => \(x\.pocNric \|\| x\.nric\) === targetPoc\);/g,
    `
            let targetPoc = p.pocNric || p.nric;
            if (p.role === 'CAREGIVER' && p.relatedTrainee && (!p.pocNric || p.pocNric === p.nric)) {
                const rNames = p.relatedTrainee.split(',').map(n => n.trim().toLowerCase());
                const match = globalLogistics.participants.find(x => x.role === 'TRAINEE' && rNames.includes((x.name || '').toLowerCase()));
                if (match) targetPoc = match.pocNric || match.nric;
            } else if (p.role === 'TRAINEE' && (!p.pocNric || p.pocNric === p.nric)) {
                const match = globalLogistics.participants.find(x => x.role === 'CAREGIVER' && x.relatedTrainee && x.relatedTrainee.toLowerCase().includes((p.name || '').toLowerCase()));
                if (match) targetPoc = match.pocNric || match.nric;
            }
            const familyMembers = globalLogistics.participants.filter(x => {
                let xTarget = x.pocNric || x.nric;
                if (x.role === 'CAREGIVER' && x.relatedTrainee && (!x.pocNric || x.pocNric === x.nric)) {
                    const rNames = x.relatedTrainee.split(',').map(n => n.trim().toLowerCase());
                    const match = globalLogistics.participants.find(y => y.role === 'TRAINEE' && rNames.includes((y.name || '').toLowerCase()));
                    if (match) xTarget = match.pocNric || match.nric;
                } else if (x.role === 'TRAINEE' && (!x.pocNric || x.pocNric === x.nric)) {
                    const match = globalLogistics.participants.find(y => y.role === 'CAREGIVER' && y.relatedTrainee && y.relatedTrainee.toLowerCase().includes((x.name || '').toLowerCase()));
                    if (match) xTarget = match.pocNric || match.nric;
                }
                return xTarget === targetPoc;
            });
    `
);

fs.writeFileSync('./frontend/js/logistics.js', code);
console.log("Fixed getRoomState in logistics.js");
