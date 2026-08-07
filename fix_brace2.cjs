const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');
code = code.replace(/    }\n}\n\/\/ ==========================================\n\/\/ PAIRING LOGIC/, 
`    }
}
}
// ==========================================
// PAIRING LOGIC`);
fs.writeFileSync('frontend/js/logistics.js', code);
