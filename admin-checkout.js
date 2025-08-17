function loadStuff() {
    populateCheckoutConsignorDropdown();
    renderCheckoutList();
}

async function populateCheckoutConsignorDropdown() {
  const dropdown = document.getElementById('checkoutConsignorDropdown');
  dropdown.innerHTML = '<option value="">-- Select Consignor --</option>';
  try {
    const res = await fetch('https://labelle-co-server.vercel.app/cosigners');
    const cosigners = await res.json();
    cosigners.forEach(c => {
      const option = document.createElement('option');
      option.value = JSON.stringify({ name: c.name, email: c.email });
      option.textContent = `${c.name} (${c.email})`;
      dropdown.appendChild(option);
    });
  } catch (err) {
    dropdown.innerHTML = '<option value="">Error loading cosigners</option>';
  }
}

let checkoutItems = JSON.parse(localStorage.getItem("adminCheckoutItems") || "[]");

function saveCheckoutItems() {
  localStorage.setItem("adminCheckoutItems", JSON.stringify(checkoutItems));
}

function addCheckoutItem(event) {
  event.preventDefault();
  const name = document.getElementById('checkoutName').value.trim();
  const price = Number(document.getElementById('checkoutPrice').value);
  const qty = Number(document.getElementById('checkoutQty').value);
  let profitSplit = document.getElementById('checkoutProfitSplit').value;
  const cosignerData = JSON.parse(document.getElementById('checkoutConsignorDropdown').value || '{}');
  if (!name || !price || !qty) {
    document.getElementById('checkoutMsg').textContent = "Fill out all fields.";
    return false;
  }
  // If no cosigner, force profitSplit to 100/0
  if (!cosignerData.email) profitSplit = "100/0";
  checkoutItems.push({
    name, price, qty, profitSplit,
    cosignerName: cosignerData.name,
    cosignerEmail: cosignerData.email
  });
  saveCheckoutItems();
  renderCheckoutList();
  document.getElementById('checkoutForm').reset();
  document.getElementById('checkoutMsg').textContent = "";
  return false;
}

function renderCheckoutList() {
  const container = document.getElementById('checkoutList');
  if (!checkoutItems.length) {
    container.innerHTML = '<p>No items added.</p>';
    return;
  }
  let html = `<table>
    <tr>
      <th>Name</th>
      <th>Price</th>
      <th>Quantity</th>
      <th>Profit Split</th>
      <th>Consignor</th>
      <th>Actions</th>
    </tr>`;
  checkoutItems.forEach((item, idx) => {
    html += `<tr>
      <td><input type="text" value="${item.name}" onchange="editCheckoutItem(${idx}, 'name', this.value)"></td>
      <td><input type="number" value="${item.price}" onchange="editCheckoutItem(${idx}, 'price', this.value)"></td>
      <td><input type="number" value="${item.qty}" min="1" onchange="editCheckoutItem(${idx}, 'qty', this.value)"></td>
      <td>
        <select onchange="editCheckoutItem(${idx}, 'profitSplit', this.value)">
          ${["100/0","90/10","80/20","70/30","60/40","50/50","40/60","30/70","20/80","10/90"].map(opt =>
            `<option value="${opt}" ${item.profitSplit === opt ? 'selected' : ''}>${opt}</option>`
          ).join('')}
        </select>
      </td>
      <td>
        <select onchange="editCheckoutItem(${idx}, 'cosigner', this.value)">
          ${getConsignorOptions(item.cosignerName, item.cosignerEmail)}
        </select>
      </td>
      <td>
        <button onclick="removeCheckoutItem(${idx})">Remove</button>
      </td>
    </tr>`;
  });
  html += '</table>';
  container.innerHTML = html;
}

function getConsignorOptions(selectedName, selectedEmail) {
  console.log("Generating cosigner options for:", selectedName, selectedEmail);
  let options = '<option value="">-- Select Consignor --</option>';
  const cosignerDropdown = document.getElementById('checkoutConsignorDropdown');
  for (let i = 1; i < cosignerDropdown.options.length; i++) {
    const val = cosignerDropdown.options[i].value;
    const { name, email } = JSON.parse(val);
    console.log(email)
    options += `<option value="${val}" ${name === selectedName && email === selectedEmail ? 'selected' : ''}>${name} (${email})</option>`;
  }
  return options;
}

function editCheckoutItem(idx, field, value) {
  if (field === 'cosigner') {
    const data = JSON.parse(value || '{}');
    checkoutItems[idx].cosignerName = data.name;
    checkoutItems[idx].cosignerEmail = data.email;
  } else if (field === 'price' || field === 'qty') {
    checkoutItems[idx][field] = Number(value);
  } else {
    checkoutItems[idx][field] = value;
  }
  saveCheckoutItems();
  renderCheckoutList();
}

function removeCheckoutItem(idx) {
  checkoutItems.splice(idx, 1);
  saveCheckoutItems();
  renderCheckoutList();
}

async function startAdminCheckout() {
  if (!checkoutItems.length) {
    document.getElementById('checkoutMsg').textContent = "Add items before checkout.";
    return;
  }
  // Prepare items for Stripe
  const cartItems = checkoutItems.map(item => ({
    name: item.name,
    price: Math.round(item.price * 100),
    quantity: item.qty
  }));
  // Save to localStorage for return.js
  localStorage.removeItem("pendingOrder");
  localStorage.removeItem("completedCart");
  localStorage.setItem("adminCheckoutCart", JSON.stringify({ items: checkoutItems }));

  // Stripe checkout (similar to scanner.html)
  const stripe = Stripe("pk_test_51RUqjwI71UXMKz4PWxaW4fEWQH6TtyqGKb2oC4odsVxJIWsetUL55eU9wos1KQJ1wxxiJgILTsr7fcuvvypP9ZAD00rWNs4Iip"); //UPDATE
  const fetchClientSecret = async () => {
    const response = await fetch("https://labelle-co-server.vercel.app/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems })
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  };

  const checkout = await stripe.initEmbeddedCheckout({
    fetchClientSecret,
  });

  checkout.mount('#checkout');
}