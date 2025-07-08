const CLOUD_API_URL = 'https://labelle-co-server.vercel.app/cloud';

let allitems = {
  'main.html' : {
    'Tables and Desks' : {
      'Dining Table' : {'img': 'Images/diningtablefirst.jpg', 'price': 1699, 'single' : true, 'specials' : ['pads in leather case', '8 chairs', '2 leaves'], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000001', 'bought' : false},
      'Wine&Cabinet' : {'img': 'Images/wineandcabindet.jpg', 'price': 449, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000002', 'bought' : false},
      'Side table' : {'img': 'Images/sidetable.jpg', 'price': 199, 'single' : true, 'specials' : ['welded/no screws', 'no sqeak'], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000003', 'bought' : false},
      'French Blue Desk' : {'img': 'Images/antiquebluetable.jpg', 'price': 389, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000004', 'bought' : false},
      'Writing Desk' : {'img': 'Images/writingdesk.jpg', 'price': 299, 'single' : true, 'specials' : ['bamboo chair'], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000005', 'bought' : false},
      'Coffee Table' : {'img': 'Images/coffeetable.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000006', 'bought' : false},
      'White Coffee Table' : {'img': 'Images/coffeetblwhite.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000007', 'bought' : false},
      'Wooden Dinner Table' : {'img': 'Images/woodentable.jpg', 'price': 1299, 'single' : true, 'specials' : ['leaves'], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000008', 'bought' : false},
      'Small Table' : {'img': 'Images/smalltable.jpg', 'price': 1895, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000009', 'bought' : false},
  },
    'Cabinets' : {
      'Cabinet' : {'img': 'Images/salecabinet.jpg', 'price': 499, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000010', 'bought' : false},
      'Skinny Cabinets' : {'img': 'Images/smallcabs.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000011', 'bought' : false},
      'Night Stands(both!)' : {'img': 'Images/nightstands.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000012', 'bought' : false},
      'Two Drawer Cabinet' : {'img': 'Images/2layercab.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000000', 'bought' : false},
      'Regency Style Dresser' : {'img': 'Images/regencystyledresser.jpg', 'price': 549, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000013', 'bought' : false},
      'Five layer Cabinet' : {'img': 'Images/5layercab.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000014', 'bought' : false},
      'Big Blue Cabinet' : {'img': 'Images/bigbluecab.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000015', 'bought' : false},
      'Blue Bookshelf' : {'img': 'Images/smallbluecab.jpg', 'price': 499, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000016', 'bought' : false},
      'Beutifal Cabinet' : {'img': 'Images/bigbeutifalcabinet.jpg', 'price': 529, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000017', 'bought' : false},
      'Green Chest' : {'img': 'Images/bigbeutifalchest.jpg', 'price': 499, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000018', 'bought' : false},
      'Hand made bookshelf' : {'img': 'Images/handmadebookshelf.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '000000019', 'bought' : false},
      'Red China Hutch' : {'img': 'Images/redcabinet.jpg', 'price': 249, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000020', 'bought' : false},
      'Tall Blue Cabinet' : {'img': 'Images/TallblueCabinet.jpg', 'price': 549, 'single' : true, 'specials' : ['original bamboo'], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000021', 'bought' : false},
      'Ballerina cabinet' : {'img': 'Images/ballerinacab.jpg', 'price': 349, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000022', 'bought' : false},
      'Wardrobe' : {'img': 'Images/Wardrobe.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000023', 'bought' : false},
      'Chester Drawer' : {'img': 'Images/chesterdrawer.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000024', 'bought' : false},
      'Night Stands' : {'img': 'Images/nightstands2.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000025', 'bought' : false},
      'Dresser' : {'img': 'Images/dresser.jpg', 'price': 449, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000026', 'bought' : false},
      'Big Drawer' : {'img': 'Images/maxstoragedrawer.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000027', 'bought' : false},
      'Small Drawer' : {'img': 'Images/small cabinet.jpg', 'price': 99, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000028', 'bought' : false},
      //'3 drawer night stand' : {'img': 'Images/3drawer.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000029', 'bought' : false},
      'Wine&Cabinet' : {'img': 'Images/wineandcabindet.jpg', 'price': 449, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000030', 'bought' : false},
      'Grated Night Stand(2x)' : {'img': 'Images/gratenightstand.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000031', 'bought' : false},
      'Dresser' : {'img': 'Images/large dresser.jpg', 'price': 489, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000032', 'bought' : false},
      'White Chester Drawers' : {'img': 'Images/chesterdrawer2.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000033', 'bought' : false},
      'Lingerie chest' : {'img': 'Images/Tallcabinet2.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000034', 'bought' : false},
      'Large Belgian Cabinet' : {'img': 'Images/bigwoodenboy.jpg', 'price': 1395, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000035', 'bought' : false},
      'Tall Cabinet' : {'img': 'Images/tallcabinet.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000036', 'bought' : false},
      'Wine&Cabinet' : {'img': 'Images/wineandcabindet.jpg', 'price': 449, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000037', 'bought' : false},
  },
    'Beds' : {
      'Rustic Bed(Full Size!)' : {'img': 'Images/rusticbed.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000038', 'bought' : false},
      'King Bed' : {'img': 'Images/Kingbed.jpg', 'price': 599, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000039', 'bought' : false},
      'Queen Bed' : {'img': 'Images/queenbed2.jpg', 'price': 695, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000040', 'bought' : false},
      'Iron king bed' : {'img': 'Images/ironking.jpg', 'price': 795, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000041', 'bought' : false},
      'Queen Bed' : {'img': 'Images/queenbed.jpg', 'price': 599, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000042', 'bought' : false},
  },
    'Other Items' : {
      //set the # in stock to what's actually in stock
      'Squash Memory Books' : {'img': 'Images/squashmemorybooks.jpg', 'price': 22, 'single' : false, 'stock' : 20, 'specials' : [], 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000043', 'itemsOnHold' : 0, 'itemsBought' : 0},
      'Geometry Towels' : {'img': 'Images/geotowels.jpg', 'price': 22, 'single' : false, 'stock' : 20, 'specials' : [], 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000044', 'itemsOnHold' : 0, 'itemsBought' : 0},
      'Lamp' : {'img': 'Images/lamp.jpg', 'price': 75.95, 'single' : false, 'stock' : 20, 'specials' : [], 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50', 'barcode' : '00000045', 'itemsOnHold' : 0, 'itemsBought' : 0},
    },
  },
};

let currentpage = 'main.html';
let barcodeQueue = [];

window.onload = function() {
  showPasswordOverlay();
};

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
    })
    .catch(err => showLoadingError(err.message))
    .finally(hideLoading);
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
      container.parentNode.insertBefore(printBtn, container);
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
      totalAdminProfit += adminProfit;

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
        <input type="text" value="${details.img || ''}" onchange="editItem('${category}','${item}', 'img', this.value)" placeholder="Image URL">
        ${details.img ? `<br><img src="${details.img}" alt="preview" style="max-width:60px;max-height:60px;">` : ''}
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
          <select onchange="editItem('${category}','${item}','profitSplit', this.value)">
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
  container.innerHTML = html;

  const totalDiv = document.createElement('div');
  totalDiv.style.marginTop = '16px';
  totalDiv.innerHTML = `<strong>Total Admin Profit: $${totalAdminProfit.toFixed(2)}</strong>`;
  container.appendChild(totalDiv);
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
  .catch(err => showLoadingError(err.message))
  .finally(hideLoading);
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
    .catch(err => showLoadingError(err.message))
    .finally(hideLoading);

  loadInventory();
}

async function acceptOrder(orderId) {
  showLoading();
  try {
    // Load orders and inventory
    let orders = await (await fetch('https://labelle-co-server.vercel.app/orders')).json();
    let orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found.");
    let order = orders[orderIndex];

    // Load inventory
    let inventory = await (await fetch(CLOUD_API_URL)).json();

    for (const [itemName, qty] of Object.entries(order.items)) {
      let found = false;
      for (const page in inventory) {
        for (const category in inventory[page]) {
          if (inventory[page][category][itemName]) {
            let item = inventory[page][category][itemName];
            if ('stock' in item) {
              // Subtract ordered quantity from stock
              item.stock = Math.max(0, (item.stock || 0) - qty);
              // Increase itemsOnHold or itemsBought by qty
              if (order.orderType === 'hold' && 'itemsOnHold' in item) {
                item.itemsOnHold = (item.itemsOnHold || 0) + qty;
              } else if (order.orderType === 'buy' && 'itemsBought' in item) {
                item.itemsBought = (item.itemsBought || 0) + qty;
              }
              // Optionally remove item if stock is 0
              // if (item.stock === 0) delete inventory[page][category][itemName];
            } else {
              // No stock property: remove item
              delete inventory[page][category][itemName];
            }
            found = true;
            break;
          }
        }
        if (found) break;
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
  } catch (err) {
    showLoadingError(err.message);
  } finally {
    hideLoading();
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
  } catch (err) {
    showLoadingError(err.message);
  } finally {
    hideLoading();
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

window.submitNewAdminItem = function(event) {
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
  const profitSplit = document.getElementById('newItemProfitSplit').value;
  const cosignerName = document.getElementById('newItemCosignerName').value.trim();
  const cosignerEmail = document.getElementById('newItemCosignerEmail').value.trim();

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
    profitSplit: profitSplit,
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
  })
  .catch(err => showLoadingError(err.message))
  .finally(hideLoading);

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