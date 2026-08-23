const fs = require('fs');

function fixSyntax(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/return \\`<div/g, 'return `<div');
    content = content.replace(/<\/div>\\`;/g, '</div>`;');
    
    // Also, inside that string, we need to make sure ${fRoleColor} is not escaped inside a template literal, unless it's supposed to be literally `${fRoleColor}` which it shouldn't. Wait, we want it evaluated!
    // In my patch I did \\\${fRoleColor} which became \${fRoleColor} in the file.
    // If it's inside `return \`...\``, it should be `${fRoleColor}`!
    content = content.replace(/\\\$\{/g, '${');
    
    fs.writeFileSync(file, content, 'utf8');
}

fixSyntax('frontend/js/main.js');
fixSyntax('frontend/js/profile.js');
