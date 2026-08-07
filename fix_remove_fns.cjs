const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

const restoreFns = `
function removeGroupList(gName) {
    activeAssignType = 'group';
    removeGroupBusFromPopup(gName);
}

function removeBusList(bName) {
    activeAssignType = 'bus';
    removeGroupBusFromPopup(bName);
}
`;

code += `\n${restoreFns}\n`;
fs.writeFileSync('frontend/js/logistics.js', code);
