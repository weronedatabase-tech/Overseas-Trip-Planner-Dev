const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.js')) results.push(file);
        }
    });
    return results;
}

const files = walk('frontend/js');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    let original = content;

    content = content.replace(/\? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'\)/g,
                              "? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400')");

    content = content.replace(
        /const roleColor = t\.role === 'VOLUNTEER' \? 'text-green-700 bg-green-100 dark:bg-green-900\/50 border-green-200 dark:border-green-800' : 'text-green-700 bg-green-100 dark:bg-green-900\/50 border-green-200 dark:border-green-800';/g,
        "const roleColor = t.role === 'VOLUNTEER' ? 'text-orange-700 bg-orange-100 dark:bg-orange-900/50 border-orange-200 dark:border-orange-800' : 'text-green-700 bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800';"
    );

    content = content.replace(
        / : 'text-green-700 bg-green-100 dark:bg-green-900\/50 border-green-200 dark:border-green-800'\)/g,
        " : 'text-orange-700 bg-orange-100 dark:bg-orange-900/50 border-orange-200 dark:border-orange-800')"
    );

    content = content.replace(
        /<div class="bg-green-50 text-green-700 dark:bg-green-900\/30 dark:text-green-400 p-1\.5 rounded font-bold border border-green-200 dark:border-green-800">VOL: \$\{bd\.VOLUNTEER\}<\/div>/g,
        '<div class="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 p-1.5 rounded font-bold border border-orange-200 dark:border-orange-800">VOL: ${bd.VOLUNTEER}</div>'
    );
    
    if(original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Modified', file);
    }
});
console.log('Done');
