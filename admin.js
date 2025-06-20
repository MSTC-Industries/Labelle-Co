const CLOUD_API_URL = 'https://labelle-co-server.vercel.app/cloud';

let allitems = {
  /*'main.html' : {
    'Tables and Desks' : {
      'Dining Table' : {'img': 'Images/diningtablefirst.jpg', 'price': 1699, 'single' : true, 'specials' : ['pads in leather case', '8 chairs', '2 leaves'], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Wine&Cabinet' : {'img': 'Images/wineandcabindet.jpg', 'price': 449, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Side table' : {'img': 'Images/sidetable.jpg', 'price': 199, 'single' : true, 'specials' : ['welded/no screws', 'no sqeak'], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'French Blue Desk' : {'img': 'Images/antiquebluetable.jpg', 'price': 389, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Writing Desk' : {'img': 'Images/writingdesk.jpg', 'price': 299, 'single' : true, 'specials' : ['bamboo chair'], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Coffee Table' : {'img': 'Images/coffeetable.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'White Coffee Table' : {'img': 'Images/coffeetblwhite.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Wooden Dinner Table' : {'img': 'Images/woodentable.jpg', 'price': 1299, 'single' : true, 'specials' : ['leaves'], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Small Table' : {'img': 'Images/smalltable.jpg', 'price': 1895, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
  },
    'Cabinets' : {
      'Cabinet' : {'img': 'Images/salecabinet.jpg', 'price': 499, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Skinny Cabinets' : {'img': 'Images/smallcabs.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Night Stands(both!)' : {'img': 'Images/nightstands.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Two Drawer Cabinet' : {'img': 'Images/2layercab.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Regency Style Dresser' : {'img': 'Images/regencystyledresser.jpg', 'price': 549, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Five layer Cabinet' : {'img': 'Images/5layercab.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Big Blue Cabinet' : {'img': 'Images/bigbluecab.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Blue Bookshelf' : {'img': 'Images/smallbluecab.jpg', 'price': 499, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Beutifal Cabinet' : {'img': 'Images/bigbeutifalcabinet.jpg', 'price': 529, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Green Chest' : {'img': 'Images/bigbeutifalchest.jpg', 'price': 499, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Hand made bookshelf' : {'img': 'Images/handmadebookshelf.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Red China Hutch' : {'img': 'Images/redcabinet.jpg', 'price': 249, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Tall Blue Cabinet' : {'img': 'Images/TallblueCabinet.jpg', 'price': 549, 'single' : true, 'specials' : ['original bamboo'], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Ballerina cabinet' : {'img': 'Images/ballerinacab.jpg', 'price': 349, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Wardrobe' : {'img': 'Images/Wardrobe.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Chester Drawer' : {'img': 'Images/chesterdrawer.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Night Stands' : {'img': 'Images/nightstands2.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Dresser' : {'img': 'Images/dresser.jpg', 'price': 449, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Big Drawer' : {'img': 'Images/maxstoragedrawer.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Small Drawer' : {'img': 'Images/small cabinet.jpg', 'price': 99, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      //'3 drawer night stand' : {'img': 'Images/3drawer.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Wine&Cabinet' : {'img': 'Images/wineandcabindet.jpg', 'price': 449, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Grated Night Stand(2x)' : {'img': 'Images/gratenightstand.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Dresser' : {'img': 'Images/large dresser.jpg', 'price': 489, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'White Chester Drawers' : {'img': 'Images/chesterdrawer2.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Lingerie chest' : {'img': 'Images/Tallcabinet2.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Large Belgian Cabinet' : {'img': 'Images/bigwoodenboy.jpg', 'price': 1395, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Tall Cabinet' : {'img': 'Images/tallcabinet.jpg', 'price': 299, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Wine&Cabinet' : {'img': 'Images/wineandcabindet.jpg', 'price': 449, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
  },
    'Beds' : {
      'Rustic Bed(Full Size!)' : {'img': 'Images/rusticbed.jpg', 'price': 399, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'King Bed' : {'img': 'Images/Kingbed.jpg', 'price': 599, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Queen Bed' : {'img': 'Images/queenbed2.jpg', 'price': 695, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Iron king bed' : {'img': 'Images/ironking.jpg', 'price': 795, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Queen Bed' : {'img': 'Images/queenbed.jpg', 'price': 599, 'single' : true, 'specials' : [], 'onhold' : false, 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
  },
    'Other Items' : {
      //set the # in stock to what's actually in stock
      'Squash Memory Books' : {'img': 'Images/squashmemorybooks.jpg', 'price': 22, 'single' : false, 'stock' : 20, 'specials' : [], 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Geometry Towels' : {'img': 'Images/geotowels.jpg', 'price': 22, 'single' : false, 'stock' : 20, 'specials' : [], 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
      'Lamp' : {'img': 'Images/lamp.jpg', 'price': 75.95, 'single' : false, 'stock' : 20, 'specials' : [], 'cosignerName': 'admin', 'cosignerEmail': 'mstc.industries.official@gmail.com', 'profitSplit': '50/50'},
    },
  },*/
};

let currentpage = 'main.html';

// Call this before loading anything else
checkAdminPassword().then(allowed => {
    if (allowed) {
        loadInventory();
        loadOrders();
    }
});

async function checkAdminPassword() {
    let password = prompt("Admin password:");
    if (!password) {
        document.body.innerHTML = "<h2>Access denied.</h2><p>No password entered, please reload the page to try again.</p>";
        return false;
    }
    const res = await fetch('https://labelle-co-server.vercel.app/check-admin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    if (res.ok) {
        return true;
    } else {
        document.body.innerHTML = "<h2>Access denied.</h2><p>Incorrect password, please reload the page to try again.</p>";
        return false;
    }
}

// Load inventory
function loadInventory() {
  fetch(CLOUD_API_URL)
    .then(res => res.json())
    .then(data => {
      allitems = data;
      populatePageSelector();
      renderTable();
    });
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
  if (!allitems[currentpage]) {
    container.innerHTML = '<p>No data for this page.</p>';
    return;
  }
  let totalAdminProfit = 0;
  let html = '<table><tr><th>Category</th><th>Item</th><th>Image</th><th>Price</th><th>Specials</th><th>Stock</th><th>On Hold</th><th>Profit Split</th><th>Admin Profit</th><th>Cosigner Name</th><th>Cosigner Email</th><th>Actions</th></tr>';
  for (const [category, items] of Object.entries(allitems[currentpage])) {
    for (const [item, details] of Object.entries(items)) {
      const hasStockProp = Object.prototype.hasOwnProperty.call(details, 'stock');
      const hasOnHoldProp = Object.prototype.hasOwnProperty.call(details, 'onhold');
      
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
          <input type="checkbox" ${details.onhold ? 'checked' : ''} 
            onchange="editItem('${category}','${item}', 'onhold', this.checked)" 
            ${hasStockProp ? 'disabled' : ''}>
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
        <td><button onclick="removeItem('${category}','${item}')">Remove</button></td>
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
  if (field === 'item') {
    // Rename item
    allitems[currentpage][category][value] = allitems[currentpage][category][item];
    delete allitems[currentpage][category][item];
  } else if (field === 'specials') {
    allitems[currentpage][category][item][field] = value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  } else if (field === 'onhold') {
    allitems[currentpage][category][item][field] = value;
  } else if (field === 'price' || field === 'stock') {
    allitems[currentpage][category][item][field] = Number(value);
  } else {
    allitems[currentpage][category][item][field] = value;
  }
  renderTable();
};

window.removeItem = function(category, item) {
  delete allitems[currentpage][category][item];
  renderTable();
};

window.addNewItem = function() {
  const category = prompt('Category?');
  const item = prompt('Item name?');
  if (!category || !item) return;
  if (!allitems[currentpage][category]) allitems[currentpage][category] = {};

  let img = prompt('Image URL? (Upload to Imgur, Google Drive, etc.)');
  let type = prompt('Type "stock" for non single items, or "onhold" for single items:').toLowerCase();
  let newItem = {
    img: img || '',
    price: 0,
    single: false,
    specials: [],
    cosignerName: 'admin', //pls update these
    cosignerEmail: 'mstc.industries.official@gmail.com',
    profitSplit: "50/50"
  };
  if (type === 'stock') {
    newItem.stock = 1;
    newItem.itemsOnHold = 0;
  } else if (type === 'onhold') {
    newItem.onhold = false;
  }

  allitems[currentpage][category][item] = newItem;
  renderTable();
};

window.saveAll = function() {
  fetch(CLOUD_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allitems)
  })
  .then(res => res.text())
  .then(msg => alert('Saved!'));
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
  fetch('https://labelle-co-server.vercel.app/orders')
    .then(res => res.json())
    .then(orders => {
      const container = document.getElementById('orders');
      if (!orders.length) {
        container.innerHTML = '<p>No orders yet.</p>';
        return;
      }
      let html = '<table><tr><th>Name</th><th>Phone</th><th>Email</th><th>Items</th><th>Admin Profit</th><th>Cosigner Profits</th><th>Status</th></tr>';
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
          <td>${order.status}</td>
        </tr>`;
      }
      html += '</table>';
      container.innerHTML = html;
    });

  loadInventory();
}