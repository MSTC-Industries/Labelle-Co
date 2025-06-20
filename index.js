var allitems = {}

var order = {
  "name" : "",
  "phone" : "",
  "email" : "",
  "items" : {}
}

let totalprice = 0;
let currentpage = "";

//var stripe = Stripe("pk_test_TYooMQauvdEDq54NiTphI7jx"); //for payment, deal w/ this later

function ready() {
  document.getElementById("searchback").style.display = "none";
}

function toggleCart() {
  document.getElementById("cart-panel").classList.toggle("open");
  document.getElementById("error-message").innerHTML = "";
}

function getChildById(parent, id) {
  return parent?.querySelector(`#${id}`) || null;
}

function addToCart(button, single) {
  const parent = button.parentElement;
  const cart = document.getElementById("cartItems");
  const title = getChildById(parent, "name");
  const priceElem = getChildById(parent, "v");
  let quantityInput = getChildById(parent, "quantity");
  let max = quantityInput ? Number(quantityInput.max) : 1;
  let quantity = single ? 1 : Math.min(Number(quantityInput?.value || 0), max);
  if (quantityInput && quantityInput.value > max) quantityInput.value = max;
  const pricePer = priceElem?.getAttribute("value") || 1;

  let itemTotal = quantity * pricePer;
  itemTotal = Math.round(itemTotal * 100) / 100;
  totalprice += itemTotal;

  // Remove existing item if present
  cart.querySelectorAll("*").forEach(node => {
    const text = getChildById(node, "text");
    if (text && text.value === title.innerText) {
      totalprice -= text.dataset.price;
      node.remove();
    }
  });

  totalprice = Math.round(totalprice * 100) / 100;

  if (itemTotal !== 0) {
    const cartitem = document.createElement("div");
    const text = document.createElement("p");
    text.innerHTML = `${title.innerText}: $${itemTotal}`;
    text.id = "text";
    text.dataset.price = itemTotal;
    text.value = title.innerText;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.id = "remove";

    cartitem.appendChild(text);

    if (!single) {
      const quantityInput = document.createElement("input");
      quantityInput.type = "number";
      quantityInput.id = "quantity";
      quantityInput.min = 1;
      quantityInput.max = max;
      quantityInput.dataset.multiplier = pricePer;
      quantityInput.value = getChildById(parent, "quantity")?.value || 0;
      cartitem.appendChild(quantityInput);
      quantityInput.addEventListener("input", () => updateCartItem(cartitem));
    }

    cartitem.appendChild(removeButton);
    cart.appendChild(cartitem);

    removeButton.addEventListener("click", () => {
      totalprice -= parseFloat(text.dataset.price);
      totalprice = Math.round(totalprice * 100) / 100;
      document.getElementById("totalAmount").innerHTML = `Total: $${totalprice}`;
      cartitem.remove();
    });
  }

  document.getElementById("totalAmount").innerHTML = `Total: $${totalprice}`;
}

function updateCartItem(item) {
  const quantity = getChildById(item, "quantity");
  const max = Number(quantity.max);
  if (quantity.value > max) quantity.value = max;
  const newPrice = quantity.dataset.multiplier * quantity.value;
  const text = getChildById(item, "text");
  text.innerHTML = `${text.value}: $${newPrice}`;
  totalprice -= parseFloat(text.dataset.price);
  totalprice += Number(newPrice);
  text.dataset.price = newPrice;
  totalprice = Math.round(totalprice * 100) / 100;
  document.getElementById("totalAmount").innerHTML = `Total: $${totalprice}`;
}

async function loadPage(page) {
  try {
    const response = await fetch(page);
    if (!response.ok) throw new Error("Page not found");
    const data = await response.text();
    document.getElementById("pagestuff").innerHTML = data;
    currentpage = page;
    await fetchData()
  } catch (error) {
    console.error(error);
    document.getElementById("pagestuff").innerHTML = "<p>Error loading page</p>";
  }
}

function search(searchinput = document.getElementById("searchbox").value) {
  document.querySelectorAll(".card").forEach(node => {
    const title = getChildById(node, "name")?.innerText.toLowerCase();
    node.style.display = title?.includes(searchinput.toLowerCase()) ? "block" : "none";
  });
  document.getElementById("searchback").style.display = searchinput ? "block" : "none";
}

function searchback() {
  search("");
  document.getElementById("searchback").style.display = "none";
  document.getElementById("searchbox").value = "";
}

function addcards(self, items) {
  self.innerHTML = "";
  Object.entries(items).forEach(([category, categoryItems]) => {
    const title = document.createElement("h1");
    title.innerHTML = category;
    title.className = "categorytitle";
    title.id = category;

    const container = document.createElement("div");
    container.className = "category";

    self.appendChild(title);
    self.appendChild(container);

    Object.entries(categoryItems).forEach(([itemkey, itemDetails]) => {
      const item = document.createElement("div");
      item.className = "card";

      // Add green banner if on hold
      let holdBanner = "";
      if (itemDetails.onhold === true) {
        holdBanner = `<div class="hold-banner">On Hold</div>`;
      } else if ('stock' in itemDetails && itemDetails.stock <= itemDetails.itemsOnHold) {
        holdBanner = `<div class="outofstock-banner">All on Hold</div>`;
      }

      const checkmarks = itemDetails.specials.map(quality => `<p>✅ ${quality}</p>`).join("");
      const checkmarkSection = `<div class='checkmarks'>${checkmarks}</div>`;

      const disabled = (itemDetails.onhold === true || ('stock' in itemDetails && itemDetails && itemDetails.stock <= itemDetails.itemsOnHold)) ? "disabled" : "";

      const itemHTML = `
        ${holdBanner}
        <img src='${itemDetails.img}' alt='Product Image'>
        ${checkmarkSection}
        <div class='info'>
          <h2 id='name'>${itemkey}</h2>
          <p value='${itemDetails.price}' id='v'>$${itemDetails.price} per item</p>
          ${!itemDetails.single ? `
            <div class='quantity-selector'>
              <label for='quantity'>Quantity: </label>
              <input type='number' id='quantity' name='quantity' min='0' max='${itemDetails.stock - itemDetails.itemsOnHold}' value='0'>
            </div>` : ""}
          <button onclick='addToCart(this, ${itemDetails.single})' id='add' ${disabled}>Add to Cart</button>
        </div>`;

      item.innerHTML = itemHTML;
      container.appendChild(item);
    });
  });

  populateCategoryDropdown();
}

async function pay(event, orderType) {
  if (event) event.preventDefault();
  if (totalprice === 0) { return; }
  await fetchData();
  const cart = document.getElementById("cartItems");

  order.name = document.getElementById("nameinput").value;
  order.phone = document.getElementById("phone").value;
  order.email = document.getElementById("email").value;
  order.orderType = orderType; // <-- Add orderType to order

  var failed = false;
  var failedItem = "";
  cart.querySelectorAll("*").forEach(node => {
    const text = getChildById(node, "text");
    if (text) { 
      var itemData = getItemObject(text.value)
      var quantity = text.dataset.price / itemData.data.price;

      // Check for stock/hold issues
      if ((('onhold' in itemData.data && itemData.data.onhold == true) || ('stock' in itemData.data && (itemData.data.stock - (itemData.data.itemsOnHold || 0)) < quantity)) && !failed ) { 
        failed = true;
        failedItem = text.value;
      } else {
        order.items[text.value] = quantity;

        if (orderType === "hold") {
          // Place Hold logic
          if ('onhold' in itemData.data) {
            allitems[itemData.page][itemData.category][itemData.item].onhold = true;
          } else if ('stock' in itemData.data) {
            // Add or update itemsOnHold
            let prevOnHold = allitems[itemData.page][itemData.category][itemData.item].itemsOnHold || 0;
            allitems[itemData.page][itemData.category][itemData.item].itemsOnHold = prevOnHold + quantity;
          }
        } else if (orderType === "buy") {
          // Buy logic: remove from inventory
          if ('onhold' in itemData.data) {
            // Remove the item entirely
            delete allitems[itemData.page][itemData.category][itemData.item];
          } else if ('stock' in itemData.data) {
            allitems[itemData.page][itemData.category][itemData.item].stock -= quantity;
            if (allitems[itemData.page][itemData.category][itemData.item].stock <= 0) {
              delete allitems[itemData.page][itemData.category][itemData.item];
            }
          }
        }
      }
    }
  });

  if (failed) {
    document.getElementById("error-message").innerText = 
      `Sorry, the item "${failedItem}" is already on hold or is out of stock and cannot be ordered.`;
    document.getElementById("error-message").style.color = "red";
  } else {
    document.getElementById("error-message").innerText = 
      `Thank you for your order, ${order.name}! Your order will be processed shortly.`;
    document.getElementById("error-message").style.color = "green";
    document.getElementById("cartItems").innerHTML = "";
    totalprice = 0;
    document.getElementById("totalAmount").innerHTML = "Total: $0.00";
    await saveData();

    // Save order to backend
    await submitOrder({...order, items: {...order.items}, orderType: orderType});

    await fetch('https://labelle-co-server.vercel.app/notify-owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    addcards(getChildById(document.getElementById("pagestuff"), "c"), allitems[currentpage]);
  }

  order.items = {};
}

function getItemObject(itemName) {
  for (const page in allitems) {
    for (const category in allitems[page]) {
      if (allitems[page][category][itemName]) {
        return {
          "page" : page,
          "category" : category,
          "item" : itemName,
          "data" : allitems[page][category][itemName]
        };
      }
    }
  }
  return null; // Not found
}

// Load allitems from the cloud
async function fetchData() {
  try {
    const response = await fetch('https://labelle-co-server.vercel.app/cloud');
    const data = await response.json();
    allitems = data;
    addcards(getChildById(document.getElementById("pagestuff"), "c"), allitems[currentpage]);
  } catch (error) {
    console.error('Error fetching items from cloud:', error);
  }
}

// Save allitems to the cloud
async function saveData() {
  try {
    const response = await fetch('https://labelle-co-server.vercel.app/cloud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allitems)
    });
    const data = await response.text();
    console.log('Saved to cloud:', data);
  } catch (error) {
    console.error('Error saving items to cloud:', error);
  }
}

async function submitOrder(newOrder) {
  try {
    const res = await fetch('https://labelle-co-server.vercel.app/orders');
    let orders = await res.json();
    if (!Array.isArray(orders)) orders = [];
    newOrder.id = Date.now();
    newOrder.status = 'pending';
    orders.push(newOrder);
    await fetch('https://labelle-co-server.vercel.app/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders)
    });
    console.log('Order submitted!');
  } catch (error) {
    console.error('Error submitting order:', error);
  }
}

function populateCategoryDropdown() {
  const dropdown = document.getElementById('category-dropdown');
  if (!dropdown) return;
  dropdown.innerHTML = '';
  if (!allitems[currentpage]) return;
  Object.keys(allitems[currentpage]).forEach(category => {
    const a = document.createElement('a');
    a.href = `#${category}`;
    a.textContent = category;
    dropdown.appendChild(a);
  });
}

document.getElementById('cartForm').addEventListener('submit', function(event) {
    event.preventDefault();
    validateContactAndPay(event);
});
 
function validateContactAndPay(event) {
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const cart = document.getElementById("cartItems");
    if (!phone && !email) {
        document.getElementById('error-message').innerText = "Please provide either a phone number or an email.";
        document.getElementById('error-message').style.color = "red";
        event.preventDefault();
        return false;
    }
    // Check if cart is empty
    if (!cart.hasChildNodes() || cart.innerText.trim() === "") {
        document.getElementById('error-message').innerText = "Your cart is empty. Please add at least one item.";
        document.getElementById('error-message').style.color = "red";
        event.preventDefault();
        return false;
    }
    document.getElementById('error-message').innerText = "";
    // Call your pay function
    pay(event);
    return false; // Prevent default form submission, let pay handle it
}