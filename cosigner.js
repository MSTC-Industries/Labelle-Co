const CLOUD_API_URL = 'https://labelle-co-server.vercel.app/cloud';
const COSIGNER_INFO_URL = 'https://labelle-co-server.vercel.app/cosigner-info';

let allitems = {};
let cosignerEmail = localStorage.getItem('cosignerEmail');
let cosignerName = '';
let barcodeQueue = [];

fetchCosignerInfo();
loadInventory();

async function fetchCosignerInfo() {
  if (!cosignerEmail) return;
  showLoading();
  try {
    const res = await fetch(`${COSIGNER_INFO_URL}?email=${encodeURIComponent(cosignerEmail)}`);
    if (res.ok) {
      const data = await res.json();
      cosignerName = data.name;
      document.getElementById('cosignerEmail').textContent = data.email;
      document.getElementById('cosignerName').textContent = data.name;
    } else {
      document.getElementById('cosignerEmail').textContent = cosignerEmail;
      document.getElementById('cosignerName').textContent = '';
      showLoadingError("Could not fetch cosigner info.");
    }
  } catch (err) {
    showLoadingError("Network error: " + err.message);
  } finally {
    hideLoading();
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
    })
    .catch(err => showLoadingError(err.message))
    .finally(hideLoading);
}

function renderTable() {
  const container = document.getElementById('inventory');
  
  // Show/hide Print Barcodes button
  let printBtn = document.getElementById('printBarcodesBtn');
  if (barcodeQueue.length > 0) {
    if (!printBtn) {
      printBtn = document.createElement('button');
      printBtn.id = 'printBarcodesBtn';
      printBtn.textContent = `Print Barcodes (${barcodeQueue.length})`;
      printBtn.className = 'btn';
      printBtn.style.marginBottom = '10px';
      printBtn.onclick = printBarcodeQueue;
      container.parentNode.insertBefore(printBtn, container);
    } else {
      printBtn.style.display = '';
      printBtn.textContent = `Print Barcodes (${barcodeQueue.length})`;
    }
  } else if (printBtn) {
    printBtn.style.display = 'none';
  }
  
  let html = '<table><tr><th>Category</th><th>Item</th><th>Image</th><th>Price</th><th>Specials</th><th>Stock</th><th>On Hold</th><th>Bought</th><th>Profit Split</th><th>Cosigner Profit</th><th>Barcode ID</th><th>Actions</th></tr>';
  // Gather all categories for dropdown
  let allCategories = new Set();
  for (const categories of Object.values(allitems)) {
    for (const category of Object.keys(categories)) {
      allCategories.add(category);
    }
  }
  let totalCosignerProfit = 0;
  for (const [page, categories] of Object.entries(allitems)) {
    for (const [category, items] of Object.entries(categories)) {
      for (const [item, details] of Object.entries(items)) {
        if (details.cosignerEmail === cosignerEmail) {
          const hasStockProp = Object.prototype.hasOwnProperty.call(details, 'stock');
          const hasOnHoldProp = Object.prototype.hasOwnProperty.call(details, 'onhold');
          const isChecked = barcodeQueue.some(q => q.page === currentpage && q.category === category && q.item === item);

          const profitSplit = details.profitSplit || "50/50";
          const price = Number(details.price) || 0;
          const cosignerPercent = Number(profitSplit.split('/')[1]) || 50;
          const cosignerProfit = ((price * cosignerPercent) / 100).toFixed(2);
          totalCosignerProfit += cosignerProfit;

          html += `<tr>
            <td>
              <select onchange="changeCategory('${page}','${category}','${item}', this.value)">
                ${Array.from(allCategories).map(cat =>
                  `<option value="${cat}" ${cat === category ? 'selected' : ''}>${cat}</option>`
                ).join('')}
                <option value="__new__">-- New Category --</option>
              </select>
            </td>
            <td><input type="text" value="${item}" onchange="editItem('${page}','${category}','${item}','item', this.value)"></td>
            <td>
              <input type="text" value="${details.img || ''}" onchange="editItem('${page}','${category}','${item}','img', this.value)" placeholder="Image URL">
              ${details.img ? `<br><img src="${details.img}" alt="preview" style="max-width:60px;max-height:60px;">` : ''}
            </td>
            <td><input type="number" value="${details.price}" onchange="editItem('${page}','${category}','${item}','price', this.value)"></td>
            <td>
              <textarea rows="2" cols="18" onchange="editItem('${page}','${category}','${item}','specials', this.value)">${details.specials ? details.specials.join('\n') : ''}</textarea>
            </td>
            <td>
              <input type="number" value="${details.stock ?? ''}" 
                onchange="editItem('${page}','${category}','${item}','stock', this.value)" 
                ${hasOnHoldProp ? 'disabled' : ''}>
            </td>
            <td>
              ${
                typeof details.itemsOnHold === 'number'
                  ? `<input type="number" min="0" value="${details.itemsOnHold}" 
                      onchange="editItem('${page}','${category}','${item}','itemsOnHold', this.value)">`
                  : `<input type="checkbox" ${details.onhold ? 'checked' : ''} 
                      onchange="editItem('${page}','${category}','${item}','onhold', this.checked)" 
                      ${hasStockProp ? 'disabled' : ''}>`
              }
            </td>
            <td>
              ${
                typeof details.itemsBought === 'number'
                  ? `<input type="number" min="0" max="${details.stock ?? ''}" value="${details.itemsBought}" 
                        onchange="editItem('${page}','${category}','${item}','itemsBought', this.value)">`
                  : `<input type="checkbox" ${details.bought ? 'checked' : ''} 
                        onchange="editItem('${page}','${category}','${item}','bought', this.checked)" 
                        ${hasStockProp ? 'disabled' : ''}>`
              }
            </td>
            <td>${details.profitSplit || "50/50"}</td>
            <td>${cosignerProfit}</td>
            <td>${details.barcode}</td>
            <td>
              <button onclick="removeItem('${page}','${category}','${item}')">Remove</button>
              <label style="display:inline-flex;align-items:center;">
                <input type="checkbox" onchange="toggleBarcodeQueue('${currentpage}','${category}','${item}')" ${isChecked ? 'checked' : ''}>
                Barcode
              </label>
            </td>
          </tr>`;
        }
      }
    }
  }
  html += '</table>';
  container.innerHTML = html;

  const totalDiv = document.createElement('div');
  totalDiv.style.marginTop = '16px';
  totalDiv.innerHTML = `<strong>Total Cosigner Profit: $${totalCosignerProfit.toFixed(2)}</strong>`;
  container.appendChild(totalDiv);
}

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
    })
    .catch(err => showLoadingError(err.message))
    .finally(hideLoading);
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
  .catch(err => showLoadingError(err.message))
  .finally(hideLoading);
};

function logoutToHub() {
      // Clear cosigner info from localStorage
      localStorage.removeItem('cosignerEmail');
      localStorage.removeItem('cosignerName');
      window.location.href = "adminhub.html";
}

function openAddItemOverlay() {
  const overlay = document.getElementById('add-item-overlay');
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.transform = 'translateY(0)';
  }, 10);
  document.body.style.overflow = 'hidden';
  updatePageDropdown();
}

function closeAddItemOverlay() {
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

window.submitNewItem = function(event) {
  event.preventDefault();
  const page = document.getElementById('newItemPageDropdown').value;
  let category = document.getElementById('newItemCategoryDropdown').value;
  if (category === '__new__') {
    category = document.getElementById('newItemCategoryInput').value.trim();
  }
  const item = document.getElementById('newItemName').value.trim();
  const img = document.getElementById('newItemImg').value.trim();
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

  let newItem = {
    img: img || '',
    price: price || 0,
    single: false,
    specials: specials,
    cosignerName: cosignerName,
    cosignerEmail: cosignerEmail,
    profitSplit: "50/50",
    barcode: Date.now().toString()
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

  showLoading();
  fetch(CLOUD_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allitems)
  })
  .then(res => res.text())
  .then(msg => {
    closeAddItemOverlay();
    loadInventory();
    setTimeout(() => alert('Item added!'), 100);
  })
  .catch(err => showLoadingError(err.message))
  .finally(hideLoading);

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
          body { font-family: sans-serif; }
          .barcode-block { margin-bottom: 32px; text-align: center; }
          .barcode-value { margin-top: 12px; font-size: 18px; font-family: monospace; }
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
                  height: 100,
                  displayValue: true
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
  // Optionally clear the queue after printing
  barcodeQueue = [];
  setTimeout(renderTable, 1000);
};