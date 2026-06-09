/**
 * Jest Unit Tests for aura.js
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('aura.js tracker', () => {
  const code = fs.readFileSync(path.resolve(__dirname, '../src/public/aura.js'), 'utf8');

  beforeEach(() => {
    // Force document.readyState to be complete for testing
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true
    });

    // Reset DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    
    // Clear globals/window variables
    delete window.AURA_INITIALIZED;
    delete window.AURA_UID;
    delete window.AURA_START_TIME;
    delete window.AURA_CONFIG;
    delete window.AURA_AGENCY_ID;
    
    localStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });

    // Mock global fetch
    global.fetch = jest.fn();
    
    // Mock navigator.connection
    global.navigator.connection = {
      effectiveType: '4g',
      rtt: 50,
      downlink: 10,
      saveData: false
    };
    
    // Mock crypto.getRandomValues
    global.crypto = {
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
        return arr;
      }
    };
    
    // Mock IndexedDB to resolve immediately
    global.indexedDB = {
      open: jest.fn(() => {
        const req = {
          onupgradeneeded: null,
          onsuccess: null,
          onerror: null
        };
        setTimeout(() => {
          if (req.onsuccess) {
            req.onsuccess({ target: { result: {} } });
          }
        }, 0);
        return req;
      })
    };
  });

  test('extracts data-client-id from script tag and triggers config handshake', async () => {
    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'test-client-uuid');
    script.src = 'https://cdn.auraworks.co.za/aura.js';
    document.head.appendChild(script);

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ require_consent_banner: false, is_active: true })
    });

    // Run the IIFE script
    eval(code);

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('client_id=test-client-uuid'),
      expect.any(Object)
    );
  });

  test('dynamically injects banner.js when require_consent_banner is true', async () => {
    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'test-client-uuid');
    script.src = 'https://cdn.auraworks.co.za/aura.js';
    document.head.appendChild(script);

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ require_consent_banner: true, compliance_mode: 'GDPR', is_active: true })
    });

    eval(code);

    await new Promise(resolve => setTimeout(resolve, 50));

    const bannerScript = document.querySelector('script[src*="banner.js"]');
    expect(bannerScript).not.toBeNull();
    expect(bannerScript.src).toBe('https://banner.auraworks.co.za/banner.js');
  });

  test('does not inject banner.js when require_consent_banner is false', async () => {
    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'test-client-uuid');
    script.src = 'https://cdn.auraworks.co.za/aura.js';
    document.head.appendChild(script);

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ require_consent_banner: false, is_active: true })
    });

    eval(code);

    await new Promise(resolve => setTimeout(resolve, 50));

    const bannerScript = document.querySelector('script[src*="banner.js"]');
    expect(bannerScript).toBeNull();
  });
});
