const fs = require('fs');

function fixSyntax(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    // We want to remove the extra bracket before "} else {"
    code = code.replace(/}\s*}\s*} else {/g, '}\n           } else {'); 
    // wait, what did my bad sed do? It did: 
    // code = code.replace(/} else {/g, 'else {');
    // then I reverted: code.replace(/else {/g, '} else {');
    // So "else {" became "} else {".
    // Let's just do a smart regex:
    // look for `           }\n           } else {`
    // and replace with `           } else {`
    
    code = code.replace(/           }\n           } else {/g, '           } else {');
    
    fs.writeFileSync(filepath, code);
}

fixSyntax('frontend/js/diet.js');
fixSyntax('frontend/js/medical.js');
fixSyntax('frontend/js/expired.js');
