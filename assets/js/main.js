/**
 * MelaninGold Organic — main.js
 * Shared utilities, nav, shop renderer, product detail renderer, checkout.
 * Must be loaded LAST (after sheets.js, products.js, cart.js; admin.js only on admin pages).
 * Depends on: sheets.js, products.js, cart.js
 */

window.MG = window.MG || {};

window.MG_CONFIG = {
  googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbydRyD70RHqDa67KfadQWpsktlB7XnMS4WKcaUkyomqsTfOc9dMq2qeM5a2QiLd-8UEHw/exec',
  whatsappNumber: '255767954679',
  ...(window.MG_CONFIG || {})
};

/* ============================================================
   UTILS
   ============================================================ */
MG.Utils = {

  /** Format a TZS price */
  fmtPrice(n) {
    return 'Sh ' + Number(n).toLocaleString('en-US');
  },

  /** Show a toast notification */
  toast(msg, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' toast--error' : '');
    t.setAttribute('role', 'status');
    const icon = type === 'error'
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    t.innerHTML = icon + ' ' + msg;
    container.appendChild(t);
    /* Animate out */
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(100%)';
      setTimeout(() => t.remove(), 400);
    }, 3200);
  },

  /** Debounce a function */
  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  /** Resolve asset path prefix based on current page depth */
  pathPrefix() {
    return window.location.pathname.includes('/pages/') ? '../' : '';
  },

  setError(field, message) {
    if (!field) return;
    const group = field.closest('.form-group');
    const error = group?.querySelector('.form-error');
    field.classList.toggle('is-invalid', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) {
      error.textContent = message || '';
      error.hidden = !message;
    }
  },

  validateRequired(fields) {
    let valid = true;
    fields.forEach(({ el, label }) => {
      const empty = !el?.value.trim();
      this.setError(el, empty ? `${label} is required.` : '');
      if (empty) valid = false;
    });
    return valid;
  },

  async submitLead(payload) {
    /* Prefer MG.Sheets if loaded, else fall back to direct fetch */
    if (window.MG?.Sheets) {
      return MG.Sheets.submitOrder(payload);
    }
    const url = window.MG_CONFIG?.googleAppsScriptUrl;
    if (!url) {
      return { ok: false, error: 'Google Apps Script URL is not configured.' };
    }
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() })
      });
      return { ok: true, opaque: true };
    } catch (error) {
      return { ok: false, error: error.message || 'Submission failed.' };
    }
  }
};

/* ============================================================
   FLOATING WHATSAPP
   ============================================================ */
MG.FloatingWhatsApp = {
  init() {
    if (document.body.classList.contains('admin-page') || window.location.pathname.includes('admin.html')) return;
    if (document.querySelector('.floating-whatsapp')) return;

    const link = document.createElement('a');
    link.className = 'floating-whatsapp';
    link.href = `https://wa.me/${window.MG_CONFIG.whatsappNumber}?text=${encodeURIComponent("Hello MelaninGold! I'd like to make an enquiry.")}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Chat with MelaninGold Organic on WhatsApp');
    link.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.935 1.395 5.608L.057 23.882l6.445-1.313A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 0 1-5.031-1.369l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 0 1 2.106 12C2.106 6.525 6.525 2.106 12 2.106S21.894 6.525 21.894 12 17.475 21.894 12 21.894z"/>
      </svg>
      <span>WhatsApp</span>`;
    document.body.appendChild(link);
  }
};

/* ============================================================
   NAVIGATION
   ============================================================ */
MG.Nav = {
  init() {
    /* Hamburger toggle */
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileMenu = document.querySelector('.nav-mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const expanded = hamburger.getAttribute('aria-expanded') === 'true';
        const open = !expanded;
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        mobileMenu.hidden = !open;
        mobileMenu.classList.toggle('open', open);
      });
      mobileMenu.addEventListener('click', e => {
        if (e.target.closest('a')) {
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.setAttribute('aria-label', 'Open navigation menu');
          mobileMenu.hidden = true;
          mobileMenu.classList.remove('open');
        }
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.setAttribute('aria-label', 'Open navigation menu');
          mobileMenu.hidden = true;
          mobileMenu.classList.remove('open');
        }
      });
    }

    /* Mark active link */
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a, .nav-mobile-menu a').forEach(a => {
      const href = a.getAttribute('href') || '';
      /* Remove leading ../ for comparison */
      const clean = href.replace(/^\.\.\//, '');
      if (path.endsWith(clean) && clean !== '') {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }
};

/* ============================================================
   PRODUCT CARD RENDERER
   ============================================================ */
MG.Render = {

  /** Render a single product card HTML string */
  card(p) {
    const prefix = MG.Utils.pathPrefix();
    const imgSrc = p.image.startsWith('http') || p.image.startsWith('data:')
      ? p.image
      : prefix + p.image.replace('../', '');
    const href = `${prefix}pages/product-${p.slug}.html`;

    return `
      <article class="product-card" data-category="${p.category}"
               data-price="${p.price}" data-name="${p.name.toLowerCase()}">
        <div class="product-card__img-wrap">
          <a href="${href}" aria-label="View ${p.name}">
            <img src="${imgSrc}" alt="${p.name}" loading="lazy"
                 width="600" height="600">
          </a>
        </div>
        <div class="product-card__body">
          <p class="product-card__cat">${p.category}</p>
          <a href="${href}" class="product-card__name">${p.name}</a>
          <p class="product-card__desc">${p.shortDescription}</p>
          <div class="product-card__footer">
            <span class="product-card__price">${MG.Utils.fmtPrice(p.price)}</span>
            <button class="product-card__add"
                    onclick="event.preventDefault(); MG.Cart.addItem(${p.id})"
                    aria-label="Add ${p.name} to cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </article>`;
  },

  /** Render a grid of products into a container */
  grid(containerId, products) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!products.length) {
      el.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <p class="empty-state__msg">No products found</p>
          <p class="empty-state__sub">Try a different filter</p>
        </div>`;
      return;
    }
    el.innerHTML = products.map(p => this.card(p)).join('');
  }
};

/* ============================================================
   SHOP PAGE
   ============================================================ */
MG.Shop = {

  _all: [],

  init() {
    this._all = MG.Products.getAll();
    this.render();

    /* Filter tabs */
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        this.render();
      });
    });

    /* Sort select */
    document.querySelector('.sort-select')?.addEventListener('change', () => this.render());
  },

  render() {
    const catEl  = document.querySelector('.filter-tab.active');
    const sortEl = document.querySelector('.sort-select');
    const cat    = catEl ? catEl.dataset.cat : 'all';
    const sort   = sortEl ? sortEl.value : '';

    let list = this._all.filter(p => cat === 'all' || p.category === cat);

    if (sort === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name-asc')   list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    MG.Render.grid('shop-grid', list);
  }
};

/* ============================================================
   PRODUCT DETAIL PAGE
   ============================================================ */
MG.ProductDetail = {

  init() {
    /* Resolve slug from filename */
    const filename = window.location.pathname.split('/').pop();
    const slug = filename.replace('product-', '').replace('.html', '');
    const p = MG.Products.getBySlug(slug);
    const root = document.getElementById('product-detail-root');
    if (!root) return;

    if (!p) {
      root.innerHTML = `
        <div class="empty-state" style="padding:80px 0;">
          <p class="empty-state__msg">Product not found</p>
          <a href="shop.html" class="btn btn--ghost" style="margin-top:24px;">Back to Shop</a>
        </div>`;
      return;
    }

    /* Update page title & meta */
    document.title = `${p.name} - MelaninGold Organic | ${MG.Utils.fmtPrice(p.price)} TZS`;
    document.querySelector('meta[name="description"]')
      ?.setAttribute('content', p.shortDescription);

    const imgSrc = p.image.startsWith('http') || p.image.startsWith('data:')
      ? p.image
      : '../' + p.image.replace('../', '');

    root.innerHTML = `
      <div class="product-detail">
        <div class="product-detail__img">
          <img src="${imgSrc}" alt="${p.name}" loading="lazy" width="600" height="600">
        </div>
        <div class="product-detail__info">
          <span class="product-detail__badge">Organic &amp; Handmade · ${p.category}</span>
          <h1 class="product-detail__name">${p.name}</h1>
          <p class="product-detail__price">${MG.Utils.fmtPrice(p.price)}</p>
          <div class="divider"></div>
          <p class="product-detail__desc">${p.fullDescription || p.shortDescription}</p>
          <div class="product-detail__tags">
            ${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <div class="qty-control" role="group" aria-label="Quantity">
            <button class="qty-btn" onclick="MG.ProductDetail.changeQty(-1)"
                    aria-label="Decrease quantity">−</button>
            <input class="qty-input" type="number" id="qty-val"
                   value="1" min="1" max="99" aria-label="Quantity">
            <button class="qty-btn" onclick="MG.ProductDetail.changeQty(1)"
                    aria-label="Increase quantity">+</button>
          </div>
          <div class="product-detail__actions">
            <button class="btn btn--gold" onclick="MG.ProductDetail.addToCart(${p.id})">
              Add to Cart
            </button>
            <a class="btn btn--ghost" href="${MG.Cart.productWaUrl(p, 1)}"
               data-product-whatsapp="${p.id}"
               target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.935 1.395 5.608L.057 23.882l6.445-1.313A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 0 1-5.031-1.369l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 0 1 2.106 12C2.106 6.525 6.525 2.106 12 2.106S21.894 6.525 21.894 12 17.475 21.894 12 21.894z"/>
              </svg>
              Order on WhatsApp
            </a>
          </div>
          <p class="product-detail__note">
            Free WhatsApp order confirmation · Handmade in Zanzibar, Tanzania
          </p>
        </div>
      </div>`;

    /* More products */
    const more = MG.Products.getAll().filter(x => x.id !== p.id).slice(0, 4);
    MG.Render.grid('more-products-grid', more);
    document.getElementById('qty-val')?.addEventListener('input', () => this.syncWhatsAppLink());
  },

  changeQty(delta) {
    const input = document.getElementById('qty-val');
    if (input) {
      input.value = Math.max(1, parseInt(input.value || 1) + delta);
      this.syncWhatsAppLink();
    }
  },

  addToCart(id) {
    const qty = parseInt(document.getElementById('qty-val')?.value || 1);
    MG.Cart.addItem(id, qty);
    this.syncWhatsAppLink();
  },

  syncWhatsAppLink() {
    const link = document.querySelector('[data-product-whatsapp]');
    if (!link) return;
    const product = MG.Products.getById(Number(link.dataset.productWhatsapp));
    const qty = parseInt(document.getElementById('qty-val')?.value || 1);
    if (product) link.href = MG.Cart.productWaUrl(product, qty);
  }
};

/* ============================================================
   CHECKOUT PAGE
   ============================================================ */
MG.Checkout = {

  init() {
    const items   = MG.Cart.getItems();
    const emptyEl = document.getElementById('checkout-empty');
    const formEl  = document.getElementById('checkout-form-wrap');

    if (!items.length) {
      emptyEl?.classList.remove('hidden');
      formEl?.classList.add('hidden');
      return;
    }
    emptyEl?.classList.add('hidden');
    formEl?.classList.remove('hidden');

    /* Render order rows */
    const rowsEl = document.getElementById('order-summary-rows');
    const totalEl = document.getElementById('checkout-total');

    if (rowsEl) {
      const prefix = MG.Utils.pathPrefix();
      rowsEl.innerHTML = items.map(item => {
        const p = MG.Products.getById(item.productId);
        if (!p) return '';
        const imgSrc = p.image.startsWith('http') || p.image.startsWith('data:')
          ? p.image
          : prefix + p.image.replace('../', '');
        return `
          <div class="order-row">
            <img class="order-row__img" src="${imgSrc}" alt="${p.name}"
                 loading="lazy" width="56" height="56">
            <div class="order-row__details">
              <div class="order-row__name">${p.name}</div>
              <div class="order-row__qty">Qty: ${item.qty}</div>
            </div>
            <span class="order-row__price">
              ${MG.Utils.fmtPrice(p.price * item.qty)}
            </span>
          </div>`;
      }).join('');
    }

    if (totalEl) totalEl.textContent = MG.Utils.fmtPrice(MG.Cart.getTotal());

    document.querySelectorAll('#checkout-form [required]').forEach(field => {
      field.addEventListener('input', () => MG.Utils.setError(field, ''));
    });

    /* Form submit → Google Sheets first, then optional WhatsApp */
    document.getElementById('checkout-form')
      ?.addEventListener('submit', async e => {
        e.preventDefault();
        if (e.currentTarget.dataset.orderPlaced === 'true') return;
        const name    = document.getElementById('co-name')?.value.trim();
        const phone   = document.getElementById('co-phone')?.value.trim();
        const address = document.getElementById('co-address')?.value.trim();
        const notes   = document.getElementById('co-notes')?.value.trim();
        const valid = MG.Utils.validateRequired([
          { el: document.getElementById('co-name'), label: 'Full name' },
          { el: document.getElementById('co-phone'), label: 'Phone / WhatsApp' },
          { el: document.getElementById('co-address'), label: 'Delivery address' }
        ]);
        if (!valid) {
          MG.Utils.toast('Please fill in all required fields.', 'error');
          return;
        }
        const url = MG.Cart.checkoutWaUrl(name, phone, address, notes);
        const button = e.currentTarget.querySelector('[type="submit"]');
        const originalButtonHtml = button?.innerHTML;
        if (button) {
          button.disabled = true;
          button.textContent = 'Placing Order...';
        }
        const orderItems = items.map(item => {
          const p = MG.Products.getById(item.productId);
          return p ? `${p.name} x${item.qty} (${MG.Utils.fmtPrice(p.price * item.qty)})` : '';
        }).filter(Boolean).join('\n');
        const result = await MG.Utils.submitLead({
          type: 'order',
          customerName: name,
          phone,
          deliveryAddress: address,
          orderItems,
          orderTotal: MG.Cart.getTotal(),
          notes,
          status: 'New'
        });
        const msg = document.getElementById('checkout-submit-message');
        const waLink = document.getElementById('checkout-whatsapp-link');
        if (waLink && url) waLink.href = url;
        if (button) {
          button.disabled = Boolean(result.ok);
          button.innerHTML = result.ok ? 'Order Placed' : originalButtonHtml;
        }
        if (result.ok) {
          MG.Cart.clear();
          e.currentTarget.dataset.orderPlaced = 'true';
        }
        if (msg) {
          msg.hidden = false;
          msg.classList.toggle('form-success--warning', !result.ok);
          if (waLink) waLink.hidden = !result.ok;
          msg.querySelector('p').textContent = result.ok
            ? 'Your order has been placed and your cart has been cleared. You can continue to WhatsApp if you want to confirm directly.'
            : 'We could not submit your order to the order sheet. Please try again, or contact MelaninGold Organic on WhatsApp if the problem continues.';
        }
      });

    /* Clear cart button */
    document.getElementById('btn-clear-cart')
      ?.addEventListener('click', () => {
        MG.Cart.clear();
        window.location.reload();
      });
  }
};

/* ============================================================
   CONTACT PAGE
   ============================================================ */
MG.Contact = {
  init() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('input', () => MG.Utils.setError(field, ''));
    });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('contact-name');
      const phone = document.getElementById('contact-phone');
      const address = document.getElementById('contact-address');
      const notes = document.getElementById('contact-notes');
      const valid = MG.Utils.validateRequired([
        { el: name, label: 'Full name' },
        { el: phone, label: 'Phone / WhatsApp' },
        { el: address, label: 'Delivery address' }
      ]);
      if (!valid) {
        MG.Utils.toast('Please fill in all required fields.', 'error');
        return;
      }
      const button = form.querySelector('[type="submit"]');
      const originalButtonHtml = button?.innerHTML;
      if (button) {
        button.disabled = true;
        button.textContent = 'Submitting...';
      }
      const result = await MG.Utils.submitLead({
        type: 'contact',
        customerName: name.value.trim(),
        phone: phone.value.trim(),
        deliveryAddress: address.value.trim(),
        orderItems: 'Contact enquiry',
        orderTotal: '',
        notes: notes.value.trim(),
        status: 'New'
      });
      if (button) {
        button.disabled = false;
        button.innerHTML = originalButtonHtml;
      }
      const status = document.getElementById('contact-submit-message');
      if (status) {
        status.hidden = false;
        status.classList.toggle('form-success--warning', !result.ok);
        status.querySelector('p').textContent = result.ok
          ? 'Thank you. Your enquiry was submitted and we will contact you shortly.'
          : 'We could not confirm the Google Sheet submission. Please message us on WhatsApp too.';
      }
    });
  }
};

/* ============================================================
   DOM READY — PAGE ROUTER
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* Always init: nav + cart badge + cart drawer */
  MG.Nav.init();
  MG.Cart.init();
  MG.FloatingWhatsApp.init();

  /* Route by page */
  const path = window.location.pathname;

  if (path.endsWith('index.html') || path.endsWith('/')) {
    /* Homepage — featured 4 products */
    MG.Render.grid('featured-grid', MG.Products.getFeatured(4));
  }

  if (path.includes('shop.html')) {
    MG.Shop.init();
  }

  if (path.includes('product-') && path.endsWith('.html')) {
    MG.ProductDetail.init();
  }

  if (path.includes('checkout.html')) {
    MG.Checkout.init();
  }

  if (path.includes('contact.html')) {
    MG.Contact.init();
  }

  if (path.includes('admin.html') && window.MG?.Admin && (!MG.Auth || MG.Auth.isLoggedIn())) {
    MG.Admin.init();
  }
});
