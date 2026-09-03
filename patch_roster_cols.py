import sys

with open('frontend/js/participants.js', 'r') as f:
    content = f.read()

# 1. Add sleeping to initial columns block if not exists (or just add the backwards compat check)
compat_check = """
if (!rosterCols.find(c => c.id === 'sleeping')) {
    const otherIdx = rosterCols.findIndex(c => c.id === 'otherPoints');
    rosterCols.splice(otherIdx > -1 ? otherIdx : rosterCols.length, 0, { id: 'sleeping', label: 'Sleeping Arrangements', width: 220, visible: true });
    localStorage.setItem('rosterCols', JSON.stringify(rosterCols));
}
"""

if "c.id === 'sleeping'" not in content:
    idx = content.find("// Force hide role and group in existing")
    content = content[:idx] + compat_check + content[idx:]


# 2. Add sleeping to baseClass break-words
old_base_class = "['address', 'medical', 'diet', 'otherPoints', 'pairings']"
new_base_class = "['address', 'medical', 'diet', 'otherPoints', 'pairings', 'sleeping']"
content = content.replace(old_base_class, new_base_class)

# 3. Add rendering block
old_medical_block = """           } else if (c.id === 'otherPoints') {"""
new_medical_block = """           } else if (c.id === 'sleeping') {
               const hasSleeping = p.sleeping && p.sleeping.trim() && p.sleeping.trim().toLowerCase() !== 'nil' && p.sleeping.trim().toLowerCase() !== 'none';
               html += `<td class="${baseClass}" ${styleStr}>${hasSleeping ? `<span class="text-indigo-700 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded inline-block whitespace-pre-wrap leading-tight">${p.sleeping}</span>` : `<span class="text-gray-400 italic">NONE</span>`}</td>`;
           } else if (c.id === 'otherPoints') {"""
if "c.id === 'sleeping'" not in content.split("rosterCols.forEach(c => {")[1]:
    content = content.replace(old_medical_block, new_medical_block)

with open('frontend/js/participants.js', 'w') as f:
    f.write(content)
