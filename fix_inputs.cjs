const fs = require('fs');
let code = fs.readFileSync('frontend/js/finance.js', 'utf8');

// For updateFeeDeviation, let's remove the setTimeout re-render, and just update the row's total dynamically if possible, or just not re-render, relying on onblur to re-render if needed, but actually we can just re-render on blur.

code = code.replace(/clearTimeout\(window\.feeRenderTimeout\);\nwindow\.feeRenderTimeout = setTimeout\(\(\) => \{ renderFeeTracker\(\); \}, 800\);/g, "");

// For updateFinanceConfig, let's remove renderAllFinanceTabs() from perPersonFee updates.
// Wait, if we remove it, it won't update the UI. But if we change oninput to not call updateFinanceConfig, and instead just set the value.
// Actually, it's easier to change the HTML template to only call updateFinanceConfig on blur!

// Replace perPersonFee oninput
code = code.replace(/oninput="formatMoneyInput\(this, false\); updateFinanceConfig\('perPersonFee', parseFloat\(this\.value\.replace\(\/,\/g, ''\)\)\|\|0\)"/g, 
'oninput="formatMoneyInput(this, false); financeConfig.perPersonFee = parseFloat(this.value.replace(/,/g, \'\'))||0; queueFinanceUpdate();"');

// Replace fee deviation amount oninput
code = code.replace(/oninput="formatMoneyInput\(this, false\); updateFeeDeviation\('\$\{c\.poc\}', 'amount', this\.value\)"/g,
'oninput="formatMoneyInput(this, false); if(!financeConfig.feeDeviations[\'${c.poc}\']) financeConfig.feeDeviations[\'${c.poc}\'] = {}; financeConfig.feeDeviations[\'${c.poc}\'].amount = parseFloat(this.value.replace(/,/g, \'\'))||0; queueFinanceUpdate();"');

// Replace fee deviation remarks onchange -> onblur (onchange is fine since it triggers on blur/enter)
// Wait, the user said "when i try to key in the value, after 1 character it deselects". This happens on `oninput` for perPersonFee and updateFeeDeviation. 
// Ah! wait, `updateFeeDeviation` was called on `onchange` for remarks, not `oninput`. `onchange` only fires on blur! 
// Let's check `updateFeeDeviation` for remarks.
// `<input type="text" value="\${c.rem}" onchange="updateFeeDeviation('\${c.poc}', 'remarks', this.value)"`
// If it's `onchange`, it doesn't fire on every keystroke. It fires on blur. So remarks is fine.

// What about other inputs? Let's check updateFinanceField
// `<input type="text" ... oninput="formatMoneyInput(this, false); updateFinanceField('\${opt.id}', '\${f.id}', 'cost', this.value)"`
// updateFinanceField doesn't re-render, it just calls updateTotals which surgically updates textContent. So cost input is fine!

// What about `oninput="updateFinanceField('\${opt.id}', '\${f.id}', 'name', this.value)"` ?
// updateFinanceField doesn't re-render. So that's fine.

// Wait, is there any other input that triggers a re-render on input?
// Let's check `updateFinanceOption('...','title', this.value)`
// updateFinanceOption doesn't re-render either.

// So only `updateFeeDeviation` (because it had a setTimeout renderFeeTracker) and `updateFinanceConfig` (because it called renderAllFinanceTabs) were problematic.

fs.writeFileSync('frontend/js/finance.js', code);
