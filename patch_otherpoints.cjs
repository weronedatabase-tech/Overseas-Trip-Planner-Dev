const fs = require('fs');
let code = fs.readFileSync('frontend/js/main.js', 'utf8');

const otherPointsHtml = `<div class="md:col-span-2"><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Other Points</label><textarea id="gpmOther" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" rows="2">\${m.otherPoints || ''}</textarea></div>`;

code = code.replace(/<div class="md:col-span-2"><label class="text-\[10px\] font-bold mb-0\.5 text-gray-500 block uppercase">Medical Conditions/g, otherPointsHtml + '\n<div class="md:col-span-2"><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Medical Conditions');

code = code.replace(/otherPoints: p\.otherPoints/g, "otherPoints: document.getElementById('gpmOther') ? document.getElementById('gpmOther').value : p.otherPoints");

fs.writeFileSync('frontend/js/main.js', code);
