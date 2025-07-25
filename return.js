initialize();

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
    if (pendingOrderStr) {
      try {
        showLoading();

        const pendingOrder = JSON.parse(pendingOrderStr);

        // Fetch latest allitems from the cloud
        let allitemsRes = await fetch('https://labelle-co-server.vercel.app/cloud');
        let allitems = await allitemsRes.json();

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

        // Save updated allitems to the cloud
        await fetch('https://labelle-co-server.vercel.app/cloud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allitems)
        });

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