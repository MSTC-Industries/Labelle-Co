const CLOUD_API_URL = 'https://labelle-co-server.vercel.app/cloud';
const COSIGNER_INFO_URL = 'https://labelle-co-server.vercel.app/cosigner-info';

let allitems = {};
let cosignerEmail = localStorage.getItem('cosignerEmail');
let cosignerName = '';

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
              <button onclick="showBarcodeModal('${details.barcode}', '${item}', '${details.price}')">Barcode</button>
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

window.showBarcodeModal = function(barcode, itemName, price) {
  if (!barcode) {
    alert("No barcode assigned to this item.");
    return;
  }
  document.getElementById('barcode-modal').style.display = 'flex';
  JsBarcode("#barcode-svg", barcode, {
    format: "CODE128",
    lineColor: "#000",
    width: 2,
    height: 100,
    displayValue: true
  });
  // Show item name and price instead of barcode value
  document.getElementById('barcode-value').textContent = `${itemName} - $${price}`;
  // Store for printing
  document.getElementById('barcode-value').setAttribute('data-barcode', barcode);
  document.getElementById('barcode-value').setAttribute('data-item', itemName);
  document.getElementById('barcode-value').setAttribute('data-price', price);
};

window.closeBarcodeModal = function() {
  document.getElementById('barcode-modal').style.display = 'none';
  document.getElementById('barcode-svg').innerHTML = '';
  document.getElementById('barcode-value').textContent = '';
};

window.printBarcode = function() {
  const svg = document.getElementById('barcode-svg').outerHTML;
  const valueDiv = document.getElementById('barcode-value');
  const itemName = valueDiv.getAttribute('data-item') || '';
  const price = valueDiv.getAttribute('data-price') || '';
  const barcode = valueDiv.getAttribute('data-barcode') || '';
  const printWindow = window.open('', '', 'width=400,height=300');
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Barcode</title>
        <style>
          body { display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; }
          .barcode-value { margin-top: 12px; font-size: 18px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div>${svg}</div>
        <div class="barcode-value">${itemName} - $${price}</div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          if (window.JsBarcode && document.querySelector('svg')) {
            JsBarcode(document.querySelector('svg'), "${barcode}", {
              format: "CODE128",
              lineColor: "#000",
              width: 2,
              height: 100,
              displayValue: true
            });
          }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
};

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