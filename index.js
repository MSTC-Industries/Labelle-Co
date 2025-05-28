var allitems = {
  //"" : {"img": "", "price": 1.00 },
  "main.html" : {
    "Furniture" : {
      "Dining Table" : {"img": "Images/diningtablefirst.jpg", "price": 1699 },
      //8 chairs refninished top, 2 leaves
      "Cabinet" : {"img": "Images/salecabinet.jpg", "price": 499 },
      "Night Stands(both!)" : {"img": "Images/nightstands.jpg", "price": 399 },
      "Rustic Bed(Full Size!)" : {"img": "Images/rusticbed.jpg", "price": 399 },
      "Chester Drawer" : {"img": "Images/chesterdrawer.jpg", "price": 399 },
      "Night Stands" : {"img": "Images/nightstands2.jpg", "price": 299 },
      "Dresser" : {"img": "Images/dresser.jpg", "price": 449 },
      "Big Drawer" : {"img": "Images/maxstoragedrawer.jpg", "price": 399 },
      "Small Drawer" : {"img": "Images/small cabinet.jpg", "price": 99 },
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
