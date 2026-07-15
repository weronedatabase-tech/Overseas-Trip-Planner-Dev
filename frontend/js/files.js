// ==========================================
// files.js - Google Drive Manager
// ==========================================
// [CONSIDERATION - SPA to MPA Migration]: Ported to use AppCore for backend calls.

let currentDrivePath = []; 
let driveClipboard = null; 
let selectedDriveItems = new Map(); 

document.addEventListener('click', (e) => {
  const menu = document.getElementById('driveAddMenu');
  if (menu && !menu.classList.contains('hidden-force')) {
      const addBtn = document.getElementById('btnDriveAdd');
      if (addBtn && !addBtn.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.add('hidden-force');
      }
  }
});

function buildFilesUI() {
  document.getElementById('tab-files').innerHTML = `
  <div class="flex flex-col h-full w-full relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div class="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-3 md:p-4 shrink-0 flex items-center gap-3 z-20 relative">
          <button type="button" id="btnDriveBack" onclick="navigateDriveBack()" class="hidden-force w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition focus:outline-none shrink-0 active:scale-95 flex items-center justify-center shadow-sm">
              <i class="fa-solid fa-arrow-left text-sm pointer-events-none"></i>
          </button>
          
          <div class="flex flex-col min-w-0 flex-1 pl-1">
              <h3 id="driveCurrentFolderName" class="text-base md:text-lg font-black text-zinc-900 dark:text-white tracking-tight truncate">Trip Folder</h3>
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Drive Explorer</span>
          </div>
          
          <div class="flex items-center gap-2 shrink-0">
              <input type="file" id="driveFileInput" multiple class="hidden-force" onchange="handleFileSelect(event)">
              
              <button type="button" id="btnDrivePaste" onclick="pasteFromDriveClipboard()" class="hidden-force px-3 py-2 rounded-xl text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition focus:outline-none shrink-0 flex items-center gap-1.5 font-bold text-xs md:text-sm active:scale-95 border border-green-200 dark:border-green-800 shadow-sm" title="Paste Item">
                  <i class="fa-solid fa-clipboard pointer-events-none"></i>
                  <span class="hidden md:inline pointer-events-none" id="lblDrivePaste">Paste</span>
              </button>

              <div class="relative inline-block text-left z-30">
                  <button type="button" id="btnDriveAdd" onclick="toggleDriveAddMenu(event)" class="px-3 py-2 rounded-xl text-white bg-primary hover:bg-blue-600 transition focus:outline-none shrink-0 flex items-center gap-1.5 font-bold text-xs md:text-sm active:scale-95 shadow-md" title="Add New">
                      <i class="fa-solid fa-plus pointer-events-none"></i>
                      <span class="hidden md:inline pointer-events-none">Add</span>
                  </button>
                  <div id="driveAddMenu" class="hidden-force origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 ring-1 ring-black ring-opacity-5 divide-y divide-zinc-100 dark:divide-zinc-700 z-[100] overflow-hidden">
                      <div class="py-1">
                          <a href="#" onclick="toggleDriveAddMenu(); promptCreateFolder()" class="group flex items-center px-4 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"><i class="fa-solid fa-folder text-yellow-500 mr-3 text-lg pointer-events-none"></i> New Folder</a>
                          <a href="#" onclick="toggleDriveAddMenu(); triggerFileUpload()" class="group flex items-center px-4 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"><i class="fa-solid fa-file-arrow-up text-blue-500 mr-3 text-lg pointer-events-none"></i> File Upload</a>
                      </div>
                      <div class="py-1">
                          <a href="#" onclick="toggleDriveAddMenu(); promptCreateGoogleDoc('doc')" class="group flex items-center px-4 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"><i class="fa-solid fa-file-word text-blue-600 mr-3 text-lg pointer-events-none"></i> Google Doc</a>
                          <a href="#" onclick="toggleDriveAddMenu(); promptCreateGoogleDoc('sheet')" class="group flex items-center px-4 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"><i class="fa-solid fa-file-excel text-green-600 mr-3 text-lg pointer-events-none"></i> Google Sheet</a>
                          <a href="#" onclick="toggleDriveAddMenu(); promptCreateGoogleDoc('slide')" class="group flex items-center px-4 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"><i class="fa-solid fa-file-powerpoint text-yellow-600 mr-3 text-lg pointer-events-none"></i> Google Slides</a>
                      </div>
                  </div>
              </div>
              
              <button type="button" onclick="refreshCurrentDriveFolder(this)" class="w-10 h-10 rounded-xl text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition focus:outline-none shrink-0 relative z-30 flex items-center justify-center active:scale-95 shadow-sm" title="Refresh">
                  <i class="fa-solid fa-rotate-right btn-icon pointer-events-none text-sm"></i>
                  <div class="btn-spinner spinner-primary hidden-force !w-4 !h-4 border-2 absolute pointer-events-none"></div>
              </button>
          </div>
      </div>

      <div id="driveBulkActions" class="hidden-force bg-blue-50 dark:bg-blue-900/30 p-3 shrink-0 flex justify-between items-center border-b border-blue-200 dark:border-blue-800 z-10 transition-all">
          <span id="driveBulkCount" class="text-xs md:text-sm font-black text-blue-800 dark:text-blue-300">0 selected</span>
          <div class="flex items-center gap-2">
              <button onclick="bulkCopySelected()" class="px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg shadow-sm hover:bg-blue-100 dark:hover:bg-zinc-700 transition focus:outline-none"><i class="fa-regular fa-copy mr-1"></i> Copy</button>
              <button onclick="bulkMoveSelected()" class="px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-lg shadow-sm hover:bg-orange-50 dark:hover:bg-zinc-700 transition focus:outline-none"><i class="fa-solid fa-arrows-up-down-left-right mr-1"></i> Move</button>
              <button onclick="bulkDeleteSelected()" class="px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-zinc-700 transition focus:outline-none"><i class="fa-solid fa-trash mr-1"></i> Delete</button>
              <button onclick="clearDriveSelection()" class="px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition focus:outline-none ml-2">Cancel</button>
          </div>
      </div>

      <div class="flex-grow overflow-y-auto overflow-x-hidden p-3 md:p-4 bg-zinc-50 dark:bg-zinc-950 custom-scrollbar pb-10 relative">
          <div id="driveLoadingOverlay" class="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm z-[50] hidden-force flex flex-col justify-center items-center">
              <div class="loader !w-10 !h-10 border-primary mb-3"></div>
              <span id="driveLoadingText" class="text-primary dark:text-blue-400 font-bold text-xs tracking-wide shadow-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 rounded-full">Loading folder...</span>
          </div>

          <div id="driveContentsList" class="space-y-2 max-w-5xl mx-auto"></div>
      </div>
  </div>
  `;
  updatePasteButtonState();
}

function toggleDriveAddMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('driveAddMenu');
  if (menu) menu.classList.toggle('hidden-force');
}

function toggleDriveItemSelection(event, id, isFolder, name) {
  event.stopPropagation();
  if (event.target.checked) selectedDriveItems.set(id, { id, isFolder, name });
  else selectedDriveItems.delete(id);
  updateBulkActionsBar();
}

function updateBulkActionsBar() {
  const bar = document.getElementById('driveBulkActions');
  const countLbl = document.getElementById('driveBulkCount');
  if (!bar || !countLbl) return;

  if (selectedDriveItems.size > 0) {
      bar.classList.remove('hidden-force');
      countLbl.textContent = `${selectedDriveItems.size} item(s) selected`;
  } else {
      bar.classList.add('hidden-force');
  }
}

function clearDriveSelection() {
  selectedDriveItems.clear();
  document.querySelectorAll('.drive-item-checkbox').forEach(cb => cb.checked = false);
  updateBulkActionsBar();
}

function setDriveClipboard(action, itemsArray) {
  driveClipboard = { action, items: itemsArray };
  AppCore.showToast(`${action === 'copy' ? 'Copied' : 'Moving'} ${itemsArray.length} item(s). Navigate to target folder and paste.`);
  clearDriveSelection();
  updatePasteButtonState();
}

function bulkCopySelected() { setDriveClipboard('copy', Array.from(selectedDriveItems.values())); }
function bulkMoveSelected() { setDriveClipboard('move', Array.from(selectedDriveItems.values())); }
async function bulkDeleteSelected() {
  if (!confirm(`Move ${selectedDriveItems.size} item(s) to Trash?`)) return;
  const items = Array.from(selectedDriveItems.values());
  clearDriveSelection();
  const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root' };
  await executeBulkAction('delete', items, current.id);
}

function actionSingleCopy(id, isFolder, name) { setDriveClipboard('copy', [{id, isFolder, name}]); }
function actionSingleMove(id, isFolder, name) { setDriveClipboard('move', [{id, isFolder, name}]); }

async function promptDeleteDriveItem(id, isFolder, name) {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
  const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root' };
  await executeBulkAction('delete', [{id, isFolder, name}], current.id);
}

function updatePasteButtonState() {
  const btn = document.getElementById('btnDrivePaste');
  const lbl = document.getElementById('lblDrivePaste');
  if (btn && lbl) {
      if (driveClipboard && driveClipboard.items.length > 0) {
          btn.classList.remove('hidden-force');
          if (driveClipboard.action === 'copy') {
              lbl.textContent = `Paste (${driveClipboard.items.length})`;
              btn.classList.remove('text-orange-600', 'hover:bg-orange-50');
              btn.classList.add('text-green-700', 'dark:text-green-400', 'hover:bg-green-200');
          } else {
              lbl.textContent = `Move Here (${driveClipboard.items.length})`;
              btn.classList.remove('text-green-700', 'dark:text-green-400', 'hover:bg-green-200');
              btn.classList.add('text-orange-600', 'dark:text-orange-400', 'hover:bg-orange-50', 'dark:hover:bg-zinc-800');
          }
      } else {
          btn.classList.add('hidden-force');
      }
  }
}

async function pasteFromDriveClipboard() {
  if (!driveClipboard || driveClipboard.items.length === 0) return;
  const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root' };

  let singleNewName = null;
  if (driveClipboard.items.length === 1) {
      const item = driveClipboard.items[0];
      const defaultName = driveClipboard.action === 'copy' ? `Copy of ${item.name}` : item.name;
      singleNewName = prompt(`${driveClipboard.action === 'copy' ? 'Pasting' : 'Moving'} "${item.name}".\nEnter name:`, defaultName);
      if (!singleNewName || !singleNewName.trim()) return;
  }

  await executeBulkAction(driveClipboard.action, driveClipboard.items, current.id, singleNewName?.trim());
  driveClipboard = null;
  updatePasteButtonState();
}

async function executeBulkAction(actionType, items, targetFolderId, singleNewName = null) {
  const overlay = document.getElementById('driveLoadingOverlay');
  const loadText = document.getElementById('driveLoadingText');

  if (overlay) {
      overlay.classList.remove('hidden-force');
      if (actionType === 'delete') loadText.textContent = `Deleting ${items.length} item(s)...`;
      else if (actionType === 'move') loadText.textContent = `Moving ${items.length} item(s)...`;
      else loadText.textContent = `Copying ${items.length} item(s)...`;
  }

  try {
      const res = await AppCore.apiFetch('bulkDriveOperation', { actionType, items, targetFolderId, singleNewName });
      renderDriveContents(res.folders, res.files);
      AppCore.showToast("Operation successful.");
  } catch(e) {
      AppCore.showToast("Failed: " + e.message, true);
  } finally {
      if (overlay) overlay.classList.add('hidden-force');
  }
}

async function promptCreateFolder() {
  const folderName = prompt("Enter new folder name:");
  if (!folderName || !folderName.trim()) return;

  const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root' };
  const overlay = document.getElementById('driveLoadingOverlay');
  if (overlay) { overlay.classList.remove('hidden-force'); document.getElementById('driveLoadingText').textContent = "Creating folder..."; }

  try {
      const res = await AppCore.apiFetch('createDriveFolder', { parentFolderId: current.id, folderName: folderName.trim() });
      renderDriveContents(res.folders, res.files);
      AppCore.showToast("Folder created.");
  } catch(e) { AppCore.showToast("Failed to create folder.", true); } 
  finally { if (overlay) overlay.classList.add('hidden-force'); }
}

async function promptCreateGoogleDoc(docType) {
  const labels = { 'doc': 'Google Doc', 'sheet': 'Google Sheet', 'slide': 'Google Slide' };
  const fileName = prompt(`Enter name for new ${labels[docType]}:`, `Untitled ${labels[docType]}`);
  if (!fileName || !fileName.trim()) return;

  const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root' };
  const overlay = document.getElementById('driveLoadingOverlay');
  if (overlay) { overlay.classList.remove('hidden-force'); document.getElementById('driveLoadingText').textContent = `Creating ${labels[docType]}...`; }

  try {
      const res = await AppCore.apiFetch('createGoogleDoc', { folderId: current.id, fileName: fileName.trim(), docType: docType });
      renderDriveContents(res.folders, res.files);
      AppCore.showToast(`${labels[docType]} created successfully.`);
  } catch(e) { AppCore.showToast(`Failed to create ${labels[docType]}.`, true); } 
  finally { if (overlay) overlay.classList.add('hidden-force'); }
}

function triggerFileUpload() { document.getElementById('driveFileInput').click(); }

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result.split(',')[1]);
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsDataURL(file);
  });
}

async function handleFileSelect(event) {
  const selectedFiles = Array.from(event.target.files);
  if (selectedFiles.length === 0) return;

  let validFiles = [], skippedFiles = [];
  for (let f of selectedFiles) { if (f.size > 4194304) skippedFiles.push(f.name); else validFiles.push(f); }

  if (skippedFiles.length > 0) AppCore.showToast(`Skipped ${skippedFiles.length} file(s) larger than 4MB.`, true);
  if (validFiles.length === 0) { event.target.value = ''; return; }

  const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root' };
  const overlay = document.getElementById('driveLoadingOverlay');
  const loadText = document.getElementById('driveLoadingText');

  if (overlay) overlay.classList.remove('hidden-force');

  let successCount = 0, lastRes = null;
  for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      if (loadText) loadText.textContent = `Uploading file ${i + 1} of ${validFiles.length}...`;
      try {
          const base64Data = await readFileAsBase64(file);
          lastRes = await AppCore.apiFetch('uploadDriveFile', { folderId: current.id, fileName: file.name, mimeType: file.type || 'application/octet-stream', fileData: base64Data });
          successCount++;
      } catch(err) { AppCore.showToast(`Failed to upload ${file.name}`, true); }
  }

  if (lastRes) renderDriveContents(lastRes.folders, lastRes.files);
  if (overlay) overlay.classList.add('hidden-force');
  event.target.value = '';
  if (successCount > 0) AppCore.showToast(`Successfully uploaded ${successCount} file(s).`);
}

async function promptRenameDriveItem(id, isFolder, oldName) {
  const newName = prompt(`Enter new name for the ${isFolder ? 'folder' : 'file'}:`, oldName);
  if (!newName || !newName.trim() || newName.trim() === oldName) return;

  const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root' };
  const overlay = document.getElementById('driveLoadingOverlay');
  if (overlay) { overlay.classList.remove('hidden-force'); document.getElementById('driveLoadingText').textContent = "Renaming item..."; }

  try {
      const res = await AppCore.apiFetch('renameDriveItem', { itemId: id, isFolder: isFolder, newName: newName.trim(), currentFolderId: current.id });
      renderDriveContents(res.folders, res.files);
      AppCore.showToast("Item renamed successfully.");
  } catch(e) { AppCore.showToast("Failed to rename item.", true); } 
  finally { if (overlay) overlay.classList.add('hidden-force'); }
}

async function loadDriveFolder(folderId, folderName, isBack = false) {
  if (!isBack && (currentDrivePath.length === 0 || currentDrivePath[currentDrivePath.length - 1].id !== folderId)) {
      currentDrivePath.push({ id: folderId, name: folderName });
  }
  updateDriveHeader();

  const overlay = document.getElementById('driveLoadingOverlay');
  if (overlay) { overlay.classList.remove('hidden-force'); document.getElementById('driveLoadingText').textContent = "Loading folder..."; }

  try {
      const res = await AppCore.apiFetch('getDriveContents', { folderId: folderId });
      if (currentDrivePath.length === 1 && folderId === 'root') {
          currentDrivePath[0].name = res.currentFolderName;
          currentDrivePath[0].id = res.currentFolderId;
          updateDriveHeader();
      }
      renderDriveContents(res.folders, res.files);
  } catch(e) {
      AppCore.showToast("Failed to load folder contents.", true);
      if (!isBack && currentDrivePath.length > 1) { currentDrivePath.pop(); updateDriveHeader(); }
  } finally {
      if (overlay) overlay.classList.add('hidden-force');
  }
}

function updateDriveHeader() {
  const backBtn = document.getElementById('btnDriveBack');
  const title = document.getElementById('driveCurrentFolderName');
  if (!backBtn || !title) return;
  backBtn.classList.toggle('hidden-force', currentDrivePath.length <= 1);
  const current = currentDrivePath[currentDrivePath.length - 1];
  title.textContent = current ? current.name : "Trip Folder";
}

function navigateDriveBack() {
  if (currentDrivePath.length > 1) {
      currentDrivePath.pop();
      const target = currentDrivePath[currentDrivePath.length - 1];
      loadDriveFolder(target.id, target.name, true);
      clearDriveSelection();
  }
}

function refreshCurrentDriveFolder(btn) {
  btn.classList.add('opacity-50');
  const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root', name: 'Trip Folder' };
  loadDriveFolder(current.id, current.name, true).finally(() => { btn.classList.remove('opacity-50'); });
  clearDriveSelection();
}

function openDriveFile(url) {
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function renderDriveContents(folders, files) {
  const container = document.getElementById('driveContentsList');
  let html = '';

  if (folders.length === 0 && files.length === 0) {
      container.innerHTML = '<div class="flex flex-col items-center justify-center p-12 text-zinc-400 dark:text-zinc-500"><i class="fa-solid fa-ghost text-5xl mb-4 opacity-50"></i><p class="text-sm font-bold uppercase tracking-widest">This folder is empty.</p></div>';
      return;
  }

  folders.forEach(f => {
      const safeName = f.name.replace(/'/g, "\\'");
      const isChecked = selectedDriveItems.has(f.id) ? 'checked' : '';
      html += `
      <div class="flex items-center gap-2 bg-white dark:bg-zinc-800 p-2 md:p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:border-primary dark:hover:border-primary transition group">
          <div class="flex items-center pl-1 shrink-0" onclick="event.stopPropagation()">
             <input type="checkbox" class="drive-item-checkbox w-4 h-4 text-primary bg-zinc-100 border-zinc-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600 cursor-pointer" ${isChecked} onchange="toggleDriveItemSelection(event, '${f.id}', true, '${safeName}')">
          </div>
          <div onclick="loadDriveFolder('${f.id}', '${safeName}')" class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none active:scale-[0.98] px-2 py-1">
              <div class="w-10 h-10 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-folder text-yellow-500 text-lg"></i>
              </div>
              <span class="font-bold text-sm md:text-base text-zinc-900 dark:text-white truncate group-hover:text-primary transition-colors">${f.name}</span>
          </div>
          <div class="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button onclick="actionSingleCopy('${f.id}', true, '${safeName}')" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-zinc-700 rounded-lg transition focus:outline-none shrink-0 shadow-sm border border-transparent hover:border-green-200 dark:hover:border-zinc-600" title="Copy Folder"><i class="fa-regular fa-copy"></i></button>
              <button onclick="actionSingleMove('${f.id}', true, '${safeName}')" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-zinc-700 rounded-lg transition focus:outline-none shrink-0 shadow-sm border border-transparent hover:border-orange-200 dark:hover:border-zinc-600" title="Move Folder"><i class="fa-solid fa-arrows-up-down-left-right"></i></button>
              <button onclick="promptRenameDriveItem('${f.id}', true, '${safeName}')" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-700 rounded-lg transition focus:outline-none shrink-0 shadow-sm border border-transparent hover:border-blue-200 dark:hover:border-zinc-600" title="Rename Folder"><i class="fa-solid fa-pen-to-square"></i></button>
              <button onclick="promptDeleteDriveItem('${f.id}', true, '${safeName}')" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-700 rounded-lg transition focus:outline-none shrink-0 shadow-sm border border-transparent hover:border-red-200 dark:hover:border-zinc-600" title="Delete Folder"><i class="fa-solid fa-trash"></i></button>
          </div>
      </div>
      `;
  });

  files.forEach(f => {
      const safeName = f.name.replace(/'/g, "\\'");
      const isChecked = selectedDriveItems.has(f.id) ? 'checked' : '';
      let iconHtml = '', bgClass = 'bg-zinc-50 dark:bg-zinc-800';

      if (f.mimeType.includes('spreadsheet')) { bgClass = 'bg-green-50 dark:bg-green-900/30'; iconHtml = `<i class="fa-solid fa-file-excel text-green-600 dark:text-green-400 text-lg"></i>`; } 
      else if (f.mimeType.includes('document')) { bgClass = 'bg-blue-50 dark:bg-blue-900/30'; iconHtml = `<i class="fa-solid fa-file-word text-blue-600 dark:text-blue-400 text-lg"></i>`; } 
      else if (f.mimeType.includes('presentation')) { bgClass = 'bg-yellow-50 dark:bg-yellow-900/30'; iconHtml = `<i class="fa-solid fa-file-powerpoint text-yellow-600 dark:text-yellow-400 text-lg"></i>`; } 
      else if (f.mimeType.includes('pdf')) { bgClass = 'bg-red-50 dark:bg-red-900/30'; iconHtml = `<i class="fa-solid fa-file-pdf text-red-600 dark:text-red-400 text-lg"></i>`; } 
      else { iconHtml = `<i class="fa-solid fa-file text-zinc-400 text-lg"></i>`; }

      const shortcutBadge = f.isShortcut ? `<div class="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-800 rounded-full shadow-sm p-0.5"><i class="fa-solid fa-link text-blue-500 text-[10px]"></i></div>` : '';
      const nameHtml = f.isShortcut 
        ? `<div class="flex flex-col min-w-0"><span class="font-bold text-sm md:text-base text-zinc-900 dark:text-white truncate group-hover:text-primary transition-colors">${f.name}</span><span class="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black">Shortcut</span></div>`
        : `<span class="font-bold text-sm md:text-base text-zinc-900 dark:text-white truncate group-hover:text-primary transition-colors">${f.name}</span>`;

      html += `
      <div class="flex items-center gap-2 bg-white dark:bg-zinc-800 p-2 md:p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600 transition group">
          <div class="flex items-center pl-1 shrink-0" onclick="event.stopPropagation()">
             <input type="checkbox" class="drive-item-checkbox w-4 h-4 text-primary bg-zinc-100 border-zinc-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600 cursor-pointer" ${isChecked} onchange="toggleDriveItemSelection(event, '${f.id}', false, '${safeName}')">
          </div>
          <div onclick="openDriveFile('${f.url}')" class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none active:scale-[0.98] px-2 py-1">
              <div class="relative w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center shrink-0">
                ${iconHtml}
                ${shortcutBadge}
              </div>
              ${nameHtml}
          </div>
          <div class="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button onclick="actionSingleCopy('${f.id}', false, '${safeName}')" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-zinc-700 rounded-lg transition focus:outline-none shrink-0 shadow-sm border border-transparent hover:border-green-200 dark:hover:border-zinc-600" title="Copy File"><i class="fa-regular fa-copy"></i></button>
              <button onclick="actionSingleMove('${f.id}', false, '${safeName}')" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-zinc-700 rounded-lg transition focus:outline-none shrink-0 shadow-sm border border-transparent hover:border-orange-200 dark:hover:border-zinc-600" title="Move File"><i class="fa-solid fa-arrows-up-down-left-right"></i></button>
              <button onclick="promptRenameDriveItem('${f.id}', false, '${safeName}')" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-700 rounded-lg transition focus:outline-none shrink-0 shadow-sm border border-transparent hover:border-blue-200 dark:hover:border-zinc-600" title="Rename File"><i class="fa-solid fa-pen-to-square"></i></button>
              <button onclick="promptDeleteDriveItem('${f.id}', false, '${safeName}')" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-700 rounded-lg transition focus:outline-none shrink-0 shadow-sm border border-transparent hover:border-red-200 dark:hover:border-zinc-600" title="Delete File"><i class="fa-solid fa-trash"></i></button>
          </div>
      </div>
      `;
  });

  container.innerHTML = html;
}