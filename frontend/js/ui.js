function showToast(msg, isError = false) {
 const t = document.getElementById('toast');
 if(!t) return;
 t.textContent = msg;
 t.className = `fixed top-12 left-1/2 transform -translate-x-1/2 px-4 py-2.5 rounded-xl shadow-2xl z-[100] transition-opacity duration-300 text-sm font-bold border ${isError ? 'bg-red-600 text-white border-red-700' : 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-700 dark:border-gray-200'}`;
 t.classList.remove('opacity-0');
 setTimeout(() => t.classList.add('opacity-0'), 4000);
}

window.cleanTrailingComma = function(input) { setTimeout(() => { if (document.activeElement === input) return; if (input && input.value) { const names = input.value.split("|").map(x => x.trim()).filter(x => x !== ""); input.value = names.join(" | "); } }, 250); };
function setBtnLoading(btn, isLoading) {
 if (!btn) return;
 const spinner = btn.querySelector('.btn-spinner');
 const icon = btn.querySelector('.btn-icon');
 const text = btn.querySelector('.btn-text');

 if (isLoading) {
   btn.disabled = true; btn.classList.add('opacity-80', 'cursor-not-allowed');
   if (spinner) spinner.classList.remove('hidden-force');
   if (icon) icon.classList.add('opacity-0');
   // if (text) text.classList.add('opacity-0');
 } else {
   btn.disabled = false; btn.classList.remove('opacity-80', 'cursor-not-allowed');
   if (spinner) spinner.classList.add('hidden-force');
   if (icon) icon.classList.remove('opacity-0');
   // if (text) text.classList.remove('opacity-0');
 }
}

function toggleTheme() {
 document.documentElement.classList.toggle('dark');
 localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

const projectColorPalette =[
 'bg-slate-100 border-slate-400 text-slate-900 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100',
 'bg-gray-100 border-gray-400 text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-slate-100',
 'bg-zinc-100 border-zinc-400 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-600 dark:text-zinc-100',
 'bg-neutral-100 border-neutral-400 text-neutral-900 dark:bg-neutral-900 dark:border-neutral-600 dark:text-neutral-100',
 'bg-stone-100 border-stone-400 text-stone-900 dark:bg-stone-900 dark:border-stone-600 dark:text-stone-100',
 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-900 dark:border-amber-600 dark:text-amber-100',
 'bg-yellow-100 border-yellow-400 text-yellow-900 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-100',
 'bg-lime-100 border-lime-400 text-lime-900 dark:bg-lime-900 dark:border-lime-600 dark:text-lime-100',
 'bg-green-100 border-green-400 text-green-900 dark:bg-green-900 dark:border-green-600 dark:text-green-100',
 'bg-emerald-100 border-emerald-400 text-emerald-900 dark:bg-emerald-900 dark:border-emerald-600 dark:text-emerald-100',
 'bg-teal-100 border-teal-400 text-teal-900 dark:bg-teal-900 dark:border-teal-600 dark:text-teal-100',
 'bg-cyan-100 border-cyan-400 text-cyan-900 dark:bg-cyan-900 dark:border-cyan-600 dark:text-cyan-100',
 'bg-sky-100 border-sky-400 text-sky-900 dark:bg-sky-900 dark:border-sky-600 dark:text-sky-100',
 'bg-green-100 border-green-400 text-green-900 dark:bg-green-900 dark:border-green-600 dark:text-green-100',
 'bg-indigo-100 border-indigo-400 text-indigo-900 dark:bg-indigo-900 dark:border-indigo-600 dark:text-indigo-100',
 'bg-violet-100 border-violet-400 text-violet-900 dark:bg-violet-900 dark:border-violet-600 dark:text-violet-100',
 'bg-purple-100 border-purple-400 text-purple-900 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-100',
 'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-900 dark:bg-fuchsia-900 dark:border-fuchsia-600 dark:text-fuchsia-100'
];

function getProjectColor(groupName) {
 if (!groupName || groupName === 'None') return 'bg-gray-100 border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100';
 if (appSettings && appSettings.projectColors && appSettings.projectColors[groupName]) return appSettings.projectColors[groupName];
 return 'bg-gray-100 border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100';
}

function getProjectAbbreviation(name) {
 const match = name.match(/\((.*?)\)/); if (match && match[1]) return match[1].substring(0,3).toUpperCase();
 const words = name.split(' ').filter(w => w.length > 0);
 if (words.length > 1) return words.slice(0,3).map(w => w[0]).join('').toUpperCase();
 return name.substring(0,3).toUpperCase();
}

function renderHeaderLegend() {
 const deskCont = document.getElementById('headerLegend');
 const mobCont = document.getElementById('mobHeaderLegend');
 if (!appSettings || !appSettings.activeProjects || appSettings.activeProjects.length === 0) {
   if(deskCont) deskCont.innerHTML = '';
   if(mobCont) mobCont.innerHTML = '';
   return;
 }
 let html = '';
 appSettings.activeProjects.forEach(proj => {
   if(!proj) return;
   const colorCls = getProjectColor(proj); const shortName = getProjectAbbreviation(proj);
   html += `<span class="px-1.5 py-0.5 rounded text-[11px] md:text-xs font-bold border shadow-sm cursor-help ${colorCls}" title="${proj}">${shortName}</span>`;
 });
 if(deskCont) deskCont.innerHTML = html;
 if(mobCont) mobCont.innerHTML = html;
}

window.getFamilyMembers = function(nric, allParticipants) {
    const target = allParticipants.find(p => p.nric === nric);
    if (!target) return [];
    const targetPoc = target.pocNric || target.nric;
    
    let myRelatedNames = [];
    if (target.relatedTrainee) {
        myRelatedNames = String(target.relatedTrainee).split(/[\|,]/).map(n => n.replace(/\s+/g, '').toLowerCase()).filter(n => n);
    }
    let myName = (target.fullName || '').replace(/\s+/g, '').toLowerCase();
    let myShortName = (target.shortName || '').replace(/\s+/g, '').toLowerCase();

    return allParticipants.filter(p => {
        if (p.pocNric === targetPoc && targetPoc) return true;
        
        let pName = (p.fullName || '').replace(/\s+/g, '').toLowerCase();
        let pShortName = (p.shortName || '').replace(/\s+/g, '').toLowerCase();
        
        // Am I a Caregiver for them?
        if (myRelatedNames.length > 0 && myRelatedNames.some(d => d.includes(pName) || pName.includes(d) || (pShortName && d.includes(pShortName)))) {
            return true;
        }
        
        // Are they a Caregiver for me?
        if (p.role === 'CAREGIVER' && p.relatedTrainee) {
            let theirRelated = String(p.relatedTrainee).split(/[\|,]/).map(n => n.replace(/\s+/g, '').toLowerCase()).filter(n => n);
            if (theirRelated.some(d => d.includes(myName) || myName.includes(d) || (myShortName && d.includes(myShortName)))) {
                return true;
            }
        }
        return false;
    });
};

window.isFamily = function(nric, allParticipants) {
    return window.getFamilyMembers(nric, allParticipants).length > 1;
};

function applyGlobalSorting(participants) {
 if(!appSettings) return participants;
 const rules = appSettings.sortingRules || ['project', 'family', 'role', 'name'];
 const familyCounts = {};
 participants.forEach(p => { 
    const poc = p.pocNric;
    familyCounts[poc] = (familyCounts[poc] || 0) + 1; 
 });

 return participants.sort((a, b) => {
   for (let rule of rules) {
       if (rule === 'none') continue;
       if (rule === 'project') {
           const aG = a.group || 'ZZZ';
           const bG = b.group || 'ZZZ';
           const cmp = aG.localeCompare(bG);
           if (cmp !== 0) return cmp;
       }
       if (rule === 'family') {
           const aPoc = a.pocNric;
           const bPoc = b.pocNric;
           const aFam = familyCounts[aPoc] > 1 ? 1 : 0;
           const bFam = familyCounts[bPoc] > 1 ? 1 : 0;
           if (aFam !== bFam) return bFam - aFam;
           if (aFam === 1 && bFam === 1) {
               const cmp = aPoc.localeCompare(bPoc);
               if (cmp !== 0) return cmp;
           }
       }
       if (rule === 'role') {
           const rW = { 'CAREGIVER': 1, 'TRAINEE': 2, 'VOLUNTEER': 3 };
           const aR = rW[a.role] || 9;
           const bR = rW[b.role] || 9;
           if (aR !== bR) return aR - bR;
       }
       if (rule === 'name') {
           const cmp = (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '');
           if (cmp !== 0) return cmp;
       }
   }
   return 0;
 });
}

function processDisplayNames(participants) {
 if(!participants) return;
 const nameCounts = {};
 participants.forEach(p => {
     p.shortName = p.shortName ? p.shortName.trim() : '';
     p.name = p.name ? p.name.trim() : '';
     const sName = p.shortName || p.name;
     nameCounts[sName] = (nameCounts[sName] || 0) + 1;
 });
 participants.forEach(p => {
     const sName = p.shortName || p.name;
     if (nameCounts[sName] > 1) {
         const roleChar = p.role ? p.role.charAt(0).toUpperCase() : 'U';
         const projAcr = p.group ? getProjectAbbreviation(p.group) : 'N/A';
         p.displayName = `${sName} (${roleChar}) (${projAcr})`;
     } else {
         p.displayName = sName;
     }
 });
 const displayCounts = {};
 participants.forEach(p => { displayCounts[p.displayName] = (displayCounts[p.displayName] || 0) + 1; });
 participants.forEach(p => {
     if (displayCounts[p.displayName] > 1) {
         const sName = p.shortName || p.name;
         const roleChar = p.role ? p.role.charAt(0).toUpperCase() : 'U';
         const projAcr = p.group ? getProjectAbbreviation(p.group) : 'N/A';
         const words = p.name.split(' ');
         let extraChar = '';
         if (words.length > 1) {
             const diffWord = words.find(w => w.toLowerCase() !== sName.toLowerCase());
             if(diffWord) extraChar = diffWord.charAt(0).toUpperCase() + '.';
             else extraChar = words[1].charAt(0).toUpperCase() + '.';
         } else {
             extraChar = p.name.charAt(0).toUpperCase() + '.';
         }
         p.displayName = `${sName} ${extraChar} (${roleChar}) (${projAcr})`;
     }
 });
 const finalCounts = {};
 participants.forEach(p => { finalCounts[p.displayName] = (finalCounts[p.displayName] || 0) + 1; });
 participants.forEach(p => {
     if (finalCounts[p.displayName] > 1 && p.nric) {
         p.displayName = `${p.displayName} [${p.nric.slice(-4)}]`;
     }
 });
}

async function updateApp(btn) {
 setBtnLoading(btn, true);
 showToast("Updating app data and clearing caches...");
 try {
   if ('caches' in window) {
     const cacheNames = await caches.keys();
     await Promise.all(cacheNames.map(name => caches.delete(name)));
   }
   if ('serviceWorker' in navigator) {
     const regs = await navigator.serviceWorker.getRegistrations();
     for (let r of regs) await r.unregister();
   }
 } catch(e) { console.error(e); }
 setTimeout(() => {
   const url = new URL(window.location.href);
   url.searchParams.set('v', new Date().getTime());
   window.location.replace(url.toString());
 }, 1000);
}

function handleEnter(e, func) { if(e.key === 'Enter') func(); }

function clearSearch(inputId, callbackName) {
 const input = document.getElementById(inputId);
 if (input) {
     input.value = '';
     if (typeof window[callbackName] === 'function') window[callbackName]();
 }
}

window.formatMoneyInput = function(input, isBlur) {
 let cursorStart = input.selectionStart;
 let oldLen = input.value.length;
 
  let val = input.value.replace(/[^0-9.-]/g, '');
 if(val !== '') {
     let isNegative = val[0] === '-';
     val = val.replace(/-/g, '');
     if(isNegative) val = '-' + val;
 }
 if(val === '') {
     input.value = '';
     return;
 }
 
 let parts = val.split('.');
 if(parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
 
 if (isBlur) {
     let number = parseFloat(val);
     if(!isNaN(number)) {
         input.value = number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
     } else {
         input.value = '0.00';
     }
 } else {
     parts = val.split('.');
     let whole = parts[0] ? parseFloat(parts[0]).toLocaleString('en-US') : '0';
     
     if(parts.length > 1) {
         input.value = whole + '.' + parts[1].substring(0, 2);
     } else {
         input.value = whole;
     }
     
     let newLen = input.value.length;
     let diff = newLen - oldLen;
     let newCursor = cursorStart + diff;
     try { input.setSelectionRange(newCursor, newCursor); } catch(e){}
 }
};

window.applyCaregiverLabels = function(participants) {
    if (!participants) return;
    const traineeMap = {};
    participants.forEach(p => {
        if (p.role === 'TRAINEE') {
            const nameToUse = p.shortName || p.fullName || p.name;
            const searchKey = String(p.nric || '').toLowerCase();
            const searchKey2 = String(p.fullName || p.name || '').toLowerCase();
            const searchKey3 = String(p.shortName || '').toLowerCase();
            traineeMap[searchKey] = nameToUse;
            traineeMap[searchKey2] = nameToUse;
            traineeMap[searchKey3] = nameToUse;
        }
    });

    participants.forEach(p => {
        if (p.role === 'CAREGIVER') {
            if (p.relatedTrainee) {
                let parts = String(p.relatedTrainee).split(/[\|,]/).filter(Boolean);
                let mapped = parts.map(n => {
                    let raw = n.trim();
                    let k = raw.toLowerCase();
                    let lookupName = raw.replace(/\s*\(.*?\)\s*/g, '').toLowerCase().trim();
                    if (traineeMap[k]) return traineeMap[k];
                    if (traineeMap[lookupName]) return traineeMap[lookupName];
                    const match = raw.match(/\((.*?)\)/);
                    if (match && match[1]) return match[1].trim();
                    return raw.replace(/\s*\(.*?\)\s*/g, '').trim();
                });
                p.caregiverFor = mapped.join(', ');
            }
        }
    });
};

window.renderPhoneLink = function(phone, extraClasses = '') {
    if (!phone || phone === '-' || String(phone).trim() === '' || String(phone).toLowerCase() === 'n/a') return '-';
    let cleaned = String(phone).replace(/[^\d+]/g, '');
    if (cleaned.length === 8 && (cleaned.startsWith('8') || cleaned.startsWith('9'))) {
        cleaned = '65' + cleaned;
    } else if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    }
    return `<a href="https://wa.me/${cleaned}" target="_blank" class="text-green-600 dark:text-green-400 hover:underline inline-flex items-center gap-1 w-max ${extraClasses}" title="Chat on WhatsApp" onclick="event.stopPropagation()"><svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> ${phone}</a>`;
};

window.formatDDMmmYYYY = function(dateStr) {
    if (!dateStr || dateStr.trim() === '') return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

window.sortParticipantsSpecial = function(arr, allParticipants) {
    if (!arr || !allParticipants) return;
    const famMap = {};
    allParticipants.forEach(x => {
        const poc = x.pocNric;
        if(!famMap[poc]) famMap[poc] = { count: 0, hasCaregiver: false };
        famMap[poc].count++;
            });

    const specialSortMap = new Map();
    arr.forEach(p => {
        const poc = p.pocNric;
        const info = famMap[poc];
        const isFamily = info ? (info.count > 1) : false;
        let catScore = 4;
        if (isFamily) catScore = 1;
        else if (p.role === 'TRAINEE') catScore = 2;
        else if (p.role === 'VOLUNTEER') catScore = 3;
        let roleScore = p.role === 'TRAINEE' ? 1 : (p.role === 'CAREGIVER' ? 2 : 3);
        specialSortMap.set(p.nric, {
            group: (p.group || '').toLowerCase(),
            catScore,
            poc: poc.toLowerCase(),
            roleScore,
            name: (p.fullName || p.name || '').toLowerCase()
        });
    });

    arr.sort((a, b) => {
        let keyA = specialSortMap.get(a.nric);
        let keyB = specialSortMap.get(b.nric);
        if (!keyA || !keyB) return 0;

        if (keyA.group < keyB.group) return -1;
        if (keyA.group > keyB.group) return 1;
        
        if (keyA.catScore < keyB.catScore) return -1;
        if (keyA.catScore > keyB.catScore) return 1;
        
        if (keyA.catScore === 1) {
            if (keyA.poc < keyB.poc) return -1;
            if (keyA.poc > keyB.poc) return 1;
        }
        
        if (keyA.roleScore < keyB.roleScore) return -1;
        if (keyA.roleScore > keyB.roleScore) return 1;
        
        if (keyA.name < keyB.name) return -1;
        if (keyA.name > keyB.name) return 1;
        return 0;
    });
};

window.setupTokenInput = function(inputId, getSuggestionsCallback) {
    const originalInput = document.getElementById(inputId);
    if (!originalInput || originalInput.dataset.tokenized) return;
    originalInput.dataset.tokenized = "true";

    // Hide original input but keep its functionality
    originalInput.style.display = 'none';

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = "flex flex-wrap items-center gap-1.5 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus-within:ring-1 focus-within:ring-primary cursor-text min-h-[42px]";
    
    const chipContainer = document.createElement('div');
    chipContainer.className = "flex flex-wrap gap-1.5 items-center";
    
    const inputField = document.createElement('input');
    inputField.type = "text";
    inputField.className = "flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-xs font-semibold text-gray-900 dark:text-white min-w-[60px] p-0";
    inputField.placeholder = "Search trainee...";
    
    const dropdown = document.createElement('div');
    dropdown.className = "absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 hidden-force max-h-48 overflow-y-auto";
    
    // Wrapper must be relative for dropdown
    const outerWrapper = document.createElement('div');
    outerWrapper.className = "relative w-full";
    
    originalInput.parentNode.insertBefore(outerWrapper, originalInput);
    outerWrapper.appendChild(originalInput);
    outerWrapper.appendChild(wrapper);
    outerWrapper.appendChild(dropdown);
    
    wrapper.appendChild(chipContainer);
    wrapper.appendChild(inputField);

    let tokens = (originalInput.value || '').split(/[\|,]/).map(s => s.trim()).filter(Boolean);
    
    function renderTokens() {
        chipContainer.innerHTML = '';
        const currentTokens = window._tokenInputs[inputId] ? window._tokenInputs[inputId].tokens : tokens;
        currentTokens.forEach((t, i) => {
            const chip = document.createElement('span');
            chip.className = "inline-flex items-center px-2 py-1 rounded-md text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 uppercase tracking-widest";
            chip.innerHTML = `
                ${t}
                <button type="button" class="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none flex-shrink-0" onclick="event.stopPropagation(); window.removeTokenFromInput('${inputId}', ${i})">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                </button>
            `;
            chipContainer.appendChild(chip);
        });
        originalInput.value = currentTokens.join(' | ');
        originalInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (!window._tokenInputs) window._tokenInputs = {};
    window._tokenInputs[inputId] = {
        tokens,
        render: renderTokens,
        getInputField: () => inputField
    };
    
    window.removeTokenFromInput = function(id, index) {
        if(window._tokenInputs[id]) {
            window._tokenInputs[id].tokens.splice(index, 1);
            window._tokenInputs[id].render();
        }
    };

    renderTokens();

    wrapper.addEventListener('click', () => {
        inputField.focus();
    });

    inputField.addEventListener('input', () => {
        const query = inputField.value.trim().toLowerCase();
        if (query) {
             const suggestions = getSuggestionsCallback(query);
             renderDropdown(suggestions);
        } else {
             dropdown.classList.add('hidden-force');
        }
    });

    function renderDropdown(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            dropdown.innerHTML = '<div class="p-2 text-xs text-gray-500 text-center italic pointer-events-none">No matches found</div>';
        } else {
            dropdown.innerHTML = '';
            suggestions.forEach(s => {
                const item = document.createElement('div');
                item.className = "px-3 py-2 text-sm font-bold text-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition border-b border-gray-100 dark:border-gray-700 last:border-0";
                item.textContent = s.label;
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault(); // prevent blur
                    const currentTokens = window._tokenInputs[inputId].tokens;
                    if (!currentTokens.includes(s.value)) {
                        currentTokens.push(s.value);
                    }
                    inputField.value = '';
                    dropdown.classList.add('hidden-force');
                    renderTokens();
                });
                dropdown.appendChild(item);
            });
        }
        dropdown.classList.remove('hidden-force');
    }

    inputField.addEventListener('focus', () => {
         const suggestions = getSuggestionsCallback(inputField.value.trim().toLowerCase());
         renderDropdown(suggestions);
    });

    inputField.addEventListener('blur', () => {
        setTimeout(() => dropdown.classList.add('hidden-force'), 150);
    });
};
