import sys

with open('frontend/js/participants.js', 'r') as f:
    content = f.read()

old_html = """           <div id="columnSelector" class="hidden-force absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-30 p-2 flex flex-col gap-1 max-h-96 overflow-y-auto custom-scrollbar">
              ${rosterCols.map(c => `
                <label class="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition">"""

new_html = """           <div id="columnSelector" class="hidden-force absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-30 p-2 flex flex-col gap-1 max-h-96 overflow-y-auto custom-scrollbar">
              <div class="flex justify-between items-center mb-1 px-1 border-b border-gray-100 dark:border-gray-700 pb-1">
                  <button onclick="checkAllRosterColumns()" class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none uppercase tracking-wider">Check All</button>
                  <button onclick="uncheckAllRosterColumns()" class="text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:underline focus:outline-none uppercase tracking-wider">Uncheck All</button>
              </div>
              ${rosterCols.map(c => `
                <label class="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition">"""

content = content.replace(old_html, new_html)

js_fns = """function toggleRosterColumn(colId, isVisible) {
const c = rosterCols.find(x => x.id === colId);
if(c) c.visible = isVisible;
localStorage.setItem('rosterCols', JSON.stringify(rosterCols));
renderRosterTable();

   
}

window.checkAllRosterColumns = function() {
    rosterCols.forEach(c => {
        // we might want to prevent checking 'role' and 'group' if they are meant to be hidden, or just check all visible?
        // Wait, 'role' and 'group' might be part of rosterCols but usually we don't render their checkbox if they are hidden?
        // Ah, rosterCols contains them all, and map renders them all. So Check All will check them.
        c.visible = true;
    });
    localStorage.setItem('rosterCols', JSON.stringify(rosterCols));
    document.querySelectorAll('#columnSelector input[type="checkbox"]').forEach(cb => cb.checked = true);
    renderRosterTable();
};

window.uncheckAllRosterColumns = function() {
    rosterCols.forEach(c => c.visible = false);
    localStorage.setItem('rosterCols', JSON.stringify(rosterCols));
    document.querySelectorAll('#columnSelector input[type="checkbox"]').forEach(cb => cb.checked = false);
    renderRosterTable();
};
"""

content = content.replace("""function toggleRosterColumn(colId, isVisible) {
const c = rosterCols.find(x => x.id === colId);
if(c) c.visible = isVisible;
localStorage.setItem('rosterCols', JSON.stringify(rosterCols));
renderRosterTable();

   

}""", js_fns)

with open('frontend/js/participants.js', 'w') as f:
    f.write(content)
