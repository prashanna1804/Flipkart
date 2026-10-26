document.addEventListener('DOMContentLoaded', () => {

  const catItems = document.querySelectorAll('.cat-item');
  const filterLinks = document.querySelectorAll('.filter-list a');

  function setActiveCategory(cat) {
    catItems.forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
    filterLinks.forEach(f => f.classList.toggle('active', f.dataset.cat === cat));
    filterProducts(cat);
  }

  catItems.forEach(item => {
    item.addEventListener('click', () => setActiveCategory(item.dataset.cat));
  });

  filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveCategory(link.dataset.cat);
    });
  });

  function filterProducts(category) {
    document.querySelectorAll('.product-card').forEach(card => {
      const cat = card.dataset.category;
      card.style.display = (category === 'All' || cat === category) ? '' : 'none';
    });
  }

  const sortSelect = document.querySelector('.toolbar select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const grid = document.querySelector('.product-grid');
      const cards = Array.from(grid.querySelectorAll('.product-card'));
      const getPrice = (card) => parseInt(card.querySelector('.price').textContent.replace(/[^\d]/g, ''), 10);

      if (sortSelect.value.includes('Low to high')) {
        cards.sort((a, b) => getPrice(a) - getPrice(b));
      } else if (sortSelect.value.includes('High to low')) {
        cards.sort((a, b) => getPrice(b) - getPrice(a));
      }
      cards.forEach(card => grid.appendChild(card));
    });
  }

  const priceRange = document.getElementById('priceRange');
  const priceLabel = document.getElementById('priceLabel');
  if (priceRange && priceLabel) {
    priceRange.addEventListener('input', () => {
      priceLabel.textContent = `₹${Number(priceRange.value).toLocaleString('en-IN')}`;
      document.querySelectorAll('.product-card').forEach(card => {
        const price = parseInt(card.querySelector('.price').textContent.replace(/[^\d]/g, ''), 10);
        card.style.display = price <= Number(priceRange.value) ? '' : 'none';
      });
    });
  }

  document.querySelectorAll('.heart').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('loved');
      btn.textContent = btn.classList.contains('loved') ? '♥' : '♡';
      if (btn.classList.contains('loved')) showToast('Added to Wishlist');
    });
  });

  let cart = [];

  const cartLink = document.querySelector('.cart-link');
  const cartBadge = document.querySelector('.cart-link .badge');
  const overlay = document.querySelector('.overlay');
  const cartDrawer = document.querySelector('.cart-drawer');
  const closeButton = document.querySelector('.close-button');
  const cartItemsEl = document.querySelector('.cart-items');
  const cartEmptyEl = document.querySelector('.cart-empty');
  const cartFooterEl = document.querySelector('.cart-footer');
  const cartSubtotalEl = document.querySelector('.cart-subtotal');
  const cartCountEl = document.querySelector('.cart-count');

  function openCart(e) {
    if (e) e.preventDefault();
    overlay.classList.add('open');
    cartDrawer.classList.add('open');
  }

  function closeCart() {
    overlay.classList.remove('open');
    cartDrawer.classList.remove('open');
  }

  cartLink && cartLink.addEventListener('click', openCart);
  closeButton && closeButton.addEventListener('click', closeCart);
  overlay && overlay.addEventListener('click', closeCart);

  function renderCart() {
    if (!cartItemsEl) return;

    cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

    if (cart.length === 0) {
      cartEmptyEl.style.display = 'flex';
      cartFooterEl.style.display = 'none';
    } else {
      cartEmptyEl.style.display = 'none';
      cartFooterEl.style.display = 'block';

      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <img class="mini-image" src="${item.img}" alt="${item.name}">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>₹${item.price.toLocaleString('en-IN')}</p>
            <div class="qty">
              <button class="qty-minus" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button class="qty-plus" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove">Remove</button>
          </div>`;

        row.querySelector('.qty-plus').addEventListener('click', () => {
          item.qty += 1;
          renderCart();
        });

        row.querySelector('.qty-minus').addEventListener('click', () => {
          item.qty -= 1;
          if (item.qty <= 0) cart = cart.filter(c => c.id !== item.id);
          renderCart();
        });

        row.querySelector('.remove').addEventListener('click', () => {
          cart = cart.filter(c => c.id !== item.id);
          renderCart();
        });

        cartItemsEl.appendChild(row);
      });
    }

    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

    if (cartBadge) cartBadge.textContent = totalQty;
    if (cartCountEl) cartCountEl.textContent = totalQty;
    if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  }

  document.querySelectorAll('.add-button').forEach(btn => {
    if (btn.classList.contains('full')) return;
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const name = card.querySelector('.product-title').textContent.trim();
      const price = parseInt(card.querySelector('.price').textContent.replace(/[^\d]/g, ''), 10);
      const img = card.querySelector('.product-image img').src;
      const id = name;

      const existing = cart.find(i => i.id === id);
      if (existing) existing.qty += 1;
      else cart.push({ id, name, price, qty: 1, img });

      renderCart();
      showToast(`${name} added to cart`);

      const original = btn.textContent;
      btn.classList.add('added');
      btn.textContent = 'Added ✓';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.textContent = original;
      }, 1200);
    });
  });

  let toastTimer;
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  const dots = document.querySelectorAll('.hero-dots span');
  if (dots.length) {
    let current = 0;
    setInterval(() => {
      dots[current].classList.remove('active');
      current = (current + 1) % dots.length;
      dots[current].classList.add('active');
    }, 2800);
  }

  renderCart();
});
