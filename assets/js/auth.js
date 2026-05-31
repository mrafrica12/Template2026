/**
 * MelaninGold Organic — auth.js
 * Lightweight client-side admin gate for the static admin portal.
 *
 * Admin email: bngie@umojaserv.com
 *
 * Note: this protects casual access only. For production-grade admin security,
 * add host-level protection such as Cloudflare Access, Netlify password
 * protection, cPanel directory protection, or server-side authentication.
 */

window.MG = window.MG || {};

MG.Auth = (function () {
  const ADMIN_EMAIL = 'bngie@umojaserv.com';
  const PASSWORD_KEY = 'mg_admin_password_hash_v1';
  const SESSION_KEY = 'mg_admin_session_v1';
  const SESSION_HOURS = 8;

  async function sha256(message) {
    const encoded = new TextEncoder().encode(message);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  function passwordIsSet() {
    return Boolean(localStorage.getItem(PASSWORD_KEY));
  }

  function saveSession(email) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      email,
      expiry: Date.now() + SESSION_HOURS * 60 * 60 * 1000
    }));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function isSessionValid() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const session = JSON.parse(raw);
      if (session.email !== ADMIN_EMAIL) return false;
      if (Date.now() > session.expiry) {
        clearSession();
        return false;
      }
      return true;
    } catch (error) {
      clearSession();
      return false;
    }
  }

  function setAdminVisibility(visible) {
    document.querySelector('.admin-header')?.toggleAttribute('hidden', !visible);
    document.querySelector('.admin-page')?.toggleAttribute('hidden', !visible);
    document.querySelector('.site-footer')?.toggleAttribute('hidden', !visible);
  }

  function buildAuthOverlay() {
    const isSetup = !passwordIsSet();
    const overlay = document.createElement('div');
    overlay.id = 'admin-login-overlay';
    overlay.innerHTML = `
      <div class="login-box" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <p class="login-kicker">MelaninGold Organic</p>
        <h1 class="login-title" id="login-title">${isSetup ? 'Create Admin Password' : 'Admin Sign In'}</h1>
        <p class="login-sub">${isSetup ? 'Set a password for bngie@umojaserv.com.' : 'Sign in as bngie@umojaserv.com.'}</p>

        <form id="login-form" novalidate>
          <div class="login-field">
            <label for="login-email">Email Address</label>
            <input type="email" id="login-email" value="${ADMIN_EMAIL}" autocomplete="username" required>
          </div>

          <div class="login-field">
            <label for="login-password">${isSetup ? 'New Password' : 'Password'}</label>
            <div class="login-pw-wrap">
              <input type="password" id="login-password" autocomplete="${isSetup ? 'new-password' : 'current-password'}" required>
              <button type="button" class="toggle-pw" aria-label="Show password" onclick="MG.Auth.togglePassword('login-password', this)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          ${isSetup ? `
          <div class="login-field">
            <label for="login-password-confirm">Confirm Password</label>
            <input type="password" id="login-password-confirm" autocomplete="new-password" required>
          </div>` : ''}

          <p class="login-error" id="login-error" hidden></p>

          <button type="submit" class="login-btn" id="login-btn">
            ${isSetup ? 'Save Password' : 'Sign In'}
          </button>
        </form>
      </div>`;

    document.body.appendChild(overlay);
    injectAuthStyles();
    document.getElementById('login-password')?.focus();
    bindAuthForm(isSetup);
  }

  function injectAuthStyles() {
    if (document.getElementById('admin-auth-styles')) return;
    const style = document.createElement('style');
    style.id = 'admin-auth-styles';
    style.textContent = `
      #admin-login-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: #0A0A0A;
      }
      .login-box {
        width: min(100%, 420px);
        padding: 42px 38px 38px;
        border: 1px solid rgba(201,148,58,0.22);
        border-radius: 8px;
        background: #1C1C1C;
        box-shadow: 0 28px 70px rgba(0,0,0,0.42);
      }
      .login-kicker {
        margin-bottom: 16px;
        color: #C9943A;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .login-title {
        margin-bottom: 8px;
        color: #F8F5EF;
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 34px;
        font-weight: 300;
        line-height: 1.1;
      }
      .login-sub {
        margin-bottom: 30px;
        color: #888;
        font-size: 14px;
        line-height: 1.7;
      }
      .login-field {
        margin-bottom: 18px;
      }
      .login-field label {
        display: block;
        margin-bottom: 8px;
        color: #8A6520;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.11em;
        text-transform: uppercase;
      }
      .login-field input {
        width: 100%;
        min-height: 46px;
        padding: 13px 15px;
        border: 1px solid rgba(201,148,58,0.24);
        border-radius: 6px;
        background: #111;
        color: #F8F5EF;
        font-family: 'DM Sans', sans-serif;
        font-size: 14px;
        outline: none;
      }
      .login-field input:focus {
        border-color: rgba(232,200,122,0.6);
      }
      .login-pw-wrap {
        position: relative;
      }
      .login-pw-wrap input {
        padding-right: 46px;
      }
      .toggle-pw {
        position: absolute;
        top: 50%;
        right: 11px;
        transform: translateY(-50%);
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #888;
        border-radius: 50%;
      }
      .toggle-pw:hover {
        color: #E8C87A;
        background: rgba(201,148,58,0.08);
      }
      .login-error {
        margin: 2px 0 18px;
        padding: 11px 13px;
        border: 1px solid rgba(217,92,77,0.38);
        border-radius: 6px;
        background: rgba(217,92,77,0.1);
        color: #ffb3a9;
        font-size: 13px;
        line-height: 1.5;
      }
      .login-btn {
        width: 100%;
        min-height: 48px;
        margin-top: 4px;
        border: 1px solid #C9943A;
        border-radius: 6px;
        background: #C9943A;
        color: #0A0A0A;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.09em;
        text-transform: uppercase;
      }
      .login-btn:hover {
        background: #E8C87A;
        border-color: #E8C87A;
      }
      .login-btn:disabled {
        cursor: not-allowed;
        opacity: 0.65;
      }
      @media (max-width: 560px) {
        .login-box {
          padding: 34px 24px 28px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function bindAuthForm(isSetup) {
    document.getElementById('login-form')?.addEventListener('submit', async event => {
      event.preventDefault();

      const email = document.getElementById('login-email')?.value.trim().toLowerCase();
      const password = document.getElementById('login-password')?.value || '';
      const confirm = document.getElementById('login-password-confirm')?.value || '';
      const button = document.getElementById('login-btn');
      const originalText = button?.textContent;

      hideError();
      if (email !== ADMIN_EMAIL) {
        showError('Use bngie@umojaserv.com to access the admin portal.');
        return;
      }
      if (password.length < 8) {
        showError('Use at least 8 characters for the admin password.');
        return;
      }
      if (isSetup && password !== confirm) {
        showError('The password confirmation does not match.');
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = isSetup ? 'Saving...' : 'Signing in...';
      }

      const hash = await sha256(`${ADMIN_EMAIL}:${password}`);
      if (isSetup) {
        localStorage.setItem(PASSWORD_KEY, hash);
        saveSession(ADMIN_EMAIL);
        unlock();
      } else if (hash === localStorage.getItem(PASSWORD_KEY)) {
        saveSession(ADMIN_EMAIL);
        unlock();
      } else {
        showError('Incorrect password. Please try again.');
      }

      if (button && document.getElementById('admin-login-overlay')) {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }

  function unlock() {
    document.getElementById('admin-login-overlay')?.remove();
    setAdminVisibility(true);
    if (window.MG?.Admin) MG.Admin.init();
    if (typeof showAdminUI === 'function') showAdminUI();
  }

  function showError(message) {
    const error = document.getElementById('login-error');
    if (!error) return;
    error.textContent = message;
    error.hidden = false;
  }

  function hideError() {
    const error = document.getElementById('login-error');
    if (error) error.hidden = true;
  }

  return {
    ADMIN_EMAIL,

    guard() {
      setAdminVisibility(false);
      if (isSessionValid()) {
        unlock();
        return true;
      }
      buildAuthOverlay();
      return false;
    },

    logout() {
      clearSession();
      window.location.reload();
    },

    resetPasswordSetup() {
      localStorage.removeItem(PASSWORD_KEY);
      clearSession();
      window.location.reload();
    },

    togglePassword(inputId, button) {
      const input = document.getElementById(inputId);
      if (!input) return;
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      button?.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    },

    hashPassword: sha256,
    isLoggedIn: isSessionValid,
    isPasswordSet: passwordIsSet
  };
})();
