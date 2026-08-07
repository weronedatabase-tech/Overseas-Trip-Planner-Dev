const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

const newBranch = `
        } else if (dndState.type === 'grouping') {
            const activeGroup = elAtPoint ? elAtPoint.closest('.dnd-group-dropzone') : null;
            document.querySelectorAll('.dnd-group-dropzone').forEach(dz => {
                if (dz === activeGroup) {
                    dz.classList.add('border-primary', 'bg-blue-50', 'dark:bg-gray-800', 'dark:border-primary', 'ring-1', 'ring-primary');
                } else {
                    dz.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-800', 'dark:border-primary', 'ring-1', 'ring-primary');
                }
            });
        } else if (dndState.type === 'busing') {
            const activeBus = elAtPoint ? elAtPoint.closest('.dnd-bus-dropzone') : null;
            document.querySelectorAll('.dnd-bus-dropzone').forEach(dz => {
                if (dz === activeBus) {
                    dz.classList.add('border-primary', 'bg-blue-50', 'dark:bg-gray-800', 'dark:border-primary', 'ring-1', 'ring-primary');
                } else {
                    dz.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-800', 'dark:border-primary', 'ring-1', 'ring-primary');
                }
            });
        }
`;

code = code.replace(/dz\.classList\.remove\('border-primary', 'bg-blue-50', 'dark:bg-gray-800', 'dark:border-primary', 'ring-1', 'ring-primary'\);\n                \}\n            \}\);\n        \}/, 
`dz.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-800', 'dark:border-primary', 'ring-1', 'ring-primary');
                }
            });
        }` + newBranch);

fs.writeFileSync('frontend/js/logistics.js', code);
