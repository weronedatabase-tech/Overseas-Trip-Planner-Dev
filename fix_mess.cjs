const fs = require('fs');
['diet.js', 'expired.js', 'medical.js', 'other.js', 'participants.js'].forEach(file => {
    let js = fs.readFileSync('frontend/js/' + file, 'utf8');
    
    js = js.replace(/class="flex-1 min-h-0 overflow-auto custom-scrollbar relative" id="class="flex-1 min-h-0 overflow-auto custom-scrollbar relative" id="([a-zA-Z]+TableContainer)""/g, 
                    'class="flex-1 min-h-0 overflow-auto custom-scrollbar relative" id="$1"');

    // medical inside expired.js?
    if (file === 'expired.js') {
        js = js.replace(/id="medicalTableContainer"/g, 'id="expiredTableContainer"');
    }

    fs.writeFileSync('frontend/js/' + file, js);
});
console.log("Cleaned up table containers");
