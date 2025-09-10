async function cosignerLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('loginMsg');
  msg.textContent = "Logging in...";
  const res = await fetch('https://labelle-co-server.vercel.app/cosigner-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (res.ok) {
    // Save cosigner info for later use
    localStorage.setItem('cosignerEmail', email);
    // Optionally, fetch cosigner name from backend if needed
    window.location.href = "cosigner.html";
  } else {
    msg.textContent = "Login failed. Please check your credentials.";
  }
  return false;
}

async function cosignerCreate(event) {
  event.preventDefault();
  const email = document.getElementById('createEmail').value;
  const password = document.getElementById('createPassword').value;
  const name = document.getElementById('createName').value;
  const address = document.getElementById('createAddress').value;
  const phone = document.getElementById('createPhone').value;
  const owedProfit = 0.0;
  const msg = document.getElementById('createMsg');
  msg.textContent = "Creating account...";
  const res = await fetch('https://labelle-co-server.vercel.app/cosigner-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, address, phone, owedProfit })
  });
  if (res.ok) {
    localStorage.setItem('cosignerEmail', email);
    localStorage.setItem('cosignerName', name);
    window.location.href = "cosigner.html";
  } else if (res.status === 409) {
    msg.textContent = "That email is already registered. Please use another.";
  } else {
    msg.textContent = "Account creation failed.";
  }
  return false;
}