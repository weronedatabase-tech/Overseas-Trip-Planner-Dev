const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

// Ensure 'bus' column exists
if (!code.includes("c.id === 'bus'")) {
    // 1. Add to initial array
    const oldInit = "id: 'pairings', label: 'Pairing(s)', width: 150, visible: true },";
    code = code.replace(oldInit, oldInit + "\n{ id: 'bus', label: 'Bus', width: 90, visible: true },");

    // 2. Add to compatibility check
    const checkStr = `if (!rosterCols.find(c => c.id === 'bus')) {
    const pairIdx = rosterCols.findIndex(c => c.id === 'pairings');
    rosterCols.splice(pairIdx > -1 ? pairIdx + 1 : rosterCols.length, 0, { id: 'bus', label: 'Bus', width: 90, visible: true });
}`;
    code = code.replace(/if \(\!rosterCols\.find\(c => c\.id === 'medical'\)\) \{/g, checkStr + "\nif (!rosterCols.find(c => c.id === 'medical')) {");
    
    // 3. Render bus
    const pairRender = "} else if (c.id === 'pairings') {";
    code = code.replace(pairRender, `} else if (c.id === 'bus') {
               html += \`<td class="\${baseClass} font-bold" \${styleStr}>\${(p.bus || 'UNASSIGNED').toUpperCase()}</td>\`;
           } else if (c.id === 'pairings') {`);
}

fs.writeFileSync('frontend/js/participants.js', code);
