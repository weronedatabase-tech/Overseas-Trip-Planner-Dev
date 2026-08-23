const fs = require('fs');
let content = fs.readFileSync('frontend/js/ui.js', 'utf8');

const sortHelper = `
window.sortParticipantsSpecial = function(arr, allParticipants) {
    if (!arr || !allParticipants) return;
    const famMap = {};
    allParticipants.forEach(x => {
        const poc = x.pocNric || x.nric;
        if(!famMap[poc]) famMap[poc] = { count: 0, hasCaregiver: false };
        famMap[poc].count++;
        if(x.role === 'CAREGIVER') famMap[poc].hasCaregiver = true;
    });

    const specialSortMap = new Map();
    arr.forEach(p => {
        const poc = p.pocNric || p.nric;
        const info = famMap[poc];
        const isFamily = info ? (info.count > 1 || info.hasCaregiver) : false;
        let catScore = 4;
        if (isFamily) catScore = 1;
        else if (p.role === 'TRAINEE') catScore = 2;
        else if (p.role === 'VOLUNTEER') catScore = 3;
        let roleScore = p.role === 'TRAINEE' ? 1 : (p.role === 'CAREGIVER' ? 2 : 3);
        specialSortMap.set(p.nric, {
            group: (p.group || '').toLowerCase(),
            catScore,
            poc: poc.toLowerCase(),
            roleScore,
            name: (p.fullName || p.name || '').toLowerCase()
        });
    });

    arr.sort((a, b) => {
        let keyA = specialSortMap.get(a.nric);
        let keyB = specialSortMap.get(b.nric);
        if (!keyA || !keyB) return 0;

        if (keyA.group < keyB.group) return -1;
        if (keyA.group > keyB.group) return 1;
        
        if (keyA.catScore < keyB.catScore) return -1;
        if (keyA.catScore > keyB.catScore) return 1;
        
        if (keyA.catScore === 1) {
            if (keyA.poc < keyB.poc) return -1;
            if (keyA.poc > keyB.poc) return 1;
        }
        
        if (keyA.roleScore < keyB.roleScore) return -1;
        if (keyA.roleScore > keyB.roleScore) return 1;
        
        if (keyA.name < keyB.name) return -1;
        if (keyA.name > keyB.name) return 1;
        return 0;
    });
};
`;

if (!content.includes('sortParticipantsSpecial')) {
    content += sortHelper;
    fs.writeFileSync('frontend/js/ui.js', content, 'utf8');
}
