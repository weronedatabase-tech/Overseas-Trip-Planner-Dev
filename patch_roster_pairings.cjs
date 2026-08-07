const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

const oldLoop = `   adminRosterData.forEach(p => {
       p.room = roomsMap[p.nric] || 'UNASSIGNED';
       p.pairings = pairingsMap[p.nric] ? pairingsMap[p.nric].join(', ') : 'NONE';
   });`;

const newLoop = `   adminRosterData.forEach(p => {
       p.room = roomsMap[p.nric] || 'UNASSIGNED';
       let myPairings = pairingsMap[p.nric] ? [...pairingsMap[p.nric]] : [];
       if (p.role === 'CAREGIVER' && p.relatedTrainee) {
           const related = adminRosterData.find(x => x.fullName.toLowerCase() === p.relatedTrainee.toLowerCase() && x.role === 'TRAINEE');
           if (related && pairingsMap[related.nric]) {
               myPairings.push(...pairingsMap[related.nric]);
           }
       }
       p.pairings = myPairings.length > 0 ? Array.from(new Set(myPairings)).join(', ') : 'NONE';
   });`;

code = code.replace(oldLoop, newLoop);
fs.writeFileSync('frontend/js/participants.js', code);
