/**
 * Jest Unit Tests for banner.js
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('banner.js consent banner', () => {
  const code = fs.readFileSync(path.resolve(__dirname, '../src/banner/banner.js'), 'utf8');
  let shadowRoots = [];
  let originalAttachShadow;
  let listeners = [];
  let originalWindowAddEventListener;
  let originalDocumentAddEventListener;

  beforeAll(() => {
    // Intercept attachShadow
    originalAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(options) {
      const root = originalAttachShadow.call(this, { ...options, mode: 'open' });
      shadowRoots.push(root);
      return root;
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
    window.addEventListener = originalWindowAddEventListener;
    document.addEventListener = originalDocumentAddEventListener;
  });

  beforeEach(() => {
    jest.useFakeTimers();

    // Reset DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    shadowRoots = [];
    
    delete window.AURA_BANNER_INITIALIZED;
    localStorage.clear();
    
    // Mock document.cookie to accept Secure cookies in JSDOM
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
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('bootstraps when aura:ready is dispatched', () => {
    eval(code);

    const config = { require_consent_banner: true, compliance_mode: 'POPIA' };
    const event = new CustomEvent('aura:ready', {
      detail: {
        auraId: 'test-aura-uuid',
        clientId: 'test-client-uuid',
        config: config
      }
    });
    window.dispatchEvent(event);

    const root = document.getElementById('aura-consent-root');
    expect(root).not.toBeNull();
    expect(shadowRoots.length).toBe(1);
  });

  test('GDPR compliance mode starts banner immediately and requires consent checkbox', () => {
    eval(code);

    const config = { require_consent_banner: true, compliance_mode: 'GDPR' };
    const event = new CustomEvent('aura:ready', {
      detail: {
        auraId: 'test-aura-uuid',
        clientId: 'test-client-uuid',
        config: config
      }
    });
    window.dispatchEvent(event);

    const shadow = shadowRoots[0];
    const bannerEl = shadow.getElementById('aura-banner-el');
    
    expect(bannerEl.classList.contains('visible')).toBe(true);

    const checkbox = shadow.getElementById('aura-consent-checkbox');
    expect(checkbox).not.toBeNull();

    const acceptBtn = shadow.getElementById('aura-btn-accept');
    expect(acceptBtn.disabled).toBe(true);

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(acceptBtn.disabled).toBe(false);
  });

  test('clicking accept cookie/localStorage dispatches consent updated event and transitions to Phase 2', () => {
    eval(code);

    const consentUpdatedSpy = jest.fn();
    window.addEventListener('aura_consent_updated', consentUpdatedSpy);

    const config = { require_consent_banner: true, compliance_mode: 'GDPR' };
    const event = new CustomEvent('aura:ready', {
      detail: {
        auraId: 'test-aura-uuid',
        clientId: 'test-client-uuid',
        config: config
      }
    });
    window.dispatchEvent(event);

    const shadow = shadowRoots[0];
    
    // Enable accept button by checking GDPR box
    const checkbox = shadow.getElementById('aura-consent-checkbox');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));

    const acceptBtn = shadow.getElementById('aura-btn-accept');
    acceptBtn.click();

    expect(localStorage.getItem('aura_consent_given')).toBe('true');
    expect(document.cookie).toContain('aura_consent=true');

    expect(consentUpdatedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { status: 'accepted', source: 'banner' }
      })
    );

    const fnameInput = shadow.getElementById('aura-input-firstname');
    expect(fnameInput).not.toBeNull();
  });

  test('Phase 2 Form step 1 validates fields, dispatches warm lead on next step, and transitions to step 2', () => {
    eval(code);

    const warmLeadSpy = jest.fn();
    window.addEventListener('aura_warm_lead', warmLeadSpy);

    // Start in GDPR mode so banner shows immediately
    const config = { require_consent_banner: true, compliance_mode: 'GDPR' };
    const event = new CustomEvent('aura:ready', {
      detail: {
        auraId: 'test-aura-uuid',
        clientId: 'test-client-uuid',
        config: config
      }
    });
    window.dispatchEvent(event);

    const shadow = shadowRoots[0];
    
    // Accept GDPR consent to enter Phase 2
    const checkbox = shadow.getElementById('aura-consent-checkbox');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    shadow.getElementById('aura-btn-accept').click();

    const nextBtn = shadow.getElementById('aura-btn-next');
    expect(nextBtn.disabled).toBe(true);

    const fnameInput = shadow.getElementById('aura-input-firstname');
    const lnameInput = shadow.getElementById('aura-input-lastname');
    const phoneInput = shadow.getElementById('aura-input-phone');

    fnameInput.value = 'John';
    fnameInput.dispatchEvent(new Event('input'));
    lnameInput.value = 'Doe';
    lnameInput.dispatchEvent(new Event('input'));
    phoneInput.value = '+27821234567';
    phoneInput.dispatchEvent(new Event('input'));

    expect(nextBtn.disabled).toBe(false);
    nextBtn.click();

    expect(warmLeadSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          first_name: 'John',
          last_name: 'Doe',
          phone: '+27821234567',
          name: 'John Doe',
          capture_source: 'banner_warm_signal_part1'
        }
      })
    );

    const emailInput = shadow.getElementById('aura-input-email');
    expect(emailInput).not.toBeNull();
  });

  test('Phase 2 Form step 2 submits full details and closes banner', () => {
    eval(code);

    const warmLeadSpy = jest.fn();
    window.addEventListener('aura_warm_lead', warmLeadSpy);

    const config = { require_consent_banner: true, compliance_mode: 'GDPR' };
    const event = new CustomEvent('aura:ready', {
      detail: {
        auraId: 'test-aura-uuid',
        clientId: 'test-client-uuid',
        config: config
      }
    });
    window.dispatchEvent(event);

    const shadow = shadowRoots[0];
    
    // Step 1: GDPR Consent
    const checkbox = shadow.getElementById('aura-consent-checkbox');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    shadow.getElementById('aura-btn-accept').click();

    // Step 2: Contact Details Part 1
    const fnameInput = shadow.getElementById('aura-input-firstname');
    const lnameInput = shadow.getElementById('aura-input-lastname');
    const phoneInput = shadow.getElementById('aura-input-phone');

    fnameInput.value = 'John';
    fnameInput.dispatchEvent(new Event('input'));
    lnameInput.value = 'Doe';
    lnameInput.dispatchEvent(new Event('input'));
    phoneInput.value = '+27821234567';
    phoneInput.dispatchEvent(new Event('input'));

    shadow.getElementById('aura-btn-next').click();

    // Step 3: Contact Details Part 2
    const emailInput = shadow.getElementById('aura-input-email');
    const companyInput = shadow.getElementById('aura-input-company');
    const roleInput = shadow.getElementById('aura-input-role');
    const submitBtn = shadow.getElementById('aura-btn-submit');

    expect(submitBtn.disabled).toBe(true);

    emailInput.value = 'john.doe@miningcorp.co.za';
    emailInput.dispatchEvent(new Event('input'));
    companyInput.value = 'Mining Corp';
    companyInput.dispatchEvent(new Event('input'));
    roleInput.value = 'Procurement Officer';
    roleInput.dispatchEvent(new Event('input'));

    expect(submitBtn.disabled).toBe(false);
    submitBtn.click();

    expect(warmLeadSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          email: 'john.doe@miningcorp.co.za',
          company: 'Mining Corp',
          company_name: 'Mining Corp',
          first_name: 'John',
          last_name: 'Doe',
          name: 'John Doe',
          position: 'Procurement Officer',
          phone: '+27821234567',
          capture_source: 'banner_warm_signal'
        }
      })
    );

    expect(localStorage.getItem('aura_lead_captured')).toBe('true');

    const bannerEl = shadow.getElementById('aura-banner-el');
    expect(bannerEl.classList.contains('visible')).toBe(false);
  });

  test('Phase 4: Asset Gate displays modal overlay and dispatches lead details', () => {
    eval(code);

    const warmLeadSpy = jest.fn();
    window.addEventListener('aura_warm_lead', warmLeadSpy);

    const config = { require_consent_banner: true, compliance_mode: 'GDPR' };
    const event = new CustomEvent('aura:ready', {
      detail: {
        auraId: 'test-aura-uuid',
        clientId: 'test-client-uuid',
        config: config
      }
    });
    window.dispatchEvent(event);

    const triggerEvent = new CustomEvent('aura:trigger_banner', { detail: { phase: 4 } });
    window.dispatchEvent(triggerEvent);

    const shadow = shadowRoots[0];
    const overlayEl = shadow.getElementById('aura-modal-overlay-el');
    expect(overlayEl.classList.contains('visible')).toBe(true);

    const emailInput = shadow.getElementById('aura-modal-input-email');
    const submitBtn = shadow.getElementById('aura-modal-btn-submit');

    emailInput.value = 'spec@engineering.com';
    emailInput.dispatchEvent(new Event('input'));

    submitBtn.click();

    expect(warmLeadSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          email: 'spec@engineering.com',
          capture_source: 'banner_asset_gate'
        }
      })
    );

    expect(overlayEl.classList.contains('visible')).toBe(false);
  });
});
