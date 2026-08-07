const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

const regex = /function updateClonePosition\(x, y\) \{[\s\S]*?\}\s*\}\s*\/\/\s*==========================================\s*\/\/\s*PAIRING LOGIC/;
const replacement = `function updateClonePosition(x, y) {
    if(dndState.clone) {
        const centerX = x - (dndState.rectWidth / 2);
        const centerY = y - (dndState.rectHeight / 2);
        dndState.clone.style.transform = \`translate3d(\${centerX}px, \${centerY}px, 0px) scale(1.05)\`;
    }
}
}
// ==========================================
// PAIRING LOGIC`;

code = code.replace(regex, replacement);
fs.writeFileSync('frontend/js/logistics.js', code);
