const fs = require('fs');
['frontend/js/medical.js', 'frontend/js/diet.js', 'frontend/js/expired.js'].forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/<table class="table-fixed-layout text-left border-collapse border-b border-gray-200 dark:border-gray-800">/, '<table class="w-full table-fixed text-left border-collapse border-b border-gray-200 dark:border-gray-800">');
    fs.writeFileSync(file, code);
    console.log("Patched " + file);
});
