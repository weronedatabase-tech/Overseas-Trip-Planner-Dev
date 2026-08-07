const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(/}\s*}\s*else if \(dndState\.type === 'grouping'\)/g, "} else if (dndState.type === 'grouping')");
code = code.replace(/dndState\.clone\.style\.transform = `translate3d\(\$\{centerX\}px, \$\{centerY\}px, 0px\) scale\(1\.05\)`[^}]*}\s*}\s*}/g, 
`dndState.clone.style.transform = \`translate3d(\${centerX}px, \${centerY}px, 0px) scale(1.05)\`;
    }
}`);
fs.writeFileSync('frontend/js/logistics.js', code);
