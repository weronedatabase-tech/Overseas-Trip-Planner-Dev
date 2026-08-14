const fs = require('fs');
const path = require('path');

function getFiles(dir, ext) {
    const results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            results.push(...getFiles(full, ext));
        } else if (full.endsWith(ext)) {
            results.push(full);
        }
    });
    return results;
}

const htmlFiles = getFiles('.', '.html');
htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Top headers
    content = content.replace(/<header class="([^"]*)py-2([^"]*)">/g, '<header class="$1py-1$2">');
    content = content.replace(/<header class="([^"]*)py-3([^"]*)">/g, '<header class="$1py-1$2">');
    content = content.replace(/<header class="([^"]*)py-1.5([^"]*)">/g, '<header class="$1py-1$2">');
    
    // tabContainer padding
    content = content.replace(/id="tabContainer" class="([^"]*)p-2 md:p-4([^"]*)"/g, 'id="tabContainer" class="$1p-1 md:p-2$2"');
    
    // mobHeaderLegend padding
    content = content.replace(/id="mobHeaderLegend" class="([^"]*)py-1\.5([^"]*)"/g, 'id="mobHeaderLegend" class="$1py-0.5$2"');

    fs.writeFileSync(file, content);
});

const jsFiles = getFiles('frontend/js', '.js');
jsFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // View Titles (p-3 border-b -> py-1.5 px-3 border-b)
    content = content.replace(/<div class="p-3 border-b /g, '<div class="py-1.5 px-2 md:px-3 border-b ');
    
    // Legend / Search bars (p-3 bg-gray-50 -> py-1.5 px-2 md:px-3 bg-gray-50)
    content = content.replace(/<div class="p-3 bg-gray-50 /g, '<div class="py-1 px-2 md:px-3 bg-gray-50 ');
    
    // Table Headers (th class="p-3 -> th class="py-1.5 px-2)
    content = content.replace(/<th class="p-3 /g, '<th class="py-1.5 px-2 ');
    content = content.replace(/<th class="p-3"/g, '<th class="py-1.5 px-2"');
    
    // Table Data (td class="p-3 -> py-1.5 px-2)
    content = content.replace(/<td class="p-3 /g, '<td class="py-1.5 px-2 ');
    content = content.replace(/<td class="p-3"/g, '<td class="py-1.5 px-2"');
    
    // Roster participants counts/legend buttons - they are mostly small anyway
    // but maybe we can make text tighter if needed.

    fs.writeFileSync(file, content);
});
console.log("Done");
