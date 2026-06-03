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
   * Uses a simple text/plain POST so Apps Script can receive the request without
   * a browser preflight. In no-cors mode the response is opaque, so success means
   * the browser accepted the network request for delivery.
   */
  function post(payload) {
    return new Promise(function (resolve, reject) {
      let settled = false;
      const body = JSON.stringify(payload);
      const timeout = setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error('Order submission timed out. Please try again.'));
      }, 12000);

      fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: body
      })
      .then(function () {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve({ ok: true, opaque: true });
      })
      .catch(function (err) {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(err);
      });
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

      return post(payload).catch(function (err) {
        return { ok: false, error: err.message || 'Order submission failed.' };
      });
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

      return post(payload).catch(function (err) {
        return { ok: false, error: err.message || 'Product sync failed.' };
      });
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

      return post(payload).catch(function (err) {
        return { ok: false, error: err.message || 'Contact submission failed.' };
      });
    },

    /**
     * Health check — verify the endpoint is reachable (GET).
     */
    ping: function () {
      return fetch(ENDPOINT)
        .then(function (r) { return r.json(); })
        .then(function (d) { return d; })
        .catch(function (e) {
          return { ok: false, error: e.message || 'Health check failed.' };
        });
    }
  };

})();
