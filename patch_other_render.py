import sys

with open('frontend/js/other.js', 'r') as f:
    content = f.read()

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

if old_render in content:
    content = content.replace(old_render, new_render)
    with open('frontend/js/other.js', 'w') as f:
        f.write(content)
    print("Patched!")
else:
    # Just locate it by finding the substring
    idx_start = content.find("   const hasNotes = p.otherPoints && p.otherPoints.trim()")
    idx_end = content.find("   html += `</div></td></tr>`;", idx_start) + len("   html += `</div></td></tr>`;")
    
    if idx_start != -1 and idx_end != -1:
        content = content[:idx_start] + new_render + content[idx_end:]
        with open('frontend/js/other.js', 'w') as f:
            f.write(content)
        print("Patched via substring!")
    else:
        print("Still could not find it.")

