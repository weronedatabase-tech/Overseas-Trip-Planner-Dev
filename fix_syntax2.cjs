const fs = require('fs');

function fixSyntax2(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    // My sed revert `s/else {/} else {/g` might have turned `} else if` into `} } else if` ??
    // Let's check!
    code = code.replace(/}\s*}\s*else if/g, '} else if');
    code = code.replace(/}\s*}\s*else {/g, '} else {');
    code = code.replace(/}\s*}\s*}\s*else {/g, '} else {'); // Just in case
    
    fs.writeFileSync(filepath, code);
}

fixSyntax2('frontend/js/diet.js');
fixSyntax2('frontend/js/medical.js');
fixSyntax2('frontend/js/expired.js');
