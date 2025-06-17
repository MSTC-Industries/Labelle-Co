const CLOUD_API_URL = 'https://labelle-co-server.vercel.app/cloud';
const COSIGNER_INFO_URL = 'https://labelle-co-server.vercel.app/cosigner-info';

let allitems = {};
let cosignerEmail = localStorage.getItem('cosignerEmail');
let cosignerName = '';

fetchCosignerInfo();
loadInventory();

async function fetchCosignerInfo() {
  if (!cosignerEmail) return;
  const res = await fetch(`${COSIGNER_INFO_URL}?email=${encodeURIComponent(cosignerEmail)}`);
  if (res.ok) {
    const data = await res.json();
    cosignerName = data.name;
    document.getElementById('cosignerEmail').textContent = data.email;
    document.getElementById('cosignerName').textContent = data.name;
  } else {
    document.getElementById('cosignerEmail').textContent = cosignerEmail;
    document.getElementById('cosignerName').textContent = '';
  }
}

// Load inventory and filter for this cosigner
function loadInventory() {
  fetch(CLOUD_API_URL)
    .then(res => res.json())
    .then(data => {
      allitems = data;
      renderTable();
    });
}

function renderTable() {
  const container = document.getElementById('inventory');
  let html = '<table><tr><th>Category</th><th>Item</th><th>Image</th><th>Price</th><th>Specials</th><th>Stock</th><th>On Hold</th><th>Profit Split</th><th>Cosigner Name</th><th>Cosigner Email</th><th>Actions</th></tr>';
  // Gather all categories for dropdown
  let allCategories = new Set();
  for (const categories of Object.values(allitems)) {
    for (const category of Object.keys(categories)) {
      allCategories.add(category);
    }
  }
  for (const [page, categories] of Object.entries(allitems)) {
    for (const [category, items] of Object.entries(categories)) {
      for (const [item, details] of Object.entries(items)) {
        if (details.cosignerEmail === cosignerEmail) {
          const hasStockProp = Object.prototype.hasOwnProperty.call(details, 'stock');
          const hasOnHoldProp = Object.prototype.hasOwnProperty.call(details, 'onhold');
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
              <input type="checkbox" ${details.onhold ? 'checked' : ''} 
                onchange="editItem('${page}','${category}','${item}','onhold', this.checked)" 
                ${hasStockProp ? 'disabled' : ''}>
            </td>
            <td>${details.profitSplit || "50/50"}</td>
            <td>${details.cosignerName || ''}</td>
            <td>${details.cosignerEmail || ''}</td>
            <td>
              <button onclick="removeItem('${page}','${category}','${item}')">Remove</button>
            </td>
          </tr>`;
        }
      }
    }
  }
  html += '</table>';
  container.innerHTML = html;
}

window.addNewItem = function() {
  const page = prompt('Page? (e.g., main.html)');
  const category = prompt('Category?');
  const item = prompt('Item name?');
  if (!page || !category || !item) return;
  if (!allitems[page]) allitems[page] = {};
  if (!allitems[page][category]) allitems[page][category] = {};

  let img = prompt('Image URL? (Upload to Imgur, Google Drive, etc.)');
  let type = prompt('Type "stock" for non single items, or "onhold" for single items:').toLowerCase();
  let newItem = {
    img: img || '',
    price: 0,
    single: false,
    specials: [],
    cosignerName: cosignerName,
    cosignerEmail: cosignerEmail,
    profitSplit: "50/50"
  };
  if (type === 'stock') {
    newItem.stock = 1;
  } else if (type === 'onhold') {
    newItem.onhold = false;
  }

  allitems[page][category][item] = newItem;

  // Save to backend
  fetch(CLOUD_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allitems)
  })
  .then(res => res.text())
  .then(msg => {
    alert('Item added!');
    loadInventory();
  });
};

window.removeItem = function(page, category, item) {
  if (allitems[page] && allitems[page][category] && allitems[page][category][item]) {
    delete allitems[page][category][item];
    // Save to backend
    fetch(CLOUD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allitems)
    })
    .then(res => res.text())
    .then(msg => {
      alert('Item removed!');
      loadInventory();
    });
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
  } else if (field === 'onhold') {
    itemObj.onhold = value;
  } else if (field === 'price' || field === 'stock') {
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
  fetch(CLOUD_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allitems)
  })
  .then(res => res.text())
  .then(msg => alert('Saved!'));
};