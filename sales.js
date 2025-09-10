const CLOUD_API_URL = 'https://labelle-co-server.vercel.app/cloud';

window.onload = function() {
  // Security check
  const salesPasswordOk = localStorage.getItem('salesPasswordOk');
  if (salesPasswordOk !== 'true') {
    window.location.href = "adminhub.html";
    return;
  }
  loadSalesInventory();
};

function logoutSales() {
  localStorage.removeItem('salesPasswordOk');
  window.location.href = "adminhub.html";
}

let allitems = {};
let currentpage = null;

function loadSalesInventory() {
  fetch(CLOUD_API_URL)
    .then(res => res.json())
    .then(data => {
      allitems = data;
      currentpage = Object.keys(allitems)[0] || null;
      renderSalesInventoryTable();
      populateSalesPageSelector();
    });
}

function populateSalesPageSelector() {
  const container = document.getElementById('salesInventoryTable');
  let html = `<label for="salesPageSelect">Select Page:</label>
    <select id="salesPageSelect" onchange="switchSalesPage(this.value)">
      ${Object.keys(allitems).map(page => `<option value="${page}">${page}</option>`).join('')}
    </select>`;
  container.innerHTML = html + container.innerHTML;
}

window.switchSalesPage = function(page) {
  currentpage = page;
  renderSalesInventoryTable();
};

function renderSalesInventoryTable() {
  const container = document.getElementById('salesInventoryTable');
  if (!allitems[currentpage]) {
    container.innerHTML = '<p>No data for this page.</p>';
    return;
  }
  let html = `<table><tr>
    <th>Category</th>
    <th>Item</th>
    <th>Image</th>
    <th>Price</th>
    <th>Specials</th>
    <th>Stock</th>
    <th>On Hold</th>
    <th>Bought</th>
    <th>Consignor Name</th>
    <th>Consignor Email</th>
    <th>Barcode ID</th>
  </tr>`;

  for (const [category, items] of Object.entries(allitems[currentpage])) {
    for (const [itemKey, details] of Object.entries(items)) {
      html += `<tr>
        <td>${category}</td>
        <td>${itemKey}</td>
        <td>${details.img ? `<img src="${details.img}" alt="preview" style="max-width:60px; max-height:60px;">` : ''}</td>
        <td>$${Number(details.price).toFixed(2)}</td>
        <td>${details.specials ? details.specials.join(', ') : ''}</td>
        <td>${details.stock ?? ''}</td>
        <td>${details.onhold ? 'Yes' : 'No'}</td>
        <td>${details.bought ? 'Yes' : 'No'}</td>
        <td>${details.cosignerName || ''}</td>
        <td>${details.cosignerEmail || ''}</td>
        <td>${details.barcode || ''}</td>
      </tr>`;
    }
  }
  container.innerHTML = html;
}

window.filterSalesInventoryTable = function() {
  const input = document.getElementById("salesInventorySearch");
  const filter = input.value.toLowerCase();
  const table = document.querySelector("#salesInventoryTable table");
  if (!table) return;
  const rows = table.getElementsByTagName("tr");
  for (let i = 1; i < rows.length; i++) {
    const itemCell = rows[i].getElementsByTagName("td")[1];
    if (itemCell) {
      const itemText = itemCell.textContent || itemCell.innerText;
      rows[i].style.display = itemText.toLowerCase().includes(filter) ? "" : "none";
    }
  }
};

window.clearSalesInventorySearch = function() {
  const input = document.getElementById("salesInventorySearch");
  input.value = "";
  filterSalesInventoryTable();
};