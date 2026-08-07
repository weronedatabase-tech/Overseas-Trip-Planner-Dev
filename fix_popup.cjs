const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(/function addGroupList\(\) \{[\s\S]*?\}\n/, `function addGroupList() {
    activeAssignType = 'group';
    addGroupBusFromPopup();
}
`);

code = code.replace(/function addBusList\(\) \{[\s\S]*?\}\n/, `function addBusList() {
    activeAssignType = 'bus';
    addGroupBusFromPopup();
}
`);

fs.writeFileSync('frontend/js/logistics.js', code);
