const projectColorPalette =[
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
'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-100',
'bg-indigo-100 border-indigo-400 text-indigo-900 dark:bg-indigo-900 dark:border-indigo-600 dark:text-indigo-100',
'bg-violet-100 border-violet-400 text-violet-900 dark:bg-violet-900 dark:border-violet-600 dark:text-violet-100',
'bg-purple-100 border-purple-400 text-purple-900 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-100',
'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-900 dark:bg-fuchsia-900 dark:border-fuchsia-600 dark:text-fuchsia-100',
'bg-pink-100 border-pink-400 text-pink-900 dark:bg-pink-900 dark:border-pink-600 dark:text-pink-100',
'bg-rose-100 border-rose-400 text-rose-900 dark:bg-rose-900 dark:border-rose-600 dark:text-rose-100'
];

window.getProjectColor = function(groupName) {
   if (!groupName || groupName === 'None') return 'bg-zinc-100 border-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100'; 
   if (AppCore.appSettings?.projectColors && AppCore.appSettings.projectColors[groupName]) return AppCore.appSettings.projectColors[groupName];
   return 'bg-zinc-100 border-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100'; 
}

window.getProjectAbbreviation = function(name) {
   const match = name.match(/\((.*?)\)/); if (match && match[1]) return match[1].substring(0,3).toUpperCase();
   const words = name.split(' ').filter(w => w.length > 0);
   if (words.length > 1) return words.slice(0,3).map(w => w[0]).join('').toUpperCase();
   return name.substring(0,3).toUpperCase();
}

window.renderHeaderLegend = function() {
   const deskCont = document.getElementById('headerLegend');
   const mobCont = document.getElementById('mobHeaderLegend');
   if (!AppCore.appSettings?.activeProjects || AppCore.appSettings.activeProjects.length === 0) { 
       if(deskCont) deskCont.innerHTML = ''; 
       if(mobCont) mobCont.innerHTML = ''; 
       return; 
   }
   let html = '';
   AppCore.appSettings.activeProjects.forEach(proj => {
       if(!proj) return;
       const colorCls = getProjectColor(proj); const shortName = getProjectAbbreviation(proj);
       html += `<span class="px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold border shadow-sm cursor-help ${colorCls}" title="${proj}">${shortName}</span>`;
   });
   if(deskCont) deskCont.innerHTML = html;
   if(mobCont) mobCont.innerHTML = html;
}