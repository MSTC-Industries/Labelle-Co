initialize();

let returntype = "index.html"

async function initialize() {
  document.getElementById('exit').style.display = 'none';

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get('session_id');
  const response = await fetch(`https://labelle-co-server.vercel.app/session-status?session_id=${sessionId}`);
  const session = await response.json();

  if (session.status == 'open') {
    window.location.replace('index.html');
  } else if (session.status == 'complete') {
    // Submit the order if it exists in localStorage
    const pendingOrderStr = localStorage.getItem("pendingOrder");
    const completedCartStr = localStorage.getItem("completedCart");
    const adminCheckoutCartStr = localStorage.getItem("adminCheckoutCart");
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

        /* Update analytics (same as before)
        await fetch('https://labelle-co-server.vercel.app/update-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: completedCart,
            allitems: allitems
          })
        });*/

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

          if (!analytics.months[monthKey].itemsSold[itemName]) {
            analytics.months[monthKey].itemsSold[itemName] = {
              quantity: 0,
              price: 0.0,
              date: now,
              cosignerEmail: itemObj.cosignerEmail || '',
              profitSplit: itemObj.profitSplit || "50/50",
              cost: itemObj.cost || 0,
              taxed: !!itemObj.taxed
            };
          }
          analytics.months[monthKey].itemsSold[itemName].quantity += qty;
          analytics.months[monthKey].itemsSold[itemName].price += Number(itemObj.price) * qty;
          analytics.months[monthKey].itemsSold[itemName].date = now;
          analytics.months[monthKey].itemsSold[itemName].cosignerEmail = itemObj.cosignerEmail || '';
          analytics.months[monthKey].itemsSold[itemName].profitSplit = itemObj.profitSplit || "50/50";
          analytics.months[monthKey].itemsSold[itemName].cost = itemObj.cost || 0;
          analytics.months[monthKey].itemsSold[itemName].taxed = !!itemObj.taxed;
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
    } /*else if (adminCheckoutCartStr) {
      returntype = "admin.html";
      try {
        showLoading();
        const adminCheckoutCart = JSON.parse(adminCheckoutCartStr);

        // Fetch cosigners from the cloud
        let cosignersRes = await fetch('https://labelle-co-server.vercel.app/cosigners');
        let cosigners = await cosignersRes.json();

        // Calculate profits for consigners
        const emailToProfit = {};
        let totalProfit = 0;
        let adminProfit = 0;
        const now = Date.now();
        const monthKey = `${new Date(now).getMonth() + 1}-${new Date(now).getFullYear()}`;
        let cosignerProfits = {};

        for (const item of adminCheckoutCart.items) {
          const price = Number(item.price);
          const [adminPercentStr, cosignerPercentStr] = item.profitSplit?.split('/') ?? ['50', '50'];
          const adminPercent = Number(adminPercentStr);
          const cosignerPercent = Number(cosignerPercentStr);
          const profit = price * cosignerPercent / 100 * item.qty;
          const adminCut = price * adminPercent / 100 * item.qty;
          totalProfit += price * item.qty;
          adminProfit += adminCut;
          const email = item.cosignerEmail;
          if (email) { // Only add if cosignerEmail exists
            emailToProfit[email] = (emailToProfit[email] || 0) + profit;
            cosignerProfits[email] = (cosignerProfits[email] || 0) + profit;
          }
        }

        // Apply profits to consigners
        cosigners.forEach(c => {
          if (emailToProfit[c.email]) {
            c.owedProfit = (c.owedProfit || 0) + emailToProfit[c.email];
          }
        });

        // Save updated cosigners to the cloud
        await fetch('https://labelle-co-server.vercel.app/cosigners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cosigners)
        });

        // Update analytics
        // Fetch current analytics
        const res = await fetch('https://labelle-co-server.vercel.app/get-analytics');
        let analyticsRes = await res.json();
        let analytics = {};
        try { analytics = await analyticsRes.json(); } catch { analytics = { customers: {}, registerAmount: 0, registerOpened: false, months: {} }; }
        if (!analytics.months) analytics.months = {};
        if (!analytics.months[monthKey]) {
          analytics.months[monthKey] = {
            itemsSold: {}
          };
        }
        for (const item of adminCheckoutCart.items) {
          if (!analytics.months[monthKey].itemsSold[item.name]) {
            analytics.months[monthKey].itemsSold[item.name] = {
              quantity: 0,
              price: 0.0,
              date: now,
              cosignerEmail: item.cosignerEmail || '',
              profitSplit: item.profitSplit || "50/50",
              cost: item.cost || 0,
              taxed: !!item.taxed
            };
          }
          analytics.months[monthKey].itemsSold[item.name].quantity += item.qty;
          analytics.months[monthKey].itemsSold[item.name].price += Number(item.price) * item.qty;
          analytics.months[monthKey].itemsSold[item.name].date = now;
          analytics.months[monthKey].itemsSold[item.name].cosignerEmail = item.cosignerEmail || '';
          analytics.months[monthKey].itemsSold[item.name].profitSplit = item.profitSplit || "50/50";
          analytics.months[monthKey].itemsSold[item.name].cost = item.cost || 0;
          analytics.months[monthKey].itemsSold[item.name].taxed = !!item.taxed;
        }
        // Remove profit summary fields
        if (analytics.months[monthKey].totalProfit !== undefined) delete analytics.months[monthKey].totalProfit;
        if (analytics.months[monthKey].adminProfit !== undefined) delete analytics.months[monthKey].adminProfit;
        if (analytics.months[monthKey].cosignerProfits !== undefined) delete analytics.months[monthKey].cosignerProfits;
        // Remove revenue from main analytics object
        if (analytics.revenue !== undefined) delete analytics.revenue;
        // Save analytics
        await fetch('https://labelle-co-server.vercel.app/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analytics)
        });

        // Clear localStorage
        localStorage.removeItem("adminCheckoutCart");
        localStorage.removeItem("adminCheckoutItems");
      } catch (err) {
        console.error("Order submission failed:", err);
      } finally {
        hideLoading();
        document.getElementById('message').innerHTML = 'Thank You!';
        document.getElementById('details').innerHTML = `Your payment was successful.<br>
        Thank you for shopping with us!`;
        document.getElementById('exit').style.display = 'block';
      }
    }*/
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