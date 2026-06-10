/**
 * Jest Integration Tests for Event Decoupling
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Event Decoupling Integration', () => {
  const auraCode = fs.readFileSync(path.resolve(__dirname, '../src/public/aura.js'), 'utf8');
  const bannerCode = fs.readFileSync(path.resolve(__dirname, '../src/banner/banner.js'), 'utf8');
  let shadowRoots = [];
  let originalAttachShadow;
  let originalAppendChild;
  let listeners = [];
  let originalWindowAddEventListener;
  let originalDocumentAddEventListener;

  beforeAll(() => {
    originalAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(options) {
      const root = originalAttachShadow.call(this, { ...options, mode: 'open' });
      shadowRoots.push(root);
      return root;
    };

    originalAppendChild = HTMLHeadElement.prototype.appendChild;
    HTMLHeadElement.prototype.appendChild = function(element) {
      const result = originalAppendChild.call(this, element);
      if (element.tagName === 'SCRIPT' && element.src && element.src.includes('banner.js')) {
        setTimeout(() => {
          if (element.onload) element.onload();
        }, 0);
      }
      return result;
    };

    // Track window listeners
    originalWindowAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
      listeners.push({ target: window, type, listener, options });
      return originalWindowAddEventListener.call(this, type, listener, options);
    };

    // Track document listeners
    originalDocumentAddEventListener = document.addEventListener;
    document.addEventListener = function(type, listener, options) {
      listeners.push({ target: document, type, listener, options });
      return originalDocumentAddEventListener.call(this, type, listener, options);
    };
  });

  afterAll(() => {
    listeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    listeners = [];
    Element.prototype.attachShadow = originalAttachShadow;
    HTMLHeadElement.prototype.appendChild = originalAppendChild;
    window.addEventListener = originalWindowAddEventListener;
    document.addEventListener = originalDocumentAddEventListener;
  });

  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    shadowRoots = [];

    delete window.AURA_INITIALIZED;
    delete window.AURA_BANNER_INITIALIZED;
    delete window.AURA_UID;
    delete window.AURA_START_TIME;
    delete window.AURA_CONFIG;
    delete window.AURA_AGENCY_ID;
    localStorage.clear();

    // Mock document.cookie
    let cookieStore = '';
    Object.defineProperty(document, 'cookie', {
      get: () => cookieStore,
      set: (val) => {
        const pair = val.split(';')[0].trim();
        if (cookieStore) {
          cookieStore += '; ' + pair;
        } else {
          cookieStore = pair;
        }
      },
      configurable: true
    });

    // Clear event listeners from previous tests
    listeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    listeners = [];

    global.fetch = jest.fn();
    
    global.navigator.connection = {
      effectiveType: '4g',
      rtt: 50,
      downlink: 10,
      saveData: false
    };

    global.crypto = {
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
        return arr;
      }
    };

    const mockIndexedDB = {
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
    global.indexedDB = mockIndexedDB;
    Object.defineProperty(window, 'indexedDB', {
      value: mockIndexedDB,
      configurable: true,
      writable: true
    });
  });

  test('aura.js boots banner.js, intercepts aura_warm_lead event, appends telemetry, and dispatches to track endpoint', async () => {
    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'integration-client-uuid');
    script.src = 'https://cdn.auraworks.co.za/aura.js';
    document.head.appendChild(script);

    // Mock API requests
    global.fetch.mockImplementation((url) => {
      if (url.includes('clients/config')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ require_consent_banner: true, compliance_mode: 'GDPR', is_active: true })
        });
      }
      return Promise.resolve({ ok: true });
    });

    // Eval scripts to simulate edge delivery loading
    eval(auraCode);
    eval(bannerCode);

    // Wait for async init & config fetch
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('clients/config'),
      expect.any(Object)
    );

    // Verify shadow DOM was mounted by banner.js
    expect(shadowRoots.length).toBe(1);
    const shadow = shadowRoots[0];

    // Step 1: Authorize GDPR checkbox and accept
    const checkbox = shadow.getElementById('aura-consent-checkbox');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));

    shadow.getElementById('aura-btn-accept').click();

    // Step 2: Fill Form Step 1 Contact Info
    const fnameInput = shadow.getElementById('aura-input-firstname');
    const lnameInput = shadow.getElementById('aura-input-lastname');
    const phoneInput = shadow.getElementById('aura-input-phone');

    fnameInput.value = 'Alice';
    fnameInput.dispatchEvent(new Event('input'));
    lnameInput.value = 'Smith';
    lnameInput.dispatchEvent(new Event('input'));
    phoneInput.value = '+27839999999';
    phoneInput.dispatchEvent(new Event('input'));

    shadow.getElementById('aura-btn-next').click();

    // Step 3: Fill Form Step 2 Company Details
    const emailInput = shadow.getElementById('aura-input-email');
    const companyInput = shadow.getElementById('aura-input-company');
    const roleInput = shadow.getElementById('aura-input-role');
    const submitBtn = shadow.getElementById('aura-btn-submit');

    emailInput.value = 'alice@miningcorp.co.za';
    emailInput.dispatchEvent(new Event('input'));
    companyInput.value = 'Mining Corp';
    companyInput.dispatchEvent(new Event('input'));
    roleInput.value = 'Chief Procurement';
    roleInput.dispatchEvent(new Event('input'));

    // Clear fetch history so we can focus on track/identity
    global.fetch.mockClear();

    // Submit form
    submitBtn.click();

    // Give time for custom event dispatching and async fingerprinting in aura.js
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Verify aura.js intercepted the custom event and called tracking API
    const identityCall = global.fetch.mock.calls.find(call => 
      call[0].includes('/track/identity') && call[1].body.includes('alice@miningcorp.co.za')
    );
    expect(identityCall).toBeDefined();

    expect(identityCall[1]).toEqual(
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String)
      })
    );

    const callPayload = JSON.parse(identityCall[1].body);
    expect(callPayload.email).toBe('alice@miningcorp.co.za');
    expect(callPayload.company).toBe('Mining Corp');
    expect(callPayload.first_name).toBe('Alice');
    expect(callPayload.last_name).toBe('Smith');
    expect(callPayload.position).toBe('Chief Procurement');
    expect(callPayload.phone).toBe('+27839999999');
    expect(callPayload.fingerprint).toBeDefined();
    expect(callPayload.fingerprint.canvas).toBeDefined();
    expect(callPayload.session_id).toBeDefined();
    expect(callPayload.client_id).toBe('integration-client-uuid');
  });
});
