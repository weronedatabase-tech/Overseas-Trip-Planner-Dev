const fs = require('fs');
let code = fs.readFileSync('frontend/js/main.js', 'utf8');

const oldModalLoad = `  try {
    const res = await apiCall('getProfile', { nric: nric });
    if(res.status === 'error') throw new Error(res.message);
    const m = res.family.find(f => f.nric.toUpperCase() === nric.toUpperCase());
    if(!m) throw new Error("Participant not found");`;

const newModalLoad = `  try {
    let m = null;
    if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) {
        m = adminRosterData.find(f => f.nric.toUpperCase() === nric.toUpperCase());
    } else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) {
        m = loadedFamily.find(f => f.nric.toUpperCase() === nric.toUpperCase());
    }
    
    if (!m) {
        const res = await apiCall('getProfile', { nric: nric });
        if(res.status === 'error') throw new Error(res.message);
        m = res.family.find(f => f.nric.toUpperCase() === nric.toUpperCase());
    }
    if(!m) throw new Error("Participant not found");`;

code = code.replace(oldModalLoad, newModalLoad);
fs.writeFileSync('frontend/js/main.js', code);
