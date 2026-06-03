// ==========================================
// Google Drive File & Folder Manager
// ==========================================
let currentDrivePath = []; // Stores { id: 'folderId', name: 'Folder Name' }

function buildFilesUI() {
 document.getElementById('tab-files').innerHTML = `
   <div class="flex flex-col h-full w-full relative">
     <!-- Header -->
     <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-2 md:p-3 shrink-0 flex items-center gap-2 shadow-sm rounded-t-xl md:rounded-none z-10">
       <button id="btnDriveBack" onclick="navigateDriveBack()" class="hidden-force p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
       </button>
       <h3 id="driveCurrentFolderName" class="text-sm md:text-base font-black text-gray-900 dark:text-white tracking-tight truncate flex-1">Trip Folder</h3>
       
       <button onclick="promptCreateFolder()" class="p-1.5 rounded-lg text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-gray-800 transition focus:outline-none shrink-0" title="Create Folder">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
       </button>

       <input type="file" id="driveFileInput" multiple class="hidden-force" onchange="handleFileSelect(event)">
       <button onclick="triggerFileUpload()" class="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-800 transition focus:outline-none shrink-0" title="Upload File">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
       </button>
       
       <button onclick="refreshCurrentDriveFolder(this)" class="p-1.5 rounded-lg text-primary hover:bg-blue-50 dark:hover:bg-gray-800 transition focus:outline-none shrink-0 relative flex items-center justify-center" title="Refresh">
          <svg class="w-5 h-5 md:w-6 md:h-6 btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <div class="btn-spinner spinner-primary hidden-force !w-3 !h-3 md:!w-4 md:!h-4 border-2 absolute"></div>
       </button>
     </div>
     
     <!-- Loading Overlay -->
     <div id="driveLoadingOverlay" class="absolute inset-0 top-[50px] bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm z-20 hidden-force flex flex-col justify-center items-center">
        <div class="loader !w-8 !h-8 border-primary mb-2"></div>
        <span id="driveLoadingText" class="text-primary dark:text-blue-400 font-bold text-[10px] tracking-wide shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full mt-2">Loading folder...</span>
     </div>
     
     <!-- Contents List -->
     <div id="driveContentsList" class="flex-grow overflow-y-auto p-2 md:p-3 space-y-1.5 bg-gray-50 dark:bg-gray-950 custom-scrollbar pb-10">
     </div>
   </div>
 `;
}

async function promptCreateFolder() {
 const folderName = prompt("Enter new folder name:");
 if (!folderName || !folderName.trim()) return;
 
 const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root' };
 const overlay = document.getElementById('driveLoadingOverlay');
 const loadText = document.getElementById('driveLoadingText');
 
 if (overlay) {
     overlay.classList.remove('hidden-force');
     loadText.textContent = "Creating folder...";
 }
 
 try {
     const res = await callBackend('createDriveFolder', { parentFolderId: current.id, folderName: folderName.trim() });
     if (res.status === 'error') throw new Error(res.message);
     renderDriveContents(res.folders, res.files);
     showToast("Folder created.");
 } catch(e) {
     showToast("Failed to create folder.", true);
 } finally {
     if (overlay) overlay.classList.add('hidden-force');
 }
}

function triggerFileUpload() {
 document.getElementById('driveFileInput').click();
}

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
 
 let validFiles = [];
 let skippedFiles = [];
 
 // 4MB limit (Google Apps Script Payload Safety Limit)
 for (let f of selectedFiles) {
     if (f.size > 4194304) {
         skippedFiles.push(f.name);
     } else {
         validFiles.push(f);
     }
 }
 
 if (skippedFiles.length > 0) {
     showToast(`Skipped ${skippedFiles.length} file(s) larger than 4MB.`, true);
 }
 
 if (validFiles.length === 0) {
     event.target.value = '';
     return;
 }
 
 const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root' };
 const overlay = document.getElementById('driveLoadingOverlay');
 const loadText = document.getElementById('driveLoadingText');
 
 if (overlay) {
     overlay.classList.remove('hidden-force');
 }
 
 let successCount = 0;
 let lastRes = null;
 
 // Upload files sequentially to avoid rate limiting and payload collision
 for (let i = 0; i < validFiles.length; i++) {
     const file = validFiles[i];
     if (loadText) {
         loadText.textContent = `Uploading file ${i + 1} of ${validFiles.length}...`;
     }
     
     try {
         const base64Data = await readFileAsBase64(file);
         const res = await callBackend('uploadDriveFile', { 
             folderId: current.id, 
             fileName: file.name, 
             mimeType: file.type || 'application/octet-stream', 
             fileData: base64Data 
         });
         
         if (res.status === 'error') throw new Error(res.message);
         lastRes = res;
         successCount++;
     } catch(err) {
         showToast(`Failed to upload ${file.name}: ${err.message}`, true);
     }
 }
 
 // Refresh the UI with the final folder contents state
 if (lastRes) {
     renderDriveContents(lastRes.folders, lastRes.files);
 }
 
 if (overlay) {
     overlay.classList.add('hidden-force');
 }
 
 event.target.value = '';
 
 if (successCount > 0) {
     showToast(`Successfully uploaded ${successCount} file(s).`);
 }
}

async function promptDeleteDriveItem(id, isFolder, name) {
 if (!confirm(`Are you sure you want to delete the ${isFolder ? 'folder' : 'file'} "${name}"?\nThis will move it to the Drive Trash.`)) return;
 
 const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root' };
 const overlay = document.getElementById('driveLoadingOverlay');
 const loadText = document.getElementById('driveLoadingText');
 
 if (overlay) {
     overlay.classList.remove('hidden-force');
     loadText.textContent = "Deleting item...";
 }
 
 try {
     const res = await callBackend('deleteDriveItem', { itemId: id, isFolder: isFolder, currentFolderId: current.id });
     if (res.status === 'error') throw new Error(res.message);
     renderDriveContents(res.folders, res.files);
     showToast("Item moved to Trash.");
 } catch(e) {
     showToast("Failed to delete.", true);
 } finally {
     if (overlay) overlay.classList.add('hidden-force');
 }
}

async function loadDriveFolder(folderId, folderName, isBack = false) {
 if (!isBack) {
   if (currentDrivePath.length === 0 || currentDrivePath[currentDrivePath.length - 1].id !== folderId) {
     currentDrivePath.push({ id: folderId, name: folderName });
   }
 }
 
 updateDriveHeader();
 const overlay = document.getElementById('driveLoadingOverlay');
 const loadText = document.getElementById('driveLoadingText');
 if (overlay) {
     overlay.classList.remove('hidden-force');
     loadText.textContent = "Loading folder...";
 }
 
 try {
   const res = await callBackend('getDriveContents', { folderId: folderId });
   if (res.status === 'error') {
     throw new Error(res.message);
   }
   
   if (currentDrivePath.length === 1 && folderId === 'root') {
       currentDrivePath[0].name = res.currentFolderName;
       currentDrivePath[0].id = res.currentFolderId;
       updateDriveHeader();
   }
   
   renderDriveContents(res.folders, res.files);
 } catch(e) {
   showToast("Failed to load folder contents.", true);
   if (!isBack && currentDrivePath.length > 1) {
       currentDrivePath.pop();
       updateDriveHeader();
   }
 } finally {
   if (overlay) overlay.classList.add('hidden-force');
 }
}

function updateDriveHeader() {
 const backBtn = document.getElementById('btnDriveBack');
 const title = document.getElementById('driveCurrentFolderName');
 if (!backBtn || !title) return;
 
 if (currentDrivePath.length > 1) {
   backBtn.classList.remove('hidden-force');
 } else {
   backBtn.classList.add('hidden-force');
 }
 
 const current = currentDrivePath[currentDrivePath.length - 1];
 title.textContent = current ? current.name : "Trip Folder";
}

function navigateDriveBack() {
 if (currentDrivePath.length > 1) {
   currentDrivePath.pop();
   const target = currentDrivePath[currentDrivePath.length - 1];
   loadDriveFolder(target.id, target.name, true);
 }
}

function refreshCurrentDriveFolder(btn) {
 setBtnLoading(btn, true);
 const current = currentDrivePath[currentDrivePath.length - 1] || { id: 'root', name: 'Trip Folder' };
 loadDriveFolder(current.id, current.name, true).finally(() => {
   setBtnLoading(btn, false);
 });
}

function openDriveFile(url) {
 window.open(url, '_blank');
}

function renderDriveContents(folders, files) {
 const container = document.getElementById('driveContentsList');
 let html = '';
 
 if (folders.length === 0 && files.length === 0) {
     container.innerHTML = '<div class="flex flex-col items-center justify-center p-8 text-gray-400 dark:text-gray-500"><svg class="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg><p class="text-xs font-bold">This folder is empty.</p></div>';
     return;
 }
 
 const trashIcon = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`;
 
 // Render Folders
 folders.forEach(f => {
     const safeName = f.name.replace(/'/g, "\\'");
     html += `
       <div class="flex items-center gap-1 bg-white dark:bg-gray-800 p-1.5 md:p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:border-primary transition group">
          <div onclick="loadDriveFolder('${f.id}', '${safeName}')" class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none active:scale-[0.98] px-2 py-1">
              <div class="w-8 h-8 rounded bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
              </div>
              <span class="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">${f.name}</span>
          </div>
          <button onclick="promptDeleteDriveItem('${f.id}', true, '${safeName}')" class="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-md transition focus:outline-none shrink-0" title="Delete Folder">
             ${trashIcon}
          </button>
       </div>
     `;
 });
 
 // Render Files
 files.forEach(f => {
     const safeName = f.name.replace(/'/g, "\\'");
     let iconHtml = '';
     let bgClass = 'bg-gray-50 dark:bg-gray-700';
     
     if (f.mimeType.includes('spreadsheet')) {
         bgClass = 'bg-green-50 dark:bg-green-900/30';
         iconHtml = `<svg class="w-5 h-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
     } else if (f.mimeType.includes('document')) {
         bgClass = 'bg-blue-50 dark:bg-blue-900/30';
         iconHtml = `<svg class="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
     } else if (f.mimeType.includes('pdf')) {
         bgClass = 'bg-red-50 dark:bg-red-900/30';
         iconHtml = `<svg class="w-5 h-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM16.5 9h-1v2h1V9z"/><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/></svg>`;
     } else {
         iconHtml = `<svg class="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm6 1.5L18.5 9H12V3.5z"/></svg>`;
     }

     html += `
       <div class="flex items-center gap-1 bg-white dark:bg-gray-800 p-1.5 md:p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:border-gray-300 dark:hover:border-gray-500 transition group">
          <div onclick="openDriveFile('${f.url}')" class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none active:scale-[0.98] px-2 py-1">
              <div class="w-8 h-8 rounded ${bgClass} flex items-center justify-center shrink-0">
                ${iconHtml}
              </div>
              <span class="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">${f.name}</span>
          </div>
          <button onclick="promptDeleteDriveItem('${f.id}', false, '${safeName}')" class="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-md transition focus:outline-none shrink-0" title="Delete File">
             ${trashIcon}
          </button>
       </div>
     `;
 });
 
 container.innerHTML = html;
}