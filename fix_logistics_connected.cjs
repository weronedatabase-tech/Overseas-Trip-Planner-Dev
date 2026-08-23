const fs = require('fs');
let code = fs.readFileSync('./frontend/js/logistics.js', 'utf8');

const target = `function getConnectedParticipants(startNric) {
    const connected = new Set([startNric]);
    const queue = [startNric];
    const activePairings = (globalLogistics.pairings || []).filter(p => (!p.status || p.status === 'ACTIVE'));
    
    while(queue.length > 0) {
        const current = queue.shift();
        const p = globalLogistics.participants.find(x => x.nric === current);
        if (!p) continue;
        
        // Auto link related trainees/caregivers
        if (p.role === 'CAREGIVER' && p.relatedTrainee) {`;

const replacement = `function getConnectedParticipants(startNric) {
    const connected = new Set([startNric]);
    const queue = [startNric];
    const activePairings = (globalLogistics.pairings || []).filter(p => (!p.status || p.status === 'ACTIVE'));
    
    while(queue.length > 0) {
        const current = queue.shift();
        const p = globalLogistics.participants.find(x => x.nric === current);
        if (!p) continue;
        
        // Auto link related trainees/caregivers based on advanced pocNric matching
        let pTarget = p.pocNric || p.nric;
        if (p.role === 'CAREGIVER' && p.relatedTrainee && (!p.pocNric || p.pocNric === p.nric)) {
            const rNames = p.relatedTrainee.split(',').map(n => n.trim().toLowerCase());
            const match = globalLogistics.participants.find(x => x.role === 'TRAINEE' && rNames.includes((x.name || '').toLowerCase()));
            if (match) pTarget = match.pocNric || match.nric;
        } else if (p.role === 'TRAINEE' && (!p.pocNric || p.pocNric === p.nric)) {
            const match = globalLogistics.participants.find(x => x.role === 'CAREGIVER' && x.relatedTrainee && x.relatedTrainee.toLowerCase().includes((p.name || '').toLowerCase()));
            if (match) pTarget = match.pocNric || match.nric;
        }

        globalLogistics.participants.forEach(x => {
            let xTarget = x.pocNric || x.nric;
            if (x.role === 'CAREGIVER' && x.relatedTrainee && (!x.pocNric || x.pocNric === x.nric)) {
                const rNames = x.relatedTrainee.split(',').map(n => n.trim().toLowerCase());
                const match = globalLogistics.participants.find(y => y.role === 'TRAINEE' && rNames.includes((y.name || '').toLowerCase()));
                if (match) xTarget = match.pocNric || match.nric;
            } else if (x.role === 'TRAINEE' && (!x.pocNric || x.pocNric === x.nric)) {
                const match = globalLogistics.participants.find(y => y.role === 'CAREGIVER' && y.relatedTrainee && y.relatedTrainee.toLowerCase().includes((x.name || '').toLowerCase()));
                if (match) xTarget = match.pocNric || match.nric;
            }
            if (xTarget === pTarget && !connected.has(x.nric)) {
                connected.add(x.nric);
                queue.push(x.nric);
            }
        });

        if (p.role === 'CAREGIVER' && p.relatedTrainee) {`;

code = code.replace(/function getConnectedParticipants[\s\S]*?\/\/ Auto link related trainees\/caregivers\s+if \(p\.role === 'CAREGIVER' && p\.relatedTrainee\) \{/, replacement);
fs.writeFileSync('./frontend/js/logistics.js', code);
console.log("Fixed logistics.js getConnectedParticipants (regex replace)");
