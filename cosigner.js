const CLOUD_API_URL = 'https://labelle-co-server.vercel.app/cloud';
const COSIGNER_INFO_URL = 'https://labelle-co-server.vercel.app/cosigner-info';

let allitems = {};
let cosignerEmail = localStorage.getItem('cosignerEmail');
let cosignerName = '';
let barcodeQueue = [];
let expandedGroups = {};

fetchConsignorInfo();
loadInventory();
showSection('inventory');

async function fetchConsignorInfo() {
  if (!cosignerEmail) return;
  showLoading();
  try {
    const res = await fetch(`${COSIGNER_INFO_URL}?email=${encodeURIComponent(cosignerEmail)}`);
    if (res.ok) {
      const data = await res.json();
      cosignerName = data.name;
      document.getElementById('cosignerName').textContent = data.name;
    } else {
      document.getElementById('cosignerName').textContent = '';
      showLoadingError("Could not fetch cosigner info.");
    }

    hideLoading();
  } catch (err) {
    showLoadingError("Network error: " + err.message);
  }
}

// Load inventory and filter for this cosigner
function loadInventory() {
  showLoading();
  fetch(CLOUD_API_URL)
    .then(res => res.json())
    .then(data => {
      allitems = data;
      renderTable();
      updatePageDropdown();
      hideLoading();
    })
    .catch(err => showLoadingError(err.message))
}

function showSection(section) {
  document.getElementById('inventory-section').style.display = (section === 'inventory') ? '' : 'none';
  document.getElementById('analytics-section').style.display = (section === 'analytics') ? '' : 'none';
  document.getElementById('password-change-section').style.display = (section === 'password-change') ? '' : 'none';
  if (section === 'analytics') {
    loadCosignerAnalytics();
  }
}

async function renderTable() {
  const res = await fetch('https://labelle-co-server.vercel.app/cosigners');
  const cosigners = await res.json();
  const me = cosigners.find(c => c.email === cosignerEmail);

  const container = document.getElementById('inventory');
  const optionsCard = document.getElementById('options-card');
  const oldBtn = document.getElementById('print-barcode-btn');
  if (oldBtn) oldBtn.remove();
  let totalConsignorProfit = 0;
  let printBtnHtml = '';
  if (barcodeQueue.length > 0) {
    printBtnHtml = `<button onclick="printBarcodeQueue()" style="margin-bottom:12px;">Print Barcodes (${barcodeQueue.length})</button>`;
  }
  let html = `<table>
    <tr>
      <th>Category</th>
      <th>Item</th>
      <th>Image</th>
      <th>Price</th>
      <th>Specials</th>
      <th>Stock</th>
      <th>On Hold</th>
      <th>Bought</th>
      <th>Profit Split</th>
      <th>Consignor Profit</th>
      <th>Barcode ID</th>
      <th>Actions</th>
    </tr>`;

  // Gather all categories for dropdown
  let allCategories = new Set();
  for (const categories of Object.values(allitems)) {
    for (const category of Object.keys(categories)) {
      allCategories.add(category);
    }
  }

  for (const [page, categories] of Object.entries(allitems)) {
    for (const [category, items] of Object.entries(categories)) {
      // Only show items for this cosigner
      // Group items by generalName
      const groups = {};
      for (const [itemKey, details] of Object.entries(items)) {
        if (details.cosignerEmail !== cosignerEmail) continue;
        const groupKey = details.generalName || null;
        if (groupKey) {
          if (!groups[groupKey]) groups[groupKey] = [];
          groups[groupKey].push({ itemKey, details });
        } else {
          groups[itemKey] = [{ itemKey, details }];
        }
      }

      for (const [groupName, groupItems] of Object.entries(groups)) {
        const isGrouped = groupItems.length > 1 || groupItems[0].details.generalName;
        const groupId = `${category}-${groupName}`.replace(/\s+/g, '_');

        if (groupItems[0].details.generalName) {
          // Title row for grouped items
          html += `<tr style="background:#eaf6fb;">
            <td colspan="12" style="font-weight:bold;">
              <input type="text" value="${groupName}" style="font-weight:bold;font-size:16px;width:220px;" onchange="editGeneralName('${page}','${category}','${groupName}', this.value)">
              <button id="toggleBtn-${groupId}" onclick="toggleGroupRows('${groupId}')">
                ${expandedGroups[groupId] ? 'Hide Subcategories' : 'Show Subcategories'}
              </button>
            </td>
          </tr>`;
          // Subcategory rows (hidden by default)
          groupItems.forEach(({ itemKey, details }, idx) => {
            const profitSplit = details.profitSplit || "50/50";
            const price = Number(details.price) || 0;
            const cosignerPercent = Number(profitSplit.split('/')[1]) || 50;
            const cosignerProfit = ((price * cosignerPercent) / 100).toFixed(2);
            totalConsignorProfit += Number(cosignerProfit);
            const hasStockProp = Object.prototype.hasOwnProperty.call(details, 'stock');
            const hasOnHoldProp = Object.prototype.hasOwnProperty.call(details, 'onhold');
            const isChecked = barcodeQueue.some(q => q.page === page && q.category === category && q.item === itemKey);

            html += `<tr class="group-row-${groupId}" style="background:#f0f8ff;display:${expandedGroups[groupId] ? '' : 'none'};">
              <td>
                <input type="text" value="${details.subcategory || ''}" onchange="editSubcategory('${page}','${category}','${itemKey}', this.value)">
              </td>
              <td>
                <select onchange="changeCategory('${page}','${category}','${itemKey}', this.value)">
                  ${Array.from(allCategories).map(cat =>
                    `<option value="${cat}" ${cat === category ? 'selected' : ''}>${cat}</option>`
                  ).join('')}
                  <option value="__new__">-- New Category --</option>
                </select>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="file" accept="image/*" onchange="uploadImageAndUpdate('${page}','${category}','${itemKey}', this)">
                  ${details.img ? `<img src="${details.img}" alt="preview" style="max-width:60px; max-height:60px;">` : ''}
                </div>
              </td>
              <td><input type="number" value="${details.price}" onchange="editItem('${page}','${category}','${itemKey}', 'price', this.value)"></td>
              <td>
                <textarea rows="2" cols="18" onchange="editItem('${page}','${category}','${itemKey}', 'specials', this.value)">${details.specials ? details.specials.join('\n') : ''}</textarea>
              </td>
              <td>
                <input type="number" value="${details.stock ?? ''}" 
                  onchange="editItem('${page}','${category}','${itemKey}', 'stock', this.value)" 
                  ${hasOnHoldProp ? 'disabled' : ''}>
              </td>
              <td>
                ${
                  typeof details.itemsOnHold === 'number'
                    ? `<input type="number" min="0" value="${details.itemsOnHold}" 
                        onchange="editItem('${page}','${category}','${itemKey}','itemsOnHold', this.value)">`
                    : `<input type="checkbox" ${details.onhold ? 'checked' : ''} 
                        onchange="editItem('${page}','${category}','${itemKey}','onhold', this.checked)" 
                        ${hasStockProp ? 'disabled' : ''}>`
                }
              </td>
              <td>
                ${
                  typeof details.itemsBought === 'number'
                    ? `<input type="number" min="0" max="${details.stock ?? ''}" value="${details.itemsBought}" 
                          onchange="editItem('${page}','${category}','${itemKey}','itemsBought', this.value)">`
                    : `<input type="checkbox" ${details.bought ? 'checked' : ''} 
                          onchange="editItem('${page}','${category}','${itemKey}','bought', this.checked)" 
                          ${hasStockProp ? 'disabled' : ''}>`
                }
              </td>
              <td>${details.profitSplit || "50/50"}</td>
              <td>${cosignerProfit}</td>
              <td>${details.barcode}</td>
              <td>
                <button onclick="removeItem('${page}','${category}','${itemKey}')">Remove</button>
                <label style="display:inline-flex;align-items:center;">
                  <input type="checkbox" onchange="toggleBarcodeQueue('${page}','${category}','${itemKey}')" ${isChecked ? 'checked' : ''}>
                  Barcode
                </label>
              </td>
            </tr>`;
          });
        } else {
          // Normal item row (not grouped)
          const { itemKey, details } = groupItems[0];
          const profitSplit = details.profitSplit || "50/50";
          const price = Number(details.price) || 0;
          const cosignerPercent = Number(profitSplit.split('/')[1]) || 50;
          const cosignerProfit = ((price * cosignerPercent) / 100).toFixed(2);
          totalConsignorProfit += Number(cosignerProfit);
          const hasStockProp = Object.prototype.hasOwnProperty.call(details, 'stock');
          const hasOnHoldProp = Object.prototype.hasOwnProperty.call(details, 'onhold');
          const isChecked = barcodeQueue.some(q => q.page === page && q.category === category && q.item === itemKey);

          html += `<tr style="background:#ffffff;">
            <td>
              <select onchange="changeCategory('${page}','${category}','${itemKey}', this.value)">
                ${Array.from(allCategories).map(cat =>
                  `<option value="${cat}" ${cat === category ? 'selected' : ''}>${cat}</option>`
                ).join('')}
                <option value="__new__">-- New Category --</option>
              </select>
            </td>
            <td><input type="text" value="${itemKey}" onchange="editItem('${page}','${category}','${itemKey}', 'item', this.value)"></td>
            <td>
              <div style="display: flex; align-items: center; gap: 6px;">
                <input type="file" accept="image/*" onchange="uploadImageAndUpdate('${page}','${category}','${itemKey}', this)">
                ${details.img ? `<img src="${details.img}" alt="preview" style="max-width:60px; max-height:60px;">` : ''}
              </div>
            </td>
            <td><input type="number" value="${details.price}" onchange="editItem('${page}','${category}','${itemKey}', 'price', this.value)"></td>
            <td>
              <textarea rows="2" cols="18" onchange="editItem('${page}','${category}','${itemKey}', 'specials', this.value)">${details.specials ? details.specials.join('\n') : ''}</textarea>
            </td>
            <td>
              <input type="number" value="${details.stock ?? ''}" 
                onchange="editItem('${page}','${category}','${itemKey}', 'stock', this.value)" 
                ${hasOnHoldProp ? 'disabled' : ''}>
            </td>
            <td>
              ${
                typeof details.itemsOnHold === 'number'
                  ? `<input type="number" min="0" value="${details.itemsOnHold}" 
                      onchange="editItem('${page}','${category}','${itemKey}','itemsOnHold', this.value)">`
                  : `<input type="checkbox" ${details.onhold ? 'checked' : ''} 
                      onchange="editItem('${page}','${category}','${itemKey}','onhold', this.checked)" 
                      ${hasStockProp ? 'disabled' : ''}>`
              }
            </td>
            <td>
              ${
                typeof details.itemsBought === 'number'
                  ? `<input type="number" min="0" max="${details.stock ?? ''}" value="${details.itemsBought}" 
                        onchange="editItem('${page}','${category}','${itemKey}','itemsBought', this.value)">`
                  : `<input type="checkbox" ${details.bought ? 'checked' : ''} 
                        onchange="editItem('${page}','${category}','${itemKey}','bought', this.checked)" 
                        ${hasStockProp ? 'disabled' : ''}>`
              }
            </td>
            <td>${details.profitSplit || "50/50"}</td>
            <td>${cosignerProfit}</td>
            <td>${details.barcode}</td>
            <td>
              <button onclick="removeItem('${page}','${category}','${itemKey}')">Remove</button>
              <label style="display:inline-flex;align-items:center;">
                <input type="checkbox" onchange="toggleBarcodeQueue('${page}','${category}','${itemKey}')" ${isChecked ? 'checked' : ''}>
                Barcode
              </label>
            </td>
          </tr>`;
        }
      }
    }
  }

  html += '</table>';
  const owed = Number(me?.owedProfit) || 0;
  if (barcodeQueue.length > 0) {
    const printBtn = document.createElement('button');
    printBtn.id = 'print-barcode-btn';
    printBtn.textContent = `Print Barcodes (${barcodeQueue.length})`;
    printBtn.onclick = printBarcodeQueue;
    optionsCard.appendChild(printBtn);
  }
  container.innerHTML = `
    <strong>Total Consignor Value: $${totalConsignorProfit.toFixed(2)}</strong>
    <br>
    <strong>Unpaid (Owed by Admin): $${owed.toFixed(2)}</strong>
    <br>
    ${html}
  `;
}

// --- Helper functions for grouping ---
window.toggleGroupRows = function(groupId) {
  expandedGroups[groupId] = !expandedGroups[groupId];
  renderTable();
};

window.editGeneralName = function(page, category, oldGeneralName, newGeneralName) {
  if (!newGeneralName.trim()) return;
  const items = allitems[page][category];
  Object.entries(items).forEach(([key, details]) => {
    if (details.generalName === oldGeneralName) {
      const subcat = details.subcategory;
      const newKey = newGeneralName + ' (' + subcat + ')';
      details.generalName = newGeneralName;
      items[newKey] = details;
      delete items[key];
    }
  });
  renderTable();
};

window.editSubcategory = function(page, category, itemKey, value) {
  const items = allitems[page][category];
  const details = items[itemKey];
  if (!details || !details.generalName) return;
  const newKey = details.generalName + ' (' + value + ')';
  details.subcategory = value;
  items[newKey] = details;
  delete items[itemKey];
  renderTable();
};

window.removeItem = function(page, category, item) {
  if (allitems[page] && allitems[page][category] && allitems[page][category][item]) {
    delete allitems[page][category][item];
    // Save to backend
    showLoading();
    fetch(CLOUD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allitems)
    })
    .then(res => res.text())
    .then(msg => {
      loadInventory();
      hideLoading();
    })
    .catch(err => showLoadingError(err.message))
  }
};

window.editItem = function(page, category, item, field, value) {
  let itemObj = allitems[page][category][item];
  if (field === 'item') {
    allitems[page][category][value] = itemObj;
    delete allitems[page][category][item];
  } else if (field === 'specials') {
    itemObj.specials = value
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  } else if (field === 'onhold' || field === 'bought') {
    // Checkbox: convert to boolean
    itemObj[field] = value === true || value === "true" || value === "on" || value === "checked";
  } else if (
    field === 'price' ||
    field === 'stock' ||
    field === 'itemsOnHold' ||
    field === 'itemsBought'
  ) {
    // Number fields
    itemObj[field] = Number(value);
  } else {
    itemObj[field] = value;
  }
  renderTable();
};

window.changeCategory = function(page, oldCategory, item, newCategory) {
  if (newCategory === "__new__") {
    const name = prompt("Enter new category name:");
    if (!name) {
      renderTable();
      return;
    }
    newCategory = name.trim();
    if (!newCategory) {
      renderTable();
      return;
    }
  }
  if (!allitems[page][newCategory]) allitems[page][newCategory] = {};
  allitems[page][newCategory][item] = allitems[page][oldCategory][item];
  delete allitems[page][oldCategory][item];
  // Remove old category if empty
  if (Object.keys(allitems[page][oldCategory]).length === 0) {
    delete allitems[page][oldCategory];
  }
  renderTable();
};

window.saveAll = function() {
  showLoading();
  fetch(CLOUD_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allitems)
  })
  .then(res => res.text())
  .then(hideLoading)
  .catch(err => showLoadingError(err.message));
};

function logoutToHub() {
      // Clear cosigner info from localStorage
      localStorage.removeItem('cosignerEmail');
      localStorage.removeItem('cosignerName');
      window.location.href = "adminhub.html";
}

function openAddItemOverlay() {
  resetSubcategories();
  const overlay = document.getElementById('add-item-overlay');
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.transform = 'translateY(0)';
  }, 10);
  document.body.style.overflow = 'hidden';
  updatePageDropdown();
}

function closeAddItemOverlay() {
  resetSubcategories();
  const overlay = document.getElementById('add-item-overlay');
  overlay.style.transform = 'translateY(-100vh)';
  setTimeout(() => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('addItemForm').reset();
    document.getElementById('addItemMsg').textContent = '';
  }, 500);
}

window.openAddItemOverlay = openAddItemOverlay;
window.closeAddItemOverlay = closeAddItemOverlay;

window.submitNewItem = async function(event) {
  event.preventDefault();
  showLoading();
  const page = document.getElementById('newItemPageDropdown').value;
  let category = document.getElementById('newItemCategoryDropdown').value;
  if (category === '__new__') {
    category = document.getElementById('newItemCategoryInput').value.trim();
  }
  const item = document.getElementById('newItemName').value.trim();
  //const img = document.getElementById('newItemImg').value.trim();
  const type = document.getElementById('newItemType').value;
  const price = Number(document.getElementById('newItemPrice').value);
  const specials = document.getElementById('newItemSpecials').value
    .split('\n').map(s => s.trim()).filter(s => s.length > 0);

  if (!page || !category || !item) {
    document.getElementById('addItemMsg').textContent = "Please fill out all required fields.";
    return false;
  }

  if (!allitems[page]) allitems[page] = {};
  if (!allitems[page][category]) allitems[page][category] = {};

  const file = document.getElementById('imageUpload')?.files[0];
  let imageURL

  if (file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('https://labelle-co-server.vercel.app/upload-image', {
      method: 'POST',
      body: formData
    });
    const { id } = await res.json();
    imageURL = `https://lh3.googleusercontent.com/d/${id}=s800`;
  }

  if (subcategories.length > 0) {
    subcategories.forEach(subcategory => {
      const barcode = Date.now().toString() + Math.floor(Math.random() * 1000000).toString();
      let newItem = {
        img: imageURL || '',
        price: price || 0,
        single: (type === 'onhold'),
        specials: specials,
        cosignerName: cosignerName,
        cosignerEmail: cosignerEmail,
        profitSplit: "50/50",
        barcode: barcode,
        subcategory: subcategory,
        generalName: item
      };
      if (type === 'stock') {
        newItem.stock = 1;
        newItem.itemsOnHold = 0;
        newItem.itemsBought = 0;
      } else if (type === 'onhold') {
        newItem.onhold = false;
        newItem.bought = false;
      }
      allitems[page][category][item + ' (' + subcategory + ')'] = newItem;

      fetch('https://labelle-co-server.vercel.app/cosigner-add-item-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: item + ' (' + subcategory + ')',
          cosignerName: cosignerName,
          cosignerEmail: cosignerEmail
        })
      });
    });
  } else {
    const barcode = Date.now().toString();
    let newItem = {
      img: imageURL || '',
      price: price || 0,
      single: (type === 'onhold'),
      specials: specials,
      cosignerName: cosignerName,
      cosignerEmail: cosignerEmail,
      profitSplit: "50/50",
      barcode: barcode
      // no subcategory field
    };
    if (type === 'stock') {
      newItem.stock = 1;
      newItem.itemsOnHold = 0;
      newItem.itemsBought = 0;
    } else if (type === 'onhold') {
      newItem.onhold = false;
      newItem.bought = false;
    }
    allitems[page][category][item] = newItem;

    fetch('https://labelle-co-server.vercel.app/cosigner-add-item-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: item,
        cosignerName: cosignerName,
        cosignerEmail: cosignerEmail
      })
    });
  }
  fetch(CLOUD_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allitems)
  })
  .then(res => res.text())
  .then(msg => {
    closeAddItemOverlay();
    loadInventory();
    hideLoading();
  })
  .catch(err => showLoadingError(err.message));

  return false;
};

function updatePageDropdown() {
  const pageDropdown = document.getElementById('newItemPageDropdown');
  pageDropdown.innerHTML = '';
  Object.keys(allitems).forEach(page => {
    pageDropdown.innerHTML += `<option value="${page}">${page}</option>`;
  });
  // Optionally, select the first page by default
  if (Object.keys(allitems).length > 0) {
    pageDropdown.value = Object.keys(allitems)[0];
  }
  updateCategoryDropdown();
}

function updateCategoryDropdown() {
  const page = document.getElementById('newItemPageDropdown').value;
  const dropdown = document.getElementById('newItemCategoryDropdown');
  dropdown.innerHTML = '<option value="">-- Select Category --</option>';
  if (allitems[page]) {
    Object.keys(allitems[page]).forEach(cat => {
      dropdown.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  }
  dropdown.innerHTML += '<option value="__new__">-- New Category --</option>';
  document.getElementById('newItemCategoryInput').style.display = 'none';
}

window.updatePageDropdown = updatePageDropdown;
window.updateCategoryDropdown = updateCategoryDropdown;

function onCategoryDropdownChange() {
  const dropdown = document.getElementById('newItemCategoryDropdown');
  const input = document.getElementById('newItemCategoryInput');
  if (dropdown.value === '__new__') {
    input.style.display = '';
    input.required = true;
  } else {
    input.style.display = 'none';
    input.required = false;
  }
}

function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  document.getElementById('loading-text').style.display = '';
  document.getElementById('loading-error').style.display = 'none';
  document.getElementById('loading-error-close').style.display = 'none';
  overlay.style.display = 'flex';
  setTimeout(() => overlay.classList.add('active'), 10);
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  setTimeout(() => overlay.style.display = 'none', 300);
}

function showLoadingError(message) {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  document.getElementById('loading-text').style.display = 'none';
  const errorDiv = document.getElementById('loading-error');
  errorDiv.textContent = message || "An error occurred.";
  errorDiv.style.display = '';
  document.getElementById('loading-error-close').style.display = '';
  overlay.style.display = 'flex';
  overlay.classList.add('active');
  alert(message);
}

function hideLoadingError() {
  hideLoading();
}

window.toggleBarcodeQueue = function(page, category, item) {
  const idx = barcodeQueue.findIndex(q => q.page === page && q.category === category && q.item === item);
  if (idx === -1) {
    barcodeQueue.push({ page, category, item });
  } else {
    barcodeQueue.splice(idx, 1);
  }
  renderTable();
};

window.printBarcodeQueue = function() {
  if (barcodeQueue.length === 0) return;
  let printWindow = window.open('', '', 'width=600,height=800');
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Barcodes</title>
        <style>
          body { font-family: sans-serif; margin:0; padding:0; }
          .barcode-block {
            width: 2in;
            height: 1in;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            page-break-after: always;
            margin: 0;
            padding: 0;
          }
          .barcode-svg {
            width: 1.8in;
            height: 0.7in;
            margin-top: 0.1in;
          }
          .barcode-value {
            font-size: 14px;
            font-family: monospace;
            margin-top: 2px;
            text-align: center;
            max-width: 1.8in;
            overflow: hidden;
            white-space: nowrap;
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        ${barcodeQueue.map(q => {
          const details = allitems[q.page][q.category][q.item];
          const barcode = details.barcode || '';
          const itemName = q.item;
          const price = details.price || '';
          return `
            <div class="barcode-block">
              <svg class="barcode-svg" data-barcode="${barcode}"></svg>
              <div class="barcode-value">${itemName} - $${price}</div>
            </div>
          `;
        }).join('')}
        <script>
          window.onload = function() {
            document.querySelectorAll('.barcode-svg').forEach(svg => {
              const code = svg.getAttribute('data-barcode');
              if (window.JsBarcode && code) {
                JsBarcode(svg, code, {
                  format: "CODE128",
                  lineColor: "#000",
                  width: 2,
                  height: 50, // Adjust for best fit
                });
              }
            });
            setTimeout(() => window.print(), 500);
          }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  barcodeQueue = [];
  setTimeout(renderTable, 1000);
};

window.uploadImageAndUpdate = async function(page, category, item, inputElement) {
  const file = inputElement.files[0];
  showLoading();

  if (!file) {
    hideLoading();
    return;
  }

  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('https://labelle-co-server.vercel.app/upload-image', {
      method: 'POST',
      body: formData
    });

    const { id } = await res.json();
    const imageURL = `https://lh3.googleusercontent.com/d/${id}=s800`;

    console.log(allitems[page][category][item].img)
    allitems[page][category][item].img = imageURL;
    console.log(allitems[page][category][item].img)
    renderTable();
  } catch (err) {
    showLoadingError("Image upload failed: " + err.message);
  }

  hideLoading();
};

let subcategories = [];

window.addSubcategory = function() {
  const input = document.getElementById('newSubcategoryInput');
  const name = input.value.trim();
  if (name && !subcategories.includes(name)) {
    subcategories.push(name);
    input.value = '';
    renderSubcategoryList();
  }
};

window.removeSubcategory = function(name) {
  subcategories = subcategories.filter(sub => sub !== name);
  renderSubcategoryList();
};

function renderSubcategoryList() {
  const listDiv = document.getElementById('subcategoryList');
  listDiv.innerHTML = subcategories.map(sub =>
    `<span style="display:inline-block;background:#eee;padding:4px 8px;margin:2px;border-radius:4px;">
      ${sub}
      <button type="button" onclick="removeSubcategory('${sub}')"
        style="margin-left:4px;background:#c00;color:#fff;border:none;border-radius:2px;cursor:pointer;">x</button>
    </span>`
  ).join('');
}

function resetSubcategories() {
  subcategories = [];
  renderSubcategoryList();
}

async function changeCosignerPassword() {
  const email = cosignerEmail; // Set this from login/session
  const oldPassword = document.getElementById('cosignerOldPassword').value;
  const newPassword = document.getElementById('cosignerNewPassword').value;
  const msg = document.getElementById('cosignerPasswordChangeMsg');
  msg.textContent = "Processing...";
  const res = await fetch('https://labelle-co-server.vercel.app/cosigner-change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, oldPassword, newPassword })
  });
  msg.textContent = await res.text();
}

async function loadCosignerAnalytics() {
  const res = await fetch(`https://labelle-co-server.vercel.app/cosigner-analytics?email=${encodeURIComponent(cosignerEmail)}`);
  const { totalProfit, itemsSold } = await res.json();
  document.getElementById('cosignerAnalyticsSummary').innerHTML = `<strong>Total Profit:</strong> $${totalProfit.toFixed(2)}`;
  let html = `<table><tr><th>Item Name</th><th>Quantity</th><th>Price</th><th>Date</th></tr>`;
  for (const item of itemsSold) {
    html += `<tr>
      <td>${item.itemName}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>${item.date ? new Date(item.date).toLocaleString() : '-'}</td>
    </tr>`;
  }
  html += '</table>';
  document.getElementById('cosignerAnalyticsItemsSold').innerHTML = html;
}