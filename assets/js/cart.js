/**
 * MelaninGold Organic — cart.js
 * Cart logic: state, localStorage persistence, drawer UI, WhatsApp checkout.
 * Depends on: products.js (MG.Products), main.js (MG.Utils)
 * Future: swap localStorage → server cart (same public API unchanged).
 */

window.MG = window.MG || {};

MG.Cart = (function () {

  /* ── Storage key ── */
  const KEY = 'mg_cart_v2';

  /* ── WhatsApp number ── */
  function whatsAppNumber() {
    return window.MG_CONFIG?.whatsappNumber || '255767954679';
  }

  /* ── State ── */
  let _items = []; // [{ productId: Number, qty: Number }]

  /* ── Persistence ── */
  function loadFromStorage() {
    try {
      _items = JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      _items = [];
    }
  }

  function saveToStorage() {
    localStorage.setItem(KEY, JSON.stringify(_items));
  }

  /* ── Badge update ── */
  function updateBadge() {
    const count = _items.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = count;
      el.classList.toggle('visible', count > 0);
    });
  }

  /* ── Drawer UI ── */
  function renderDrawer() {
    const body = document.querySelector('.cart-drawer__body');
    if (!body) return;

    if (_items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <svg class="cart-empty__icon" width="52" height="52" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0
                     0 2-1.61L23 6H6"/>
          </svg>
          <p class="cart-empty__msg">Your cart is empty</p>
          <p class="cart-empty__sub">Add products to begin your order</p>
        </div>`;
      const foot = document.querySelector('.cart-drawer__foot');
      if (foot) foot.style.display = 'none';
      return;
    }

    const foot = document.querySelector('.cart-drawer__foot');
    if (foot) foot.style.display = '';

    /* Resolve image path prefix based on current page location */
    const isInPages = window.location.pathname.includes('/pages/');
    const prefix = isInPages ? '../' : '';

    body.innerHTML = _items.map(item => {
      const p = MG.Products.getById(item.productId);
      if (!p) return '';
      const imgSrc = p.image.startsWith('http')
        ? p.image
        : prefix + p.image.replace('../', '');
      return `
        <article class="cart-item" data-product-id="${p.id}">
          <img class="cart-item__img" src="${imgSrc}"
               alt="${p.name}" loading="lazy" width="72" height="72">
          <div class="cart-item__info">
            <div class="cart-item__name">${p.name}</div>
            <div class="cart-item__price">${MG.Utils.fmtPrice(p.price)}</div>
            <div class="cart-item__qty" role="group" aria-label="Quantity for ${p.name}">
              <button class="cart-item__qty-btn" aria-label="Decrease quantity"
                      onclick="MG.Cart.updateQty(${p.id}, ${item.qty - 1})">−</button>
              <span class="cart-item__qty-num" aria-live="polite">${item.qty}</span>
              <button class="cart-item__qty-btn" aria-label="Increase quantity"
                      onclick="MG.Cart.updateQty(${p.id}, ${item.qty + 1})">+</button>
            </div>
          </div>
          <button class="cart-item__remove" aria-label="Remove ${p.name} from cart"
                  onclick="MG.Cart.removeItem(${p.id})">Remove</button>
        </article>`;
    }).join('');

    const totalEl = document.querySelector('.cart-total-amount');
    if (totalEl) totalEl.textContent = MG.Utils.fmtPrice(getTotal());
  }

  /* ── Total ── */
  function getTotal() {
    return _items.reduce((sum, item) => {
      const p = MG.Products.getById(item.productId);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  }

  /* ── WhatsApp URL builders ── */
  function buildProductWaUrl(product, qty = 1) {
    const text = [
      `Hello MelaninGold! I'd like to order:`,
      ``,
      `${product.name} x${qty} (${MG.Utils.fmtPrice(product.price * qty)})`,
      `Total: ${MG.Utils.fmtPrice(product.price * qty)}`,
      ``,
      `Name:`,
      `Phone:`,
      `Address:`
    ].join('\n');
    return `https://wa.me/${whatsAppNumber()}?text=${encodeURIComponent(text)}`;
  }

  function buildCheckoutWaUrl(name, phone, address, notes) {
    if (!_items.length) return null;

    let msg = `Hello MelaninGold! I'd like to order:\n\n`;
    _items.forEach(item => {
      const p = MG.Products.getById(item.productId);
      if (p) msg += `${p.name} x${item.qty} (${MG.Utils.fmtPrice(p.price * item.qty)})\n`;
    });
    msg += `Total: ${MG.Utils.fmtPrice(getTotal())}`;
    msg += `\n\nName: ${name}`;
    msg += `\nPhone: ${phone}`;
    msg += `\nAddress: ${address}`;
    if (notes) msg += `\nNotes: ${notes}`;

    return `https://wa.me/${whatsAppNumber()}?text=${encodeURIComponent(msg)}`;
  }

  /* ── Init ── */
  loadFromStorage();

  /* ── Public API ── */
  return {

    /** Initialise — call once on DOMContentLoaded */
    init() {
      loadFromStorage();
      updateBadge();

      /* Open drawer */
      document.querySelectorAll('.btn-cart, .js-open-cart').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', 'cart-drawer');
        btn.addEventListener('click', () => this.open());
      });

      /* Close drawer */
      document.querySelectorAll('.cart-overlay, .cart-close').forEach(el =>
        el.addEventListener('click', () => this.close())
      );

      /* Stop click propagation inside drawer */
      document.querySelector('.cart-drawer')
        ?.addEventListener('click', e => e.stopPropagation());

      /* Keyboard close (Escape) */
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') this.close();
      });
    },

    /** Add a product to cart */
    addItem(productId, qty = 1) {
      const idx = _items.findIndex(i => i.productId === productId);
      if (idx >= 0) {
        _items[idx].qty += qty;
      } else {
        _items.push({ productId, qty });
      }
      saveToStorage();
      updateBadge();
      this.open();
      MG.Utils.toast('Added to cart');
    },

    /** Update quantity (0 = remove) */
    updateQty(productId, qty) {
      if (qty <= 0) {
        this.removeItem(productId);
        return;
      }
      const idx = _items.findIndex(i => i.productId === productId);
      if (idx >= 0) _items[idx].qty = qty;
      saveToStorage();
      updateBadge();
      renderDrawer();
    },

    /** Remove product from cart */
    removeItem(productId) {
      _items = _items.filter(i => i.productId !== productId);
      saveToStorage();
      updateBadge();
      renderDrawer();
    },

    /** Clear entire cart */
    clear() {
      _items = [];
      saveToStorage();
      updateBadge();
      renderDrawer();
    },

    /** Get cart total in TZS */
    getTotal,

    /** Get all items (for checkout page) */
    getItems: () => [..._items],

    /** Open cart drawer */
    open() {
      const overlay = document.querySelector('.cart-overlay');
      const drawer = document.querySelector('.cart-drawer');
      overlay?.classList.add('open');
      overlay?.setAttribute('aria-hidden', 'false');
      drawer?.classList.add('open');
      drawer?.setAttribute('aria-hidden', 'false');
      document.querySelectorAll('.btn-cart, .js-open-cart').forEach(btn => {
        btn.setAttribute('aria-expanded', 'true');
      });
      document.body.style.overflow = 'hidden';
      renderDrawer();
      /* Focus management */
      setTimeout(() => {
        document.querySelector('.cart-close')?.focus();
      }, 50);
    },

    /** Close cart drawer */
    close() {
      const overlay = document.querySelector('.cart-overlay');
      const drawer = document.querySelector('.cart-drawer');
      overlay?.classList.remove('open');
      overlay?.setAttribute('aria-hidden', 'true');
      drawer?.classList.remove('open');
      drawer?.setAttribute('aria-hidden', 'true');
      document.querySelectorAll('.btn-cart, .js-open-cart').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
      });
      document.body.style.overflow = '';
    },

    /** Build single-product WhatsApp URL */
    productWaUrl: buildProductWaUrl,

    /** Build full checkout WhatsApp URL */
    checkoutWaUrl: buildCheckoutWaUrl
  };

})();
