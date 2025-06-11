var allitems = {
  /*'main.html' : {
    'Tables and Desks' : {
      'Dining Table' : {'img': 'Images/diningtablefirst.jpg', 'price': 1699, 'single' : true, 'specials' : ['pads in leather case', '8 chairs', '2 leaves']},
      'Wine&Cabinet' : {'img': 'Images/wineandcabindet.jpg', 'price': 449, 'single' : true, 'specials' : []},
      'Side table' : {'img': 'Images/sidetable.jpg', 'price': 199, 'single' : true, 'specials' : ['welded/no screws', 'no sqeak']},
      'French Blue Desk' : {'img': 'Images/antiquebluetable.jpg', 'price': 389, 'single' : true, 'specials' : []},
      'Writing Desk' : {'img': 'Images/writingdesk.jpg', 'price': 299, 'single' : true, 'specials' : ['bamboo chair']},
      'Coffee Table' : {'img': 'Images/coffeetable.jpg', 'price': 399, 'single' : true, 'specials' : []},
      'White Coffee Table' : {'img': 'Images/coffeetblwhite.jpg', 'price': 299, 'single' : true, 'specials' : []},
      'Wooden Dinner Table' : {'img': 'Images/woodentable.jpg', 'price': 1299, 'single' : true, 'specials' : ['leaves']},
      'Small Table' : {'img': 'Images/smalltable.jpg', 'price': 1895, 'single' : true, 'specials' : []},
  },
    'Cabinets' : {
      'Cabinet' : {'img': 'Images/salecabinet.jpg', 'price': 499, 'single' : true, 'specials' : []},
      'Skinny Cabinets' : {'img': 'Images/smallcabs.jpg', 'price': 299, 'single' : true, 'specials' : []},
      'Night Stands(both!)' : {'img': 'Images/nightstands.jpg', 'price': 399, 'single' : true, 'specials' : []},
      'Two Drawer Cabinet' : {'img': 'Images/2layercab.jpg', 'price': 299, 'single' : true, 'specials' : []},
      'Regency Style Dresser' : {'img': 'Images/regencystyledresser.jpg', 'price': 549, 'single' : true, 'specials' : []},
      'Five layer Cabinet' : {'img': 'Images/5layercab.jpg', 'price': 299, 'single' : true, 'specials' : []},
      'Big Blue Cabinet' : {'img': 'Images/bigbluecab.jpg', 'price': 399, 'single' : true, 'specials' : []},
      'Blue Bookshelf' : {'img': 'Images/smallbluecab.jpg', 'price': 499, 'single' : true, 'specials' : []},
      'Beutifal Cabinet' : {'img': 'Images/bigbeutifalcabinet.jpg', 'price': 529, 'single' : true, 'specials' : []},
      'Green Chest' : {'img': 'Images/bigbeutifalchest.jpg', 'price': 499, 'single' : true, 'specials' : []},
      'Hand made bookshelf' : {'img': 'Images/handmadebookshelf.jpg', 'price': 399, 'single' : true, 'specials' : []},
      'Red China Hutch' : {'img': 'Images/redcabinet.jpg', 'price': 249, 'single' : true, 'specials' : []},
      'Tall Blue Cabinet' : {'img': 'Images/TallblueCabinet.jpg', 'price': 549, 'single' : true, 'specials' : ['original bamboo']},
      'Ballerina cabinet' : {'img': 'Images/ballerinacab.jpg', 'price': 349, 'single' : true, 'specials' : []},
      'Wardrobe' : {'img': 'Images/Wardrobe.jpg', 'price': 399, 'single' : true, 'specials' : []},
      'Chester Drawer' : {'img': 'Images/chesterdrawer.jpg', 'price': 399, 'single' : true, 'specials' : []},
      'Night Stands' : {'img': 'Images/nightstands2.jpg', 'price': 299, 'single' : true, 'specials' : []},
      'Dresser' : {'img': 'Images/dresser.jpg', 'price': 449, 'single' : true, 'specials' : []},
      'Big Drawer' : {'img': 'Images/maxstoragedrawer.jpg', 'price': 399, 'single' : true, 'specials' : []},
      'Small Drawer' : {'img': 'Images/small cabinet.jpg', 'price': 99, 'single' : true, 'specials' : []},
      //'3 drawer night stand' : {'img': 'Images/3drawer.jpg', 'price': 399, 'single' : true, 'specials' : []},
      'Wine&Cabinet' : {'img': 'Images/wineandcabindet.jpg', 'price': 449, 'single' : true, 'specials' : []},
      'Grated Night Stand(2x)' : {'img': 'Images/gratenightstand.jpg', 'price': 399, 'single' : true, 'specials' : []},
      'Dresser' : {'img': 'Images/large dresser.jpg', 'price': 489, 'single' : true, 'specials' : []},
      'White Chester Drawers' : {'img': 'Images/chesterdrawer2.jpg', 'price': 399, 'single' : true, 'specials' : []},
      'Lingerie chest' : {'img': 'Images/Tallcabinet2.jpg', 'price': 299, 'single' : true, 'specials' : []},
      'Large Belgian Cabinet' : {'img': 'Images/bigwoodenboy.jpg', 'price': 1395, 'single' : true, 'specials' : []},
      'Tall Cabinet' : {'img': 'Images/tallcabinet.jpg', 'price': 299, 'single' : true, 'specials' : []},
      'Wine&Cabinet' : {'img': 'Images/wineandcabindet.jpg', 'price': 449, 'single' : true, 'specials' : []},
  },
    'Beds' : {
      'Rustic Bed(Full Size!)' : {'img': 'Images/rusticbed.jpg', 'price': 399, 'single' : true, 'specials' : []},
      'King Bed' : {'img': 'Images/Kingbed.jpg', 'price': 599, 'single' : true, 'specials' : []},
      'Queen Bed' : {'img': 'Images/queenbed2.jpg', 'price': 695, 'single' : true, 'specials' : []},
      'Iron king bed' : {'img': 'Images/ironking.jpg', 'price': 795, 'single' : true, 'specials' : []},
      'Queen Bed' : {'img': 'Images/queenbed.jpg', 'price': 599, 'single' : true, 'specials' : []},
  },
    'Other Items' : {
      'Squash Memory Books' : {'img': 'Images/squashmemorybooks.jpg', 'price': 22, 'single' : false, 'specials' : []},
      'Geometry Towels' : {'img': 'Images/geotowels.jpg', 'price': 22, 'single' : false, 'specials' : []},
      'Lamp' : {'img': 'Images/lamp.jpg', 'price': 75.95, 'single' : false, 'specials' : []},
    },
  },*/
}

var orders = {}

//var stripe = Stripe("pk_test_TYooMQauvdEDq54NiTphI7jx"); //for payment, deal w/ this later
fetchData();

let totalprice = 0;

function ready() {
  document.getElementById("searchback").style.display = "none";
}

function toggleCart() {
  document.getElementById("cart-panel").classList.toggle("open");
}

function getChildById(parent, id) {
  return parent?.querySelector(`#${id}`) || null;
}

function addToCart(button, single) {
  const parent = button.parentElement;
  const cart = document.getElementById("cartItems");
  const title = getChildById(parent, "name");
  const priceElem = getChildById(parent, "v");
  let quantity = single ? 1 : getChildById(parent, "quantity")?.value || 0;
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
    addcards(getChildById(document.getElementById("pagestuff"), "c"), allitems[page]);
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

      const checkmarks = itemDetails.specials.map(quality => `<p>✅ ${quality}</p>`).join("");
      const checkmarkSection = `<div class='checkmarks'>${checkmarks}</div>`;

      const itemHTML = `
        <img src='${itemDetails.img}' alt='Product Image'>
        ${checkmarkSection}
        <div class='info'>
          <h2 id='name'>${itemkey}</h2>
          <p value='${itemDetails.price}' id='v'>$${itemDetails.price} per item</p>
          ${!itemDetails.single ? `
            <div class='quantity-selector'>
              <label for='quantity'>Quantity: </label>
              <input type='number' id='quantity' name='quantity' min='0' max='20' value='0'>
            </div>` : ""}
          <button onclick='addToCart(this, ${itemDetails.single})' id='add'>Add to Cart</button>
        </div>`;

      item.innerHTML = itemHTML;
      container.appendChild(item);
    });
  });
}

function fetchData() {
  fetch('http://localhost:3000/get-data')
    .then(response => response.json())
    .then(data => {console.log(data); allitems = data})
    .catch(error => console.error('Error:', error));
}

function updateData() {
  fetch('http://localhost:3000/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allitems)
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
}

function updateOrderData() {
  fetch('http://localhost:3000/update-order-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders)
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
}

function pay() {
  if (totalprice === 0) { return; }
  const cart = document.getElementById("cartItems");
  cart.querySelectorAll("*").forEach(node => {
    const text = getChildById(node, "text");
    if (text) { 
      orders[text.value] = text.dataset.price / getItemObject(text.value).price;
    }
  });
  console.log(orders)
}

function getItemObject(itemName) {
  for (const page in allitems) {
    for (const category in allitems[page]) {
      if (allitems[page][category][itemName]) {
        return allitems[page][category][itemName];
      }
    }
  }
  return null; // Not found
}