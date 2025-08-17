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
      returntype = "scanner.html"
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
        for (const [itemName, qty] of Object.entries(completedCart.items)) {
          for (const page in allitems) {
            for (const category in allitems[page]) {
              const item = allitems[page][category][itemName];
              if (item) {
                const price = Number(item.price);
                const [_, cosignerPercentStr] = item.profitSplit?.split('/') ?? ['50', '50'];
                const cosignerPercent = Number(cosignerPercentStr);
                const profit = price * cosignerPercent / 100 * qty;
                const email = item.cosignerEmail;
                emailToProfit[email] = (emailToProfit[email] || 0) + profit;
              }
            }
          }
        }

        await fetch('https://labelle-co-server.vercel.app/update-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: completedCart,
            allitems: allitems
          })
        });

        // Mutate inventory
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
    } else if (adminCheckoutCartStr) {
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
        try { analytics = await analyticsRes.json(); } catch { analytics = { revenue: 0.0, customers: {}, months: {} }; }
        if (!analytics.months) analytics.months = {};
        if (!analytics.months[monthKey]) {
          analytics.months[monthKey] = {
            totalProfit: 0.0,
            adminProfit: 0.0,
            cosignerProfits: {},
            itemsSold: {}
          };
        }
        analytics.revenue = (analytics.revenue || 0) + totalProfit;
        analytics.months[monthKey].totalProfit += totalProfit;
        analytics.months[monthKey].adminProfit += adminProfit;
        for (const [email, profit] of Object.entries(cosignerProfits)) {
          analytics.months[monthKey].cosignerProfits[email] = (analytics.months[monthKey].cosignerProfits[email] || 0) + profit;
        }
        // Add items sold
        for (const item of adminCheckoutCart.items) {
          if (!analytics.months[monthKey].itemsSold[item.name]) {
            analytics.months[monthKey].itemsSold[item.name] = {
              quantity: 0,
              price: 0.0,
              date: now,
              cosignerEmail: item.cosignerEmail || ''
            };
          }
          analytics.months[monthKey].itemsSold[item.name].quantity += item.qty;
          analytics.months[monthKey].itemsSold[item.name].price += Number(item.price) * item.qty;
          analytics.months[monthKey].itemsSold[item.name].date = now;
          analytics.months[monthKey].itemsSold[item.name].cosignerEmail = item.cosignerEmail || '';
        }
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
    }
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