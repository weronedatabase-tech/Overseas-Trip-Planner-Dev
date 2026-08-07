const fs = require('fs');
let code = fs.readFileSync('frontend/js/main.js', 'utf8');

const newBtns = `          <div class="flex gap-2 justify-between pt-2">
            <button type="button" onclick="deleteAdminParticipant('\${nric}')" class="bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 font-bold py-2 px-4 rounded-lg text-xs hover:bg-red-100 transition shadow-sm">Delete Participant</button>
            <div class="flex gap-2">
                <button type="button" onclick="document.getElementById('gpm-view').classList.remove('hidden-force'); document.getElementById('gpm-edit').classList.add('hidden-force');" class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" class="bg-primary text-white font-bold py-2 px-4 rounded-lg text-xs hover:bg-blue-600 transition flex items-center shadow-sm">
                  <span class="btn-text">Save Changes</span><div class="btn-spinner hidden-force ml-2"></div>
                </button>
            </div>
          </div>`;

code = code.replace(/<div class="flex gap-2 justify-end pt-2">[\s\S]*?<\/div>/, newBtns);

const deleteFunc = `
async function deleteAdminParticipant(nric) {
    if (!confirm("Are you sure you want to delete this participant? Their details will be moved to a separate sheet.")) return;
    try {
        showToast("Deleting...", false, 10000);
        const res = await apiCall('deleteParticipant', { nric });
        if (res.status === 'success') {
            showToast("Participant deleted successfully.");
            closeParticipantSummaryModal();
            if (typeof fetchRoster === 'function') fetchRoster();
            if (typeof loadRoster === 'function') loadRoster();
        } else {
            showToast("Error: " + res.message, true);
        }
    } catch (e) {
        showToast("Failed to delete.", true);
    }
}
`;

if (!code.includes("deleteAdminParticipant")) {
    code += deleteFunc;
}

fs.writeFileSync('frontend/js/main.js', code);
