const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Insert the Name field in index.html right after Uploader NRIC
const nricField = `<div>
                <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uploader NRIC</label>
                <input type="text" id="landingRecNric" required class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl uppercase font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="S1234567A">
            </div>`;
const newFields = `<div>
                <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uploader NRIC</label>
                <input type="text" id="landingRecNric" required class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl uppercase font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="S1234567A">
            </div>
            <div>
                <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name (Optional)</label>
                <input type="text" id="landingRecName" class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="John Doe">
            </div>`;

code = code.replace(nricField, newFields);
fs.writeFileSync('index.html', code);
console.log("Updated index.html form");
