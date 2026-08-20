const fs = require('fs');

const scrollPages = ['dashboard.html', 'settings.html', 'index.html', 'register.html'];

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    
    if (scrollPages.includes(file)) {
        // Leave overflow-y-auto
    } else {
        // Change tabContainer from overflow-y-auto to overflow-hidden flex flex-col
        html = html.replace(/id="tabContainer" class="([^"]*)overflow-y-auto([^"]*)"/g, 
            'id="tabContainer" class="$1overflow-hidden flex flex-col$2"');
    }
    
    fs.writeFileSync(file, html);
});

console.log("Fixed tabContainer in HTML files");
