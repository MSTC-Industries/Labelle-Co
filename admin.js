const CLOUD_API_URL = 'https://labelle-co-server.vercel.app/cloud';

let allitems = {};

let currentpage = 'main.html';
let barcodeQueue = [];

window.onload = function() {
  showPasswordOverlay();
  showSection('inventory');
};

function showSection(section) {
  document.getElementById('order-section').style.display = (section === 'orders') ? '' : 'none';
  document.getElementById('inventory-section').style.display = (section === 'inventory') ? '' : 'none';
  document.getElementById('cosigners-section').style.display = (section === 'cosigners') ? '' : 'none';
  if (section === 'cosigners') renderCosigners();
}

function showPasswordOverlay() {
  document.getElementById('admin-password-overlay').style.transform = 'translateY(0)';
  document.getElementById('admin-password-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

window.submitAdminPassword = async function() {
  const password = document.getElementById('adminPasswordInput').value;
  const msg = document.getElementById('adminPasswordMsg');
  if (!password) {
    msg.textContent = "Please enter a password.";
    return;
  }
  msg.textContent = "Checking...";
  const res = await fetch('https://labelle-co-server.vercel.app/check-admin-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (res.ok) {
    // Slide up overlay
    const overlay = document.getElementById('admin-password-overlay');
    overlay.style.transform = 'translateY(-100vh)';
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 500);
    // Now load data
    populatePageSelector()
    loadInventory();
    loadOrders();
  } else {
    msg.textContent = "Incorrect password. Try again.";
  }
};

// Load inventory
function loadInventory() {
  showLoading();
  fetch(CLOUD_API_URL)
    .then(res => res.json())
    .then(data => {
      allitems = data;
      renderTable();
      hideLoading();
    })
    .catch(err => showLoadingError(err.message))
}


// Populate the page selector dropdown
function populatePageSelector() {
  const pageSelect = document.getElementById('pageSelect');
  pageSelect.innerHTML = '';
  Object.keys(allitems).forEach(page => {
    const option = document.createElement('option');
    option.value = page;
    option.textContent = page;
    if (page === currentpage) option.selected = true;
    pageSelect.appendChild(option);
  });
}

// Switch between pages
window.switchPage = function(page) {
  currentpage = page;
  renderTable();
};

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
      document.getElementById('options-card').appendChild(printBtn);
    } else {
      printBtn.style.display = '';
      printBtn.textContent = `Print Barcodes (${barcodeQueue.length})`;
    }
  } else if (printBtn) {
    printBtn.style.display = 'none';
  }
  
  if (!allitems[currentpage]) {
    container.innerHTML = '<p>No data for this page.</p>';
    return;
  }
  let totalAdminProfit = 0;
  let html = '<table><tr><th>Category</th><th>Item</th><th>Image</th><th>Price</th><th>Specials</th><th>Stock</th><th>On Hold</th><th>Bought</th><th>Profit Split</th><th>Admin Profit</th><th>Cosigner Name</th><th>Cosigner Email</th><th>Barcode ID</th><th>Actions</th></tr>';
  for (const [category, items] of Object.entries(allitems[currentpage])) {
    for (const [item, details] of Object.entries(items)) {
      const hasStockProp = Object.prototype.hasOwnProperty.call(details, 'stock');
      const hasOnHoldProp = Object.prototype.hasOwnProperty.call(details, 'onhold');
      const isChecked = barcodeQueue.some(q => q.page === currentpage && q.category === category && q.item === item);

      const profitSplit = details.profitSplit || "50/50";
      const price = Number(details.price) || 0;
      const adminPercent = Number(profitSplit.split('/')[0]) || 50;
      const adminProfit = ((price * adminPercent) / 100).toFixed(2);
      totalAdminProfit += Number(adminProfit);

      html += `<tr>
        <td>
        <select onchange="changeCategory('${category}','${item}', this.value)">
            ${Object.keys(allitems[currentpage]).map(cat =>
            `<option value="${cat}" ${cat === category ? 'selected' : ''}>${cat}</option>`
            ).join('')}
            <option value="__new__">-- New Category --</option>
        </select>
        </td>
        <td><input type="text" value="${item}" onchange="editItem('${category}','${item}', 'item', this.value)"></td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="file" accept="image/*" onchange="uploadImageAndUpdate('${category}','${item}', this)">
            ${details.img ? `<img src="${details.img}" alt="preview" style="max-width:60px; max-height:60px;">` : ''}
          </div>
        </td>
        <td><input type="number" value="${details.price}" onchange="editItem('${category}','${item}', 'price', this.value)"></td>
        <td>
            <textarea rows="2" cols="18" onchange="editItem('${category}','${item}', 'specials', this.value)">${details.specials ? details.specials.join('\n') : ''}</textarea>
        </td>
        <td>
          <input type="number" value="${details.stock ?? ''}" 
            onchange="editItem('${category}','${item}', 'stock', this.value)" 
            ${hasOnHoldProp ? 'disabled' : ''}>
        </td>
        <td>
          ${
              typeof details.itemsOnHold === 'number'
                ? `<input type="number" min="0" value="${details.itemsOnHold}" 
                    onchange="editItem('${category}','${item}','itemsOnHold', this.value)">`
                : `<input type="checkbox" ${details.onhold ? 'checked' : ''} 
                    onchange="editItem('${category}','${item}','onhold', this.checked)" 
                    ${hasStockProp ? 'disabled' : ''}>`
            }
        </td>
        <td>
          ${
            typeof details.itemsBought === 'number'
              ? `<input type="number" min="0" max="${details.stock ?? ''}" value="${details.itemsBought}" 
                    onchange="editItem('${category}','${item}','itemsBought', this.value)">`
              : `<input type="checkbox" ${details.bought ? 'checked' : ''} 
                    onchange="editItem('${category}','${item}','bought', this.checked)" 
                    ${hasStockProp ? 'disabled' : ''}>`
          }
        </td>
        <td>
          <select onchange="editItem('${category}','${item}','profitSplit', this.value)" class="profit-split-select">
            ${["90/10","80/20","70/30","60/40","50/50","40/60","30/70","20/80","10/90"].map(opt =>
              `<option value="${opt}" ${details.profitSplit === opt ? 'selected' : ''}>${opt}</option>`
            ).join('')}
          </select>
        </td>
        <td>${adminProfit}</td>
        <td>${details.cosignerName || ''}</td>
        <td>${details.cosignerEmail || ''}</td>
        <td>${details.barcode}</td>
        <td>
          <button onclick="removeItem('${category}','${item}')">Remove</button>
          <label style="display:inline-flex;align-items:center;">
            <input type="checkbox" onchange="toggleBarcodeQueue('${currentpage}','${category}','${item}')" ${isChecked ? 'checked' : ''}>
            Barcode
          </label>
        </td>
      </tr>`;
    }
  }

  html += '</table>';
  container.innerHTML = `<strong>Total Admin Profit: $${totalAdminProfit.toFixed(2)}</strong>` + html;
}

window.editItem = function(category, item, field, value) {
  const itemObj = allitems[currentpage][category][item];
  if (field === 'item') {
    // Rename item
    allitems[currentpage][category][value] = itemObj;
    delete allitems[currentpage][category][item];
  } else if (field === 'specials') {
    itemObj.specials = value
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  } else if (field === 'onhold' || field === 'bought') {
    // Checkbox: convert to boolean
    itemObj[field] = value === true || value === "true" || value === "on" || value === "checked";
  } else if (field === 'price' || field === 'stock' || field === 'itemsOnHold' || field === 'itemsBought') {
    // Number fields
    itemObj[field] = Number(value);
  } else {
    itemObj[field] = value;
  }
  renderTable();
};

window.removeItem = function(category, item) {
  delete allitems[currentpage][category][item];
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

window.changeCategory = function(oldCategory, item, newCategory) {
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
  if (!allitems[currentpage][newCategory]) allitems[currentpage][newCategory] = {};
  allitems[currentpage][newCategory][item] = allitems[currentpage][oldCategory][item];
  delete allitems[currentpage][oldCategory][item];
  // Remove old category if empty
  if (Object.keys(allitems[currentpage][oldCategory]).length === 0) {
    delete allitems[currentpage][oldCategory];
  }
  renderTable();
};

function loadOrders() {
  showLoading();
  fetch('https://labelle-co-server.vercel.app/orders')
    .then(res => res.json())
    .then(orders => {
      const container = document.getElementById('orders');
      if (!orders.length) {
        container.innerHTML = '<p>No orders yet.</p>';
        return;
      }
      let html = '<table><tr><th>Name</th><th>Phone</th><th>Email</th><th>Items</th><th>Admin Profit</th><th>Cosigner Profits</th><th>Status</th><th>Actions</th></tr>';
      for (const order of orders) {
        // Calculate profits
        let adminProfit = 0;
        let cosignerProfits = {}; // { email: { name, profit } }
        let itemsHtml = '';
        for (const [itemName, qty] of Object.entries(order.items)) {
          let found = false;
          for (const page in allitems) {
            for (const category in allitems[page]) {
              if (allitems[page][category][itemName]) {
                const itemObj = allitems[page][category][itemName];
                const price = Number(itemObj.price) || 0;
                const profitSplit = (itemObj.profitSplit || "50/50").split('/');
                const adminPercent = Number(profitSplit[0]) || 50;
                const cosignerPercent = Number(profitSplit[1]) || 50;
                const itemAdminProfit = (price * adminPercent / 100) * qty;
                const itemCosignerProfit = (price * cosignerPercent / 100) * qty;
                adminProfit += itemAdminProfit;

                // Cosigner info
                const cosignerEmail = itemObj.cosignerEmail || 'unknown';
                const cosignerName = itemObj.cosignerName || 'unknown';
                if (!cosignerProfits[cosignerEmail]) {
                  cosignerProfits[cosignerEmail] = { name: cosignerName, profit: 0 };
                }
                cosignerProfits[cosignerEmail].profit += itemCosignerProfit;

                itemsHtml += `${itemName} (${qty})<br>
                  <small>Split: ${profitSplit[0]}/${profitSplit[1]}, Price: $${price}, 
                  Admin: $${(itemAdminProfit).toFixed(2)}, 
                  Cosigner: $${(itemCosignerProfit).toFixed(2)}</small><br>`;
                found = true;
                break;
              }
            }
            if (found) break;
          }
          if (!found) {
            itemsHtml += `${itemName} (${qty}) <small style="color:red;">(not found in inventory)</small><br>`;
          }
        }

        // Cosigner profits summary
        let cosignerProfitsHtml = '';
        for (const [email, { name, profit }] of Object.entries(cosignerProfits)) {
          cosignerProfitsHtml += `${name} (${email}): $${profit.toFixed(2)}<br>`;
        }

        html += `<tr>
          <td>${order.name}</td>
          <td>${order.phone}</td>
          <td>${order.email}</td>
          <td>${itemsHtml}</td>
          <td>$${adminProfit.toFixed(2)}</td>
          <td>${cosignerProfitsHtml || '-'}</td>
          <td>
            ${order.orderType === 'buy' ? 'Buying' : order.orderType === 'hold' ? 'On Hold' : order.status}
          </td>
          <td>
            <button onclick="acceptOrder(${order.id})">Accept</button>
            <button onclick="cancelOrder(${order.id})">Cancel</button>
          </td>
        </tr>`;
      }
      html += '</table>';
      container.innerHTML = html;
    })
    .then(hideLoading)
    .catch(err => showLoadingError(err.message));

  loadInventory();
}

async function acceptOrder(orderId) {
  showLoading();
  try {
    // Load orders, inventory, and cosigners
    const [ordersRes, inventoryRes, cosignerRes] = await Promise.all([
      fetch('https://labelle-co-server.vercel.app/orders'),
      fetch(CLOUD_API_URL),
      fetch('https://labelle-co-server.vercel.app/cosigners')
    ]);
    const orders = await ordersRes.json();
    const inventory = await inventoryRes.json();
    const cosigners = await cosignerRes.json();

    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found.");
    const order = orders[orderIndex];

    const emailToProfit = {};

    // STEP 1: Calculate profits BEFORE inventory mutation
    for (const [itemName, qty] of Object.entries(order.items)) {
      for (const page in inventory) {
        for (const category in inventory[page]) {
          const item = inventory[page][category][itemName];
          if (item) {
            const price = Number(item.price);
            const [_, cosignerPercentStr] = item.profitSplit?.split('/') ?? ['50', '50'];
            const cosignerPercent = Number(cosignerPercentStr);
            const profit = price * cosignerPercent / 100 * qty;
            const email = item.cosignerEmail;
            emailToProfit[email] = (emailToProfit[email] || 0) + profit;
          }
        }
      }
    }

    // STEP 2: Mutate inventory using your original logic
    for (const [itemName, qty] of Object.entries(order.items)) {
      let found = false;
      for (const page in inventory) {
        for (const category in inventory[page]) {
          if (inventory[page][category][itemName]) {
            let item = inventory[page][category][itemName];
            if ('stock' in item) {
              item.stock = Math.max(0, (item.stock || 0) - qty);
              if (order.orderType === 'hold' && 'itemsOnHold' in item) {
                item.itemsOnHold = (item.itemsOnHold || 0) + qty;
              } else if (order.orderType === 'buy' && 'itemsBought' in item) {
                item.itemsBought = (item.itemsBought || 0) + qty;
              }
            } else {
              delete inventory[page][category][itemName];
            }
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }

    // STEP 3: Apply profits to cosigners
    cosigners.forEach(c => {
      if (emailToProfit[c.email]) {
        c.owedProfit = (c.owedProfit || 0) + emailToProfit[c.email];
      }
    });

    // STEP 4: Remove order and persist changes
    orders.splice(orderIndex, 1);

    await Promise.all([
      fetch('https://labelle-co-server.vercel.app/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orders)
      }),
      fetch('https://labelle-co-server.vercel.app/cosigners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cosigners)
      }),
      fetch(CLOUD_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventory)
      })
    ]);

    loadOrders();
    hideLoading();
  } catch (err) {
    showLoadingError(err.message);
  }
}

async function cancelOrder(orderId) {
  showLoading();
  try {
    // Load orders and inventory
    let orders = await (await fetch('https://labelle-co-server.vercel.app/orders')).json();
    let orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found.");
    let order = orders[orderIndex];

    // Load inventory
    let inventory = await (await fetch(CLOUD_API_URL)).json();

    if (order.orderType === 'buy') {
      // Restore bought/itemsBought status and stock
      for (const [itemName, qty] of Object.entries(order.items)) {
        let found = false;
        for (const page in inventory) {
          for (const category in inventory[page]) {
            if (inventory[page][category][itemName]) {
              let item = inventory[page][category][itemName];
              if ('stock' in item) {
                item.stock = (item.stock || 0) + qty;
                if ('itemsBought' in item) {
                  item.itemsBought = Math.max(0, (item.itemsBought || 0) - qty);
                }
              } else if ('bought' in item) {
                item.bought = false;
              }
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }
    } else if (order.orderType === 'hold') {
      // Restore onhold/itemsOnHold status and stock
      for (const [itemName, qty] of Object.entries(order.items)) {
        let found = false;
        for (const page in inventory) {
          for (const category in inventory[page]) {
            if (inventory[page][category][itemName]) {
              let item = inventory[page][category][itemName];
              if ('stock' in item) {
                item.stock = (item.stock || 0) + qty;
                if ('itemsOnHold' in item) {
                  item.itemsOnHold = Math.max(0, (item.itemsOnHold || 0) - qty);
                }
              } else if ('onhold' in item) {
                item.onhold = false;
              }
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }
    }

    // Remove the order
    orders.splice(orderIndex, 1);

    // Save updated orders and inventory
    await fetch('https://labelle-co-server.vercel.app/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders)
    });
    await fetch(CLOUD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inventory)
    });

    loadOrders();
    hideLoading();
  } catch (err) {
    showLoadingError(err.message);
  }
}

function logoutToHub() {
      window.location.href = "adminhub.html";
}

function openAddItemOverlay() {
  const overlay = document.getElementById('add-item-overlay');
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.transform = 'translateY(0)';
  }, 10);
  document.body.style.overflow = 'hidden';
  updateAdminPageDropdown();
  populateCosignerDropdown();
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

function updateAdminPageDropdown() {
  const pageDropdown = document.getElementById('newItemPageDropdown');
  pageDropdown.innerHTML = '';
  Object.keys(allitems).forEach(page => {
    pageDropdown.innerHTML += `<option value="${page}">${page}</option>`;
  });
  // Set to current page if possible
  pageDropdown.value = currentpage;
  updateAdminCategoryDropdown();
}

function updateAdminCategoryDropdown() {
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

function onAdminCategoryDropdownChange() {
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

window.updateAdminPageDropdown = updateAdminPageDropdown;
window.updateAdminCategoryDropdown = updateAdminCategoryDropdown;
window.onAdminCategoryDropdownChange = onAdminCategoryDropdownChange;

window.submitNewAdminItem = async function(event) {
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
  const profitSplit = document.getElementById('newItemProfitSplit').value;
  const cosignerData = JSON.parse(document.getElementById('cosignerDropdown').value || '{}');
  const cosignerName = cosignerData.name || '';
  const cosignerEmail = cosignerData.email || '';
  const barcode = Date.now().toString();

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

  let newItem = {
    img: imageURL || '',
    price: price || 0,
    single: (type === 'onhold'),
    specials: specials,
    cosignerName: cosignerName,
    cosignerEmail: cosignerEmail,
    profitSplit: profitSplit,
    barcode: barcode
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

  console.log(allitems)

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
  console.log(message);
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

async function renderCosigners() {
  const cosignersDiv = document.getElementById('cosigners-list');
  cosignersDiv.innerHTML = 'Loading...';
  try {
    const res = await fetch('https://labelle-co-server.vercel.app/cosigners');
    const cosigners = await res.json();
    if (!Array.isArray(cosigners) || cosigners.length === 0) {
      cosignersDiv.innerHTML = '<p>No cosigners found.</p>';
      return;
    }

    let html = `<table>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Owed Amount</th>
        <th>Pay Back</th>
      </tr>`;

    for (const c of cosigners) {
      const profit = Number(c.owedProfit) || 0;
      html += `<tr>
        <td>${c.name || ''}</td>
        <td>${c.email || ''}</td>
        <td>$${profit.toFixed(2)}</td>
        <td>
          <input type="number" 
                id="payInput-${c.email}" 
                min="0" 
                max="${profit}" 
                placeholder="Amount" 
                style="width:80px;"
                ${profit <= 0 ? 'disabled' : ''}>
          <button onclick="submitCosignerPayment('${c.email}')" ${profit <= 0 ? 'disabled' : ''}>
            Submit
          </button>
        </td>
      </tr>`;
    }

    html += '</table>';
    cosignersDiv.innerHTML = html;
  } catch (err) {
    cosignersDiv.innerHTML = `<p style="color:red;">Failed to load cosigners: ${err.message}</p>`;
  }
}

window.submitCosignerPayment = async function(email) {
  const input = document.getElementById(`payInput-${email}`);
  const value = Number(input.value);

  if (isNaN(value) || value <= 0) {
    alert("Enter a valid amount.");
    return;
  }

  showLoading(); // 🔄 Show loading before processing

  try {
    const res = await fetch('https://labelle-co-server.vercel.app/cosigners');
    const cosigners = await res.json();

    const c = cosigners.find(c => c.email === email);
    if (!c) throw new Error("Cosigner not found.");

    const currentOwed = Number(c.owedProfit) || 0;
    if (value > currentOwed) {
      alert(`You can't pay more than $${currentOwed.toFixed(2)}.`);
      return;
    }

    c.owedProfit = Math.max(0, currentOwed - value);

    await fetch('https://labelle-co-server.vercel.app/cosigners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cosigners)
    });

    renderCosigners(); // Refresh the cosigner table
    hideLoading();
  } catch (err) {
    alert("Failed to process payment: " + err.message);
  }
};

async function populateCosignerDropdown() {
  const dropdown = document.getElementById('cosignerDropdown');
  dropdown.innerHTML = '<option value="">-- Select Cosigner --</option>';
  try {
    const res = await fetch('https://labelle-co-server.vercel.app/cosigners');
    const cosigners = await res.json();
    cosigners.forEach(c => {
      const option = document.createElement('option');
      option.value = JSON.stringify({ name: c.name, email: c.email }); // store both
      option.textContent = `${c.name} (${c.email})`;
      dropdown.appendChild(option);
    });
  } catch (err) {
    console.error('Failed to fetch cosigners:', err);
    dropdown.innerHTML = '<option value="">Error loading cosigners</option>';
  }
}

window.uploadImageAndUpdate = async function(category, item, inputElement) {
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

    allitems[currentpage][category][item].img = imageURL;
    renderTable();
  } catch (err) {
    showLoadingError("Image upload failed: " + err.message);
  }

  hideLoading();
};

