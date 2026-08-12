const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

const regex = /function autoAssignRooms\(\) \{[\s\S]*?showToast\("No clusters could be completely fitted\."\);\s*\}/;

const newAutoAssign = `function autoAssignRooms() {
if(!confirm("This will automatically assign unassigned participants into EXISTING rooms based on their connections. Continue?")) return;
const activeRooms = globalLogistics.rooms.filter(r => !r.isDeleted);
const roomAssignments = {};
activeRooms.forEach(r => {
    r.occupants.forEach(n => roomAssignments[n] = r.id);
});

// Helper to accurately determine room state
function getRoomState(roomId) {
    const r = activeRooms.find(x => x.id === roomId);
    let hasFamily = false;
    let hasVolunteer = false;
    let genderSet = new Set();
    r.occupants.forEach(n => {
        const p = globalLogistics.participants.find(x => x.nric === n);
        if (p) {
            if (p.role === 'VOLUNTEER') hasVolunteer = true;
            if (p.role === 'CAREGIVER') hasFamily = true;
            const targetPoc = p.pocNric || p.nric; const familyMembers = globalLogistics.participants.filter(x => (x.pocNric || x.nric) === targetPoc);
            if (familyMembers.some(x => x.role === 'CAREGIVER')) hasFamily = true;
            if (p.gender) genderSet.add(p.gender.toLowerCase());
        }
    });
    let gender = 'empty';
    if (genderSet.size > 1) gender = 'mixed';
    else if (genderSet.has('male')) gender = 'male';
    else if (genderSet.has('female')) gender = 'female';
    return { hasFamily, hasVolunteer, gender, available: r.capacity - r.occupants.length };
}

let placedCount = 0;
const unassigned = globalLogistics.participants.filter(p => !roomAssignments[p.nric]);
if(unassigned.length === 0) { showToast("Everyone is already assigned."); return; }

const familyGroups = {};
unassigned.forEach(p => {
    if(!familyGroups[p.pocNric || p.nric]) familyGroups[p.pocNric || p.nric] = [];
    familyGroups[p.pocNric || p.nric].push(p);
});
const families = [];
const nonFamily = [];
Object.keys(familyGroups).forEach(poc => {
    const group = familyGroups[poc];
    if(group.some(p => p.role === 'CAREGIVER') || group.length > 1) {
        families.push(group);
    } else {
        nonFamily.push(...group);
    }
});

families.sort((a,b) => b.length - a.length);

// 2. Assign Families First (Must be kept together)
families.forEach(fam => {
    let bestRoom = activeRooms.find(r => {
        const state = getRoomState(r.id);
        return state.available >= fam.length && !state.hasVolunteer;
    });
    if (bestRoom) {
        fam.forEach(p => {
            bestRoom.occupants.push(p.nric);
            roomAssignments[p.nric] = bestRoom.id;
            placedCount++;
        });
        bestRoom.ts = Date.now();
        queueRoomUpdate(bestRoom.id);
    }
});

// 3. Build Pairing Clusters for remaining (Non-Family)
const pairClusters = [];
const visited = new Set();
const remainingUnassigned = nonFamily.filter(p => !roomAssignments[p.nric]);
const pairingsMap = {};
(globalLogistics.pairings || []).forEach(p => {
    if(p.status === 'ACTIVE') {
        if(!pairingsMap[p.traineeNric]) pairingsMap[p.traineeNric] = [];
        pairingsMap[p.traineeNric].push(p.volNric);
        if(!pairingsMap[p.volNric]) pairingsMap[p.volNric] = [];
        pairingsMap[p.volNric].push(p.traineeNric);
    }
});

remainingUnassigned.forEach(p => {
    if(!visited.has(p.nric)) {
        const cluster = [];
        const q = [p.nric];
        let cGender = p.gender ? p.gender.toLowerCase() : null;
        
        while(q.length > 0) {
            const curr = q.shift();
            if(!visited.has(curr)) {
                const pObj = globalLogistics.participants.find(x => x.nric === curr);
                if(pObj && !roomAssignments[curr]) {
                    const pGen = pObj.gender ? pObj.gender.toLowerCase() : null;
                    if (!cGender && pGen) cGender = pGen;
                    // Do not violate gender rule
                    if (pGen && cGender && pGen !== cGender) {
                        continue;
                    }
                    visited.add(curr);
                    cluster.push(pObj);
                    (pairingsMap[curr] || []).forEach(n => { if(!visited.has(n)) q.push(n); });
                }
            }
        }
        if(cluster.length > 0) pairClusters.push(cluster);
    }
});

// Sort clusters: volunteers first, then by size
pairClusters.sort((a,b) => {
    const aHasVol = a.some(p => p.role === 'VOLUNTEER') ? 1 : 0;
    const bHasVol = b.some(p => p.role === 'VOLUNTEER') ? 1 : 0;
    if (aHasVol !== bHasVol) return bHasVol - aHasVol;
    return b.length - a.length;
});

// 4. Assign Pair Clusters (Independent Trainees & Volunteers)
pairClusters.forEach(cluster => {
    let cGender = 'empty';
    const gSet = new Set(cluster.map(p => p.gender ? p.gender.toLowerCase() : ''));
    if(gSet.size > 1) cGender = 'mixed';
    else if(gSet.has('male')) cGender = 'male';
    else if(gSet.has('female')) cGender = 'female';
    
    const hasVol = cluster.some(p => p.role === 'VOLUNTEER');
    
    let bestRoom = activeRooms.find(r => {
        const state = getRoomState(r.id);
        if(state.available < cluster.length) return false;
        if(state.hasFamily) return false; // Prevent Vol/Trainee mixing with Family
        if(state.gender !== 'empty' && cGender !== 'empty' && state.gender !== cGender) return false;
        
        // "There must never be a room that only has trainees."
        if(!hasVol && !state.hasVolunteer) return false;
        
        return true;
    });
    
    if (bestRoom) {
        cluster.forEach(p => {
            bestRoom.occupants.push(p.nric);
            roomAssignments[p.nric] = bestRoom.id;
            placedCount++;
        });
        bestRoom.ts = Date.now();
        queueRoomUpdate(bestRoom.id);
    }
});
renderRooms();
if (placedCount > 0) {
    showToast(\`Auto-assigned \${placedCount} participants.\`);
} else {
    showToast("No clusters could be completely fitted.");
}`;

code = code.replace(regex, newAutoAssign);
fs.writeFileSync('frontend/js/logistics.js', code);
