const fs = require('fs');
let code = fs.readFileSync('frontend/js/profile.js', 'utf8');

const qrRegex = /<img src="\$\{qrUrl\}" alt="PayNow QR Code" class="w-48 h-48 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-2">\s*<p class="text-xs font-bold text-gray-800 dark:text-gray-200 text-center">Scan with your banking app to PayNow<\/p>\s*<p class="text-\[9px\] font-medium text-gray-500 mt-1">Order Ref: <span class="font-mono font-bold">\$\{orderNo\}<\/span><\/p>/s;

const newQrHtml = `\${qrUrl ? \`<img src="\${qrUrl}" alt="PayNow QR Code" class="w-48 h-48 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-2">
        <p class="text-xs font-bold text-gray-800 dark:text-gray-200 text-center">Scan with your banking app to PayNow</p>
        <p class="text-[9px] font-medium text-gray-500 mt-1">Order Ref: <span class="font-mono font-bold">\${orderNo}</span></p>\` : \`<p class="text-xs font-bold text-red-500 p-4 text-center">Admin has not set up PayNow details.</p>\`}`;

code = code.replace(qrRegex, newQrHtml);
fs.writeFileSync('frontend/js/profile.js', code);