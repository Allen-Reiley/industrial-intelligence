/**
 * Jest Unit Tests for aura.js
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('aura.js tracker', () => {
  const code = fs.readFileSync(path.resolve(__dirname, '../src/public/aura.js'), 'utf8');
  let listeners = [];
  let originalWindowAddEventListener;
  let originalDocumentAddEventListener;
  let originalLocation;

  beforeAll(() => {
    originalLocation = window.location;
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
    window.addEventListener = originalWindowAddEventListener;
    document.addEventListener = originalDocumentAddEventListener;
    delete window.__AURA_TESTING__;
    delete window.__AURA_QUEUE__;
    delete window.__AURA_TRACKER__;
  });

  beforeEach(() => {
    // Restore window.location
    delete window.location;
    window.location = originalLocation;

    // Force document.readyState to be complete for testing
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true
    });

    // Reset DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    
    // Clear event listeners from previous tests
    listeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    listeners = [];

    // Clear globals/window variables
    delete window.AURA_INITIALIZED;
    delete window.AURA_UID;
    delete window.AURA_START_TIME;
    delete window.AURA_CONFIG;
    delete window.AURA_AGENCY_ID;
    delete window.__AURA_QUEUE__;
    delete window.__AURA_TRACKER__;

    window.__AURA_TESTING__ = true;
    
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

  test('terminology enforcement: intent click triggers on prospect but not waitlist', async () => {
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

    // Clear fetch calls from initialization
    global.fetch.mockClear();

    // Create a prospect button and click it
    const prospectBtn = document.createElement('button');
    prospectBtn.innerText = 'Join Prospect List';
    document.body.appendChild(prospectBtn);
    prospectBtn.click();

    // Wait for event dispatch
    await new Promise(resolve => setTimeout(resolve, 50));

    // Should have tracked intent click
    const prospectCall = global.fetch.mock.calls.find(call => 
      call[0].includes('/track/event') && call[1].body.includes('prospect')
    );
    expect(prospectCall).toBeDefined();

    // Reset fetch mock calls
    global.fetch.mockClear();

    // Create a waitlist button and click it
    const waitlistBtn = document.createElement('button');
    waitlistBtn.innerText = 'Join Waitlist';
    document.body.appendChild(waitlistBtn);
    waitlistBtn.click();

    await new Promise(resolve => setTimeout(resolve, 50));

    // Should NOT have tracked waitlist since it was purged
    const waitlistCall = global.fetch.mock.calls.find(call => 
      call[0].includes('/track/event') && call[1].body.includes('waitlist')
    );
    expect(waitlistCall).toBeUndefined();
  });

  test('offline queue caps size to 100 and drops oldest items', async () => {
    let mockStore = {};
    let nextId = 1;
    const mockDb = {
      transaction: jest.fn(() => {
        const tx = {
          objectStore: () => ({
            add: (item) => {
              const id = nextId++;
              mockStore[id] = { ...item, id };
              setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
            },
            getAll: () => {
              const req = { onsuccess: null, result: Object.values(mockStore) };
              setTimeout(() => { if (req.onsuccess) req.onsuccess(); }, 0);
              return req;
            },
            delete: (id) => {
              delete mockStore[id];
              setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
            },
            put: (item) => {
              mockStore[item.id] = item;
              setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
            }
          }),
          oncomplete: null,
          onerror: null
        };
        return tx;
      })
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
            req.onsuccess({ target: { result: mockDb } });
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

    // Now simulate offline
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    // Directly enqueue 105 events
    for (let i = 0; i < 105; i++) {
      await window.__AURA_QUEUE__.enqueue('event', { event_name: 'test_event_' + i });
    }

    // The store should have exactly 100 events (the first 5 dropped)
    const storedEvents = Object.values(mockStore);
    expect(storedEvents.length).toBe(100);
  });

  test('offline queue caps retries to 5 attempts and drops failed event', async () => {
    let mockStore = {};
    let nextId = 1;
    const mockDb = {
      transaction: jest.fn(() => {
        const tx = {
          objectStore: () => ({
            add: (item) => {
              const id = nextId++;
              mockStore[id] = { ...item, id };
              setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
            },
            getAll: () => {
              const req = { onsuccess: null, result: Object.values(mockStore) };
              setTimeout(() => { if (req.onsuccess) req.onsuccess(); }, 0);
              return req;
            },
            delete: (id) => {
              delete mockStore[id];
              setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
            },
            put: (item) => {
              mockStore[item.id] = item;
              setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
            }
          }),
          oncomplete: null,
          onerror: null
        };
        return tx;
      })
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
            req.onsuccess({ target: { result: mockDb } });
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

    const originalSetTimeout = global.setTimeout;
    global.setTimeout = (cb) => {
      Promise.resolve().then(() => {
        cb();
      });
      return 1;
    };

    const originalConsoleWarn = console.warn;
    console.warn = jest.fn();

    delete window.location;
    window.location = { hostname: 'localhost' };

    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'test-client-uuid');
    script.src = 'https://cdn.auraworks.co.za/aura.js';
    document.head.appendChild(script);

    global.fetch.mockImplementation((url) => {
      if (url.includes('clients/config')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ require_consent_banner: true, compliance_mode: 'GDPR', is_active: true })
        });
      }
      return Promise.resolve({ ok: false });
    });

    eval(code);
    await new Promise(resolve => originalSetTimeout(resolve, 50));

    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    // Directly enqueue the event (which also triggers flush automatically since onLine is true)
    await window.__AURA_QUEUE__.enqueue('event', { event_name: 'test_event_retry' });

    // Wait for the asynchronous retry loops to complete
    await new Promise(resolve => originalSetTimeout(resolve, 100));

    expect(Object.keys(mockStore).length).toBe(0);

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Event exceeded max retries'),
      expect.any(Object)
    );

    global.setTimeout = originalSetTimeout;
    console.warn = originalConsoleWarn;
  });

  test('offline queue fails silently for production end-users', async () => {
    let mockStore = {};
    let nextId = 1;
    const mockDb = {
      transaction: jest.fn(() => {
        const tx = {
          objectStore: () => ({
            add: (item) => {
              const id = nextId++;
              mockStore[id] = { ...item, id };
              setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
            },
            getAll: () => {
              const req = { onsuccess: null, result: Object.values(mockStore) };
              setTimeout(() => { if (req.onsuccess) req.onsuccess(); }, 0);
              return req;
            },
            delete: (id) => {
              delete mockStore[id];
              setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
            },
            put: (item) => {
              mockStore[item.id] = item;
              setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
            }
          }),
          oncomplete: null,
          onerror: null
        };
        return tx;
      })
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
            req.onsuccess({ target: { result: mockDb } });
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

    const originalSetTimeout = global.setTimeout;
    global.setTimeout = (cb) => {
      Promise.resolve().then(() => {
        cb();
      });
      return 1;
    };

    const originalConsoleWarn = console.warn;
    console.warn = jest.fn();

    delete window.location;
    window.location = { hostname: 'auraworks.co.za' };

    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'test-client-uuid');
    script.src = 'https://cdn.auraworks.co.za/aura.js';
    document.head.appendChild(script);

    global.fetch.mockImplementation((url) => {
      if (url.includes('clients/config')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ require_consent_banner: true, compliance_mode: 'GDPR', is_active: true })
        });
      }
      return Promise.resolve({ ok: false });
    });

    eval(code);
    await new Promise(resolve => originalSetTimeout(resolve, 50));

    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    // Directly enqueue the event (which also triggers flush automatically since onLine is true)
    await window.__AURA_QUEUE__.enqueue('event', { event_name: 'test_event_silent' });

    // Wait for the asynchronous retry loops to complete
    await new Promise(resolve => originalSetTimeout(resolve, 100));

    expect(Object.keys(mockStore).length).toBe(0);

    expect(console.warn).not.toHaveBeenCalled();

    global.setTimeout = originalSetTimeout;
    console.warn = originalConsoleWarn;
  });
});
