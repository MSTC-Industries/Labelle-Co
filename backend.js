const express = require('express');
const nodemailer = require('nodemailer');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const FormData = require('form-data');

const app = express();
app.use(express.json());

//update all these
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwR8h1NyFJgHmXHx8bjd7sBdEmElOpj6jOajwjwIwiLCiHNQaF2DRfauT_rWEIwgdMH/exec';
const ownerEmail = 'mstc.industries.official@gmail.com';
const YOUR_DOMAIN = 'https://mstc-industries.github.io/Labelle-Co/';
const adminURL = `${YOUR_DOMAIN}admin.html`;
const stripe = require('stripe')('sk_test_51RUqjwI71UXMKz4PmfNcNYoW5Ui6wxwhpVciop00STAMnzNPvMHRIZfcfX5KNdkCcHDf8g2506lY6tC3hEe9hLpB00DFPvqjV1');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Check hub password
app.post('/check-hub-password', async (req, res) => {
  const { password } = req.body;
  try {
    const analytics = await getAnalytics();
    if (password === analytics.hubPassword) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(500);
  }
});

// Check sales password
app.post('/check-sales-password', async (req, res) => {
  const { password } = req.body;
  try {
    const analytics = await getAnalytics();
    if (password === analytics.salesPassword) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(500);
  }
});

// Check admin password
app.post('/check-admin-password', async (req, res) => {
  const { password } = req.body;
  try {
    const analytics = await getAnalytics();
    if (password === analytics.adminPassword) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(500);
  }
});

app.get('/cloud', async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL);
    const data = await response.text();
    res.set('Access-Control-Allow-Origin', '*');
    res.type('json').send(data);
  } catch (err) {
    res.status(500).send('Proxy GET error: ' + err.message);
  }
});

app.post('/cloud', async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.text();
    res.set('Access-Control-Allow-Origin', '*');
    res.send(data);
  } catch (err) {
    res.status(500).send('Proxy POST error: ' + err.message);
  }
});

app.get('/orders', async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL + '?type=orders');
    let data = await response.text();
    let orders = [];
    try { orders = JSON.parse(data); } catch { orders = []; }
    orders = await cleanupAndRestoreOrders(orders);
    res.type('json').send(JSON.stringify(orders));
  } catch (err) {
    res.status(500).send('Proxy GET orders error: ' + err.message);
  }
});

app.post('/orders', async (req, res) => {
  try {
    let orders = req.body;
    orders = await cleanupAndRestoreOrders(orders);
    const response = await fetch(APPS_SCRIPT_URL + '?type=orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders)
    });
    const data = await response.text();
    res.send(data);
  } catch (err) {
    res.status(500).send('Proxy POST orders error: ' + err.message);
  }
});

app.post('/notify-owner', async (req, res) => {
  const order = req.body;

  const itemsList = Object.entries(order.items)
    .map(([item, qty]) => `- ${item}: ${qty}`)
    .join('\n');

  const emailBody = `
New Order Received!

Name: ${order.name}
Phone: ${order.phone || 'N/A'}
Email: ${order.email || 'N/A'}

Items:
${itemsList}

-------------------------
Check the admin panel for more details.
${adminURL}`;


  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mstc.industries.official@gmail.com',
      pass: 'uvpfeqssibtxxgdq'
    }
  });

  let mailOptions = {
    from: 'mstc.industries.official@gmail.com',
    to: ownerEmail,
    subject: `New Order from ${order.name} for LabelleCo`,
    text: emailBody
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Notification sent!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to send email');
  }
});


async function loadCosigners() {
  try {
    const response = await fetch(APPS_SCRIPT_URL + '?type=cosigner');
    if (!response.ok) throw new Error('Failed to load cosigners');
    return await response.json();
  } catch (err) {
    return [];
  }
}

async function saveCosigners(cosigners) {
  try {
    const response = await fetch(APPS_SCRIPT_URL + '?type=cosigner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cosigners)
    });
    if (!response.ok) throw new Error('Failed to save cosigners');
    return true;
  } catch (err) {
    return false;
  }
}

app.post('/cosigner-create', async (req, res) => {
  const { email, password, name, address, phone } = req.body;
  if (!email || !password || !name || !address || !phone) return res.status(400).send('Missing fields');
  let cosigners = await loadCosigners();
  if (cosigners.find(c => c.email === email)) return res.status(409).send('Email already exists');
  cosigners.push({ email, password, name, address, phone, "owedProfit": 0.0, "lastLogin": Date.now(), "profitSplit": "50/50" });
  await saveCosigners(cosigners);
  res.status(200).send('Account created');
});

app.post('/cosigner-login', async (req, res) => {
  const { email, password } = req.body;
  let cosigners = await loadCosigners();
  const user = cosigners.find(c => c.email === email && c.password === password);
  if (user) {
    // Update lastLogin to current time
    user.lastLogin = Date.now();
    await saveCosigners(cosigners);
    res.status(200).send('Login successful');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.get('/cosigner-info', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).send('Missing email');
  let cosigners = await loadCosigners();
  const user = cosigners.find(c => c.email === email);
  if (user) {
    res.json({ name: user.name, email: user.email, profitSplit: user.profitSplit || "50/50" });
  } else {
    res.status(404).send('Not found');
  }
});

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

app.post('/create-checkout-session', async (req, res) => {
  const items = req.body.items;
  const line_items = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items,
    mode: 'payment',
    return_url: `${YOUR_DOMAIN}/return.html?session_id={CHECKOUT_SESSION_ID}`,
  });

  res.send({ clientSecret: session.client_secret });
});

app.get('/session-status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    customer_email: session.customer_details.email
  });
});

app.get('/cosigners', async (req, res) => {
  const cosigners = await loadCosigners();
  res.json(cosigners);
});

app.post('/cosigners', async (req, res) => {
  const updated = req.body;
  await saveCosigners(updated);
  res.json({ message: 'Cosigners updated.' });
});

app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    console.log('File received:', req.file);

    if (!req.file) {
      console.error('No image uploaded');
      return res.status(400).json({ error: 'Missing image file' });
    }

    const form = new FormData();
    form.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const base64 = req.file.buffer.toString('base64');
    const response = await fetch(APPS_SCRIPT_URL + '?type=uploadImage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, mimeType: req.file.mimetype, name: req.file.originalname })
    });

    const text = await response.text();
    console.log('Apps Script response:', text);

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (jsonErr) {
      res.status(500).json({ error: 'Invalid JSON from Apps Script', details: text });
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy image upload error', details: err.message });
  }
});

async function cleanupAndRestoreOrders(orders) {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  let inventory = await (await fetch(APPS_SCRIPT_URL)).json(); // Load inventory

  // Filter out expired orders and restore inventory
  const validOrders = [];
  for (const order of orders) {
    if (now - (order.id || 0) < ONE_DAY) {
      validOrders.push(order);
    } else {
      // Restore inventory for expired order
      if (order.orderType === 'buy') {
        for (const [itemName, qty] of Object.entries(order.items)) {
          let found = false;
          for (const page in inventory) {
            for (const category in inventory[page]) {
              if (inventory[page][category][itemName]) {
                let item = inventory[page][category][itemName];
                if ('stock' in item) {
                  item.stock = (item.stock || 0) + qty;
                  if ('itemsBought' in item) {
                    item.itemsBought = Math.max(0, (item.itemsBought || 0) - qty);
                  }
                } else if ('bought' in item) {
                  item.bought = false;
                }
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }
      } else if (order.orderType === 'hold') {
        for (const [itemName, qty] of Object.entries(order.items)) {
          let found = false;
          for (const page in inventory) {
            for (const category in inventory[page]) {
              if (inventory[page][category][itemName]) {
                let item = inventory[page][category][itemName];
                if ('stock' in item) {
                  item.stock = (item.stock || 0) + qty;
                  if ('itemsOnHold' in item) {
                    item.itemsOnHold = Math.max(0, (item.itemsOnHold || 0) - qty);
                  }
                } else if ('onhold' in item) {
                  item.onhold = false;
                }
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }
      }
    }
  }

  // Save updated inventory
  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inventory)
  });

  return validOrders;
}

async function updateAnalytics(order, allitems) {
  // Fetch current analytics
  const analyticsRes = await fetch(APPS_SCRIPT_URL + '?type=analytics');
  let analytics = {};
  try { analytics = await analyticsRes.json(); } catch { analytics = { customers: {}, registerAmount: 0, registerOpened: false, months: {} }; }

  if (!analytics.customers || typeof analytics.customers !== 'object') analytics.customers = {};
  const customerEmail = order.email || '';
  const customerName = order.name || '';
  const customerPhone = order.phone || '';
  if (customerEmail) {
    analytics.customers[customerEmail] = {
      name: customerName,
      phone: customerPhone
    };
  }

  if (!analytics.orderType === 'hold') {
    // Get current month/year key
    const now = new Date(order.id || Date.now());
    const monthKey = `${now.getMonth() + 1}-${now.getFullYear()}`;
    if (!analytics.months[monthKey]) {
      analytics.months[monthKey] = {
        itemsSold: {}
      };
    }

    let itemsSold = analytics.months[monthKey].itemsSold;

    for (const [itemName, qty] of Object.entries(order.items)) {
      let itemObj = null;
      for (const page in allitems) {
        for (const category in allitems[page]) {
          if (allitems[page][category][itemName]) {
            itemObj = allitems[page][category][itemName];
            break;
          }
        }
        if (itemObj) break;
      }
      if (!itemObj) continue;

      // Save profitSplit, cost, taxed in itemsSold
      if (!itemsSold[itemName]) {
        itemsSold[itemName] = { quantity: 0, price: 0.0, date: order.id || Date.now(), cosignerEmail: itemObj.cosignerEmail || '', profitSplit: itemObj.profitSplit || "50/50", cost: itemObj.cost || 0, taxed: !!itemObj.taxed };
      }
      itemsSold[itemName].quantity += qty;
      itemsSold[itemName].price += Number(itemObj.price) * qty;
      itemsSold[itemName].date = order.id || Date.now();
      itemsSold[itemName].cosignerEmail = itemObj.cosignerEmail || '';
      itemsSold[itemName].profitSplit = itemObj.profitSplit || "50/50";
      itemsSold[itemName].cost = itemObj.cost || 0;
      itemsSold[itemName].taxed = !!itemObj.taxed;

      await notifyCosignerOrAdmin(itemObj, qty);
    }

    // Remove profit summary fields
    if (analytics.months[monthKey].totalProfit !== undefined) delete analytics.months[monthKey].totalProfit;
    if (analytics.months[monthKey].adminProfit !== undefined) delete analytics.months[monthKey].adminProfit;
    if (analytics.months[monthKey].cosignerProfits !== undefined) delete analytics.months[monthKey].cosignerProfits;
  }

  // Remove revenue from main analytics object
  if (analytics.revenue !== undefined) delete analytics.revenue;

  // Save analytics back to Apps Script
  await fetch(APPS_SCRIPT_URL + '?type=analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(analytics)
  });
}

app.post('/update-analytics', async (req, res) => {
  const { order, allitems } = req.body;
  if (!order || !allitems) return res.status(400).send('Missing order or allitems');
  try {
    await updateAnalytics(order, allitems);
    res.status(200).send('Analytics updated');
  } catch (err) {
    res.status(500).send('Failed to update analytics');
  }
});

app.post('/analytics', async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL + '?type=analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.text();
    res.set('Access-Control-Allow-Origin', '*');
    res.send(data);
  } catch (err) {
    res.status(500).send('Proxy POST analytics error: ' + err.message);
  }
});

app.get('/get-analytics', async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL + '?type=analytics');
    const data = await response.text();
    res.type('json').send(data);
  } catch (err) {
    res.status(500).send('Proxy GET analytics error: ' + err.message);
  }
});

app.post('/send-bulk-email', async (req, res) => {
  const { subject, html, recipients } = req.body;
  if (!subject || !html || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).send('Missing subject, html, or recipients');
  }
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mstc.industries.official@gmail.com',
      pass: 'uvpfeqssibtxxgdq' // Use your app password
    }
  });
  let errors = [];
  for (const email of recipients) {
    let mailOptions = {
      from: ownerEmail,
      to: email,
      subject,
      html
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      errors.push(email + ': ' + err.message);
    }
  }
  if (errors.length === 0) {
    res.status(200).send('All emails sent!');
  } else {
    res.status(500).send('Some errors: ' + errors.join('; '));
  }
});

async function notifyCosignerOrAdmin(item, qty) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'mstc.industries.official@gmail.com', pass: 'uvpfeqssibtxxgdq' }
  });
  const recipient = item.cosignerEmail && item.cosignerEmail !== '' ? item.cosignerEmail : ownerEmail;
  const subject = `Item Sold: ${item.generalName || item.name}`;
  const body = `
    <p>Item <b>${item.generalName || item.name}</b> was sold.</p>
    <p>Quantity: ${qty}</p>
    <p>Price: ${item.price}</p>
    <p>Profit Split: ${item.profitSplit}</p>
    <p>Consignor: ${item.cosignerName || 'N/A'} (${item.cosignerEmail || 'N/A'})</p>
  `;
  await transporter.sendMail({ from: ownerEmail, to: recipient, subject, html: body });
}

app.post('/cosigner-add-item-email', async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'mstc.industries.official@gmail.com', pass: 'uvpfeqssibtxxgdq' }
  });
  const subject = `Cosigner Added Item: ${req.body.itemName}`;
  const body = `
    <p>Cosigner <b>${req.body.cosignerName}</b> (${req.body.cosignerEmail}) added item <b>${req.body.itemName}</b>.</p>
  `;
  await transporter.sendMail({ from: 'mstc.industries.official@gmail.com', to: ownerEmail, subject, html: body });
  res.status(200).send('Item added and admin notified.');
});

app.post('/admin-change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const analytics = await getAnalytics();
    if (oldPassword !== analytics.adminPassword) return res.status(401).send('Incorrect password');
    analytics.adminPassword = newPassword;
    await saveAnalytics(analytics);
    res.send('Password updated');
  } catch {
    res.status(500).send('Failed to update password');
  }
});

app.post('/hub-change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const analytics = await getAnalytics();
    if (oldPassword !== analytics.hubPassword) return res.status(401).send('Incorrect password');
    analytics.hubPassword = newPassword;
    await saveAnalytics(analytics);
    res.send('Password updated');
  } catch {
    res.status(500).send('Failed to update password');
  }
});

// Change sales password
app.post('/sales-change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const analytics = await getAnalytics();
    if (oldPassword !== analytics.salesPassword) return res.status(401).send('Incorrect password');
    analytics.salesPassword = newPassword;
    await saveAnalytics(analytics);
    res.send('Password updated');
  } catch {
    res.status(500).send('Failed to update password');
  }
});

app.post('/cosigner-change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  let cosigners = await loadCosigners();
  const user = cosigners.find(c => c.email === email && c.password === oldPassword);
  if (!user) return res.status(401).send('Incorrect credentials');
  user.password = newPassword;
  await saveCosigners(cosigners);
  res.send('Password updated');
});

app.get('/cosigner-analytics', async (req, res) => {
  const { email } = req.query;
  const analyticsRes = await fetch(APPS_SCRIPT_URL + '?type=analytics');
  const analytics = await analyticsRes.json();
  let totalProfit = 0;
  let itemsSold = [];
  for (const month of Object.values(analytics.months || {})) {
    totalProfit += month.cosignerProfits[email] || 0;
    for (const [itemName, itemData] of Object.entries(month.itemsSold || {})) {
      if (itemData.cosignerEmail === email) {
        itemsSold.push({ itemName, ...itemData });
      }
    }
  }
  res.json({ totalProfit, itemsSold });
});

// Get current register state
app.get('/get-register', async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL + '?type=analytics');
    let analytics = await response.json();
    if (analytics.registerAmount === undefined) analytics.registerAmount = 0;
    if (analytics.registerOpened === undefined) analytics.registerOpened = false;
    res.json({
      registerAmount: analytics.registerAmount,
      registerOpened: analytics.registerOpened
    });
  } catch (err) {
    res.status(500).send('Failed to load register data');
  }
});

// Toggle register open/close (password required)
app.get('/toggle-register', async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL + '?type=analytics');
    let analytics = await response.json();
    analytics.registerOpened = !analytics.registerOpened;
    await fetch(APPS_SCRIPT_URL + '?type=analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analytics)
    });
    res.json({ registerOpened: analytics.registerOpened });
  } catch {
    res.status(500).send('Error toggling register');
  }
});

// Add money
app.post('/add-money', async (req, res) => {
  const { amount, person } = req.body;
  if (typeof amount !== 'number' || amount < 0) return res.status(400).send('Invalid amount');
  try {
    const response = await fetch(APPS_SCRIPT_URL + '?type=analytics');
    let analytics = await response.json();
    analytics.registerAmount = (analytics.registerAmount || 0) + amount;

    // Record action
    if (!Array.isArray(analytics.registerActions)) analytics.registerActions = [];
    analytics.registerActions.push({
      person: person || 'UNKNOWN',
      date: Date.now(),
      amount: amount
    });

    await fetch(APPS_SCRIPT_URL + '?type=analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analytics)
    });
    res.sendStatus(200);
  } catch {
    res.status(500).send('Error adding money');
  }
});

// Remove money
app.post('/remove-money', async (req, res) => {
  const { amount, person } = req.body;
  try {
    const response = await fetch(APPS_SCRIPT_URL + '?type=analytics');
    let analytics = await response.json();
    if (typeof amount !== 'number' || amount < 0 || amount > analytics.registerAmount) {
      return res.status(400).send('Invalid amount');
    }
    analytics.registerAmount -= amount;

    // Record action (amount negative for removal)
    if (!Array.isArray(analytics.registerActions)) analytics.registerActions = [];
    analytics.registerActions.push({
      person: person || 'UNKNOWN',
      date: Date.now(),
      amount: -amount
    });

    await fetch(APPS_SCRIPT_URL + '?type=analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analytics)
    });
    res.sendStatus(200);
  } catch {
    res.status(500).send('Error removing money');
  }
});

async function getAnalytics() {
  const response = await fetch(APPS_SCRIPT_URL + '?type=analytics');
  return await response.json();
}

// Helper to save analytics JSON
async function saveAnalytics(analytics) {
  await fetch(APPS_SCRIPT_URL + '?type=analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(analytics)
  });
}

module.exports = app;

app.listen(3000, () => console.log('Proxy running at http://localhost:3000'));