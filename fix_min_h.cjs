const fs = require('fs');

['diet.js', 'expired.js', 'medical.js', 'other.js', 'participants.js'].forEach(file => {
    let js = fs.readFileSync('frontend/js/' + file, 'utf8');
    
    // First, clean up if I messed it up with the sed command:
    // Actually, `id="&"` probably made it weird.
    // Let's just do a regex replace to clean it up.
    
    js = js.replace(/class="flex-1 overflow-auto custom-scrollbar relative" id="([a-zA-Z]+TableContainer)"/g, 
                    'class="flex-1 min-h-0 overflow-auto custom-scrollbar relative" id="$1"');
                    
    // In case the sed command already ran and messed it up:
    js = js.replace(/class="flex-1 min-h-0 overflow-auto custom-scrollbar relative" id="class="flex-1 overflow-auto custom-scrollbar relative" id="([a-zA-Z]+TableContainer)""/g, 
                    'class="flex-1 min-h-0 overflow-auto custom-scrollbar relative" id="$1"');

    // Wait, earlier I did sed -i 's/id="dietTableContainer" class="flex-1/id="dietTableContainer" class="flex-1 min-h-0/g' frontend/js/diet.js
    js = js.replace(/id="dietTableContainer" class="flex-1 min-h-0/g, 'id="dietTableContainer" class="flex-1 min-h-0');

    // Let's just safely find the table container div
    js = js.replace(/<div class="flex-1 overflow-auto custom-scrollbar relative" id="([a-zA-Z]+TableContainer)">/g, 
                    '<div class="flex-1 min-h-0 overflow-auto custom-scrollbar relative" id="$1">');
                    
    js = js.replace(/<div id="dietTableContainer" class="flex-1 min-h-0 overflow-auto custom-scrollbar relative">/g, 
                    '<div id="dietTableContainer" class="flex-1 min-h-0 overflow-auto custom-scrollbar relative">');

    fs.writeFileSync('frontend/js/' + file, js);
});

console.log("Fixed min-h-0");
