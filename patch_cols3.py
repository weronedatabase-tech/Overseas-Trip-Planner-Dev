import sys

with open('frontend/js/participants.js', 'r') as f:
    content = f.read()

old_html = """           <div id="columnSelector" class="hidden-force absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-30 p-2 flex flex-col gap-1 max-h-96 overflow-y-auto custom-scrollbar">
              <div class="flex justify-between items-center mb-1 px-1 border-b border-gray-100 dark:border-gray-700 pb-1">
                  <button onclick="checkAllRosterColumns()" class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none uppercase tracking-wider">Check All</button>
                  <button onclick="uncheckAllRosterColumns()" class="text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:underline focus:outline-none uppercase tracking-wider">Uncheck All</button>
              </div>"""

new_html = """           <div id="columnSelector" class="hidden-force absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-30 p-2 flex flex-col gap-1 max-h-96 overflow-y-auto custom-scrollbar">
              <div class="mb-1 px-1 border-b border-gray-100 dark:border-gray-700 pb-1">
                  <label class="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition">
                      <input type="checkbox" id="toggleAllColsCheckbox" ${rosterCols.every(c => c.visible) ? 'checked' : ''} onchange="toggleAllRosterColumns(this.checked)" class="w-4 h-4 text-indigo-600 rounded border-gray-300">
                      <span class="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Toggle All</span>
                  </label>
              </div>"""

content = content.replace(old_html, new_html)

old_js = """function toggleRosterColumn(colId, isVisible) {
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
};"""

new_js = """function toggleRosterColumn(colId, isVisible) {
const c = rosterCols.find(x => x.id === colId);
if(c) c.visible = isVisible;
localStorage.setItem('rosterCols', JSON.stringify(rosterCols));
const allChecked = rosterCols.every(x => x.visible);
const toggleAllCb = document.getElementById('toggleAllColsCheckbox');
if (toggleAllCb) toggleAllCb.checked = allChecked;
renderRosterTable();
}

window.toggleAllRosterColumns = function(isChecked) {
    rosterCols.forEach(c => c.visible = isChecked);
    localStorage.setItem('rosterCols', JSON.stringify(rosterCols));
    document.querySelectorAll('#columnSelector input[type="checkbox"]:not(#toggleAllColsCheckbox)').forEach(cb => cb.checked = isChecked);
    renderRosterTable();
};"""

content = content.replace(old_js, new_js)

with open('frontend/js/participants.js', 'w') as f:
    f.write(content)
