const fs = require('fs');

function patchRender2(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    
    // Fix duplicate rendering of shortName if it matches fullName
    const anchor = `<div class="\${nameClass} text-xs md:text-sm leading-tight whitespace-normal break-words">\${fullNameUpper}</div>
           <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium whitespace-normal break-words">\${shortNameUpper}</div>`;
           
    const replacement = `<div class="\${nameClass} text-xs md:text-sm leading-tight whitespace-normal break-words">\${fullNameUpper}</div>
           \${shortNameUpper && shortNameUpper !== fullNameUpper ? \`<div class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium whitespace-normal break-words">\${shortNameUpper}</div>\` : ''}`;
           
    if (code.includes(anchor)) {
        code = code.replace(anchor, replacement);
        fs.writeFileSync(filepath, code);
        console.log("Patched shortname logic in", filepath);
    } else {
        console.log("Anchor not found in", filepath);
    }
}

patchRender2('frontend/js/participants.js');
patchRender2('frontend/js/medical.js');
patchRender2('frontend/js/diet.js');
patchRender2('frontend/js/expired.js');
