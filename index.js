var allitems = {
  //"" : {"img": "", "price": 1.00 },
  "main.html" : {
    "Tables and desks" : {
      "Dining Table" : {"img": "Images/diningtablefirst.jpg", "price": 1699 },
      //8 chairs refninished top, 2 leaves

      //table pads in leather case 8 chair 2 leaves
      "Wine&Cabinet" : {"img": "Images/wineandcabindet.jpg", "price": 449 },
      "Side table" : {"img": "Images/sidetable.jpg", "price": 199 },
      
      //welded no squeec no screws
      
      "French Blue Desk" : {"img": "Images/antiquebluetable.jpg", "price": 389 },
      "Queen Bed" : {"img": "Images/queenbed.jpg", "price": 599 },
      
      
      
      
      "Writing Desk" : {"img": "Images/writingdesk.jpg", "price": 299 },
      //bamboo chair
      
      
      "Coffee Table" : {"img": "Images/coffeetable.jpg", "price": 399 },
      
      "White Coffee Table" : {"img": "Images/coffeetblwhite.jpg", "price": 299 },
      
      "Wooden Dinner Table" : {"img": "Images/woodentable.jpg", "price": 1299 },
      //leaves
      
      "Small Table" : {"img": "Images/smalltable.jpg", "price": 1895 },
      
      
      
    },
    "Cabinets" : {
        "Cabinet" : {"img": "Images/salecabinet.jpg", "price": 499 },
      "Skinny Cabinets" : {"img": "Images/smallcabs.jpg", "price": 299 },
      "Night Stands(both!)" : {"img": "Images/nightstands.jpg", "price": 399 },
      "Two Drawer Cabinet" : {"img": "Images/2layercab.jpg", "price": 299 },
      "Regency Style Dresser" : {"img": "Images/regencystyledresser.jpg", "price": 549 },
      "Five layer Cabinet" : {"img": "Images/5layercab.jpg", "price": 299 },
      "Big Blue Cabinet" : {"img": "Images/bigbluecab.jpg", "price": 399 },
      "Blue Bookshelf" : {"img": "Images/smallbluecab.jpg", "price": 499 },
      "Beutifal Cabinet" : {"img": "Images/bigbeutifalcabinet.jpg", "price": 529 },
      "Green Chest" : {"img": "Images/bigbeutifalchest.jpg", "price": 499 },
      "Hand made bookshelf" : {"img": "Images/handmadebookshelf.jpg", "price": 399 },
      "Red China Hutch" : {"img": "Images/redcabinet.jpg", "price": 249 },
      "Tall Blue Cabinet" : {"img": "Images/TallblueCabinet.jpg", "price": 549 },
      //Original Bamboo
      "Ballerina cabinet" : {"img": "Images/ballerinacab.jpg", "price": 349 },
      "Wardrobe" : {"img": "Images/Wardrobe.jpg", "price": 399 },
      "Chester Drawer" : {"img": "Images/chesterdrawer.jpg", "price": 399 },
      "Night Stands" : {"img": "Images/nightstands2.jpg", "price": 299 },
      "Dresser" : {"img": "Images/dresser.jpg", "price": 449 },
      "Big Drawer" : {"img": "Images/maxstoragedrawer.jpg", "price": 399 },
      "Small Drawer" : {"img": "Images/small cabinet.jpg", "price": 99 },
      //"3 drawer night stand" : {"img": "Images/3drawer.jpg", "price": 399 },
      "Wine&Cabinet" : {"img": "Images/wineandcabindet.jpg", "price": 449 },
      "Grated Night Stand(2x)" : {"img": "Images/gratenightstand.jpg", "price": 399 },
      "Dresser" : {"img": "Images/large dresser.jpg", "price": 489 },
      "White Chester Drawers" : {"img": "Images/chesterdrawer2.jpg", "price": 399 },
      "Lingerie chest" : {"img": "Images/Tallcabinet2.jpg", "price": 299 },
      "Large Belgian Cabinet" : {"img": "Images/bigwoodenboy.jpg", "price": 1395 },
      "Tall Cabinet" : {"img": "Images/tallcabinet.jpg", "price": 299 },
      "Wine&Cabinet" : {"img": "Images/wineandcabindet.jpg", "price": 449 },
    },
    "Beds" : {
        "Rustic Bed(Full Size!)" : {"img": "Images/rusticbed.jpg", "price": 399 },
        "King Bed" : {"img": "Images/Kingbed.jpg", "price": 599 },
        "Queen Bed" : {"img": "Images/queenbed2.jpg", "price": 695 },
        "Iron king bed" : {"img": "Images/ironking.jpg", "price": 795 },
    },
    "Other Items" : {
        "Squash Memory Books" : {"img": "Images/squashmemorybooks.jpg", "price": 22 },
      "Geometry Towels" : {"img": "Images/geotowels.jpg", "price": 22 },
      "Lamp" : {"img": "Images/lamp.jpg", "price": 75.95 },
    },
  },
}

var totalprice = 0;
var toggle = 0;

function ready() {
  document.getElementById("searchback").style.display = "none";
}

function toggleCart() {
    const cartPanel = document.getElementById('cart-panel');
    cartPanel.classList.toggle('open');

    toggle = toggle + 1;
}

function addToCart(button) {
    const parentElement = button.parentElement;
    var cart = document.getElementById("cartItems");

    var count = getChildById(parentElement, "quantity");
    var title = getChildById(parentElement, "name");
    var multi = getChildById(parentElement, "v");

    var pv = count.value;
    var multiv = multi.getAttribute("value");

    pv = pv * multiv;
    pv = Math.round(pv*100)/100;
    totalprice = totalprice + pv;

    cart.querySelectorAll("*").forEach(function(node) {
      var text = getChildById(node, "text");
      if (text != null && text.value == title.innerText) {
        totalprice -= text.name
        node.remove();
      }
    })
    totalprice = Math.round(totalprice*100)/100;

    if(pv != 0){
      var name = title.innerText;
      var cartitem = document.createElement("div");
      var text = document.createElement("p");
      var removebutton = document.createElement("button");
      var quantity = document.createElement("input");

      quantity.type = "number";
      quantity.id = "quantity";
      quantity.name = multiv;
      quantity.value = count.value;

      text.innerHTML = name + ": $"+ pv;
      text.id = "text";
      text.name = pv;
      text.value = name;

      removebutton.textContent = "remove";
      removebutton.id = "remove";

      cart.appendChild(cartitem);
      cartitem.appendChild(text);
      cartitem.appendChild(quantity);
      cartitem.appendChild(removebutton);

      quantity.addEventListener("input", () => {updateCartItem(cartitem)});

      removebutton.addEventListener("click", () => {
        cartitem.remove();
        totalprice -= text.name;
        totalprice = Math.round(totalprice*100)/100;
        document.getElementById("totalAmount").innerHTML = "Total: $"+totalprice;
       });
    }

    document.getElementById("totalAmount").innerHTML = "Total: $"+totalprice;
}

function updateCartItem(item) {
  var quantity = getChildById(item, "quantity");
  var newprice = quantity.name * quantity.value
  var text = getChildById(item, "text");
  text.innerHTML = text.value + ": $"+ newprice

  totalprice -= text.name
  totalprice += newprice
  text.name = newprice
  totalprice = Math.round(totalprice*100)/100;

  document.getElementById("totalAmount").innerHTML = "Total: $"+totalprice;
}

function loadPage(page) {
    fetch(page)
      .then(response => {
        if (!response.ok) {
          throw new Error("Page not found");
        }
        return response.text();
      })
      .then(data => {
        document.getElementById("pagestuff").innerHTML = data;

        addcards(getChildById(document.getElementById("pagestuff"), "c"), allitems[page]);
      })
      .catch(error => {
        console.error(error);
        document.getElementById("pagestuff").innerHTML = "<p>Error loading page</p>";
      });
}

function getChildById(parentElement, id) {
    const child = parentElement.querySelector(`#${id}`);
    return child;
}

function search(searchinput = document.getElementById("searchbox").value) {
  document.querySelectorAll(".card").forEach(function(node) {
    var title = getChildById(node, "name").innerText;
    if (title.toLowerCase().includes(searchinput.toLowerCase())) {
      node.style.display = "block"
    } else {
      node.style.display = "none"
    }
  
    document.getElementById("searchback").style.display = "block";
});
}

function searchback() {
  search("");
  document.getElementById("searchback").style.display = "none";
  document.getElementById("searchbox").value = "";
}

function addcards(self, items) {
  for (category in items) {
      var title = document.createElement("h1");
      title.innerHTML = category;
      title.className = 'categorytitle'
      var container = document.createElement("div");
      container.className = "category";

      console.log(self);

      self.appendChild(title);
      self.appendChild(container);

      for (itemkey in items[category]) {
          var item = document.createElement("div");
          item.className = "card";

          item.innerHTML = "\
              <img src='" + items[category][itemkey].img + "' alt='Food Image'>\
              <div class='info'>\
                <h2 id='name'>" + itemkey + "</h2>\
                <p value = '" + items[category][itemkey].price + "' id='v'>$" + items[category][itemkey].price + " per item</p>\
                <div class='quantity-selector'>\
                    <label for='quantity'>Quantity: </label>\
                    <input type='number' id='quantity' name='quantity' min='0' max='20' value='0'>\
                </div>\
                <button onclick='addToCart(this)' id='add'>Add to Cart</button>\
              </div>";
          container.appendChild(item);
      }
  }
}
function addcards(self, items) {
  for (category in items) {
      var title = document.createElement("h1");
      title.innerHTML = category;
      title.className = 'categorytitle';
      var container = document.createElement("div");
      container.className = "category";

      self.appendChild(title);
      self.appendChild(container);

      for (itemkey in items[category]) {
          var item = document.createElement("div");
          item.className = "card";

          // Define an array of positive qualities
          var qualities = ["Fresh Ingredients", "Chef’s Recommendation", "Gluten-Free", "Best Seller", "Locally Sourced"];

          // Create a section for checkmarks
          var checkmarkSection = "<div class='checkmarks'>";
          qualities.forEach(quality => {
              checkmarkSection += "<p>✅ " + quality + "</p>";
          });
          checkmarkSection += "</div>";

          item.innerHTML = "\
              <img src='" + items[category][itemkey].img + "' alt='Food Image'>\
              " + checkmarkSection + " \
              <div class='info'>\
                <h2 id='name'>" + itemkey + "</h2>\
                <p value = '" + items[category][itemkey].price + "' id='v'>$" + items[category][itemkey].price + " per item</p>\
                <div class='quantity-selector'>\
                    <label for='quantity'>Quantity: </label>\
                    <input type='number' id='quantity' name='quantity' min='0' max='20' value='0'>\
                </div>\
                <button onclick='addToCart(this)' id='add'>Add to Cart</button>\
              </div>";
          container.appendChild(item);
      }
  }
}
