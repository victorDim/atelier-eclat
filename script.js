const products = [
  {
    id: 1,
    name: 'Solstice Ring',
    category: 'Engagement',
    price: 4800,
    description: 'A sculptural gold ring featuring a brilliant diamond centerpiece.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
    details: 'Hand-set diamond center stone, pavé shoulders, and a comfort-fit band designed for enduring wear.'
  },
  {
    id: 2,
    name: 'Aurelia Pendant',
    category: 'Necklaces',
    price: 3200,
    description: 'A fluid pendant design with luminous diamond accents and soft movement.',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
    details: 'Crafted in 18k gold with a suspended diamond halo and signature hand-polished finish.'
  },
  {
    id: 3,
    name: 'Velvet Bracelet',
    category: 'Bracelets',
    price: 2750,
    description: 'Polished platinum detailing with an understated, modern silhouette.',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80',
    details: 'Slim-link bracelet with precise articulation and a softly brushed surface for everyday elegance.'
  },
  {
    id: 4,
    name: 'Nocturne Earrings',
    category: 'Earrings',
    price: 1980,
    description: 'Elegant drop earrings with pavé stones and graceful curves.',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80',
    details: 'Lightweight silhouette featuring diamond pavé and an effortless sculptural drop.'
  },
  {
    id: 5,
    name: 'Aurora Cuff',
    category: 'Cuffs',
    price: 5100,
    description: 'A bold cuff featuring a refined brushed finish and gemstone detailing.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
    details: 'Statement cuff with an architectural profile and hand-set gemstone detail for dramatic impact.'
  },
  {
    id: 6,
    name: 'Vesper Tennis Bracelet',
    category: 'Bracelets',
    price: 6400,
    description: 'A radiant tennis bracelet designed for modern glamour and lasting wear.',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
    details: 'Five-row diamond bracelet with secure clasp engineering and luminous brilliance.'
  }
];

const CART_KEY = 'atelier-eclat-cart';
const ACCOUNT_KEY = 'atelier-eclat-account';
const WISHLIST_KEY = 'atelier-eclat-wishlist';
const state = {
  cart: JSON.parse(localStorage.getItem(CART_KEY) || '[]'),
  wishlist: JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]')
};

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const productGrid = document.getElementById('productGrid');
const cartToggle = document.getElementById('cartToggle');
const cartOverlay = document.getElementById('cartOverlay');
const cartDrawer = document.getElementById('cartDrawer');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutMessage = document.getElementById('checkoutMessage');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutStatus = document.getElementById('checkoutStatus');
const checkoutSummary = document.getElementById('checkoutSummary');
const accountForm = document.getElementById('accountForm');
const accountStatus = document.getElementById('accountStatus');
const accountOverview = document.getElementById('accountOverview');
const wishlistItems = document.getElementById('wishlistItems');
const dashboardStats = document.getElementById('dashboardStats');
const dashboardOrders = document.getElementById('dashboardOrders');
const dashboardInquiries = document.getElementById('dashboardInquiries');

function formatPrice(value) {
  return `$${value.toLocaleString()}`;
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
}

function saveWishlist() {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(state.wishlist));
}

function toggleWishlist(id) {
  const productId = Number(id);
  const exists = state.wishlist.includes(productId);
  state.wishlist = exists
    ? state.wishlist.filter((item) => item !== productId)
    : [...state.wishlist, productId];
  saveWishlist();
  renderProducts();
  renderWishlist();
  renderAccountOverview();
}

function renderProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = products.map((product) => `
    <article class="product-card" data-animate>
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-body">
        <div class="product-meta">
          <span>${product.category}</span>
          <span>Limited release</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="product-price">${formatPrice(product.price)}</p>
        <a class="btn btn-secondary wide" href="product-detail.html?id=${product.id}">View details</a>
        <button class="btn btn-secondary wide" type="button" data-wishlist="${product.id}">${state.wishlist.includes(product.id) ? 'Saved' : 'Save for later'}</button>
        <button class="btn btn-primary wide" type="button" data-add="${product.id}">Add to cart</button>
      </div>
    </article>
  `).join('');
}

function renderCart() {
  if (!cartItems || !cartTotal || !cartCount) return;
  cartCount.textContent = state.cart.reduce((total, item) => total + item.quantity, 0);
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatPrice(total);

  if (state.cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty. Select a piece to begin your private consultation.</p>';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;
  cartItems.innerHTML = state.cart.map((item) => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <div>${formatPrice(item.price)} × ${item.quantity}</div>
      </div>
      <button type="button" data-remove="${item.id}">Remove</button>
    </div>
  `).join('');
}

function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const title = document.getElementById('detailTitle');
  const description = document.getElementById('detailDescription');
  const imageWrap = document.getElementById('detailImageWrap');
  const content = document.getElementById('detailContent');
  const addButton = document.getElementById('detailAdd');

  if (title) title.textContent = product.name;
  if (description) description.textContent = product.details;
  if (imageWrap) imageWrap.innerHTML = `<img src="${product.image}" alt="${product.name}" />`;
  if (content) content.innerHTML = `
    <div class="detail-grid">
      <div class="checkout-card">
        <h2>Why clients love it</h2>
        <p>${product.description}</p>
        <p>Crafted with a dedicated private consultation, secure insured delivery, and styling support from our concierge team.</p>
      </div>
      <div class="checkout-card">
        <h2>Highlights</h2>
        <ul>
          <li>Exceptional material quality</li>
          <li>Personalized styling guidance</li>
          <li>Private reservation support</li>
        </ul>
      </div>
    </div>
  `;
  if (addButton) addButton.addEventListener('click', () => addToCart(product.id));
  const wishlistButton = document.getElementById('detailWishlist');
  if (wishlistButton) {
    wishlistButton.textContent = state.wishlist.includes(product.id) ? 'Saved for later' : 'Save for later';
    wishlistButton.addEventListener('click', () => {
      toggleWishlist(product.id);
      wishlistButton.textContent = state.wishlist.includes(product.id) ? 'Saved for later' : 'Save for later';
    });
  }
}

function renderCheckoutSummary() {
  if (!checkoutSummary) return;
  if (state.cart.length === 0) {
    checkoutSummary.innerHTML = '<p>Your cart is empty. Return to the collection to select a piece.</p>';
    return;
  }
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  checkoutSummary.innerHTML = `
    <div class="cart-items">
      ${state.cart.map((item) => `<div class="cart-item"><div><strong>${item.name}</strong><div>${formatPrice(item.price)} × ${item.quantity}</div></div><div>${formatPrice(item.price * item.quantity)}</div></div>`).join('')}
    </div>
    <div class="cart-total"><span>Grand total</span><strong>${formatPrice(total)}</strong></div>
  `;
}

function renderWishlist() {
  if (!wishlistItems) return;
  if (state.wishlist.length === 0) {
    wishlistItems.innerHTML = '<p>No saved pieces yet. Tap “Save for later” to build a wishlist.</p>';
    return;
  }
  wishlistItems.innerHTML = state.wishlist.map((productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return '';
    return `<div class="account-card"><strong>${product.name}</strong><p>${product.category} · ${formatPrice(product.price)}</p></div>`;
  }).join('');
}

function renderAccountOverview() {
  if (!accountOverview) return;
  const account = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || '{}');
  if (!account.name) {
    accountOverview.innerHTML = '<p>No account activity yet. Create an account to save your wishlist and reservations.</p>';
    renderWishlist();
    return;
  }
  accountOverview.innerHTML = `
    <div class="account-card">
      <h3>${account.name}</h3>
      <p>${account.email}</p>
      <p>Preferred concierge: Private Studio</p>
      <p>Next milestone: Reservation confirmation within 24 hours</p>
    </div>
  `;
  renderWishlist();
}

async function renderDashboard() {
  if (!dashboardStats || !dashboardOrders || !dashboardInquiries) return;
  try {
    const response = await fetch('/api/dashboard');
    const data = await response.json();
    dashboardStats.innerHTML = `
      <div class="account-card">
        <strong>${data.summary?.orders || 0}</strong>
        <p>Reservations</p>
      </div>
      <div class="account-card">
        <strong>${data.summary?.inquiries || 0}</strong>
        <p>Inquiries</p>
      </div>
      <div class="account-card">
        <strong>${data.summary?.notifications || 0}</strong>
        <p>Notifications</p>
      </div>
    `;
    dashboardOrders.innerHTML = (data.orders || []).map((order) => `
      <div class="account-card">
        <strong>${order.customer?.name || 'Guest'}</strong>
        <p>${order.items?.length || 0} item(s) · ${formatPrice(order.total || 0)}</p>
      </div>
    `).join('');
    dashboardInquiries.innerHTML = (data.inquiries || []).map((inquiry) => `
      <div class="account-card">
        <strong>${inquiry.name || 'Guest'}</strong>
        <p>${inquiry.email || 'No email'} · ${inquiry.message || ''}</p>
      </div>
    `).join('');
  } catch (error) {
    dashboardStats.innerHTML = '<p>Dashboard data is temporarily unavailable.</p>';
  }
}

function addToCart(id) {
  const product = products.find((item) => item.id === Number(id));
  if (!product) return;
  const existing = state.cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((item) => item.id !== Number(id));
  saveCart();
  renderCart();
  renderCheckoutSummary();
}

function openCart() {
  cartOverlay.classList.add('open');
  cartDrawer.classList.add('open');
}

function closeCartDrawer() {
  cartOverlay.classList.remove('open');
  cartDrawer.classList.remove('open');
}

function animateOnScroll() {
  document.querySelectorAll('[data-animate]').forEach((element, index) => {
    element.animate([
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 500,
      delay: index * 80,
      fill: 'forwards'
    });
  });
}

form?.addEventListener('submit', async function (event) {
  event.preventDefault();
  const button = this.querySelector('button');
  const data = new FormData(this);
  const payload = {
    name: data.get('name')?.toString().trim() || '',
    email: data.get('email')?.toString().trim() || '',
    message: data.get('message')?.toString().trim() || '',
    company: data.get('company')?.toString().trim() || ''
  };

  if (!payload.name || !payload.email || !payload.message || payload.company) {
    formStatus.textContent = 'Please complete the form correctly before submitting.';
    return;
  }

  button.disabled = true;
  button.textContent = 'Submitting...';
  formStatus.textContent = 'Submitting your request securely...';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Unable to submit request.');
    }

    formStatus.textContent = result.message || 'Your request has been received.';
    this.reset();
  } catch (error) {
    formStatus.textContent = error.message || 'Submission failed. Please try again later.';
  } finally {
    button.disabled = false;
    button.textContent = 'Request a Consultation';
  }
});

checkoutForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (state.cart.length === 0) {
    checkoutStatus.textContent = 'Your cart is empty. Add a piece to continue.';
    return;
  }

  const data = new FormData(checkoutForm);
  const provider = data.get('provider')?.toString() || 'mock';
  const payload = {
    customer: {
      name: data.get('name')?.toString().trim() || '',
      email: data.get('email')?.toString().trim() || ''
    },
    payment: {
      cardLast4: data.get('card')?.toString().replace(/\D/g, '').slice(-4) || '',
      expiry: data.get('expiry')?.toString().trim() || '',
      cvc: data.get('cvc')?.toString().trim() || '',
      provider
    },
    items: state.cart,
    total: state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  };

  checkoutStatus.textContent = 'Preparing your reservation...';

  try {
    const paymentResponse = await fetch('/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: payload.total,
        currency: 'USD',
        customer: payload.customer,
        provider
      })
    });
    const paymentResult = await paymentResponse.json();
    if (!paymentResponse.ok) throw new Error(paymentResult.error || 'Payment setup failed.');

    payload.payment.providerStatus = paymentResult.status;
    payload.payment.providerReference = paymentResult.providerReference;
    checkoutStatus.textContent = paymentResult.message || 'Payment provider is ready.';

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Reservation failed.');
    checkoutStatus.textContent = `${result.message || 'Reservation confirmed.'} Provider: ${paymentResult.provider}`;
    state.cart = [];
    saveCart();
    renderCart();
    renderCheckoutSummary();
    checkoutForm.reset();
  } catch (error) {
    checkoutStatus.textContent = error.message || 'Reservation could not be processed.';
  }
});

accountForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(accountForm);
  const account = {
    name: data.get('name')?.toString().trim() || '',
    email: data.get('email')?.toString().trim() || ''
  };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  accountStatus.textContent = 'Welcome back. Your account is ready.';
  renderAccountOverview();
});

productGrid?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  const wishlistButton = event.target.closest('[data-wishlist]');
  if (button) addToCart(button.getAttribute('data-add'));
  if (wishlistButton) toggleWishlist(wishlistButton.getAttribute('data-wishlist'));
});

cartItems?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (button) removeFromCart(button.getAttribute('data-remove'));
});

cartToggle?.addEventListener('click', openCart);
cartOverlay?.addEventListener('click', closeCartDrawer);
closeCart?.addEventListener('click', closeCartDrawer);
checkoutBtn?.addEventListener('click', () => {
  if (state.cart.length === 0) {
    checkoutMessage.textContent = 'Add a piece to begin your reservation.';
    return;
  }
  window.location.href = 'checkout.html';
});

window.addEventListener('load', () => {
  renderProducts();
  renderCart();
  renderCheckoutSummary();
  renderAccountOverview();
  renderProductDetail();
  renderWishlist();
  animateOnScroll();
  if (dashboardStats) {
    renderDashboard();
    window.setInterval(renderDashboard, 5000);
  }
});
