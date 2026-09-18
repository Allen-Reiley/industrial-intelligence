/**
 * AuraWorks Industrial Intelligence Engine - Vanilla JS Consent Banner
 * Version: 4.0.0 (Decoupled Edge Architecture)
 * (c) 2026 AuraWorks (Pty) Ltd. All Rights Reserved.
 */
(function() {
    let auraId = null;
    let clientId = null;
    let config = null;
    let shadow = null;
    let container = null;
    let hasConsent = false;
    let isEnriched = false;

    // Form inputs state
    let email = '';
    let firstName = '';
    let lastName = '';
    let phone = '';
    let role = '';
    let companyName = '';

    let currentPhase = 1;
    let currentFormStep = 1;
    let isVisible = false;

    // Trigger flags
    let scrollTriggered = false;
    let exitTriggered = false;

    // SVG icons helper
    const SVGS = {
        X: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        ArrowRight: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
        User: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        Mail: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
        Briefcase: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
        Phone: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
        Building2: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="15" y1="22" x2="15" y2="16"></line><line x1="9" y1="16" x2="15" y2="16"></line><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path><path d="M12 14h.01"></path></svg>',
        FileText: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
    };

    // Listen for aura:ready to boot
    window.addEventListener('aura:ready', (e) => {
        if (window.AURA_BANNER_INITIALIZED) return;
        window.AURA_BANNER_INITIALIZED = true;

        auraId = e.detail.auraId;
        clientId = e.detail.clientId;
        config = e.detail.config;

        init();
    });

    // Listen for custom trigger events (e.g. Asset Gate)
    window.addEventListener('aura:trigger_banner', (e) => {
        const phase = e.detail?.phase || 4;
        showPhase(phase);
    });
    
    // Signal to aura.js that banner listeners are bound
    window.dispatchEvent(new CustomEvent('aura:banner_mounted'));

    function init() {
        const requireConsent = config ? config.require_consent_banner : false;
        const complianceMode = config ? config.compliance_mode : "POPIA";

        hasConsent = document.cookie.split('; ').some(row => row.startsWith('aura_consent=true')) || localStorage.getItem('aura_consent_given') === 'true';
        isEnriched = localStorage.getItem('aura_lead_captured') === 'true';

        if (!requireConsent || (hasConsent && isEnriched)) return;

        createDOM();
        setupTriggers(complianceMode);
    }

    function setupTriggers(complianceMode) {
        if (!hasConsent) {
            if (complianceMode === "GDPR") {
                showPhase(1);
            } else {
                // SADC/POPIA: Show banner after 2.5s delay
                setTimeout(() => {
                    if (!hasConsent) showPhase(1);
                }, 2500);
            }
        } else if (!isEnriched) {
            // Consented but details not yet captured
            showPhase(2);
        }

        // Scroll Ceiling (50%) Trigger (POPIA and Default only)
        window.addEventListener('scroll', () => {
            if (scrollTriggered || hasConsent || currentPhase === 4) return;
            const scrollPct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
            if (scrollPct >= 0.5) {
                scrollTriggered = true;
                showPhase(2);
            }
        });

        // Exit Intent Trigger (POPIA and Default only)
        document.addEventListener('mouseleave', (e) => {
            if (exitTriggered || hasConsent || currentPhase === 4 || e.clientY >= 50) return;
            exitTriggered = true;
            showPhase(3);
        });
    }

    function createDOM() {
        if (document.getElementById('aura-consent-root')) return;

        container = document.createElement('div');
        container.id = 'aura-consent-root';
        container.style.position = 'fixed';
        container.style.zIndex = '2147483647';
        document.body.appendChild(container);

        shadow = container.attachShadow({ mode: 'closed' });

        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
            
            :host {
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                color-scheme: dark;
            }
            
            .aura-banner {
                position: fixed;
                bottom: 32px;
                right: 32px;
                width: 380px;
                max-width: calc(100vw - 64px);
                background: rgba(10, 10, 10, 0.95);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                color: #e2e8f0;
                padding: 24px;
                border-radius: 14px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
                transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
                transform: translateY(100px);
                opacity: 0;
                box-sizing: border-box;
                display: none;
            }
            
            .aura-banner.visible {
                display: block;
                transform: translateY(0);
                opacity: 1;
            }
            
            .aura-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .aura-badge-container {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .aura-ping {
                position: relative;
                display: flex;
                height: 8px;
                width: 8px;
            }
            
            .aura-ping-ring {
                animation: aura-ping-anim 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                position: absolute;
                display: inline-flex;
                height: 100%;
                width: 100%;
                border-radius: 9999px;
                background-color: #10b981;
                opacity: 0.75;
            }
            
            .aura-ping-dot {
                position: relative;
                display: inline-flex;
                border-radius: 9999px;
                height: 8px;
                width: 8px;
                background-color: #10b981;
            }
            
            .aura-badge-text {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.25em;
                color: #64748b;
            }
            
            .aura-close {
                background: none;
                border: none;
                color: #475569;
                cursor: pointer;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s;
            }
            
            .aura-close:hover {
                color: #cbd5e1;
            }
            
            .aura-title {
                font-size: 16px;
                font-weight: 700;
                letter-spacing: -0.02em;
                color: #f8fafc;
                margin: 0 0 8px 0;
            }
            
            .aura-text {
                font-size: 12px;
                line-height: 1.6;
                color: #94a3b8;
                font-weight: 300;
                margin-bottom: 20px;
            }
            
            .aura-input-wrapper {
                position: relative;
                margin-bottom: 12px;
            }
            
            .aura-input-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #475569;
                display: flex;
                align-items: center;
            }
            
            .aura-input {
                width: 100%;
                background: #020617;
                border: 1px solid #1e293b;
                border-radius: 8px;
                padding: 10px 12px 10px 36px;
                color: #f8fafc;
                font-size: 13px;
                box-sizing: border-box;
                outline: none;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            
            .aura-input:focus {
                border-color: #10b981;
                box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
            }
            
            .aura-input::placeholder {
                color: #475569;
            }
            
            .aura-input-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .aura-btn-primary {
                background: #f8fafc;
                color: #020617;
                border: none;
                border-radius: 8px;
                padding: 12px 16px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                cursor: pointer;
                width: 100%;
                box-sizing: border-box;
                transition: background 0.2s, transform 0.1s, opacity 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            
            .aura-btn-primary:hover:not(:disabled) {
                background: #ffffff;
            }
            
            .aura-btn-primary:active:not(:disabled) {
                transform: scale(0.98);
            }
            
            .aura-btn-primary:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .aura-btn-primary.accent {
                background: #10b981;
                color: #ffffff;
            }
            
            .aura-btn-primary.accent:hover:not(:disabled) {
                background: #34d399;
            }
            
            .aura-btn-secondary {
                background: none;
                border: none;
                color: #64748b;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                cursor: pointer;
                transition: color 0.2s;
                margin-top: 12px;
                display: block;
                text-align: center;
                width: 100%;
            }
            
            .aura-btn-secondary:hover {
                color: #cbd5e1;
            }
            
            .aura-tabs {
                display: flex;
                border-bottom: 1px solid #1e293b;
                margin-bottom: 16px;
            }
            
            .aura-tab {
                flex: 1;
                background: none;
                border: none;
                color: #475569;
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                padding: 8px 0;
                cursor: pointer;
                transition: color 0.2s, border-color 0.2s;
                border-bottom: 2px solid transparent;
            }
            
            .aura-tab.active {
                color: #f8fafc;
                border-bottom-color: #10b981;
            }
            
            .aura-tab:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
            
            .aura-footer-text {
                font-size: 8px;
                color: #475569;
                text-align: center;
                margin-top: 16px;
                line-height: 1.4;
            }
            
            .aura-footer-text a {
                color: #64748b;
                text-decoration: underline;
            }
            
            .aura-footer-text a:hover {
                color: #cbd5e1;
            }
            
            .aura-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                z-index: 2147483646;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                box-sizing: border-box;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.4s ease;
            }
            
            .aura-modal-overlay.visible {
                opacity: 1;
                pointer-events: auto;
            }
            
            .aura-modal {
                background: #0a0a0a;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                max-width: 480px;
                width: 100%;
                padding: 32px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);
                text-align: center;
                transform: scale(0.95);
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                box-sizing: border-box;
            }
            
            .aura-modal-overlay.visible .aura-modal {
                transform: scale(1);
            }
            
            .aura-modal-icon {
                width: 56px;
                height: 56px;
                border-radius: 56px;
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #94a3b8;
                margin: 0 auto 20px auto;
            }
            
            .aura-modal-title {
                font-size: 20px;
                font-weight: 700;
                color: #f8fafc;
                margin: 0 0 8px 0;
                letter-spacing: -0.02em;
            }
            
            .aura-modal-text {
                font-size: 13px;
                line-height: 1.6;
                color: #94a3b8;
                font-weight: 300;
                margin-bottom: 24px;
            }
            
            @keyframes aura-ping-anim {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                70%, 100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        shadow.appendChild(style);

        const banner = document.createElement('div');
        banner.className = 'aura-banner';
        banner.id = 'aura-banner-el';

        const overlay = document.createElement('div');
        overlay.className = 'aura-modal-overlay';
        overlay.id = 'aura-modal-overlay-el';

        shadow.appendChild(banner);
        shadow.appendChild(overlay);
    }

    function showPhase(phase) {
        currentPhase = phase;
        isVisible = true;

        if (phase === 4) {
            // Hide banner, show overlay
            const bannerEl = shadow.getElementById('aura-banner-el');
            bannerEl.classList.remove('visible');

            const overlayEl = shadow.getElementById('aura-modal-overlay-el');
            overlayEl.innerHTML = renderPhase4();
            overlayEl.classList.add('visible');
            bindPhase4Events();
        } else {
            // Hide overlay, show banner
            const overlayEl = shadow.getElementById('aura-modal-overlay-el');
            overlayEl.classList.remove('visible');

            const bannerEl = shadow.getElementById('aura-banner-el');
            bannerEl.innerHTML = renderBanner();
            bannerEl.classList.add('visible');
            bindBannerEvents();
        }
    }

    function renderBanner() {
        if (currentPhase === 1) {
            const isGDPR = config?.compliance_mode === "GDPR";
            return `
                <div class="aura-header">
                    <div class="aura-badge-container">
                        <span class="aura-ping">
                            <span class="aura-ping-ring"></span>
                            <span class="aura-ping-dot"></span>
                        </span>
                        <span class="aura-badge-text">Identity Bridge v4.0</span>
                    </div>
                    <button class="aura-close" id="aura-btn-close">${SVGS.X}</button>
                </div>
                <h3 class="aura-title">Let's Connect</h3>
                <p class="aura-text">
                    We noticed you may be interested in our product. May we reach out for further B2B communication?
                </p>
                ${isGDPR ? `
                <div style="margin-bottom: 16px; display: flex; align-items: flex-start; gap: 8px;">
                    <input type="checkbox" id="aura-consent-checkbox" style="margin-top: 3px; cursor: pointer;" />
                    <label for="aura-consent-checkbox" style="font-size: 11px; color: #94a3b8; line-height: 1.4; cursor: pointer; user-select: none;">
                        I consent to the collection of my browser configuration, canvas signature, and website telemetry.
                    </label>
                </div>
                ` : ''}
                <div style="display: flex; gap: 8px;">
                    <button class="aura-btn-primary accent" id="aura-btn-accept" ${isGDPR ? 'disabled' : ''}>Authorize</button>
                    <button class="aura-btn-secondary" id="aura-btn-decline" style="margin: 0; width: auto; padding: 0 12px; height: 38px; display: flex; align-items: center;">Maybe Later</button>
                </div>
                <p class="aura-footer-text">AuraWorks (Pty) Ltd — Industrial Intelligence Solutions</p>
            `;
        }

        if (currentPhase === 2) {
            const isTab2Disabled = (!firstName || !lastName || !phone);
            return `
                <div class="aura-header">
                    <div class="aura-badge-container">
                        <span class="aura-ping">
                            <span class="aura-ping-ring"></span>
                            <span class="aura-ping-dot"></span>
                        </span>
                        <span class="aura-badge-text">Intelligence Phase 02</span>
                    </div>
                    <button class="aura-close" id="aura-btn-close">${SVGS.X}</button>
                </div>
                <div class="aura-tabs">
                    <button class="aura-tab ${currentFormStep === 1 ? 'active' : ''}" id="aura-tab-1">Contact Info</button>
                    <button class="aura-tab ${currentFormStep === 2 ? 'active' : ''}" id="aura-tab-2" ${isTab2Disabled ? 'disabled' : ''}>Company Details</button>
                </div>
                ${currentFormStep === 1 ? `
                <div>
                    <h4 class="aura-title" style="font-size: 13px; margin-bottom: 12px;">Who should we contact?</h4>
                    <div class="aura-input-grid">
                        <div class="aura-input-wrapper">
                            <span class="aura-input-icon">${SVGS.User}</span>
                            <input type="text" placeholder="First Name" class="aura-input" id="aura-input-firstname" value="${firstName}">
                        </div>
                        <div class="aura-input-wrapper">
                            <span class="aura-input-icon">${SVGS.User}</span>
                            <input type="text" placeholder="Last Name" class="aura-input" id="aura-input-lastname" value="${lastName}">
                        </div>
                    </div>
                    <div class="aura-input-wrapper">
                        <span class="aura-input-icon">${SVGS.Phone}</span>
                        <input type="text" placeholder="Direct Phone Number" class="aura-input" id="aura-input-phone" value="${phone}">
                    </div>
                    <button class="aura-btn-primary accent" id="aura-btn-next" ${(!firstName || !lastName || !phone) ? 'disabled' : ''}>
                        Next Step ${SVGS.ArrowRight}
                    </button>
                </div>
                ` : `
                <div>
                    <h4 class="aura-title" style="font-size: 13px; margin-bottom: 12px;">How can we support your organization?</h4>
                    <div class="aura-input-wrapper">
                        <span class="aura-input-icon">${SVGS.Mail}</span>
                        <input type="email" placeholder="Work Email Address" class="aura-input" id="aura-input-email" value="${email}">
                    </div>
                    <div class="aura-input-wrapper">
                        <span class="aura-input-icon">${SVGS.Building2}</span>
                        <input type="text" placeholder="Company Name" class="aura-input" id="aura-input-company" value="${companyName}">
                    </div>
                    <div class="aura-input-wrapper">
                        <span class="aura-input-icon">${SVGS.Briefcase}</span>
                        <input type="text" placeholder="Job Position (e.g., Lead Engineer)" class="aura-input" id="aura-input-role" value="${role}">
                    </div>
                    <button class="aura-btn-primary accent" id="aura-btn-submit" ${(!email || !companyName || !role) ? 'disabled' : ''}>
                        Complete Industrial Sync
                    </button>
                </div>
                `}
                <p class="aura-footer-text">AuraWorks (Pty) Ltd — Industrial Intelligence Solutions</p>
            `;
        }

        if (currentPhase === 3) {
            return `
                <div class="aura-header">
                    <div class="aura-badge-container">
                        <span class="aura-ping">
                            <span class="aura-ping-ring"></span>
                            <span class="aura-ping-dot"></span>
                        </span>
                        <span class="aura-badge-text">Identity Bridge v4.0</span>
                    </div>
                    <button class="aura-close" id="aura-btn-close">${SVGS.X}</button>
                </div>
                <h3 class="aura-title">Leaving so soon?</h3>
                <p class="aura-text">
                    If you'd like our SADC regional procurement spec guides and monthly industrial reports emailed to you, share your work email below.
                </p>
                <div class="aura-input-wrapper">
                    <span class="aura-input-icon">${SVGS.Mail}</span>
                    <input type="email" placeholder="Enter business email..." class="aura-input" id="aura-input-email" value="${email}">
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="aura-btn-primary accent" id="aura-btn-exit-submit" ${(!email || !email.includes('@')) ? 'disabled' : ''}>Email Me the Guides</button>
                    <button class="aura-btn-secondary" id="aura-btn-decline" style="margin: 0; width: auto; padding: 0 12px; height: 38px; display: flex; align-items: center;">Exit Site</button>
                </div>
                <p class="aura-footer-text">AuraWorks (Pty) Ltd — Industrial Intelligence Solutions</p>
            `;
        }

        return '';
    }

    function renderPhase4() {
        return `
            <div class="aura-modal">
                <div class="aura-modal-icon">${SVGS.FileText}</div>
                <h3 class="aura-modal-title">Access Technical Resource</h3>
                <p class="aura-modal-text">
                    To open blueprint schematics, CAD files, or technical datasheets, please share your business email so we can send the files directly to your inbox and establish a connection.
                </p>
                <div class="aura-input-wrapper" style="text-align: left; margin-bottom: 20px;">
                    <span class="aura-input-icon">${SVGS.Mail}</span>
                    <input type="email" placeholder="Enter corporate email..." class="aura-input" id="aura-modal-input-email" value="${email}">
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="aura-btn-primary accent" id="aura-modal-btn-submit" ${(!email || !email.includes('@')) ? 'disabled' : ''} style="padding: 14px 16px;">
                        Send Files & Connect
                    </button>
                    <button class="aura-btn-secondary" id="aura-modal-btn-cancel" style="margin-top: 4px;">
                        Cancel Request
                    </button>
                </div>
            </div>
        `;
    }

    function bindBannerEvents() {
        const closeBtn = shadow.getElementById('aura-btn-close');
        if (closeBtn) closeBtn.addEventListener('click', dismissBanner);

        const declineBtn = shadow.getElementById('aura-btn-decline');
        if (declineBtn) declineBtn.addEventListener('click', dismissBanner);

        if (currentPhase === 1) {
            const acceptBtn = shadow.getElementById('aura-btn-accept');
            const consentCheckbox = shadow.getElementById('aura-consent-checkbox');

            if (consentCheckbox && acceptBtn) {
                consentCheckbox.addEventListener('change', () => {
                    acceptBtn.disabled = !consentCheckbox.checked;
                });
            }

            if (acceptBtn) {
                acceptBtn.addEventListener('click', () => {
                    // Set consent
                    hasConsent = true;
                    const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
                    document.cookie = `aura_consent=true; expires=${exp.toUTCString()}; path=/; SameSite=Lax; Secure`;
                    localStorage.setItem('aura_consent_given', 'true');

                    // Dispatch consent event to aura.js
                    window.dispatchEvent(new CustomEvent('aura_consent_updated', {
                        detail: { status: 'accepted', source: 'banner' }
                    }));

                    // Transition to phase 2
                    showPhase(2);
                });
            }
        }

        if (currentPhase === 2) {
            const tab1 = shadow.getElementById('aura-tab-1');
            const tab2 = shadow.getElementById('aura-tab-2');

            if (tab1) {
                tab1.addEventListener('click', () => {
                    currentFormStep = 1;
                    showPhase(2);
                });
            }

            if (tab2) {
                tab2.addEventListener('click', () => {
                    if (firstName && lastName && phone) {
                        currentFormStep = 2;
                        showPhase(2);
                    }
                });
            }

            if (currentFormStep === 1) {
                const fnameInput = shadow.getElementById('aura-input-firstname');
                const lnameInput = shadow.getElementById('aura-input-lastname');
                const phoneInput = shadow.getElementById('aura-input-phone');
                const nextBtn = shadow.getElementById('aura-btn-next');

                const validate = () => {
                    firstName = fnameInput.value.trim();
                    lastName = lnameInput.value.trim();
                    phone = phoneInput.value.trim();
                    if (nextBtn) nextBtn.disabled = (!firstName || !lastName || !phone);
                };

                [fnameInput, lnameInput, phoneInput].forEach(inp => {
                    if (inp) inp.addEventListener('input', validate);
                });

                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        localStorage.setItem('aura_first_name', firstName);
                        localStorage.setItem('aura_last_name', lastName);
                        localStorage.setItem('aura_phone', phone);

                        // Dispatch partial lead event
                        window.dispatchEvent(new CustomEvent('aura_warm_lead', {
                            detail: {
                                first_name: firstName,
                                last_name: lastName,
                                phone: phone,
                                name: `${firstName} ${lastName}`,
                                capture_source: 'banner_warm_signal_part1'
                            }
                        }));

                        currentFormStep = 2;
                        showPhase(2);
                    });
                }
            } else {
                const emailInput = shadow.getElementById('aura-input-email');
                const companyInput = shadow.getElementById('aura-input-company');
                const roleInput = shadow.getElementById('aura-input-role');
                const submitBtn = shadow.getElementById('aura-btn-submit');

                const validate = () => {
                    email = emailInput.value.trim();
                    companyName = companyInput.value.trim();
                    role = roleInput.value.trim();
                    if (submitBtn) submitBtn.disabled = (!email || !companyName || !role);
                };

                [emailInput, companyInput, roleInput].forEach(inp => {
                    if (inp) inp.addEventListener('input', validate);
                });

                if (submitBtn) {
                    submitBtn.addEventListener('submit', (e) => e.preventDefault());
                    submitBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        localStorage.setItem('aura_lead_captured', 'true');
                        isEnriched = true;

                        // Dispatch full lead details
                        window.dispatchEvent(new CustomEvent('aura_warm_lead', {
                            detail: {
                                email,
                                company: companyName,
                                company_name: companyName,
                                first_name: firstName,
                                last_name: lastName,
                                name: `${firstName} ${lastName}`,
                                position: role,
                                phone: phone,
                                capture_source: 'banner_warm_signal'
                            }
                        }));

                        dismissBanner();
                    });
                }
            }
        }

        if (currentPhase === 3) {
            const emailInput = shadow.getElementById('aura-input-email');
            const submitBtn = shadow.getElementById('aura-btn-exit-submit');

            if (emailInput && submitBtn) {
                emailInput.addEventListener('input', () => {
                    email = emailInput.value.trim();
                    submitBtn.disabled = (!email || !email.includes('@'));
                });

                submitBtn.addEventListener('click', () => {
                    hasConsent = true;
                    const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
                    document.cookie = `aura_consent=true; expires=${exp.toUTCString()}; path=/; SameSite=Lax; Secure`;
                    localStorage.setItem('aura_consent_given', 'true');

                    window.dispatchEvent(new CustomEvent('aura_warm_lead', {
                        detail: {
                            email,
                            capture_source: 'banner_exit_intent'
                        }
                    }));

                    dismissBanner();
                });
            }
        }
    }

    function bindPhase4Events() {
        const cancelBtn = shadow.getElementById('aura-modal-btn-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', dismissBanner);

        const emailInput = shadow.getElementById('aura-modal-input-email');
        const submitBtn = shadow.getElementById('aura-modal-btn-submit');

        if (emailInput && submitBtn) {
            emailInput.addEventListener('input', () => {
                email = emailInput.value.trim();
                submitBtn.disabled = (!email || !email.includes('@'));
            });

            submitBtn.addEventListener('click', () => {
                hasConsent = true;
                const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
                document.cookie = `aura_consent=true; expires=${exp.toUTCString()}; path=/; SameSite=Lax; Secure`;
                localStorage.setItem('aura_consent_given', 'true');

                window.dispatchEvent(new CustomEvent('aura_warm_lead', {
                    detail: {
                        email,
                        capture_source: 'banner_asset_gate'
                    }
                }));

                dismissBanner();
            });
        }
    }

    function dismissBanner() {
        isVisible = false;
        const bannerEl = shadow.getElementById('aura-banner-el');
        if (bannerEl) bannerEl.classList.remove('visible');

        const overlayEl = shadow.getElementById('aura-modal-overlay-el');
        if (overlayEl) overlayEl.classList.remove('visible');
    }
})();
