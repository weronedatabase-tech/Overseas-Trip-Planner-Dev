const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

// 1. renderGroups (around line 1038)
code = code.replace(/let pGroup = String\(p\.group \|\| ""\)\.trim\(\);/, 'let pGroup = String(p.logisticsGroup || "").trim();');

// 2. handleGroupDrop (around 1183)
code = code.replace(/p\.group = groupName;/, 'p.logisticsGroup = groupName;');
code = code.replace(/if \(cp && cp\.group !== groupName\) \{/, 'if (cp && cp.logisticsGroup !== groupName) {');
code = code.replace(/cp\.group = groupName;/, 'cp.logisticsGroup = groupName;');

// 3. removeGroup (not explicitly shown but similar lines)
code = code.replace(/p\.group = "";/, 'p.logisticsGroup = "";');
code = code.replace(/if \(cp && cp\.group !== ""\) \{/, 'if (cp && cp.logisticsGroup !== "") {');
code = code.replace(/cp\.group = "";/, 'cp.logisticsGroup = "";');

// 4. autoAssignGroups
code = code.replace(/let unassigned = globalLogistics\.participants\.filter\(p => !p\.group\);/, 'let unassigned = globalLogistics.participants.filter(p => !p.logisticsGroup);');
code = code.replace(/if \(!p\.group\) \{/g, 'if (!p.logisticsGroup) {');
code = code.replace(/if \(cp && !cp\.group\) \{/, 'if (cp && !cp.logisticsGroup) {');
code = code.replace(/cp\.group = targetGroup;/, 'cp.logisticsGroup = targetGroup;');

// 5. autoBus
code = code.replace(/if \(p\.group\) \{/, 'if (p.logisticsGroup) {');
code = code.replace(/if \(x\.group === p\.group && !connected\.includes\(x\.nric\)\) \{/, 'if (x.logisticsGroup === p.logisticsGroup && !connected.includes(x.nric)) {');

// 6. resetGroupAssignments
code = code.replace(/if \(p\.group\) \{/, 'if (p.logisticsGroup) {');
// Wait, already handled if it matched above? Let's check with another regex pass

fs.writeFileSync('frontend/js/logistics.js', code);
