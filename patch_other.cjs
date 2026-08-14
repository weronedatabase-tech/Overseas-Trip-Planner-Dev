const fs = require('fs');

// Patch other.html
let html = fs.readFileSync('other.html', 'utf8');
html = html.replace(/<title>Dietary Restrictions/g, '<title>Other Notes');
html = html.replace(/<script src="frontend\/js\/diet\.js"><\/script>/g, '<script src="frontend/js/other.js"></script>');
html = html.replace(/tab-diet/g, 'tab-other');
fs.writeFileSync('other.html', html);

// Patch other.js
let js = fs.readFileSync('frontend/js/other.js', 'utf8');
// replace diet stuff with other notes stuff
js = js.replace(/Dietary Restrictions/g, 'Other Notes');
js = js.replace(/dietTable/g, 'otherTable');
js = js.replace(/dietSearch/g, 'otherSearch');
js = js.replace(/loadDietData/g, 'loadOtherData');
js = js.replace(/buildDietUI/g, 'buildOtherUI');
js = js.replace(/renderDietTable/g, 'renderOtherTable');
js = js.replace(/dietCols/g, 'otherCols');
js = js.replace(/dietSortRules/g, 'otherSortRules');
js = js.replace(/dietLoading/g, 'otherLoading');
js = js.replace(/tab-diet/g, 'tab-other');
js = js.replace(/handleDietSearch/g, 'handleOtherSearch');

// Change the svg icon for Other Notes to something else (e.g. a document text icon)
const docIcon = '<svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>';
js = js.replace(/<svg class="w-5 h-5 text-orange-500".*?<\/svg>/, docIcon);

// Filter logic: only show other points
const newFilter = `let data = medicalRosterData.filter(p => {
    if (!p.otherPoints) return false;
    const notes = p.otherPoints.trim().toLowerCase();
    if (notes === '' || notes === '-' || notes === 'nil' || notes === 'na' || notes === 'n/a' || notes === 'none' || notes === 'no') return false;
    return true;
});`;
js = js.replace(/let data = medicalRosterData\.filter[\s\S]*?return true;\s*\}\);/, newFilter);

// Search logic: search otherPoints
const newSearch = `if (otherSearchQuery) {
   data = data.filter(p => {
       return (p.fullName && p.fullName.toLowerCase().includes(otherSearchQuery)) ||
              (p.shortName && p.shortName.toLowerCase().includes(otherSearchQuery)) ||
              (p.otherPoints && p.otherPoints.toLowerCase().includes(otherSearchQuery));
   });
}`;
js = js.replace(/if \(otherSearchQuery\) \{[\s\S]*?\n\}/, newSearch);

// Header html
js = js.replace(/Diet Details/g, 'Notes');

// Render details logic
const renderLogic = `const hasNotes = p.otherPoints && p.otherPoints.trim() && p.otherPoints.trim().toLowerCase() !== 'nil' && p.otherPoints.trim().toLowerCase() !== 'none';
   if (hasNotes) {
       html += \`<div><span class="text-indigo-700 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded inline-block whitespace-pre-wrap">\${p.otherPoints}</span></div>\`;
   }`;
js = js.replace(/const hasDiet[\s\S]*?<\/span><\/div>\`;\s*\}/, renderLogic);

// Change the onload trigger
js = js.replace(/window\.addEventListener\('DOMContentLoaded', \(\) => \{[\s\S]*?\}\);/, `window.addEventListener('DOMContentLoaded', () => {
    buildOtherUI();
    loadOtherData();
});`);

fs.writeFileSync('frontend/js/other.js', js);
console.log("Patched other.js and other.html");
