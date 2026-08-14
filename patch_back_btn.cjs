const fs = require('fs');
['medical.html', 'diet.html', 'expired.html', 'other.html'].forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    
    // Original:
    // <button onclick="window.location.href='roster.html'" class="relative p-1.5 md:p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none flex items-center gap-1 text-xs font-bold border border-transparent hover:border-gray-300 dark:hover:border-gray-600">
    // New (Make it obvious like a primary button or distinct secondary button)
    
    html = html.replace(/<button onclick="window\.location\.href='roster\.html'" class="[^"]*">/, 
    `<button onclick="window.location.href='roster.html'" class="relative px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition focus:outline-none flex items-center gap-1.5 text-xs md:text-sm font-black border border-blue-200 dark:border-blue-800 shadow-sm">`);
    
    fs.writeFileSync(file, html);
});
console.log("Patched back buttons");
