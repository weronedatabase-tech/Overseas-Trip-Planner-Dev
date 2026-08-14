const fs = require('fs');
let code = fs.readFileSync('frontend/js/finance.js', 'utf8');

code = code.replace(
  /const up = globalLogistics\.participants\.find\(x => x\.nric === r\.uploaderNric\);\s*if\(up\) uploaderName = up\.shortName \|\| up\.name;/,
  `const up = globalLogistics.participants.find(x => x.nric === r.uploaderNric);
        if(up) uploaderName = up.shortName || up.name;
        else if (r.uploaderName) uploaderName = r.uploaderName;`
);

code = code.replace(
  /const pp = globalLogistics\.participants\.find\(x => x\.nric === payerName\);\s*if\(pp\) payerName = pp\.shortName \|\| pp\.name;/,
  `const pp = globalLogistics.participants.find(x => x.nric === payerName);
       if(pp) payerName = pp.shortName || pp.name;
       else if (r.uploaderName && payerName === r.uploaderNric) payerName = r.uploaderName;`
);

fs.writeFileSync('frontend/js/finance.js', code);
console.log("Updated finance.js");
