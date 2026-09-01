const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

// Set pairing sync to 500ms
code = code.replace(
    /pairingSyncTimeout = setTimeout\(\(\) => \{ executePairingSync\(\); \}, 2500\);/,
    'pairingSyncTimeout = setTimeout(() => { executePairingSync(); }, 600);'
);

// Set room sync to 500ms
code = code.replace(
    /roomSyncTimeout = setTimeout\(\(\) => \{ executeRoomSync\(\); \}, 2500\);/,
    'roomSyncTimeout = setTimeout(() => { executeRoomSync(); }, 600);'
);

// Set group sync to 500ms and add saving state
code = code.replace(
    /function triggerGroupSync\(\) \{\s*if \(groupSyncTimeout\) clearTimeout\(groupSyncTimeout\);\s*groupSyncTimeout = setTimeout\(executeGroupSync, 2500\);\s*\}/,
    `function triggerGroupSync() {
    setGroupSyncButtonState('saving');
    if (groupSyncTimeout) clearTimeout(groupSyncTimeout);
    groupSyncTimeout = setTimeout(executeGroupSync, 600);
}`
);

// Set bus sync to 500ms and add saving state
code = code.replace(
    /function triggerBusSync\(\) \{\s*if \(busSyncTimeout\) clearTimeout\(busSyncTimeout\);\s*busSyncTimeout = setTimeout\(executeBusSync, 2500\);\s*\}/,
    `function triggerBusSync() {
    setBusSyncButtonState('saving');
    if (busSyncTimeout) clearTimeout(busSyncTimeout);
    busSyncTimeout = setTimeout(executeBusSync, 600);
}`
);

fs.writeFileSync('frontend/js/logistics.js', code);
