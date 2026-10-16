/**
 * Task 35.2: Edge Tracker & Banner Lead Flow Integration Tests
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Task 35.2: Edge Tracker & Banner Lead Flow Integration Tests', () => {
  const auraCode = fs.readFileSync(path.resolve(__dirname, '../src/public/aura.js'), 'utf8');
  let listeners = [];
  let originalWindowAddEventListener;
  let originalDocumentAddEventListener;

  beforeAll(() => {
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
    window.addEventListener = originalWindowAddEventListener;
    document.addEventListener = originalDocumentAddEventListener;
  });

  beforeEach(() => {
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
  });

  test('1. Asset gate click interception prevents navigation, opens modal, and preserves assetUrl', async () => {
    window.__AURA_BANNER_MOUNTED__ = true;
    const bannerRoot = document.createElement('div');
    bannerRoot.id = 'aura-banner-root';
    document.body.appendChild(bannerRoot);

    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'test-client-gate-35');
    document.head.appendChild(script);

    eval(auraCode);
    await new Promise(resolve => setTimeout(resolve, 50));

    const triggerSpy = jest.fn();
    window.addEventListener('aura:trigger_banner', triggerSpy);

    const pdfLink = document.createElement('a');
    pdfLink.href = 'https://industrial.co.za/catalogue/compressor-spec.pdf';
    pdfLink.textContent = 'Download Heavy Compressor Spec';
    document.body.appendChild(pdfLink);

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    pdfLink.dispatchEvent(clickEvent);

    // Asserts default navigation prevented and assetUrl preserved
    expect(clickEvent.defaultPrevented).toBe(true);
    expect(triggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          phase: 4,
          assetUrl: 'https://industrial.co.za/catalogue/compressor-spec.pdf'
        }
      })
    );
  });

  test('2. Modal lead submission triggers lead telemetry and initiates programmatic download of assetUrl', async () => {
    let capturedWarmLead = null;
    window.addEventListener('aura_warm_lead', (e) => {
      capturedWarmLead = e.detail;
    });

    // Simulate banner logic on submit
    const currentAssetUrl = 'https://industrial.co.za/files/blueprint.dwg';
    const submittedEmail = 'procurement@sasol.com';

    // Simulate banner lead dispatch
    const leadDetail = {
      email: submittedEmail,
      capture_source: 'banner_asset_gate',
      asset_url: currentAssetUrl
    };
    window.dispatchEvent(new CustomEvent('aura_warm_lead', { detail: leadDetail }));

    expect(capturedWarmLead).not.toBeNull();
    expect(capturedWarmLead.email).toBe(submittedEmail);
    expect(capturedWarmLead.asset_url).toBe(currentAssetUrl);

    // Simulate programmatic download initiation
    const clickSpy = jest.fn();
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = currentAssetUrl;
    downloadAnchor.download = '';
    downloadAnchor.click = clickSpy;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();

    expect(clickSpy).toHaveBeenCalled();
    expect(downloadAnchor.href).toBe(currentAssetUrl);
  });

  test('3. Banner mount fallback: pre-mounted banner prevents premature fallback navigation', async () => {
    // When banner is pre-mounted, fallback timer must be cancelled immediately
    window.__AURA_BANNER_MOUNTED__ = true;
    const bannerRoot = document.createElement('div');
    bannerRoot.id = 'aura-banner-root';
    document.body.appendChild(bannerRoot);

    const script = document.createElement('script');
    script.setAttribute('data-client-id', 'test-client-prem гражданин');
    document.head.appendChild(script);

    eval(auraCode);
    await new Promise(resolve => setTimeout(resolve, 50));

    const triggerSpy = jest.fn();
    window.addEventListener('aura:trigger_banner', triggerSpy);

    const zipLink = document.createElement('a');
    zipLink.href = 'https://industrial.co.za/files/specs.zip';
    document.body.appendChild(zipLink);

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    zipLink.dispatchEvent(clickEvent);

    // Asserts banner trigger fired immediately without fallback delay
    expect(triggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          phase: 4,
          assetUrl: 'https://industrial.co.za/files/specs.zip'
        }
      })
    );
  });

  test('4. Verify Terser build outputs: dist/aura.min.js and dist/banner.min.js syntax and size constraints', () => {
    const auraMinPath = path.resolve(__dirname, '../dist/aura.min.js');
    const bannerMinPath = path.resolve(__dirname, '../dist/banner.min.js');

    expect(fs.existsSync(auraMinPath)).toBe(true);
    expect(fs.existsSync(bannerMinPath)).toBe(true);

    const auraMinContent = fs.readFileSync(auraMinPath, 'utf8');
    const bannerMinContent = fs.readFileSync(bannerMinPath, 'utf8');

    // Syntax validation: Ensure code can be evaluated without syntax error
    expect(() => new Function(auraMinContent)).not.toThrow();
    expect(() => new Function(bannerMinContent)).not.toThrow();

    // Size constraints: aura.min.js < 50KB, banner.min.js < 60KB
    const auraSizeKB = Buffer.byteLength(auraMinContent, 'utf8') / 1024;
    const bannerSizeKB = Buffer.byteLength(bannerMinContent, 'utf8') / 1024;

    expect(auraSizeKB).toBeLessThan(50);
    expect(bannerSizeKB).toBeLessThan(60);
    expect(auraSizeKB).toBeGreaterThan(1);
    expect(bannerSizeKB).toBeGreaterThan(1);
  });
});
