let returntype = "index.html"

initialize();

async function initialize() {
  document.getElementById('exit').style.display = 'none';

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get('session_id');

  if (sessionId) {
    // Stripe flow
    const response = await fetch(`https://labelle-co-server.vercel.app/session-status?session_id=${sessionId}`);
    const session = await response.json();

    if (session.status == 'open') {
      window.location.replace('index.html');
      return;
    } else if (session.status == 'complete') {
      // Submit the order if it exists in localStorage
      const pendingOrderStr = localStorage.getItem("pendingOrder");
      const completedCartStr = localStorage.getItem("completedCart");
      if (pendingOrderStr) {
        try {
          showLoading();

          const pendingOrder = JSON.parse(pendingOrderStr);

          // Fetch latest allitems and cosigners from the cloud
          let [allitemsRes, cosignersRes] = await Promise.all([
            fetch('https://labelle-co-server.vercel.app/cloud'),
            fetch('https://labelle-co-server.vercel.app/cosigners')
          ]);
          let allitems = await allitemsRes.json();
          let cosigners = await cosignersRes.json();

          await fetch('https://labelle-co-server.vercel.app/update-analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order: pendingOrder,
              allitems: allitems
            })
          });

          // Update bought/itemsBought in allitems
          for (const [itemName, quantity] of Object.entries(pendingOrder.items)) {
            outer: for (const page in allitems) {
              for (const category in allitems[page]) {
                if (allitems[page][category][itemName]) {
                  const itemData = allitems[page][category][itemName];
                  if ('onhold' in itemData) {
                    itemData.bought = true;
                  } else if ('stock' in itemData) {
                    let prevBought = itemData.itemsBought || 0;
                    itemData.itemsBought = prevBought + quantity;
                  }
                  break outer;
                }
              }
            }
          }

          // Calculate profits for consigners
          const emailToProfit = {};
          for (const [itemName, quantity] of Object.entries(pendingOrder.items)) {
            for (const page in allitems) {
              for (const category in allitems[page]) {
                const item = allitems[page][category][itemName];
                if (item) {
                  const price = Number(item.price);
                  const [_, cosignerPercentStr] = item.profitSplit?.split('/') ?? ['50', '50'];
                  const cosignerPercent = Number(cosignerPercentStr);
                  const profit = price * cosignerPercent / 100 * quantity;
                  const email = item.cosignerEmail;
                  emailToProfit[email] = (emailToProfit[email] || 0) + profit;
                }
              }
            }
          }

          // Apply profits to consigners
          cosigners.forEach(c => {
            if (emailToProfit[c.email]) {
              c.owedProfit = (c.owedProfit || 0) + emailToProfit[c.email];
            }
          });

          // Save updated allitems and cosigners to the cloud
          await Promise.all([
            fetch('https://labelle-co-server.vercel.app/cloud', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(allitems)
            }),
            fetch('https://labelle-co-server.vercel.app/cosigners', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cosigners)
            })
          ]);

          // Submit the order using the same logic as index.js
          await submitOrder(pendingOrder);

          // Notify the owner
          await fetch('https://labelle-co-server.vercel.app/notify-owner', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingOrder)
          });

          // Clear order.items and localStorage
          localStorage.removeItem("pendingOrder");
        } catch (err) {
          console.error("Order submission failed:", err);
        } finally {
          hideLoading();
          document.getElementById('message').innerHTML = 'Thank You!';
          document.getElementById('details').innerHTML = `Your payment was successful.<br>
          We appreciate your order and will process it soon.`;
          document.getElementById('exit').style.display = 'block';
        }
      } else if (completedCartStr) {
        await completedCartStrLogic(completedCartStr);
      }
      return;
    }
  }

  // If no sessionId, handle cash/manual checkout
  const completedCartStr = localStorage.getItem("completedCart");
  if (completedCartStr) {
    await completedCartStrLogic(completedCartStr);
  }
}

async function completedCartStrLogic(completedCartStr) {
  returntype = "scanner.html";
      try {
        showLoading();

        const completedCart = JSON.parse(completedCartStr);

        // Fetch latest allitems and cosigners from the cloud
        let [allitemsRes, cosignersRes] = await Promise.all([
          fetch('https://labelle-co-server.vercel.app/cloud'),
          fetch('https://labelle-co-server.vercel.app/cosigners')
        ]);
        let allitems = await allitemsRes.json();
        let cosigners = await cosignersRes.json();

        // Calculate profits for consigners
        const emailToProfit = {};
        // completedCart.items: { itemName: qty }
        // completedCart.manualItems: { barcode: { name, price, profitSplit, cosignerName, cosignerEmail } }
        for (const [itemName, qty] of Object.entries(completedCart.items)) {
          let found = false;
          let itemObj = null;
          // Try to find in inventory
          for (const page in allitems) {
            for (const category in allitems[page]) {
              if (allitems[page][category][itemName]) {
                itemObj = allitems[page][category][itemName];
                found = true;
                break;
              }
            }
            if (found) break;
          }
          // If not found, check manualItems
          if (!itemObj && completedCart.manualItems) {
            // Find manual item by name
            for (const manual of Object.values(completedCart.manualItems)) {
              if (manual.name === itemName) {
                itemObj = manual;
                break;
              }
            }
          }
          if (!itemObj) continue;

          const price = Number(itemObj.price);
          const [_, cosignerPercentStr] = itemObj.profitSplit?.split('/') ?? ['50', '50'];
          const cosignerPercent = Number(cosignerPercentStr);
          const profit = price * cosignerPercent / 100 * qty;
          const email = itemObj.cosignerEmail;
          if (email) {
            emailToProfit[email] = (emailToProfit[email] || 0) + profit;
          }
        }

        // Mutate inventory for items that exist in inventory
        for (const [itemName, qty] of Object.entries(completedCart.items)) {
          let found = false;
          for (const page in allitems) {
            for (const category in allitems[page]) {
              if (allitems[page][category][itemName]) {
                let item = allitems[page][category][itemName];
                if ('stock' in item) {
                  item.stock = Math.max(0, (item.stock || 0) - qty);
                  if ('itemsBought' in item) {
                    item.itemsBought = (item.itemsBought || 0) - qty;
                  }
                } else if ('onhold' in item) {
                  item.bought = true;
                } else {
                  delete allitems[page][category][itemName];
                }
                found = true;
                break;
              }
            }
            if (found) break;
          }
          // If not found, it's a manual item, so do nothing to inventory
        }

        // Apply profits to consigners
        cosigners.forEach(c => {
          if (emailToProfit[c.email]) {
            c.owedProfit = (c.owedProfit || 0) + emailToProfit[c.email];
          }
        });

        const now = Date.now();
        const monthKey = `${new Date(now).getMonth() + 1}-${new Date(now).getFullYear()}`;

        // Fetch current analytics
        const analyticsRes = await fetch('https://labelle-co-server.vercel.app/get-analytics');
        let analytics = await analyticsRes.json();
        if (!analytics.months) analytics.months = {};
        if (!analytics.months[monthKey]) {
          analytics.months[monthKey] = { itemsSold: {} };
        }

        // Add all items (inventory and manual) to analytics
        for (const [itemName, qty] of Object.entries(completedCart.items)) {
          let itemObj = null;
          // Try to find in inventory
          for (const page in allitems) {
            for (const category in allitems[page]) {
              if (allitems[page][category][itemName]) {
                itemObj = allitems[page][category][itemName];
                break;
              }
            }
            if (itemObj) break;
          }
          // If not found, check manualItems
          if (!itemObj && completedCart.manualItems) {
            for (const manual of Object.values(completedCart.manualItems)) {
              if (manual.name === itemName) {
                itemObj = manual;
                break;
              }
            }
          }
          if (!itemObj) continue;

          const isManual = !!(completedCart.manualItems && completedCart.manualItems[itemObj.barcode]);
          const taxedValue = isManual ? true : !!itemObj.taxed;

          if (!analytics.months[monthKey].itemsSold[itemName]) {
            analytics.months[monthKey].itemsSold[itemName] = {
              quantity: 0,
              price: 0.0,
              date: now,
              cosignerEmail: itemObj.cosignerEmail || '',
              profitSplit: itemObj.profitSplit || "50/50",
              cost: itemObj.cost || 0,
              taxed: taxedValue
            };
          }
          analytics.months[monthKey].itemsSold[itemName].quantity += qty;
          analytics.months[monthKey].itemsSold[itemName].price += Number(itemObj.price) * qty;
          analytics.months[monthKey].itemsSold[itemName].date = now;
          analytics.months[monthKey].itemsSold[itemName].cosignerEmail = itemObj.cosignerEmail || '';
          analytics.months[monthKey].itemsSold[itemName].profitSplit = itemObj.profitSplit || "50/50";
          analytics.months[monthKey].itemsSold[itemName].cost = itemObj.cost || 0;
          analytics.months[monthKey].itemsSold[itemName].taxed = taxedValue;
        }

        // Remove profit summary fields
        if (analytics.months[monthKey].totalProfit !== undefined) delete analytics.months[monthKey].totalProfit;
        if (analytics.months[monthKey].adminProfit !== undefined) delete analytics.months[monthKey].adminProfit;
        if (analytics.months[monthKey].cosignerProfits !== undefined) delete analytics.months[monthKey].cosignerProfits;
        if (analytics.revenue !== undefined) delete analytics.revenue;

        // Save analytics
        await fetch('https://labelle-co-server.vercel.app/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analytics)
        });

        // Save updated allitems and cosigners to the cloud
        await Promise.all([
          fetch('https://labelle-co-server.vercel.app/cloud', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allitems)
          }),
          fetch('https://labelle-co-server.vercel.app/cosigners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cosigners)
          })
        ]);

        // Clear localStorage
        localStorage.removeItem("completedCart");
      } catch (err) {
        console.error("Order submission failed:", err);
      } finally {
        hideLoading();
        document.getElementById('message').innerHTML = 'Thank You!';
        document.getElementById('details').innerHTML = `Your payment was successful.<br>
        Thank you for shopping with us!`;
        document.getElementById('exit').style.display = 'block';
      }
}

// --- Duplicated from index.js for standalone use on return.html ---
async function submitOrder(newOrder) {
  showLoading();
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
  } finally {
    hideLoading();
  }
}

function showLoading() {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style = `
      position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:9999;
      background:rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;
      flex-direction:column;transition:opacity 0.3s;
    `;
    overlay.innerHTML = `<div style="font-size:2rem;color:#333;" id="loading-text">Loading...</div>`;
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
  setTimeout(() => overlay.classList.add('active'), 10);
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  setTimeout(() => overlay.style.display = 'none', 300);
}

function exit() {
  window.location.href = returntype;
}

function printReceiptFromCompletedCart(completedCart) {
  // Get date string
  const now = new Date();
  const dateStr = now.toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Build receipt HTML
  let html = `
    <div style="font-family:monospace;max-width:400px;margin:0 auto;">
      <div style="text-align:center;">
        <div style="font-size:1.3em;font-weight:bold;">LaBelle &amp; Co</div>
        <div>${dateStr}</div>
        <div>8906 W. Broad Street Suite J</div>
        <div>Henrico, VA 23294</div>
        <div>804-655-2131</div>
      </div>
      <table style="width:100%;margin-top:18px;border-collapse:collapse;">
        <tr>
          <th style="border-bottom:1px solid #333;text-align:left;">Item</th>
          <th style="border-bottom:1px solid #333;text-align:right;">Qty</th>
          <th style="border-bottom:1px solid #333;text-align:right;">Price</th>
        </tr>
  `;

  // Gather items and manualItems
  let items = [];
  let subtotal = 0;
  let totalTax = 0;

  // Helper: get manual item details by name
  function getManualDetails(name) {
    if (!completedCart.manualItems) return null;
    for (const manual of Object.values(completedCart.manualItems)) {
      if (manual.name === name) return manual;
    }
    return null;
  }

  for (const [itemName, qty] of Object.entries(completedCart.items)) {
    let price = 0, taxed = false, taxAmount = 0;
    let manualDetails = getManualDetails(itemName);
    if (manualDetails) {
      price = Number(manualDetails.price) || 0;
      taxed = manualDetails.taxed !== undefined ? manualDetails.taxed : true;
      taxAmount = taxed ? price * 0.06 * qty : 0;
    } else {
      // Try to get from inventory (allitems not available here, so use taxed=false if not manual)
      price = 0;
      taxed = false;
      taxAmount = 0;
    }
    // If not manual, try to get price from analytics (not available here), so skip tax
    // You can optionally fetch price from server if needed

    // For receipt, show untaxed price
    html += `
      <tr>
        <td>${itemName}</td>
        <td style="text-align:right;">${qty}</td>
        <td style="text-align:right;">$${(price * qty).toFixed(2)}</td>
      </tr>
    `;
    subtotal += price * qty;
    totalTax += taxAmount;
  }

  html += `
      </table>
      <div style="margin-top:18px;">
        <div style="display:flex;justify-content:space-between;">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span>Tax:</span>
          <span>$${totalTax.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:bold;">
          <span>Total:</span>
          <span>$${(subtotal + totalTax).toFixed(2)}</span>
        </div>
      </div>
      <div style="margin-top:30px;text-align:center;font-size:1em;">
        Make sure you love it... All sales are final.
      </div>
    </div>
  `;

  // Open print window
  const printWin = window.open('', '', 'width=500,height=700');
  printWin.document.write(`<html><head><title>Receipt</title></head><body>${html}</body></html>`);
  printWin.document.close();
  printWin.focus();
  printWin.print();
}

// Add this button to your thankyou-container in return.html (after the exit button)
document.addEventListener('DOMContentLoaded', () => {
  const completedCartStr = localStorage.getItem("completedCart");
  if (completedCartStr) {
    const btn = document.createElement('button');
    btn.textContent = "Print Receipt";
    btn.style.marginTop = "1rem";
    btn.onclick = () => printReceiptFromCompletedCart(JSON.parse(completedCartStr));
    document.getElementById('success').appendChild(btn);
  }
});