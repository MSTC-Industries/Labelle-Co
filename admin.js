const CLOUD_API_URL = 'https://labelle-co-server.vercel.app/cloud';

let allitems = {};
let expandedGroups = {};

let currentpage = 'main.html';
let barcodeQueue = [];

window.onload = function() {
  // Check for admin password in localStorage
  const adminPasswordOk = localStorage.getItem('adminPasswordOk');
  if (adminPasswordOk !== 'true' || localStorage.getItem('hubPasswordOk') !== 'true') {
    window.location.href = "adminhub.html";
    return;
  }
  showSection('inventory');
  populatePageSelector();
  loadInventory();
  loadOrders();
};

function showSection(section) {
  document.getElementById('order-section').style.display = (section === 'orders') ? '' : 'none';
  document.getElementById('inventory-section').style.display = (section === 'inventory') ? '' : 'none';
  document.getElementById('cosigners-section').style.display = (section === 'cosigners') ? '' : 'none';
  document.getElementById('analytics-section').style.display = (section === 'analytics') ? '' : 'none';
  document.getElementById('email-section').style.display = (section === 'email') ? '' : 'none';
  document.getElementById('admin-password-change-section').style.display = (section === 'admin-password-change') ? '' : 'none';
  if (section === 'cosigners') renderConsignors();
  if (section === 'analytics') {
    loadAnalytics();
  }
}

// Load inventory
function loadInventory() {
  showLoading();
  fetch(CLOUD_API_URL)
    .then(res => res.json())
    .then(data => {
      allitems = data;
      populateInventoryOwnerDropdown();
      renderTable();
      updatePrintBarcodeButton();
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
  const optionsCard = document.getElementById('options-card');
  const oldBtn = document.getElementById('print-barcode-btn');
  if (oldBtn) oldBtn.remove();
  if (!allitems[currentpage]) {
    container.innerHTML = '<p>No data for this page.</p>';
    return;
  }
  let printBtnHtml = '';
  if (barcodeQueue.length > 0) {
    printBtnHtml = `<button onclick="printBarcodeQueue()" style="margin-bottom:12px;">Print Barcodes (${barcodeQueue.length})</button>`;
  }
  let totalAdminProfit = 0;
  let html = `<table><tr>
    <th>Category</th>
    <th>Item</th>
    <th>Image</th>
    <th>Price</th>
    <th>Specials</th>
    <th>Stock</th>
    <th>On Hold</th>
    <th>Bought</th>
    <th>Admin Profit</th>
    <th>Consignor Name</th>
    <th>Consignor Email</th>
    <th>Barcode ID</th>
    <th>Actions</th>
  </tr>`;

  // Get selected owner filter
  const ownerSelect = document.getElementById('inventoryOwnerSelect');
  const selectedOwner = ownerSelect ? ownerSelect.value : 'all';

  for (const [category, items] of Object.entries(allitems[currentpage])) {
    // Group items by generalName
    const groups = {};
    for (const [itemKey, details] of Object.entries(items)) {
      // Owner filter logic
      let isOwnerMatch = false;
      if (selectedOwner === 'all') {
        isOwnerMatch = true;
      } else if (selectedOwner === 'admin') {
        isOwnerMatch = !details.cosignerEmail && !details.cosignerName;
      } else {
        isOwnerMatch = details.cosignerEmail === selectedOwner;
      }
      if (!isOwnerMatch) continue;

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
          <td colspan="14" style="font-weight:bold;">
            <input type="text" value="${groupName}" style="font-weight:bold;font-size:16px;width:220px;" onchange="editGeneralName('${category}','${groupName}', this.value)">
            <button id="toggleBtn-${groupId}" onclick="toggleGroupRows('${groupId}')">
              ${expandedGroups[groupId] ? 'Hide Subcategories' : 'Show Subcategories'}
            </button>
          </td>
        </tr>`;
        // Subcategory rows (hidden by default)
        groupItems.forEach(({ itemKey, details }, idx) => {
          const profitSplit = details.profitSplit || "50/50";
          const price = Number(details.price) || 0;
          const adminPercent = Number(profitSplit.split('/')[0]) || 50;
          const adminProfit = ((price * adminPercent) / 100).toFixed(2);
          totalAdminProfit += Number(adminProfit);
          const hasStockProp = Object.prototype.hasOwnProperty.call(details, 'stock');
          const hasOnHoldProp = Object.prototype.hasOwnProperty.call(details, 'onhold');
          const isChecked = barcodeQueue.some(q => q.page === currentpage && q.category === category && q.item === itemKey);

          html += `<tr class="group-row-${groupId}" style="background:#f0f8ff;display:${expandedGroups[groupId] ? '' : 'none'};">
            <td>
              <input type="text" value="${details.subcategory || ''}" onchange="editSubcategory('${category}','${itemKey}', this.value)">
            </td>
            <td>
              <select onchange="changeCategory('${category}','${itemKey}', this.value)">
                ${Object.keys(allitems[currentpage]).map(cat =>
                  `<option value="${cat}" ${cat === category ? 'selected' : ''}>${cat}</option>`
                ).join('')}
                <option value="__new__">-- New Category --</option>
              </select>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 6px;">
                <input type="file" accept="image/*" onchange="uploadImageAndUpdate('${category}','${itemKey}', this)">
                ${details.img ? `<img src="${details.img}" alt="preview" style="max-width:60px; max-height:60px;">` : ''}
              </div>
            </td>
            <td><input type="number" value="${details.price}" onchange="editItem('${category}','${itemKey}', 'price', this.value)"></td>
            <td>
              <textarea rows="2" cols="18" onchange="editItem('${category}','${itemKey}', 'specials', this.value)">${details.specials ? details.specials.join('\n') : ''}</textarea>
            </td>
            <td>
              <input type="number" value="${details.stock ?? ''}" 
                onchange="editItem('${category}','${itemKey}', 'stock', this.value)" 
                ${hasOnHoldProp ? 'disabled' : ''}>
            </td>
            <td>
              ${
                typeof details.itemsOnHold === 'number'
                  ? `<input type="number" min="0" value="${details.itemsOnHold}" 
                      onchange="editItem('${category}','${itemKey}','itemsOnHold', this.value)">`
                  : `<input type="checkbox" ${details.onhold ? 'checked' : ''} 
                      onchange="editItem('${category}','${itemKey}','onhold', this.checked)" 
                      ${hasStockProp ? 'disabled' : ''}>`
              }
            </td>
            <td>
              ${
                typeof details.itemsBought === 'number'
                  ? `<input type="number" min="0" max="${details.stock ?? ''}" value="${details.itemsBought}" 
                        onchange="editItem('${category}','${itemKey}','itemsBought', this.value)">`
                  : `<input type="checkbox" ${details.bought ? 'checked' : ''} 
                        onchange="editItem('${category}','${itemKey}','bought', this.checked)" 
                        ${hasStockProp ? 'disabled' : ''}>`
              }
            </td>
            <td>${adminProfit}</td>
            <td>${details.cosignerName || ''}</td>
            <td>${details.cosignerEmail || ''}</td>
            <td>${details.barcode}</td>
            <td>
              <button onclick="removeItem('${category}','${itemKey}')">Remove</button>
              <label style="display:inline-flex;align-items:center;">
                <input type="checkbox" onchange="toggleBarcodeQueue('${currentpage}','${category}','${itemKey}')" ${isChecked ? 'checked' : ''}>
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
        const adminPercent = Number(profitSplit.split('/')[0]) || 50;
        const adminProfit = ((price * adminPercent) / 100).toFixed(2);
        totalAdminProfit += Number(adminProfit);
        const hasStockProp = Object.prototype.hasOwnProperty.call(details, 'stock');
        const hasOnHoldProp = Object.prototype.hasOwnProperty.call(details, 'onhold');
        const isChecked = barcodeQueue.some(q => q.page === currentpage && q.category === category && q.item === itemKey);

        html += `<tr style="background:#ffffff;">
          <td>
            <select onchange="changeCategory('${category}','${itemKey}', this.value)">
              ${Object.keys(allitems[currentpage]).map(cat =>
                `<option value="${cat}" ${cat === category ? 'selected' : ''}>${cat}</option>`
              ).join('')}
              <option value="__new__">-- New Category --</option>
            </select>
          </td>
          <td><input type="text" value="${itemKey}" onchange="editItem('${category}','${itemKey}', 'item', this.value)"></td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <input type="file" accept="image/*" onchange="uploadImageAndUpdate('${category}','${itemKey}', this)">
              ${details.img ? `<img src="${details.img}" alt="preview" style="max-width:60px; max-height:60px;">` : ''}
            </div>
          </td>
          <td><input type="number" value="${details.price}" onchange="editItem('${category}','${itemKey}', 'price', this.value)"></td>
          <td>
            <textarea rows="2" cols="18" onchange="editItem('${category}','${itemKey}', 'specials', this.value)">${details.specials ? details.specials.join('\n') : ''}</textarea>
          </td>
          <td>
            <input type="number" value="${details.stock ?? ''}" 
              onchange="editItem('${category}','${itemKey}', 'stock', this.value)" 
              ${hasOnHoldProp ? 'disabled' : ''}>
          </td>
          <td>
            ${
              typeof details.itemsOnHold === 'number'
                ? `<input type="number" min="0" value="${details.itemsOnHold}" 
                    onchange="editItem('${category}','${itemKey}','itemsOnHold', this.value)">`
                : `<input type="checkbox" ${details.onhold ? 'checked' : ''} 
                    onchange="editItem('${category}','${itemKey}','onhold', this.checked)" 
                    ${hasStockProp ? 'disabled' : ''}>`
            }
          </td>
          <td>
            ${
              typeof details.itemsBought === 'number'
                ? `<input type="number" min="0" max="${details.stock ?? ''}" value="${details.itemsBought}" 
                      onchange="editItem('${category}','${itemKey}','itemsBought', this.value)">`
                : `<input type="checkbox" ${details.bought ? 'checked' : ''} 
                      onchange="editItem('${category}','${itemKey}','bought', this.checked)" 
                      ${hasStockProp ? 'disabled' : ''}>`
            }
          </td>
          <td>${adminProfit}</td>
          <td>${details.cosignerName || ''}</td>
          <td>${details.cosignerEmail || ''}</td>
          <td>${details.barcode}</td>
          <td>
            <button onclick="removeItem('${category}','${itemKey}')">Remove</button>
            <label style="display:inline-flex;align-items:center;">
              <input type="checkbox" onchange="toggleBarcodeQueue('${currentpage}','${category}','${itemKey}')" ${isChecked ? 'checked' : ''}>
              Barcode
            </label>
          </td>
        </tr>`;
      }
    }
  }

  html += '</table>';
  if (barcodeQueue.length > 0) {
    const printBtn = document.createElement('button');
    printBtn.id = 'print-barcode-btn';
    printBtn.textContent = `Print Barcodes (${barcodeQueue.length})`;
    printBtn.onclick = printBarcodeQueue;
    optionsCard.appendChild(printBtn);
  }
  container.innerHTML = `<strong>Total Admin Value: $${totalAdminProfit.toFixed(2)}</strong>
    <br>
    ${html}
  `;
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
  showLoading();
  // Get barcode before deleting
  const barcode = allitems[currentpage][category][item]?.barcode;
  // Remove from data
  delete allitems[currentpage][category][item];
  // Remove from DOM
  const table = document.querySelector("#inventory table");
  if (table && barcode) {
    const rows = table.getElementsByTagName("tr");
    for (let i = 1; i < rows.length; i++) {
      const barcodeCell = rows[i].getElementsByTagName("td")[12]; // Barcode column
      if (barcodeCell && barcodeCell.textContent === barcode) {
        table.deleteRow(i);
        break;
      }
    }
  }
  updatePrintBarcodeButton();
  // If category is empty, remove it
  if (Object.keys(allitems[currentpage][category]).length === 0) {
    delete allitems[currentpage][category];
  }
  renderTable();
  hideLoading();
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
      let html = '<table><tr><th>Name</th><th>Phone</th><th>Email</th><th>Date/Time</th><th>Items</th><th>Admin Profit</th><th>Consignor Profits</th><th>Status</th><th>Actions</th></tr>';
      for (const order of orders) {
        // Calculate profits
        let adminProfit = 0;
        let cosignerProfits = {};
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
                const itemConsignorProfit = (price * cosignerPercent / 100) * qty;
                adminProfit += itemAdminProfit;

                const cosignerEmail = itemObj.cosignerEmail || 'unknown';
                const cosignerName = itemObj.cosignerName || 'unknown';
                if (!cosignerProfits[cosignerEmail]) {
                  cosignerProfits[cosignerEmail] = { name: cosignerName, profit: 0 };
                }
                cosignerProfits[cosignerEmail].profit += itemConsignorProfit;

                itemsHtml += `${itemName} (${qty})<br>
                  <small>Split: ${profitSplit[0]}/${profitSplit[1]}, Price: $${price}, 
                  Admin: $${(itemAdminProfit).toFixed(2)}, 
                  Consignor: $${(itemConsignorProfit).toFixed(2)}</small><br>`;
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

        let cosignerProfitsHtml = '';
        for (const [email, { name, profit }] of Object.entries(cosignerProfits)) {
          cosignerProfitsHtml += `${name} (${email}): $${profit.toFixed(2)}<br>`;
        }

        // Format date/time from order.id
        let dateStr = '-';
        if (order.id) {
          const d = new Date(Number(order.id));
          dateStr = d.toLocaleString();
        }

        html += `<tr>
          <td>${order.name}</td>
          <td>${order.phone}</td>
          <td>${order.email}</td>
          <td>${dateStr}</td>
          <td>${itemsHtml}</td>
          <td>$${adminProfit.toFixed(2)}</td>
          <td>${cosignerProfitsHtml || '-'}</td>
          <td>
            ${order.orderType === 'buy' ? 'bought' : order.orderType === 'hold' ? 'on hold' : order.status}
          </td>
          <td>
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
                item.itemsOnHold = (item.itemsOnHold || 0) - qty;
              } else if (order.orderType === 'buy' && 'itemsBought' in item) {
                item.itemsBought = (item.itemsBought || 0) - qty;
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
      localStorage.removeItem('adminPasswordOk');
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
  updateAdminPageDropdown();
  populateConsignorDropdown();
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
  const type = document.getElementById('newItemType').value;
  const price = Number(document.getElementById('newItemPrice').value);
  const specials = document.getElementById('newItemSpecials').value
    .split('\n').map(s => s.trim()).filter(s => s.length > 0);
  const barcodeInput = document.getElementById('newItemBarcode').value.trim();
  const cosignerValue = document.getElementById('cosignerDropdown').value;
  const stockAmount = Number(document.getElementById('newItemStockAmount').value) || 1;
  const cost = Number(document.getElementById('newItemCost').value) || 0;
  const taxed = document.getElementById('newItemTaxed').value === "true";
  let cosignerName = '';
  let cosignerEmail = '';
  let profitSplit = "100/0";
  if (cosignerValue) {
    const cosignerData = JSON.parse(cosignerValue);
    cosignerName = cosignerData.name || '';
    cosignerEmail = cosignerData.email || '';
    try {
      const res = await fetch('https://labelle-co-server.vercel.app/cosigners');
      const cosigners = await res.json();
      const c = cosigners.find(c => c.email === cosignerEmail);
      if (c && c.profitSplit) profitSplit = c.profitSplit;
    } catch {}
  }

  if (!page || !category || !item) {
    document.getElementById('addItemMsg').textContent = "Please fill out all required fields.";
    hideLoading();
    return false;
  }

  if (!allitems[page]) allitems[page] = {};
  if (!allitems[page][category]) allitems[page][category] = {};

  const file = document.getElementById('imageUpload')?.files[0];
  let imageURL = '';
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

  const barcode = barcodeInput || (Date.now().toString() + Math.floor(Math.random() * 1000000).toString());

  if (subcategories.length > 0) {
    subcategories.forEach(subcategory => {
      let newItem = {
        img: imageURL || '',
        price: price || 0,
        single: (type === 'onhold'),
        specials: specials,
        cosignerName: cosignerName,
        cosignerEmail: cosignerEmail,
        profitSplit: profitSplit,
        barcode: barcode,
        subcategory: subcategory,
        generalName: item,
        cost: cost,
        taxed: taxed
      };
      if (type === 'stock') {
        newItem.stock = stockAmount;
        newItem.itemsOnHold = 0;
        newItem.itemsBought = 0;
      } else if (type === 'onhold') {
        newItem.onhold = false;
        newItem.bought = false;
      }
      allitems[page][category][item + ' (' + subcategory + ')'] = newItem;
    });
  } else {
    let newItem = {
      img: imageURL || '',
      price: price || 0,
      single: (type === 'onhold'),
      specials: specials,
      cosignerName: cosignerName,
      cosignerEmail: cosignerEmail,
      profitSplit: profitSplit,
      barcode: barcode,
      cost: cost,
      taxed: taxed
    };
    if (type === 'stock') {
      newItem.stock = stockAmount;
      newItem.itemsOnHold = 0;
      newItem.itemsBought = 0;
    } else if (type === 'onhold') {
      newItem.onhold = false;
      newItem.bought = false;
    }
    allitems[page][category][item] = newItem;
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
  updatePrintBarcodeButton();
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
  setTimeout(() => {
    renderTable();
    updatePrintBarcodeButton();
  }, 1000);
};

async function renderConsignors() {
  const cosignersDiv = document.getElementById('cosigners-list');
  cosignersDiv.innerHTML = 'Loading...';
  try {
    const res = await fetch('https://labelle-co-server.vercel.app/cosigners');
    const cosigners = await res.json();
    if (!Array.isArray(cosigners) || cosigners.length === 0) {
      cosignersDiv.innerHTML = '<p>No cosigners found.</p>';
      return;
    }

    // Check if all consignors are paid
    const allPaid = cosigners.every(c => Number(c.owedProfit) === 0);

    let html = '';
    if (allPaid) {
      html += `<div style="font-weight:bold;color:#27ae60;font-size:1.2em;margin-bottom:12px;">
        <i class="fas fa-check-circle"></i> All consignors are paid
      </div>`;
    }

    html += `<table>
      <tr>
        <th></th>
        <th>Name</th>
        <th>Email</th>
        <th>Address</th>
        <th>Phone</th>
        <th>Last Login</th>
        <th>Owed Amount</th>
        <th>Profit Split (%)</th>
        <th>Pay Back</th>
        <th>Pay Forward</th>
      </tr>`;

    for (const c of cosigners) {
      const profit = Number(c.owedProfit) || 0;
      // Extract consignor percent from profitSplit string
      let consignorPercent = 50;
      if (c.profitSplit && typeof c.profitSplit === "string" && c.profitSplit.includes('/')) {
        const parts = c.profitSplit.split('/');
        consignorPercent = Number(parts[1]) || 50;
      }
      // Format last login date
      let lastLoginStr = '-';
      if (c.lastLogin) {
        const d = new Date(Number(c.lastLogin));
        lastLoginStr = isNaN(d.getTime()) ? '-' : d.toLocaleString();
      }
      // Checkmark if paid
      let paidCheck = '';
      if (profit === 0) {
        paidCheck = `<span style="color:#27ae60;font-size:1.2em;"><i class="fas fa-check-circle"></i></span>`;
      }
      html += `<tr>
        <td style="width:32px;text-align:center;">${paidCheck}</td>
        <td>${c.name || ''}</td>
        <td>${c.email || ''}</td>
        <td>${c.address || ''}</td>
        <td>${c.phone || ''}</td>
        <td>${lastLoginStr}</td>
        <td>$${profit.toFixed(2)}</td>
        <td>
          <input type="number" min="0" max="100" value="${consignorPercent}" 
            style="width:60px;" 
            onchange="window.updateConsignorSplit('${c.email}', this.value)">
          <span style="font-size:12px;color:#888;">(Consignor %)</span>
        </td>
        <td>
          <input type="number" 
                id="payInput-${c.email}" 
                min="0" 
                max="${profit}" 
                placeholder="Amount" 
                style="width:80px;"
                ${profit <= 0 ? 'disabled' : ''}>
          <button onclick="submitConsignorPayment('${c.email}')" ${profit <= 0 ? 'disabled' : ''}>
            Submit
          </button>
        </td>
        <td>
          <input type="number" 
                id="payForwardInput-${c.email}" 
                min="0" 
                placeholder="Amount" 
                style="width:80px;">
          <button onclick="submitConsignorPayForward('${c.email}')">
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

// Add this new function for pay forward
window.submitConsignorPayForward = async function(email) {
  const input = document.getElementById(`payForwardInput-${email}`);
  const value = Number(input.value);

  if (isNaN(value) || value <= 0) {
    alert("Enter a valid positive amount.");
    return;
  }

  showLoading();

  try {
    const res = await fetch('https://labelle-co-server.vercel.app/cosigners');
    const cosigners = await res.json();

    const c = cosigners.find(c => c.email === email);
    if (!c) throw new Error("Consignor not found.");

    c.owedProfit = Number(c.owedProfit || 0) + value;

    await fetch('https://labelle-co-server.vercel.app/cosigners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cosigners)
    });

    renderConsignors();
    hideLoading();
  } catch (err) {
    alert("Failed to process pay forward: " + err.message);
  }
};

window.submitConsignorPayment = async function(email) {
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
    if (!c) throw new Error("Consignor not found.");

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

    renderConsignors(); // Refresh the cosigner table
    hideLoading();
  } catch (err) {
    alert("Failed to process payment: " + err.message);
  }
};

async function populateConsignorDropdown() {
  const dropdown = document.getElementById('cosignerDropdown');
  dropdown.innerHTML = '<option value="">-- Select Consignor --</option>';
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

window.toggleGroupRows = function(groupId) {
  expandedGroups[groupId] = !expandedGroups[groupId];
  renderTable();
};

window.editGeneralName = function(category, oldGeneralName, newGeneralName) {
  if (!newGeneralName.trim()) return;
  const items = allitems[currentpage][category];
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

window.editSubcategory = function(category, itemKey, value) {
  const items = allitems[currentpage][category];
  const details = items[itemKey];
  if (!details || !details.generalName) return;
  const newKey = details.generalName + ' (' + value + ')';
  details.subcategory = value;
  items[newKey] = details;
  delete items[itemKey];
  renderTable();
};

let analyticsData = null;

async function loadAnalytics() {
  document.getElementById('analyticsSummary').innerHTML = 'Loading...';
  document.getElementById('analyticsItemsSold').innerHTML = '';
  try {
    const [analyticsRes, consignorsRes] = await Promise.all([
      fetch('https://labelle-co-server.vercel.app/get-analytics'),
      fetch('https://labelle-co-server.vercel.app/cosigners')
    ]);
    analyticsData = await analyticsRes.json();
    window.consignorsList = await consignorsRes.json();
    populateAnalyticsMonthDropdown();
    populateAnalyticsConsignorDropdown();
    renderAnalytics();
  } catch (err) {
    document.getElementById('analyticsSummary').innerHTML = `<span style="color:red;">Failed to load analytics: ${err.message}</span>`;
  }
}

function populateAnalyticsMonthDropdown() {
  const select = document.getElementById('analyticsMonthSelect');
  select.innerHTML = '<option value="all">All Time</option>';
  if (analyticsData && analyticsData.months) {
    Object.keys(analyticsData.months).forEach(monthKey => {
      select.innerHTML += `<option value="${monthKey}">${monthKey}</option>`;
    });
  }
}

function populateAnalyticsConsignorDropdown() {
  const select = document.getElementById('analyticsConsignorSelect');
  select.innerHTML = '<option value="all">All Consignors</option>';
  const consignorSet = new Set();
  if (analyticsData && analyticsData.months) {
    for (const month of Object.values(analyticsData.months)) {
      for (const item of Object.values(month.itemsSold || {})) {
        if (item.cosignerEmail) consignorSet.add(item.cosignerEmail);
      }
    }
  }
  for (const email of consignorSet) {
    // Try to get name from consignors list if available
    let name = email;
    if (window.consignorsList) {
      const c = window.consignorsList.find(c => c.email === email);
      if (c && c.name) name = `${c.name} (${email})`;
    }
    select.innerHTML += `<option value="${email}">${name}</option>`;
  }
}

function renderAnalytics() {
  if (!analyticsData) return;
  const monthSelect = document.getElementById('analyticsMonthSelect');
  const consignorSelect = document.getElementById('analyticsConsignorSelect');
  const selectedMonth = monthSelect.value;
  const selectedConsignor = consignorSelect.value;

  // Gather itemsSold for selected month/all time
  let itemsSold = {};
  if (selectedMonth === 'all') {
    for (const month of Object.values(analyticsData.months || {})) {
      for (const [itemName, itemData] of Object.entries(month.itemsSold || {})) {
        if (!itemsSold[itemName]) {
          itemsSold[itemName] = { ...itemData };
        } else {
          itemsSold[itemName].quantity += itemData.quantity || 0;
          itemsSold[itemName].price += itemData.price || 0;
          itemsSold[itemName].date = Math.max(itemsSold[itemName].date, itemData.date);
        }
        // Always keep cosigner info from last sale
        itemsSold[itemName].cosignerName = itemData.cosignerName || '';
        itemsSold[itemName].cosignerEmail = itemData.cosignerEmail || '';
        itemsSold[itemName].profitSplit = itemData.profitSplit || "50/50";
        itemsSold[itemName].cost = itemData.cost || 0;
        itemsSold[itemName].taxed = !!itemData.taxed;
      }
    }
  } else {
    const month = analyticsData.months[selectedMonth] || {};
    itemsSold = { ...(month.itemsSold || {}) };
  }

  // Filter by consignor if needed
  let filteredItemsSold = itemsSold;
  if (selectedConsignor !== 'all') {
    filteredItemsSold = {};
    for (const [itemName, itemData] of Object.entries(itemsSold)) {
      if (itemData.cosignerEmail === selectedConsignor) {
        filteredItemsSold[itemName] = itemData;
      }
    }
  }

  // Calculate totals
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalProfitAfterTax = 0;
  let adminRevenue = 0, adminProfit = 0, adminProfitAfterTax = 0;
  let consignorTotals = {}; // email → { revenue, profit, profitAfterTax, name }
  const taxRate = 0.06;

  for (const itemData of Object.values(filteredItemsSold)) {
    const price = Number(itemData.price) || 0;
    const cost = Number(itemData.cost) || 0;
    const qty = Number(itemData.quantity) || 0;
    const profitSplit = (itemData.profitSplit || "50/50").split('/');
    const adminPercent = Number(profitSplit[0]) || 50;
    const consignorPercent = Number(profitSplit[1]) || 50;
    const taxed = !!itemData.taxed;

    totalRevenue += price;
    const profit = price - cost * qty;
    totalProfit += profit;

    // For profit after tax: subtract tax from revenue, then subtract cost
    let revenueAfterTax = taxed ? price * (1 - taxRate) : price;
    let profitAfterTax = revenueAfterTax - cost * qty;
    totalProfitAfterTax += profitAfterTax;

    // Admin and consignor splits
    const adminRev = price * (adminPercent / 100);
    const consignorRev = price * (consignorPercent / 100);
    const adminProf = profit * (adminPercent / 100);
    const consignorProf = profit * (consignorPercent / 100);
    const adminProfAfterTax = profitAfterTax * (adminPercent / 100);
    const consignorProfAfterTax = profitAfterTax * (consignorPercent / 100);

    adminRevenue += adminRev;
    adminProfit += adminProf;
    adminProfitAfterTax += adminProfAfterTax;

    const email = itemData.cosignerEmail || '';
    const name = itemData.cosignerName || '';
    if (email) {
      if (!consignorTotals[email]) {
        consignorTotals[email] = {
          name,
          revenue: 0,
          profit: 0,
          profitAfterTax: 0
        };
      }
      consignorTotals[email].revenue += consignorRev;
      consignorTotals[email].profit += consignorProf;
      consignorTotals[email].profitAfterTax += consignorProfAfterTax;
    }
  }

  // If viewing a specific consignor, show only their totals
  let consignorSummaryHtml = '';
  if (selectedConsignor !== 'all') {
    const c = consignorTotals[selectedConsignor] || { name: '', revenue: 0, profit: 0, profitAfterTax: 0 };
    consignorSummaryHtml = `
      <strong>Consignor: ${c.name} (${selectedConsignor})</strong><br>
      <strong>Revenue:</strong> $${c.revenue.toFixed(2)}<br>
      <strong>Profit:</strong> $${c.profit.toFixed(2)}<br>
      <strong>Profit After Tax (6%):</strong> $${c.profitAfterTax.toFixed(2)}<br>
      <small style="color:#888;">(Tax rate is 6%)</small><br>
    `;
  }

  // Render summary
  let html = `
    <strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)}<br>
    <strong>Total Profit:</strong> $${totalProfit.toFixed(2)}<br>
    <strong>Total Profit After Tax (6%):</strong> $${totalProfitAfterTax.toFixed(2)}<br>
    <small style="color:#888;">(Tax rate is 6%)</small><br>
    <strong>Admin Revenue:</strong> $${adminRevenue.toFixed(2)}<br>
    <strong>Admin Profit:</strong> $${adminProfit.toFixed(2)}<br>
    <strong>Admin Profit After Tax (6%):</strong> $${adminProfitAfterTax.toFixed(2)}<br>
    <br>
    <strong>Consignor Totals:</strong><br>
  `;
  for (const [email, c] of Object.entries(consignorTotals)) {
    html += `<span style="margin-left:16px;">
      ${c.name} (${email}): 
      Revenue: $${c.revenue.toFixed(2)}, 
      Profit: $${c.profit.toFixed(2)}, 
      Profit After Tax: $${c.profitAfterTax.toFixed(2)}
    </span><br>`;
  }
  html += consignorSummaryHtml;
  document.getElementById('analyticsSummary').innerHTML = html;

  // Render items sold table
  let itemsHtml = `<table>
    <tr>
      <th>Item Name</th>
      <th>Quantity Sold</th>
      <th>Total Price</th>
      <th>Date Sold</th>
      <th>Consignor Name</th>
      <th>Consignor Email</th>
      <th>Profit Split</th>
      <th>Cost</th>
      <th>Taxed</th>
    </tr>`;
  for (const [itemName, itemData] of Object.entries(filteredItemsSold)) {
    itemsHtml += `<tr>
      <td>${itemName}</td>
      <td>${itemData.quantity || 0}</td>
      <td>$${(itemData.price || 0).toFixed(2)}</td>
      <td>${itemData.date ? new Date(itemData.date).toLocaleString() : '-'}</td>
      <td>${itemData.cosignerName || ''}</td>
      <td>${itemData.cosignerEmail || ''}</td>
      <td>${itemData.profitSplit || ''}</td>
      <td>$${(itemData.cost || 0).toFixed(2)}</td>
      <td>${itemData.taxed ? 'Yes' : 'No'}</td>
    </tr>`;
  }
  itemsHtml += '</table>';
  document.getElementById('analyticsItemsSold').innerHTML = itemsHtml;

  const customersObj = analyticsData.customers && typeof analyticsData.customers === 'object' ? analyticsData.customers : {};
  let html2 = `<table>
    <tr><th>Name</th><th>Email</th><th>Phone</th></tr>`;
  for (const [email, info] of Object.entries(customersObj)) {
    html2 += `<tr>
      <td>${info.name || ''}</td>
      <td>${email}</td>
      <td>${info.phone || ''}</td>
    </tr>`;
  }
  html2 += '</table>';
  document.getElementById('customersTable').innerHTML = html2;
}

async function sendBulkEmail() {
  const statusDiv = document.getElementById('emailStatus');
  statusDiv.textContent = '';
  const title = document.getElementById('emailTitle').value.trim();
  const bodyHtml = document.getElementById('emailBody').innerHTML.trim();
  if (!title || !bodyHtml) {
    statusDiv.textContent = "Please enter both a title and body.";
    return;
  }
  statusDiv.textContent = "Loading customer list...";
  try {
    // Get customers from analytics
    const res = await fetch('https://labelle-co-server.vercel.app/get-analytics');
    const analytics = await res.json();
    const customers = Array.isArray(analytics.customers) ? analytics.customers : [];
    const customersObj = analytics.customers && typeof analytics.customers === 'object' ? analytics.customers : {};
    const customerEmails = Object.keys(customersObj);
    if (customerEmails.length === 0) {
      statusDiv.textContent = "No customers found in analytics.";
      return;
    }
    statusDiv.textContent = "Sending emails...";
    const sendRes = await fetch('https://labelle-co-server.vercel.app/send-bulk-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: title,
        html: bodyHtml,
        recipients: customerEmails
      })
    });
    if (sendRes.ok) {
      statusDiv.style.color = "green";
      statusDiv.textContent = "Emails sent successfully!";
    } else {
      const err = await sendRes.text();
      statusDiv.textContent = "Error sending emails: " + err;
    }
  } catch (err) {
    statusDiv.textContent = "Error: " + err.message;
  }
}

async function changeAdminPassword() {
  const oldPassword = document.getElementById('adminOldPassword').value;
  const newPassword = document.getElementById('adminNewPassword').value;
  const msg = document.getElementById('adminPasswordChangeMsg');
  msg.textContent = "Processing...";
  const res = await fetch('https://labelle-co-server.vercel.app/admin-change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword, newPassword })
  });
  msg.textContent = await res.text();
}

async function changeHubPassword() {
  const oldPassword = document.getElementById('hubOldPassword').value;
  const newPassword = document.getElementById('hubNewPassword').value;
  const msg = document.getElementById('hubPasswordChangeMsg');
  msg.textContent = "Processing...";
  const res = await fetch('https://labelle-co-server.vercel.app/hub-change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword, newPassword })
  });
  msg.textContent = await res.text();
}

function filterCustomers() {
  const input = document.getElementById("customerSearch");
  const filter = input.value.toLowerCase();
  const table = document.querySelector("#customersTable table");
  if (!table) return;
  const rows = table.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) { // skip header row
    const nameCell = rows[i].getElementsByTagName("td")[0];
    const emailCell = rows[i].getElementsByTagName("td")[1];
    const phoneCell = rows[i].getElementsByTagName("td")[2];
    let match = false;
    if (nameCell && (nameCell.textContent || nameCell.innerText).toLowerCase().includes(filter)) match = true;
    if (emailCell && (emailCell.textContent || emailCell.innerText).toLowerCase().includes(filter)) match = true;
    if (phoneCell && (phoneCell.textContent || phoneCell.innerText).toLowerCase().includes(filter)) match = true;
    rows[i].style.display = match ? "" : "none";
  }
}

window.updateConsignorSplit = async function(email, value) {
  const percent = Math.max(0, Math.min(100, Number(value)));
  const profitSplit = `${100 - percent}/${percent}`;
  showLoading();
  try {
    const res = await fetch('https://labelle-co-server.vercel.app/cosigners');
    const cosigners = await res.json();
    const c = cosigners.find(c => c.email === email);
    if (!c) throw new Error("Consignor not found.");
    c.profitSplit = profitSplit;
    await fetch('https://labelle-co-server.vercel.app/cosigners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cosigners)
    });
    renderConsignors();
    hideLoading();
  } catch (err) {
    alert("Failed to update profit split: " + err.message);
    hideLoading();
  }
};

function filterInventoryTable() {
  const input = document.getElementById("inventorySearch");
  const filter = input.value.toLowerCase();
  const table = document.querySelector("#inventory table");
  if (!table) return;
  const rows = table.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) { // skip header row
    const itemCell = rows[i].getElementsByTagName("td")[1];
    if (itemCell && itemCell.querySelector('input[type="text"]')) {
      // For editable item name cells
      const inputElem = itemCell.querySelector('input[type="text"]');
      const itemText = inputElem.value || inputElem.textContent || inputElem.innerText;
      rows[i].style.display = itemText.toLowerCase().includes(filter) ? "" : "none";
    } else if (itemCell) {
      // For static item name cells
      const itemText = itemCell.textContent || itemCell.innerText;
      rows[i].style.display = itemText.toLowerCase().includes(filter) ? "" : "none";
    } else {
      // Hide non-item rows (group headers, etc.)
      rows[i].style.display = "none";
    }
  }
}

function clearInventorySearch() {
  const input = document.getElementById("inventorySearch");
  input.value = "";
  filterInventoryTable();
}

function updatePrintBarcodeButton() {
  const optionsCard = document.getElementById('options-card');
  let btn = document.getElementById('print-barcode-btn');
  if (btn) btn.remove();
  if (barcodeQueue.length > 0) {
    btn = document.createElement('button');
    btn.id = 'print-barcode-btn';
    btn.textContent = `Print Barcodes (${barcodeQueue.length})`;
    btn.onclick = printBarcodeQueue;
    optionsCard.appendChild(btn);
  }
}

function setRegisterAccess(user) {
  localStorage.setItem('registerAccess', user);
}

function populateInventoryOwnerDropdown() {
  const ownerSelect = document.getElementById('inventoryOwnerSelect');
  if (!ownerSelect) return;
  // Always keep "All" and "Admin"
  ownerSelect.innerHTML = `<option value="all">All</option><option value="admin">Admin</option>`;
  const consignorSet = new Set();
  for (const page of Object.values(allitems)) {
    for (const category of Object.values(page)) {
      for (const details of Object.values(category)) {
        if (details.cosignerEmail) {
          consignorSet.add(details.cosignerEmail);
        }
      }
    }
  }
  // Optionally, get consignor names from window.consignorsList if available
  if (window.consignorsList) {
    for (const email of consignorSet) {
      const c = window.consignorsList.find(c => c.email === email);
      const name = c && c.name ? `${c.name} (${email})` : email;
      ownerSelect.innerHTML += `<option value="${email}">${name}</option>`;
    }
  } else {
    for (const email of consignorSet) {
      ownerSelect.innerHTML += `<option value="${email}">${email}</option>`;
    }
  }
}