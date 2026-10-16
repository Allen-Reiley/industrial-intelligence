/**
 * Phase 31 Edge Tracker & Banner Integration Tests
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Phase 31: Edge Tracker & Banner Experience Realignment', () => {
  const auraCode = fs.readFileSync(path.resolve(__dirname, '../src/public/aura.js'), 'utf8');
  let listeners = [];
  let originalWindowAddEventListener;
  let originalDocumentAddEventListener;
  let originalLocation;
  let originalGetContext;

  beforeAll(() => {
    originalLocation = window.location;
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      fillRect: jest.fn(),
      fillText: jest.fn(),
      getImageData: jest.fn(() => ({ data: [0, 0, 0, 0] })),
      getExtension: jest.fn(),
      getParameter: jest.fn()
    }));

    originalWindowAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
      listeners.push({ target: window, type, listener, options });
      return originalWindowAddEventListener.call(this, type, listener, options);
    };

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
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    window.addEventListener = originalWindowAddEventListener;
    document.addEventListener = originalDocumentAddEventListener;
    delete window.__AURA_TESTING__;
    delete window.__AURA_TRACKER__;
    delete window.__AURA_QUEUE__;
  });

  beforeEach(() => {
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true
    });

    document.head.innerHTML = '';
    document.body.innerHTML = '';

    listeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    listeners = [];

    delete window.AURA_INITIALIZED;
    delete window.AURA_UID;
    delete window.AURA_START_TIME;
    delete window.AURA_CONFIG;
    delete window.AURA_AGENCY_ID;
    delete window.__AURA_TRACKER__;
    delete window.__AURA_QUEUE__;
    delete window.__AURA_BANNER_MOUNTED__;

    window.__AURA_TESTING__ = true;
    localStorage.clear();

    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    global.fetch = jest.fn().mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('clients/config')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ require_consent_banner: false, is_active: true })
        });
      }
      return Promise.resolve({ ok: true });
    });

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

    // Mock IndexedDB to resolve immediately
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

  test('Task 31.2: Asset gate click immediately triggers banner when pre-mounted without waiting for fallback timer', async () => {
    window.__AURA_BANNER_MOUNTED__ = true;

    const bannerRoot = document.createElement('div');
    bannerRoot.id = 'aura-banner-root';
    document.body.appendChild(bannerRoot);

    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'test-client-gate');
    document.head.appendChild(script);

    eval(auraCode);
    await new Promise(resolve => setTimeout(resolve, 50));

    const triggerSpy = jest.fn();
    window.addEventListener('aura:trigger_banner', triggerSpy);

    const link = document.createElement('a');
    link.href = 'https://example.com/datasheet.pdf';
    link.textContent = 'Download CAD Datasheet';
    document.body.appendChild(link);

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(triggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          phase: 4,
          assetUrl: 'https://example.com/datasheet.pdf'
        }
      })
    );
  });

  test('Task 31.3: Debounced input blur listener captures email and phone telemetry', async () => {
    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'test-client-blur');
    document.head.appendChild(script);

    eval(auraCode);
    await new Promise(resolve => setTimeout(resolve, 50));

    const tracker = window.__AURA_TRACKER__;
    expect(tracker).toBeDefined();
    const dispatchSpy = jest.spyOn(tracker, 'dispatch');

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'user_email';
    emailInput.value = 'engineer@plant.co.za';
    document.body.appendChild(emailInput);

    emailInput.dispatchEvent(new Event('blur', { bubbles: true }));

    // Before debounce timer fires
    expect(dispatchSpy).not.toHaveBeenCalledWith('identity', expect.objectContaining({ email: 'engineer@plant.co.za' }));

    // Wait for 350ms debouncing
    await new Promise(resolve => setTimeout(resolve, 400));

    expect(dispatchSpy).toHaveBeenCalledWith(
      'identity',
      expect.objectContaining({
        email: 'engineer@plant.co.za',
        capture_source: 'field_blur'
      })
    );

    // Phone blur test
    const phoneInput = document.createElement('input');
    phoneInput.type = 'tel';
    phoneInput.name = 'phone';
    phoneInput.value = '+27 82 555 1234';
    document.body.appendChild(phoneInput);

    phoneInput.dispatchEvent(new Event('blur', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 400));

    expect(dispatchSpy).toHaveBeenCalledWith(
      'identity',
      expect.objectContaining({
        phone: '+27 82 555 1234',
        capture_source: 'field_blur'
      })
    );
  });

  test('Task 31.3: Form submission interceptor extracts contact details and dispatches telemetry', async () => {
    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'test-client-form');
    document.head.appendChild(script);

    eval(auraCode);
    await new Promise(resolve => setTimeout(resolve, 50));

    const tracker = window.__AURA_TRACKER__;
    const dispatchSpy = jest.spyOn(tracker, 'dispatch');

    const form = document.createElement('form');
    form.id = 'quote-request-form';
    form.action = '/api/submit-quote';

    const emailInp = document.createElement('input');
    emailInp.type = 'email';
    emailInp.name = 'email';
    emailInp.value = 'procurement@factory.com';
    form.appendChild(emailInp);

    const phoneInp = document.createElement('input');
    phoneInp.type = 'tel';
    phoneInp.name = 'phone';
    phoneInp.value = '+27110001234';
    form.appendChild(phoneInp);

    const compInp = document.createElement('input');
    compInp.name = 'company';
    compInp.value = 'SteelCorp Industrial';
    form.appendChild(compInp);

    document.body.appendChild(form);

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    expect(dispatchSpy).toHaveBeenCalledWith(
      'identity',
      expect.objectContaining({
        email: 'procurement@factory.com',
        phone: '+27110001234',
        company_name: 'SteelCorp Industrial',
        capture_source: 'form_submit'
      })
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      'event',
      expect.objectContaining({
        event_type: 'form_submit',
        form_id: 'quote-request-form'
      })
    );
  });

  test('Task 31.3: Intercepts History pushState for SPA pageview beacons', async () => {
    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'test-client-spa');
    document.head.appendChild(script);

    eval(auraCode);
    await new Promise(resolve => setTimeout(resolve, 50));

    const tracker = window.__AURA_TRACKER__;
    const dispatchSpy = jest.spyOn(tracker, 'dispatch');

    // Trigger pushState to simulate Next.js client-side navigation
    history.pushState({}, 'Industrial Analytics', '/analytics/overview');

    // Wait for the 50ms setTimeout in patchSPA
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(dispatchSpy).toHaveBeenCalledWith(
      'event',
      expect.objectContaining({
        event_type: 'pageview',
        url: expect.stringContaining('/analytics/overview')
      })
    );
  });

  test('Task 31.4: Terser minification maintains valid syntax and bundle constraints', () => {
    const distAura = path.resolve(__dirname, '../dist/aura.min.js');
    const distBanner = path.resolve(__dirname, '../dist/banner.min.js');

    expect(fs.existsSync(distAura)).toBe(true);
    expect(fs.existsSync(distBanner)).toBe(true);

    const auraMinContent = fs.readFileSync(distAura, 'utf8');
    const bannerMinContent = fs.readFileSync(distBanner, 'utf8');

    // Valid syntax (parse without throwing)
    expect(() => new Function(auraMinContent)).not.toThrow();
    expect(() => new Function(bannerMinContent)).not.toThrow();
  });
});
