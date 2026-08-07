const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(/<span class="font-black text-\[11px\] md:text-sm text-gray-900 dark:text-white leading-tight">Group \$\{gName\}<\/span>/g,
`<div class="flex items-center gap-2">
                    <span class="font-black text-[11px] md:text-sm text-gray-900 dark:text-white leading-tight">Group \${gName}</span>
                    <button onclick="removeGroupList('\${gName}')" class="text-gray-400 hover:text-red-500 focus:outline-none"><i class="fa-solid fa-trash text-[10px]"></i></button>
                </div>`);

code = code.replace(/<span class="font-black text-\[11px\] md:text-sm text-gray-900 dark:text-white leading-tight">Bus \$\{bName\}<\/span>/g,
`<div class="flex items-center gap-2">
                    <span class="font-black text-[11px] md:text-sm text-gray-900 dark:text-white leading-tight">Bus \${bName}</span>
                    <button onclick="removeBusList('\${bName}')" class="text-gray-400 hover:text-red-500 focus:outline-none"><i class="fa-solid fa-trash text-[10px]"></i></button>
                </div>`);

fs.writeFileSync('frontend/js/logistics.js', code);
