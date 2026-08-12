const fs = require('fs');

const files = fs.readdirSync('frontend/js').filter(f => f.endsWith('.js')).map(f => 'frontend/js/' + f);
files.forEach(f => {
    let code = fs.readFileSync(f, 'utf8');
    
    // For fa-trash
    code = code.replace(/text-gray-400 hover:text-red-500( focus:outline-none)?"><i class="fa-solid fa-trash/g, 'text-red-500 hover:text-red-600$1"><i class="fa-solid fa-trash');
    code = code.replace(/text-gray-400 hover:text-red-500(.*?fa-trash)/g, 'text-red-500 hover:text-red-600$1');

    // For SVG trashcans
    // M19 7l-.867
    // Let's replace button classes wrapping this SVG
    code = code.replace(/(<button[^>]*class="[^"]*)text-gray-400 hover:text-red-500([^"]*"[^>]*>(?:<svg[^>]*>)?(?:<path[^>]*d="M19 7))/g, '$1text-red-500 hover:text-red-600$2');
    code = code.replace(/(<button[^>]*class="[^"]*)text-gray-400([^"]*"[^>]*>(?:<svg[^>]*>)?(?:<path[^>]*d="M19 7))/g, '$1text-red-500 hover:text-red-600$2');
    
    // files.js trashIcon string:
    code = code.replace(/const trashIcon = \`<svg class="w-4 h-4" fill="none"/g, 'const trashIcon = `<svg class="w-4 h-4 text-red-500 hover:text-red-600" fill="none"');
    
    // minutes.js trash
    code = code.replace(/text-gray-400 hover:text-red-500 transition(.*?)M19 7/g, 'text-red-500 hover:text-red-600 transition$1M19 7');

    fs.writeFileSync(f, code);
});
