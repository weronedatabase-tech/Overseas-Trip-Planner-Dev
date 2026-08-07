const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(/function autoGroup\(\) \{[\s\S]*?let unassigned = globalLogistics\.participants\.filter\(p => !p\.logisticsGroup\);\s*if \(unassigned\.length === 0\) return;/,
`function autoGroup() {
    if (activeGroupsList.length === 0) return showToast("Please add at least one group first.");
    let unassigned = globalLogistics.participants.filter(p => !p.logisticsGroup);
    if (unassigned.length === 0) return;`);

code = code.replace(/function autoBus\(\) \{[\s\S]*?let unassigned = globalLogistics\.participants\.filter\(p => !p\.bus\);\s*if \(unassigned\.length === 0\) return;/,
`function autoBus() {
    if (activeBusesList.length === 0) return showToast("Please add at least one bus first.");
    let unassigned = globalLogistics.participants.filter(p => !p.bus);
    if (unassigned.length === 0) return;`);

fs.writeFileSync('frontend/js/logistics.js', code);
