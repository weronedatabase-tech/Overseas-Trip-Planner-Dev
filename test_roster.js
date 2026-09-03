let results = [
    { nric: 'A', role: 'CAREGIVER', relatedTrainee: 'T1' },
    { nric: 'B', role: 'CAREGIVER', relatedTrainee: 'T1' },
    { nric: 'T1', role: 'TRAINEE', fullName: 'T1', relatedTrainee: '' }
];
// apply memory healing
let changed = true;
while (changed) {
    changed = false;
    results.forEach(r => {
        if (r.role === 'CAREGIVER' && r.relatedTrainee) {
            const desiredNames = r.relatedTrainee.split('|').map(n => n.replace(/\s+/g, '').toLowerCase()).filter(n => n);
            results.forEach(j => {
                if (j !== r) {
                    const jName = (j.fullName || '').replace(/\s+/g, '').toLowerCase();
                    const jShort = (j.shortName || '').replace(/\s+/g, '').toLowerCase();
                    const isDesired = desiredNames.some(d => d.includes(jName) || jName.includes(d) || (jShort && d.includes(jShort)));
                    if (isDesired) {
                        const rPoc = r.pocNric || r.nric;
                        const jPoc = j.pocNric || j.nric;
                        if (rPoc !== jPoc) {
                            const targetPoc = rPoc;
                            results.forEach(x => {
                                if ((x.pocNric || x.nric) === jPoc) {
                                    x.pocNric = targetPoc;
                                }
                            });
                            changed = true;
                        }
                    }
                }
            });
        }
    });
}

console.log(results);
