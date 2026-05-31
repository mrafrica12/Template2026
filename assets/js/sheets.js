/**
 * MelaninGold Organic — sheets.js
 * Google Apps Script / Google Sheets integration.
 * Handles order capture, admin product sync, and contact form logging.
 *
 * Endpoint: https://script.google.com/macros/s/AKfycby.../exec
 * GET  → {"ok":true,"service":"MelaninGold Organic order capture"}
 * POST → {"ok":true} on success
 *
 * Usage:
 *   MG.Sheets.submitOrder(orderData)   → Promise<{ok, error?}>
 *   MG.Sheets.syncProduct(action, data) → Promise<{ok, error?}>
 *   MG.Sheets.submitContact(data)       → Promise<{ok, error?}>
 */

window.MG = window.MG || {};

MG.Sheets = (function () {

  /* ── Endpoint ── */
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbydRyD70RHqDa67KfadQWpsktlB7XnMS4WKcaUkyomqsTfOc9dMq2qeM5a2QiLd-8UEHw/exec';

  /**
   * Core POST function.
   * Google Apps Script redirects POST → we use no-cors mode or catch the redirect.
   * Since we can't read the redirect response in browser (cross-origin),
   * we fire-and-forget with a timeout fallback — WhatsApp always opens regardless.
   */
  function post(payload) {
    return new Promise(function (resolve) {
      const body = JSON.stringify(payload);

      /* Primary: fetch with no-cors (fire & forget, no response body) */
      fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',         // avoids CORS error; response is opaque
        headers: { 'Content-Type': 'application/json' },
        body: body
      })
      .then(function () {
        /* Opaque response = assumed success (script received it) */
        resolve({ ok: true });
      })
      .catch(function (err) {
        console.warn('[MG.Sheets] POST failed:', err);
        resolve({ ok: false, error: err.message });
      });

      /* Safety timeout — resolve after 8s regardless */
      setTimeout(function () {
        resolve({ ok: true, timeout: true });
      }, 8000);
    });
  }

  /* ── Public API ── */
  return {

    ENDPOINT,

    /**
     * Submit a customer order to Google Sheets.
     * @param {Object} order - { name, phone, address, notes, items[], total, timestamp }
     */
    submitOrder: function (order) {
      const payload = Object.assign({
        action:    'order',
        timestamp: new Date().toISOString(),
        source:    'website'
      }, order);

      console.log('[MG.Sheets] Submitting order:', payload);
      return post(payload);
    },

    /**
     * Log a product change from Admin (add / update / delete).
     * @param {string} action - 'add' | 'update' | 'delete'
     * @param {Object} product - product data
     */
    syncProduct: function (action, product) {
      const payload = {
        action:    'product_' + action,
        timestamp: new Date().toISOString(),
        product:   product
      };

      console.log('[MG.Sheets] Syncing product (' + action + '):', product.name);
      return post(payload);
    },

    /**
     * Submit a contact form enquiry.
     * @param {Object} data - { name, phone, email, message }
     */
    submitContact: function (data) {
      const payload = Object.assign({
        action:    'contact',
        timestamp: new Date().toISOString()
      }, data);

      console.log('[MG.Sheets] Submitting contact:', payload);
      return post(payload);
    },

    /**
     * Health check — verify the endpoint is reachable (GET).
     */
    ping: function () {
      return fetch(ENDPOINT)
        .then(function (r) { return r.json(); })
        .then(function (d) {
          console.log('[MG.Sheets] Ping OK:', d);
          return d;
        })
        .catch(function (e) {
          console.warn('[MG.Sheets] Ping failed:', e);
          return { ok: false };
        });
    }
  };

})();
