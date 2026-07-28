i// ============================================================
// CENTRAL API CONFIGURATION FOR WEB & CAPACITOR MOBILE APPS
// ============================================================

(function () {
  const SERVER_URL_KEY = 'rlb_custom_api_url_v1';
  let storedUrl = localStorage.getItem(SERVER_URL_KEY);

  // Auto-detect environment:
  // 1. Web browser running on HTTP/HTTPS
  // 2. Android emulator (10.0.2.2:3000)
  // 3. Physical mobile device (custom IP or Cloud URL)
  let defaultBase = '';

  if (window.location.protocol.startsWith('http') && window.location.hostname !== 'localhost') {
    defaultBase = window.location.origin;
  } else if (window.location.port === '3000') {
    defaultBase = 'http://localhost:3000';
  } else if (window.Capacitor || window.location.protocol === 'capacitor:' || window.location.protocol === 'file:') {
    // Native mobile app: use stored URL or live Vercel cloud production URL
    defaultBase = storedUrl || 'https://recruit-log-book.vercel.app';
  } else {
    defaultBase = storedUrl || 'https://recruit-log-book.vercel.app';
  }

  window.API_BASE_URL = storedUrl || defaultBase;

  // Helper function to build API endpoint URLs
  window.getApiUrl = function (endpoint) {
    const base = (window.API_BASE_URL || '').replace(/\/$/, '');
    const path = (endpoint || '').replace(/^\//, '');
    return base ? `${base}/${path}` : `/${path}`;
  };

  // Helper to set custom API URL (e.g. for testing with laptop Wi-Fi IP)
  window.setCustomApiUrl = function (url) {
    if (url) {
      localStorage.setItem(SERVER_URL_KEY, url);
    } else {
      localStorage.removeItem(SERVER_URL_KEY);
    }
    window.location.reload();
  };

  // Initialize native Capacitor StatusBar for visible top notification bar
  function setupStatusBar() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar) {
      try {
        const StatusBar = window.Capacitor.Plugins.StatusBar;
        StatusBar.show().catch(function () {});
        StatusBar.setOverlaysWebView({ overlay: false }).catch(function () {});
        StatusBar.setStyle({ style: 'LIGHT' }).catch(function () {});
        StatusBar.setBackgroundColor({ color: '#4F46E5' }).catch(function () {});
      } catch (e) {
        console.warn('StatusBar init warning:', e);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupStatusBar);
  } else {
    setupStatusBar();
  }
})();
