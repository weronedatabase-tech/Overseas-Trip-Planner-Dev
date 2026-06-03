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
        <button onclick="refreshCurrentDriveFolder(this)" class="p-1.5 rounded-lg text-primary hover:bg-blue-50 dark:hover:bg-gray-800 transition focus:outline-none shrink-0 relative flex items-center justify-center">
           <svg class="w-4 h-4 md:w-5 md:h-5 btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           <div class="btn-spinner spinner-primary hidden-force !w-3 !h-3 md:!w-4 md:!h-4 border-2 absolute"></div>
        </button>
      </div>
      
      <!-- Loading Overlay -->
      <div id="driveLoadingOverlay" class="absolute inset-0 top-[50px] bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm z-20 hidden-force flex flex-col justify-center items-center">
         <div class="loader !w-8 !h-8 border-primary mb-2"></div>
         <span class="text-primary dark:text-blue-400 font-bold text-[10px] tracking-wide shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full">Loading folder...</span>
      </div>
      
      <!-- Contents List -->
      <div id="driveContentsList" class="flex-grow overflow-y-auto p-2 md:p-3 space-y-1.5 bg-gray-50 dark:bg-gray-950 custom-scrollbar pb-10">
      </div>
    </div>
  `;
}

async function loadDriveFolder(folderId, folderName, isBack = false) {
  // Update path logic
  if (!isBack) {
    if (currentDrivePath.length === 0 || currentDrivePath[currentDrivePath.length - 1].id !== folderId) {
      currentDrivePath.push({ id: folderId, name: folderName });
    }
  }
  
  updateDriveHeader();
  const overlay = document.getElementById('driveLoadingOverlay');
  if (overlay) overlay.classList.remove('hidden-force');
  
  try {
    const res = await callBackend('getDriveContents', { folderId: folderId });
    if (res.status === 'error') {
      throw new Error(res.message);
    }
    
    // Update the name from the server if it's the root call and we didn't know the exact name
    if (currentDrivePath.length === 1 && folderId === 'root') {
        currentDrivePath[0].name = res.currentFolderName;
        currentDrivePath[0].id = res.currentFolderId;
        updateDriveHeader();
    }
    
    renderDriveContents(res.folders, res.files);
  } catch(e) {
    showToast("Failed to load folder contents.", true);
    // If navigation failed and we were going forward, pop the failed folder from history
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
  // Mobile OS natively intercepts Google Drive URLs if the app is installed.
  window.open(url, '_blank');
}

function renderDriveContents(folders, files) {
  const container = document.getElementById('driveContentsList');
  let html = '';
  
  if (folders.length === 0 && files.length === 0) {
      container.innerHTML = '<div class="flex flex-col items-center justify-center p-8 text-gray-400 dark:text-gray-500"><svg class="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg><p class="text-xs font-bold">This folder is empty.</p></div>';
      return;
  }
  
  // Render Folders
  folders.forEach(f => {
      const safeName = f.name.replace(/'/g, "\\'");
      html += `
        <div onclick="loadDriveFolder('${f.id}', '${safeName}')" class="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:border-primary transition group select-none active:scale-[0.98]">
           <div class="w-8 h-8 rounded bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
             <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
           </div>
           <span class="font-bold text-sm text-gray-900 dark:text-white truncate flex-1 group-hover:text-primary transition-colors">${f.name}</span>
           <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
        </div>
      `;
  });
  
  // Render Files
  files.forEach(f => {
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
          // Generic file icon
          iconHtml = `<svg class="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm6 1.5L18.5 9H12V3.5z"/></svg>`;
      }

      html += `
        <div onclick="openDriveFile('${f.url}')" class="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition group select-none active:scale-[0.98]">
           <div class="w-8 h-8 rounded ${bgClass} flex items-center justify-center shrink-0">
             ${iconHtml}
           </div>
           <span class="font-bold text-sm text-gray-900 dark:text-white truncate flex-1 group-hover:text-primary transition-colors">${f.name}</span>
        </div>
      `;
  });
  
  container.innerHTML = html;
}