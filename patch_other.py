import sys

with open('frontend/js/other.js', 'r') as f:
    content = f.read()

# 1. Update the filter
old_filter = """let data = otherRosterData.filter(p => {
    if (!p.otherPoints) return false;
    const notes = p.otherPoints.trim().toLowerCase();
    if (notes === '' || notes === '-' || notes === 'nil' || notes === 'na' || notes === 'n/a' || notes === 'none' || notes === 'no') return false;
    return true;
});"""

new_filter = """let data = otherRosterData.filter(p => {
    const hasNotes = p.otherPoints && !['', '-', 'nil', 'na', 'n/a', 'none', 'no'].includes(p.otherPoints.trim().toLowerCase());
    const hasSleeping = p.sleeping && !['', '-', 'nil', 'na', 'n/a', 'none', 'no'].includes(p.sleeping.trim().toLowerCase());
    return hasNotes || hasSleeping;
});"""

content = content.replace(old_filter, new_filter)

# 2. Update search to include sleeping
old_search = """(p.otherPoints && p.otherPoints.toLowerCase().includes(otherSearchQuery));"""
new_search = """(p.otherPoints && p.otherPoints.toLowerCase().includes(otherSearchQuery)) ||
              (p.sleeping && p.sleeping.toLowerCase().includes(otherSearchQuery));"""

content = content.replace(old_search, new_search)

# 3. Update table head
old_head = """<th class="py-1.5 px-2 bg-gray-100 dark:bg-gray-800 align-top sticky top-0 z-10 w-[65%] text-left">
       <div class="font-bold text-gray-700 dark:text-gray-300">Other Notes</div>
   </th>"""
new_head = """<th class="py-1.5 px-2 bg-gray-100 dark:bg-gray-800 align-top sticky top-0 z-10 w-[65%] text-left">
       <div class="font-bold text-gray-700 dark:text-gray-300">Notes & Sleeping</div>
   </th>"""

content = content.replace(old_head, new_head)

# 4. Update the render
old_render = """   const hasNotes = p.otherPoints && p.otherPoints.trim() && p.otherPoints.trim().toLowerCase() !== 'nil' && p.otherPoints.trim().toLowerCase() !== 'none';
   if (hasNotes) {
       html += `<div><span class="text-indigo-700 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded inline-block whitespace-pre-wrap">${p.otherPoints}</span></div>`;
   }            
   html += `</div></td></tr>`;"""

new_render = """   const hasNotes = p.otherPoints && !['', '-', 'nil', 'na', 'n/a', 'none', 'no'].includes(p.otherPoints.trim().toLowerCase());
   const hasSleeping = p.sleeping && !['', '-', 'nil', 'na', 'n/a', 'none', 'no'].includes(p.sleeping.trim().toLowerCase());
   
   if (hasNotes) {
       html += `<div><p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Other Notes</p><span class="text-indigo-700 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded inline-block whitespace-pre-wrap">${p.otherPoints}</span></div>`;
   }
   if (hasSleeping) {
       html += `<div><p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Sleeping Arrangements</p><span class="text-rose-700 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded inline-block whitespace-pre-wrap">${p.sleeping}</span></div>`;
   }
   html += `</div></td></tr>`;"""

content = content.replace(old_render, new_render)

with open('frontend/js/other.js', 'w') as f:
    f.write(content)

