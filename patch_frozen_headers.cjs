const fs = require('fs');
['frontend/js/medical.js', 'frontend/js/diet.js', 'frontend/js/expired.js'].forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace th classes to include top-0
    code = code.replace(/<th class="([^"]*?)sticky left-0([^"]*?)">/g, '<th class="$1sticky top-0 left-0$2">');
    code = code.replace(/<th class="([^"]*?)w-\[65\%\]([^"]*?)">/g, '<th class="$1sticky top-0 z-10 w-[65%]$2">');
    
    fs.writeFileSync(file, code);
});
console.log("Patched frozen headers");
