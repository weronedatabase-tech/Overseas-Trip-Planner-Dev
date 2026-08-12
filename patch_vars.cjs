const fs = require('fs');

function patchFile(filepath, includeExpiry = false) {
    let code = fs.readFileSync(filepath, 'utf8');
    
    let varsToAdd = `   const fullNameUpper = (p.fullName || '').toUpperCase();
   const shortNameUpper = (p.shortName || '').toUpperCase();
   const nameClass = 'font-bold text-gray-900 dark:text-gray-100';`;

    if (includeExpiry) {
        varsToAdd = `   let expiryHighlight = false;
   let formattedExpiry = p.passportExpiry;
   if (p.passportExpiry) {
       const expD = new Date(p.passportExpiry);
       if (!isNaN(expD.getTime())) {
           formattedExpiry = \`\${expD.getFullYear()}-\${String(expD.getMonth()+1).padStart(2,'0')}-\${String(expD.getDate()).padStart(2,'0')}\`;
           if (typeof minExpiry !== 'undefined' && minExpiry && expD < minExpiry) {
               expiryHighlight = true;
           }
       }
   }
   const fullNameUpper = (p.fullName || '').toUpperCase();
   const shortNameUpper = (p.shortName || '').toUpperCase();
   const nameClass = expiryHighlight ? 'text-red-600 dark:text-red-400 font-extrabold' : 'font-bold text-gray-900 dark:text-gray-100';
   const expClass = expiryHighlight 
        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded font-black border border-red-200 dark:border-red-800 shadow-sm whitespace-nowrap text-[11px] uppercase tracking-wider inline-block' 
        : 'text-gray-800 dark:text-gray-200 whitespace-nowrap text-xs font-medium';`;
    }

    const anchor = `data.forEach(p => {
   const roleStr = p.role.substring(0, 3).toUpperCase();
   const roleColor = p.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (p.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');`;

    if (code.includes(anchor)) {
        code = code.replace(anchor, anchor + '\n' + varsToAdd);
    }
    
    // Add else fallback for table columns if missing
    const fallbackStr = `           } else {
               html += \`<td class="\${baseClass} border-l border-gray-100 dark:border-gray-800/50" \${styleStr}>\${(p[c.id] || '-').toString().toUpperCase()}</td>\`;
           }`;
           
    const checkAnchor = `           } else if (c.id === 'emergencyName') {
               html += \`<td class="\${baseClass} border-l border-gray-100 dark:border-gray-800/50" \${styleStr}>
                   <div class="font-bold text-gray-800 dark:text-gray-200">\${(p.emergencyName || '-').toUpperCase()}</div>
                   <div class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">\${(p.emergencyRelation || '-').toUpperCase()}</div>
                   <div class="font-mono text-blue-600 dark:text-blue-400 font-bold">\${p.emergencyContact || '-'}</div>
               </td>\`;
           }`;
           
    if (code.includes(checkAnchor) && !code.includes(fallbackStr)) {
        code = code.replace(checkAnchor, checkAnchor + '\n' + fallbackStr);
    }
    
    if (includeExpiry && code.includes(fallbackStr)) {
       // add passport formatters before fallback
       const passportCheck = `           } else if (c.id === 'passportNo') {
               html += \`<td class="\${baseClass} font-mono uppercase text-gray-700 dark:text-gray-300 border-l border-gray-100 dark:border-gray-800/50" \${styleStr}>\${(p.passportNo || '-').toUpperCase()}</td>\`;
           } else if (c.id === 'passportExpiry') {
               html += \`<td class="\${baseClass} border-l border-gray-100 dark:border-gray-800/50" \${styleStr}><span class="\${expClass}">\${formattedExpiry || '-'}</span></td>\`;
           }`;
       if (!code.includes("c.id === 'passportNo'")) {
           code = code.replace(fallbackStr, passportCheck + '\n' + fallbackStr);
       }
    }

    fs.writeFileSync(filepath, code);
}

patchFile('frontend/js/medical.js', false);
patchFile('frontend/js/diet.js', false);
patchFile('frontend/js/expired.js', true);
