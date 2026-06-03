/**
 * MelaninGold Organic — admin.js
 * Admin portal: Auth guard · CRUD for products · Stats · Modal · Image upload.
 * Depends on: products.js (MG.Products), main.js (MG.Utils)
 */

window.MG = window.MG || {};

/* Auth is handled entirely by auth.js (inline overlay system).
   See auth.js for login / session / logout / password-change logic. */

MG.Admin = (function () {

  /* ── Internal: current edit state ── */
  let _editingId = null;
  let _initialized = false;

  /* ── Stat bar ── */
  function updateStats() {
    const all    = MG.Products.getAll();
    const prices = all.map(p => p.price);
    const cats   = [...new Set(all.map(p => p.category))];

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('stat-total',   all.length);
    set('stat-range',   `${MG.Utils.fmtPrice(Math.min(...prices))} – ${MG.Utils.fmtPrice(Math.max(...prices))}`);
    set('stat-cats',    cats.length);
    set('stat-status',  'Live');
  }

  /* ── Product grid ── */
  function renderGrid() {
    const grid = document.getElementById('admin-grid');
    if (!grid) return;

    const all = MG.Products.getAll();

    if (!all.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <p class="empty-state__msg">No products yet</p>
          <p class="empty-state__sub">Click "Add Product" to get started</p>
        </div>`;
      return;
    }

    grid.innerHTML = all.map(p => {
      const prefix = window.MG?.Utils?.pathPrefix ? MG.Utils.pathPrefix() : '../';
      const imgSrc = p.image
        ? (p.image.startsWith('data:') || p.image.startsWith('http')
            ? p.image
            : prefix + p.image.replace('../', ''))
        : '';
      return `
        <article class="admin-card" data-id="${p.id}">
          <div class="admin-card__img">
            ${imgSrc
              ? `<img src="${imgSrc}" alt="${p.name}" loading="lazy" width="320" height="320">`
              : `<div class="admin-card__img-placeholder" aria-hidden="true">📦</div>`}
          </div>
          <div class="admin-card__body">
            <div class="admin-card__cat">${p.category}</div>
            <div class="admin-card__name">${p.name}</div>
            <div class="admin-card__price">${MG.Utils.fmtPrice(p.price)}</div>
          </div>
          <div class="admin-card__actions">
            <button class="admin-card__btn" onclick="MG.Admin.openEditModal(${p.id})"
                    aria-label="Edit ${p.name}">Edit</button>
            <button class="admin-card__btn admin-card__btn--delete"
                    onclick="MG.Admin.deleteProduct(${p.id})"
                    aria-label="Delete ${p.name}">Delete</button>
          </div>
        </article>`;
    }).join('');
  }

  /* ── Modal helpers ── */
  function openModal() {
    document.getElementById('product-modal')?.classList.add('open');
    /* Reset preview */
    const prev = document.getElementById('upload-preview');
    if (prev) { prev.src = ''; prev.classList.remove('show'); }
    document.getElementById('current-image-url').value = '';
    /* Focus first field */
    setTimeout(() => document.getElementById('form-name')?.focus(), 80);
  }

  function closeModal() {
    document.getElementById('product-modal')?.classList.remove('open');
    document.getElementById('product-form')?.reset();
    _editingId = null;
  }

  function populateForm(p) {
    document.getElementById('form-product-id').value  = p.id;
    document.getElementById('form-name').value        = p.name;
    document.getElementById('form-price').value       = p.price;
    document.getElementById('form-category').value    = p.category;
    document.getElementById('form-description').value = p.fullDescription || '';
    document.getElementById('form-tags').value        = (p.tags || []).join(', ');
    document.getElementById('current-image-url').value= p.image || '';

    if (p.image) {
      const prefix = window.MG?.Utils?.pathPrefix ? MG.Utils.pathPrefix() : '../';
      const src = p.image.startsWith('data:') || p.image.startsWith('http')
        ? p.image
        : prefix + p.image.replace('../', '');
      const prev = document.getElementById('upload-preview');
      if (prev) { prev.src = src; prev.classList.add('show'); }
    }
  }

  /* ── Form submit handler ── */
  function handleSubmit(e) {
    e.preventDefault();

    const name  = document.getElementById('form-name').value.trim();
    const price = parseInt(document.getElementById('form-price').value);
    const cat   = document.getElementById('form-category').value;
    const desc  = document.getElementById('form-description').value.trim();
    const tags  = document.getElementById('form-tags').value
                    .split(',').map(t => t.trim()).filter(Boolean);
    const image = document.getElementById('current-image-url').value || '';

    if (!name || !price || !cat) {
      MG.Utils.toast('Please fill in Name, Price, and Category.', 'error');
      return;
    }

    const data = {
      name, price, category: cat,
      fullDescription: desc,
      shortDescription: desc.substring(0, 90) + (desc.length > 90 ? '…' : ''),
      tags, image
    };

    if (_editingId) {
      MG.Products.update(_editingId, data);
      MG.Utils.toast('Product updated');
      /* Sync to Google Sheets */
      if (window.MG?.Sheets) {
        MG.Sheets.syncProduct('update', { id: _editingId, ...data });
      }
    } else {
      const newProduct = MG.Products.add(data);
      MG.Utils.toast('Product added');
      /* Sync to Google Sheets */
      if (window.MG?.Sheets) {
        MG.Sheets.syncProduct('add', newProduct || data);
      }
    }

    closeModal();
    renderGrid();
    updateStats();
  }

  /* ── Public API ── */
  return {

    /** Init admin page — call on DOMContentLoaded */
    init() {
      if (_initialized) return;
      _initialized = true;
      renderGrid();
      updateStats();

      const form = document.getElementById('product-form');
      form?.addEventListener('submit', handleSubmit);

      /* Reset button */
      document.getElementById('btn-reset')?.addEventListener('click', () => {
        if (!confirm('Reset all products to original seed data? Custom products will be removed.')) return;
        MG.Products.reset();
        renderGrid();
        updateStats();
        MG.Utils.toast('Products reset to defaults');
      });

      /* Close modal on overlay click */
      document.getElementById('product-modal')
        ?.addEventListener('click', e => {
          if (e.target === e.currentTarget) closeModal();
        });

      /* Close modal on Escape */
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
      });
    },

    /** Open Add Product modal */
    openAddModal() {
      _editingId = null;
      document.getElementById('modal-title').textContent = 'Add Product';
      document.getElementById('product-form')?.reset();
      openModal();
    },

    /** Open Edit modal for a product */
    openEditModal(id) {
      const p = MG.Products.getById(id);
      if (!p) return;
      _editingId = id;
      document.getElementById('modal-title').textContent = 'Edit Product';
      populateForm(p);
      openModal();
    },

    /** Delete a product */
    deleteProduct(id) {
      const p = MG.Products.getById(id);
      if (!p) return;
      if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
      MG.Products.remove(id);
      renderGrid();
      updateStats();
      MG.Utils.toast(`"${p.name}" deleted`);
      /* Sync deletion to Google Sheets */
      if (window.MG?.Sheets) {
        MG.Sheets.syncProduct('delete', { id: p.id, name: p.name });
      }
    },

    /** Handle image file upload → base64 preview */
    handleImageUpload(input) {
      const file = input.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        MG.Utils.toast('Image must be under 10 MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        document.getElementById('current-image-url').value = e.target.result;
        const prev = document.getElementById('upload-preview');
        if (prev) { prev.src = e.target.result; prev.classList.add('show'); }
      };
      reader.readAsDataURL(file);
    },

    closeModal
  };

})();
