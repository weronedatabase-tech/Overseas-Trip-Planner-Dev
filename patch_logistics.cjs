const fs = require('fs');
let content = fs.readFileSync('frontend/js/logistics.js', 'utf8');

// For rooms
content = content.replace(
    /document\.getElementById\('unassignedCount'\)\.innerText = filteredUnassigned\.length;\s*let unHtml = '';/,
    "document.getElementById('unassignedCount').innerText = filteredUnassigned.length;\nif (window.sortParticipantsSpecial) window.sortParticipantsSpecial(filteredUnassigned, globalLogistics.participants);\nlet unHtml = '';"
);

// For groups
content = content.replace(
    /document\.getElementById\('groupUnassignedCount'\)\.innerText = unassigned\.length;\s*let unHtml = '';/,
    "document.getElementById('groupUnassignedCount').innerText = unassigned.length;\nif (window.sortParticipantsSpecial) window.sortParticipantsSpecial(unassigned, globalLogistics.participants);\nlet unHtml = '';"
);

// For buses
content = content.replace(
    /document\.getElementById\('busUnassignedCount'\)\.innerText = unassigned\.length;\s*let unHtml = '';/g,
    "document.getElementById('busUnassignedCount').innerText = unassigned.length;\nif (window.sortParticipantsSpecial) window.sortParticipantsSpecial(unassigned, globalLogistics.participants);\nlet unHtml = '';"
);

fs.writeFileSync('frontend/js/logistics.js', content, 'utf8');
