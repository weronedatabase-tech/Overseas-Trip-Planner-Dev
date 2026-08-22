const fs = require('fs');
let content = fs.readFileSync('./frontend/js/finance.js', 'utf8');

// The HTML for the card layout
let newContent = content
    .replace('Custom Deviation (SGD)</label>', 'Deviation (+/- SGD)</label>')
    .replace('Final Expected</label>', 'Expected (SGD)</label>')
    .replace('value="${c.rem}"', 'value="${c.rem.replace(/&/g, \'&amp;\').replace(/"/g, \'&quot;\')}"');

// Also make the card contents stretch to the bottom with mt-auto
newContent = newContent.replace(
    'class="grid grid-cols-2 gap-2 p-2 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800"',
    'class="grid grid-cols-2 gap-2 p-2 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 mt-auto"'
);

// Add h-[28px] and flex items-center justify-end to the expected div
newContent = newContent.replace(
    'class="w-full px-2 py-1 text-sm font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 shadow-sm text-right"',
    'class="w-full px-2 py-1 text-sm font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 shadow-sm text-right flex items-center justify-end h-[28px]"'
);

// Add h-[28px] to the deviation input
newContent = newContent.replace(
    'class="w-full px-2 py-1 text-xs font-bold border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-950 focus:outline-none focus:border-primary shadow-sm text-right"',
    'class="w-full px-2 py-1 text-xs font-bold border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-950 focus:outline-none focus:border-primary shadow-sm text-right h-[28px]"'
);

// Add h-[28px] to remarks input
newContent = newContent.replace(
    'class="w-full px-2 py-1 text-[10px] font-medium border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-950 focus:outline-none focus:border-primary shadow-sm"',
    'class="w-full px-2 py-1 text-[10px] font-medium border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-950 focus:outline-none focus:border-primary shadow-sm h-[28px]"'
);

// In case the button logic overlaps, let's make sure it worked
if (content !== newContent) {
    fs.writeFileSync('./frontend/js/finance.js', newContent);
    console.log('Successfully updated card html layout!');
} else {
    console.log('Could not find match for card html.');
}

