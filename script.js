// =========================================================================
// 🔗 PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
// =========================================================================
const CLOUD_API_URL = "https://script.google.com/macros/s/AKfycby-HCCNrYC-ZB0IKRFfZP2w4CXz2SmLz3MNJbGUCRGsywhTNe096MLxLaOU6L4GA3PRuA/exec";

// Bilingual Translations Dictionary
const i18n = {
    ar: {
        appTitle: "📋 نظام جرد الفروع",
        branchPrefix: "فرع: ",
        adminBtn: "⚙️ لوحة المشرف",
        submitBtn: "🚀 حفظ وتصدير للفرع الرئيسي",
        thItem: "الصنف",
        thDate: "التاريخ",
        thRec: "مستلم",
        thNew: "جديد",
        thDel: "مسلم",
        thTotal: "العدد النهائي",
        thNote: "ملاحظات",
        passDesc: "أدخل كلمة المرور الخاصة بهذا العمود",
        confirm: "تأكيد",
        cancel: "إلغاء",
        adminTitle: "⚙️ لوحة المشرف",
        adminInfo: "بيانات الفرع",
        adminPasses: "كلمات المرور",
        adminItems: "إدارة الأصناف والقوائم",
        saveAdmin: "حفظ الإعدادات",
        closeAdmin: "إغلاق",
        wrongPass: "كلمة المرور غير صحيحة!",
        reportSuccess: "تم رفع التقرير بنجاح إلى السحابة وإرساله للفرع الرئيسي!",
        reportError: "حدث خطأ أثناء إرسال التقرير. تأكد من الاتصال بالإنترنت."
    },
    en: {
        appTitle: "📋 Branch Inventory System",
        branchPrefix: "Branch: ",
        adminBtn: "⚙️ Admin Panel",
        submitBtn: "🚀 Submit Report to HQ",
        thItem: "Item Name",
        thDate: "Date",
        thRec: "Received",
        thNew: "New Stock",
        thDel: "Delivered",
        thTotal: "Final Total",
        thNote: "Notes",
        passDesc: "Enter authorization password for this column",
        confirm: "Confirm",
        cancel: "Cancel",
        adminTitle: "⚙️ Admin Settings",
        adminInfo: "Branch Info",
        adminPasses: "Passwords",
        adminItems: "Manage Categories & Items",
        saveAdmin: "Save Settings",
        closeAdmin: "Close",
        wrongPass: "Incorrect password!",
        reportSuccess: "Report successfully uploaded to cloud and sent to HQ!",
        reportError: "Error sending report. Please check your internet connection."
    }
};

let currentLang = localStorage.getItem('salma_branch_lang') || 'ar';

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('salma_branch_lang', currentLang);
    applyLanguage();
}

function applyLanguage() {
    const html = document.documentElement;
    html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', currentLang);

    const t = i18n[currentLang];

    if (document.getElementById('i18n-app-title')) document.getElementById('i18n-app-title').innerText = t.appTitle;
    if (document.getElementById('i18n-btn-admin')) document.getElementById('i18n-btn-admin').innerText = t.adminBtn;
    if (document.getElementById('i18n-btn-submit')) document.getElementById('i18n-btn-submit').innerText = t.submitBtn;

    if (document.getElementById('i18n-th-item')) document.getElementById('i18n-th-item').innerText = t.thItem;
    if (document.getElementById('i18n-th-date')) document.getElementById('i18n-th-date').innerText = t.thDate;
    if (document.getElementById('i18n-th-rec')) document.getElementById('i18n-th-rec').innerText = t.thRec;
    if (document.getElementById('i18n-th-new')) document.getElementById('i18n-th-new').innerText = t.thNew;
    if (document.getElementById('i18n-th-del')) document.getElementById('i18n-th-del').innerText = t.thDel;
    if (document.getElementById('i18n-th-total')) document.getElementById('i18n-th-total').innerText = t.thTotal;
    if (document.getElementById('i18n-th-note')) document.getElementById('i18n-th-note').innerText = t.thNote;

    if (document.getElementById('i18n-pass-desc')) document.getElementById('i18n-pass-desc').innerText = t.passDesc;
    if (document.getElementById('i18n-btn-confirm')) document.getElementById('i18n-btn-confirm').innerText = t.confirm;
    if (document.getElementById('i18n-btn-cancel')) document.getElementById('i18n-btn-cancel').innerText = t.cancel;

    const branch = getBranchInfo();
    if (document.getElementById('branch-display-tag')) {
        document.getElementById('branch-display-tag').innerText = `${t.branchPrefix}${branch.name}`;
    }
}

// Default Categories Structure
const defaultCategories = [
    {
        name: "قائمة 1 (أساسي)",
        items: [
            "سكر", "بن فاتح سادة", "بن فاتح محوج", "بن غامق محوج", "بن بندق", "اسبرسو", 
            "تست", "كراسون", "تشيز كيك", "اكلير", "ملفاي", "براونز", "دوناتس", 
            "عجينة وافل", "عجينة كباكي", "ساندوتش ميكس جبن تركي", "كوب دوناتس", 
            "غطاء دوناتس", "فاكهة حشو فراولة", "فاكهة حشو عنب بري"
        ]
    },
    {
        name: "قائمة 2 (المشروبات)",
        items: ["شاي أحمر", "شاي أخضر", "نعناع", "نسكافيه", "كركديه", "سحلب", "قرفة", "زنجبيل"]
    },
    {
        name: "قائمة 3 (الحلويات والصوصات)",
        items: ["صوص شوكولاتة", "صوص كراميل", "صوص فراولة", "عسل نحل", "مربى", "كريمة خفق"]
    },
    {
        name: "قائمة 4 (الأكواب والمستلزمات)",
        items: ["أكواب ورقية 8 أوز", "أكواب ورقية 12 أوز", "أغطية أكواب", "شاليموه", "مناديل", "أكياس بلاستيك"]
    },
    {
        name: "قائمة 5 (المستلزمات العامة)",
        items: ["صابون سائل", "كلور", "مظهر أرضيات", "إسفنج غسيل", "أكياس قمامة"]
    },
    {
        name: "قائمة 6 (المخزون العام)",
        items: ["زيت", "زبدة", "دقيق", "خميرة", "بيكنج بودر", "فانيليا"]
    }
];

function loadCategories() {
    const saved = localStorage.getItem('salma_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
}

function saveCategories(cats) {
    localStorage.setItem('salma_categories', JSON.stringify(cats));
}

let categories = loadCategories();
let currentCategoryIndex = 0;

let isReceivedUnlocked = false;
let isDeliveredUnlocked = false;
let pendingUnlockTarget = null;

function getPasswords() {
    return {
        received: localStorage.getItem('salma_pass_received') || "1234",
        delivered: localStorage.getItem('salma_pass_delivered') || "1234",
        admin: localStorage.getItem('salma_pass_admin') || "9999"
    };
}

function getBranchInfo() {
    return {
        name: localStorage.getItem('salma_branch_name') || "",
        phone: localStorage.getItem('salma_branch_phone') || "01xxxxxxxxx"
    };
}

window.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    if (document.getElementById('splash-screen')) {
        document.getElementById('splash-screen').style.display = 'none';
    }
    if (document.getElementById('app-container')) {
        document.getElementById('app-container').classList.remove('hidden');
    }

    applyLanguage();
    renderTabs();
    renderTable();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

function renderTabs() {
    const wrapper = document.getElementById('tabs-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = "";

    categories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${index === currentCategoryIndex ? 'active' : ''}`;
        btn.innerText = cat.name;
        btn.onclick = () => switchCategory(index);
        wrapper.appendChild(btn);
    });
}

function switchCategory(newIndex) {
    saveCurrentCategoryState();
    currentCategoryIndex = newIndex;
    renderTabs();
    renderTable();
}

function renderTable() {
    const activeCat = categories[currentCategoryIndex];
    if (!activeCat) return;

    if (document.getElementById('category-title')) {
        document.getElementById('category-title').innerText = activeCat.name;
    }

    if (document.getElementById('lock-icon-rec')) {
        document.getElementById('lock-icon-rec').innerText = isReceivedUnlocked ? "🔓" : "🔒";
    }
    if (document.getElementById('lock-icon-del')) {
        document.getElementById('lock-icon-del').innerText = isDeliveredUnlocked ? "🔓" : "🔒";
    }

    const tbody = document.getElementById('inventory-body');
    if (!tbody) return;
    tbody.innerHTML = "";

    const savedState = localStorage.getItem(`salma_cat_${currentCategoryIndex}`);
    const rowData = savedState ? JSON.parse(savedState) : null;
    const todayStr = new Date().toISOString().split('T')[0];

    activeCat.items.forEach((item, rIdx) => {
        const savedRow = rowData ? rowData[rIdx] : null;

        const dateVal = savedRow ? savedRow.rowDate : todayStr;
        const recVal = savedRow ? savedRow.received : 0;
        const newVal = savedRow ? savedRow.newStock : 0;
        const delVal = savedRow ? savedRow.delivered : 0;
        const totalVal = savedRow ? savedRow.total : 0;
        const noteVal = savedRow ? savedRow.note : "";

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item}</strong></td>
            <td><input type="date" class="row-date" value="${dateVal}"></td>
            <td><input type="number" class="row-rec ${isReceivedUnlocked ? '' : 'locked-input'}" value="${recVal}" ${isReceivedUnlocked ? '' : 'readonly'}></td>
            <td><input type="number" class="row-new" value="${newVal}" oninput="calculateRowTotal(this)"></td>
            <td><input type="number" class="row-del ${isDeliveredUnlocked ? '' : 'locked-input'}" value="${delVal}" ${isDeliveredUnlocked ? '' : 'readonly'} oninput="calculateRowTotal(this)"></td>
            <td><input type="number" class="row-total total-field" value="${totalVal}" readonly></td>
            <td><input type="text" class="row-note" value="${noteVal}" placeholder="..."></td>
        `;
        tbody.appendChild(tr);
    });
}

function calculateRowTotal(inputElem) {
    const row = inputElem.closest('tr');
    const rec = parseFloat(row.querySelector('.row-rec').value) || 0;
    const newVal = parseFloat(row.querySelector('.row-new').value) || 0;
    const del = parseFloat(row.querySelector('.row-del').value) || 0;

    const total = (rec + newVal) - del;
    row.querySelector('.row-total').value = total;
}

function saveCurrentCategoryState() {
    const tbody = document.getElementById('inventory-body');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    if (!rows || rows.length === 0) return;

    const catData = [];
    rows.forEach((tr, rIdx) => {
        catData.push({
            item: categories[currentCategoryIndex].items[rIdx],
            rowDate: tr.querySelector('.row-date').value,
            received: tr.querySelector('.row-rec').value,
            newStock: tr.querySelector('.row-new').value,
            delivered: tr.querySelector('.row-del').value,
            total: tr.querySelector('.row-total').value,
            note: tr.querySelector('.row-note').value
        });
    });

    localStorage.setItem(`salma_cat_${currentCategoryIndex}`, JSON.stringify(catData));
}

function requestColumnUnlock(type) {
    saveCurrentCategoryState();

    if (type === 'received') {
        if (isReceivedUnlocked) {
            isReceivedUnlocked = false;
            renderTable();
            return;
        }
    } else if (type === 'delivered') {
        if (isDeliveredUnlocked) {
            isDeliveredUnlocked = false;
            renderTable();
            return;
        }
    }

    pendingUnlockTarget = type;
    if (document.getElementById('modal-title')) {
        document.getElementById('modal-title').innerText = type === 'received' ? 
            (currentLang === 'ar' ? "فتح عمود (مستلم)" : "Unlock Received Column") : 
            (currentLang === 'ar' ? "فتح عمود (مسلم)" : "Unlock Delivered Column");
    }
    document.getElementById('modal-password-input').value = "";
    document.getElementById('password-modal').style.display = "flex";
}

function closePasswordModal() {
    document.getElementById('password-modal').style.display = "none";
    pendingUnlockTarget = null;
}

function verifyPasswordAction() {
    const entered = document.getElementById('modal-password-input').value;
    const passes = getPasswords();

    if (pendingUnlockTarget === 'received' && entered === passes.received) {
        isReceivedUnlocked = true;
        closePasswordModal();
        renderTable();
    } else if (pendingUnlockTarget === 'delivered' && entered === passes.delivered) {
        isDeliveredUnlocked = true;
        closePasswordModal();
        renderTable();
    } else {
        alert(i18n[currentLang].wrongPass);
    }
}

// Save & Sync to HQ
async function handleSaveAndExport() {
    saveCurrentCategoryState();
    const branch = getBranchInfo();
    const t = i18n[currentLang];

    if (!confirm(`${currentLang === 'ar' ? 'هل أنت متأكد من إرسال التقرير لـ' : 'Confirm submitting report for'} (${branch.name})?`)) return;

    const todayStr = new Date().toISOString().split('T')[0];

    let fullReport = [];
    categories.forEach((cat, catIdx) => {
        const saved = localStorage.getItem(`salma_cat_${catIdx}`);
        const itemsData = saved ? JSON.parse(saved) : cat.items.map(item => ({
            item: item, rowDate: todayStr, received: 0, newStock: 0, delivered: 0, total: 0, note: ""
        }));

        fullReport.push({
            categoryName: cat.name,
            items: itemsData
        });
    });

    let reportHtml = `
        <div style="font-family: system-ui, sans-serif; direction: ${currentLang === 'ar' ? 'rtl' : 'ltr'}; padding: 25px; background: #ffffff; color: #0f172a;">
            <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;">
                <h1 style="color: #1e293b; margin-bottom: 5px; font-size: 24px;">🏢 ${branch.name} - Inventory Report</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 5px;">📅 Date: ${todayStr} | 📞 Phone: ${branch.phone}</p>
            </div>
    `;

    fullReport.forEach(cat => {
        reportHtml += `<h3 style="color: #2563eb; margin-top: 25px; margin-bottom: 10px; border-right: 4px solid #2563eb; padding-right: 10px; font-size: 18px;">📋 ${cat.categoryName}</h3>`;
        reportHtml += `
            <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center; border-color: #cbd5e1; margin-bottom: 15px; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f1f5f9; color: #334155;">
                        <th>${t.thItem}</th>
                        <th>${t.thDate}</th>
                        <th>${t.thRec}</th>
                        <th>${t.thNew}</th>
                        <th>${t.thDel}</th>
                        <th>${t.thTotal}</th>
                        <th>${t.thNote}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cat.items.forEach(row => {
            reportHtml += `
                <tr>
                    <td><strong>${row.item}</strong></td>
                    <td>${row.rowDate || todayStr}</td>
                    <td>${row.received || 0}</td>
                    <td>${row.newStock || 0}</td>
                    <td>${row.delivered || 0}</td>
                    <td style="font-weight: bold; color: #2563eb; background: #eff6ff;">${row.total || 0}</td>
                    <td>${row.note || '-'}</td>
                </tr>
            `;
        });

        reportHtml += `</tbody></table>`;
    });

    reportHtml += `</div>`;

    const base64Data = btoa(unescape(encodeURIComponent(reportHtml)));
    const dataUri = `data:text/html;charset=utf-8;base64,${base64Data}`;
    const fileName = `Report_${branch.name}_${todayStr}.html`;

    const newReport = {
        action: "add",
        id: Date.now(),
        branchName: branch.name,
        phone: branch.phone,
        date: todayStr,
        fileName: fileName,
        pdfDataUri: dataUri
    };

    try {
        await fetch(CLOUD_API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(newReport)
        });

        categories.forEach((_, catIdx) => localStorage.removeItem(`salma_cat_${catIdx}`));
        isReceivedUnlocked = false;
        isDeliveredUnlocked = false;
        renderTable();

        alert(t.reportSuccess);
    } catch (error) {
        console.error(error);
        alert(t.reportError);
    }
}

// Admin Panel Functions
function openAdminModal() {
    document.getElementById('admin-master-input').value = "";
    document.getElementById('admin-login-view').style.display = "block";
    document.getElementById('admin-settings-view').style.display = "none";
    document.getElementById('admin-modal').style.display = "flex";
}

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = "none";
}

function verifyAdminLogin() {
    const entered = document.getElementById('admin-master-input').value;
    const passes = getPasswords();

    if (entered === passes.admin) {
        document.getElementById('admin-login-view').style.display = "none";
        document.getElementById('admin-settings-view').style.display = "block";
        populateAdminPanelFields();
    } else {
        alert(i18n[currentLang].wrongPass);
    }
}

function populateAdminPanelFields() {
    const branch = getBranchInfo();
    const passes = getPasswords();

    document.getElementById('branch-name-edit').value = branch.name;
    document.getElementById('branch-phone-edit').value = branch.phone;

    document.getElementById('pass-received-edit').value = passes.received;
    document.getElementById('pass-delivered-edit').value = passes.delivered;
    document.getElementById('pass-admin-edit').value = passes.admin;

    populateCategorySelects();
}

function populateCategorySelects() {
    const addCatSelect = document.getElementById('add-item-category-select');
    const delCatSelectItem = document.getElementById('del-item-category-select');
    const delCatSelect = document.getElementById('del-category-select');

    if (addCatSelect) addCatSelect.innerHTML = "";
    if (delCatSelectItem) delCatSelectItem.innerHTML = "";
    if (delCatSelect) delCatSelect.innerHTML = "";

    categories.forEach((cat, idx) => {
        if (addCatSelect) addCatSelect.add(new Option(cat.name, idx));
        if (delCatSelectItem) delCatSelectItem.add(new Option(cat.name, idx));
        if (delCatSelect) delCatSelect.add(new Option(cat.name, idx));
    });

    populateItemsForDeletion();
}

function populateItemsForDeletion() {
    const catIdx = document.getElementById('del-item-category-select').value;
    const delItemSelect = document.getElementById('del-item-name-select');
    if (!delItemSelect) return;
    delItemSelect.innerHTML = "";

    if (categories[catIdx] && categories[catIdx].items) {
        categories[catIdx].items.forEach((item, idx) => {
            delItemSelect.add(new Option(item, idx));
        });
    }
}

function addNewItem() {
    const catIdx = document.getElementById('add-item-category-select').value;
    const itemName = document.getElementById('new-item-name-input').value.trim();

    if (!itemName) return alert(currentLang === 'ar' ? "يرجى إدخال اسم الصنف!" : "Item name required");

    categories[catIdx].items.push(itemName);
    saveCategories(categories);
    document.getElementById('new-item-name-input').value = "";
    populateCategorySelects();
    renderTable();
    alert(currentLang === 'ar' ? "تمت إضافة الصنف بنجاح!" : "Item added successfully!");
}

function deleteSelectedItem() {
    const catIdx = document.getElementById('del-item-category-select').value;
    const itemIdx = document.getElementById('del-item-name-select').value;

    if (itemIdx === null || itemIdx === "") return alert(currentLang === 'ar' ? "لم يتم تحديد صنف!" : "No item selected");

    categories[catIdx].items.splice(itemIdx, 1);
    saveCategories(categories);
    populateCategorySelects();
    renderTable();
    alert(currentLang === 'ar' ? "تم حذف الصنف بنجاح!" : "Item deleted successfully!");
}

function addNewCategory() {
    const catNameInput = document.getElementById('new-category-name-input');
    if (!catNameInput) return;
    const catName = catNameInput.value.trim();

    if (!catName) return alert(currentLang === 'ar' ? "يرجى إدخال اسم القائمة الجديدة!" : "Please enter a category name!");

    categories.push({ name: catName, items: [] });
    saveCategories(categories);
    catNameInput.value = "";
    populateCategorySelects();
    renderTabs();
    alert(currentLang === 'ar' ? "تمت إضافة القائمة الجديدة بنجاح!" : "Category added successfully!");
}

function deleteSelectedCategory() {
    const delCatSelect = document.getElementById('del-category-select');
    if (!delCatSelect) return;
    const catIdx = delCatSelect.value;

    if (categories.length <= 1) {
        return alert(currentLang === 'ar' ? "لا يمكن حذف جميع القوائم! يجب إبقاء قائمة واحدة على الأقل." : "Cannot delete all categories! Keep at least one.");
    }

    if (confirm(currentLang === 'ar' ? `هل أنت متأكد من حذف قائمة (${categories[catIdx].name}) بالكامل؟` : `Delete category (${categories[catIdx].name})?`)) {
        categories.splice(catIdx, 1);
        saveCategories(categories);
        currentCategoryIndex = 0;
        populateCategorySelects();
        renderTabs();
        renderTable();
        alert(currentLang === 'ar' ? "تم حذف القائمة بنجاح!" : "Category deleted successfully!");
    }
}

function saveAdminSettings() {
    const name = document.getElementById('branch-name-edit').value.trim();
    const phone = document.getElementById('branch-phone-edit').value.trim();

    const passRec = document.getElementById('pass-received-edit').value.trim();
    const passDel = document.getElementById('pass-delivered-edit').value.trim();
    const passAdm = document.getElementById('pass-admin-edit').value.trim();

    if (!name || !passRec || !passDel || !passAdm) {
        return alert(currentLang === 'ar' ? "جميع الحقول مطلوبة!" : "All fields are required!");
    }

    localStorage.setItem('salma_branch_name', name);
    localStorage.setItem('salma_branch_phone', phone);

    localStorage.setItem('salma_pass_received', passRec);
    localStorage.setItem('salma_pass_delivered', passDel);
    localStorage.setItem('salma_pass_admin', passAdm);

    applyLanguage();
    alert(currentLang === 'ar' ? "تم حفظ الإعدادات بنجاح!" : "Settings saved successfully!");
    closeAdminModal();
}
