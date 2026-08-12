const fs = require('fs');

// MEDICAL.JS
let medJs = fs.readFileSync('frontend/js/medical.js', 'utf8');
medJs = medJs.replace(/localStorage\.getItem\('medSortRules'\)/g, "localStorage.getItem('medicalSortRules_v2')");
medJs = medJs.replace(/localStorage\.setItem\('medSortRules'/g, "localStorage.setItem('medicalSortRules_v2'");

medJs = medJs.replace(/localStorage\.getItem\('medCols'\)/g, "localStorage.getItem('medicalCols_v2')");
medJs = medJs.replace(/localStorage\.setItem\('medCols'/g, "localStorage.setItem('medicalCols_v2'");

const newMedCols = `let medCols = JSON.parse(localStorage.getItem('medicalCols_v2')) || [
{ id: 'medical', label: 'Medical & Medications', width: 300, visible: true },
{ id: 'otherPoints', label: 'Other Notes', width: 220, visible: true },
{ id: 'emergencyName', label: 'Emergency Contact Name', width: 180, visible: true },
{ id: 'emergencyContact', label: 'Emergency Contact No.', width: 180, visible: true }
];`;
medJs = medJs.replace(/let medCols =[\s\S]*?\];/, newMedCols);

// Remove backward compatibility block
medJs = medJs.replace(/\/\/ Ensure backwards compatibility[\s\S]*?\}\n/g, "");

// Filter adminRosterData for medical
// wait, inside renderMedicalTable, it does let data = [...adminRosterData];
const medicalFilter = `let data = adminRosterData.filter(p => p.medical || p.otherPoints || p.emergencyName || p.emergencyContact);`;
medJs = medJs.replace(/let data = \[\.\.\.adminRosterData\];/, medicalFilter);

fs.writeFileSync('frontend/js/medical.js', medJs);

// DIET.JS
let dietJs = fs.readFileSync('frontend/js/diet.js', 'utf8');
dietJs = dietJs.replace(/localStorage\.getItem\('medSortRules'\)/g, "localStorage.getItem('dietSortRules_v2')");
dietJs = dietJs.replace(/localStorage\.setItem\('medSortRules'/g, "localStorage.setItem('dietSortRules_v2'");

dietJs = dietJs.replace(/localStorage\.getItem\('medCols'\)/g, "localStorage.getItem('dietCols_v2')");
dietJs = dietJs.replace(/localStorage\.setItem\('medCols'/g, "localStorage.setItem('dietCols_v2'");

const newDietCols = `let medCols = JSON.parse(localStorage.getItem('dietCols_v2')) || [
{ id: 'diet', label: 'Dietary Restrictions', width: 300, visible: true },
{ id: 'otherPoints', label: 'Other Notes', width: 220, visible: true }
];`;
dietJs = dietJs.replace(/let medCols =[\s\S]*?\];/, newDietCols);

// Remove backward compatibility block
dietJs = dietJs.replace(/\/\/ Ensure backwards compatibility[\s\S]*?\}\n/g, "");

// Filter adminRosterData for diet
const dietFilter = `let data = adminRosterData.filter(p => p.diet || p.otherPoints);`;
dietJs = dietJs.replace(/let data = \[\.\.\.adminRosterData\];/, dietFilter);

// Change title inside UI
dietJs = dietJs.replace(/<h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg">Medical & Dietary<\/h3>/, 
'<h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg">Dietary Restrictions</h3>');

medJs = fs.readFileSync('frontend/js/medical.js', 'utf8');
medJs = medJs.replace(/<h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg">Medical & Dietary<\/h3>/, 
'<h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg">Medical Requirements</h3>');
fs.writeFileSync('frontend/js/medical.js', medJs);

fs.writeFileSync('frontend/js/diet.js', dietJs);
