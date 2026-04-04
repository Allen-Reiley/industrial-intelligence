/**
 * AuraWorks Identity Bridge - cookie.js
 * Version: 1.0.0 (Persistence Edition)
 * Purpose: 2026-compliant Triple-Storage (Cookie, LocalStorage, IndexedDB).
 * For reference purposes, aura.js is used.
*/

const AuraPersistence = {
    key: 'aura_uid',

    async init() {
        let id = await this.getStoredID();
        
        if (!id) {
            id = this.generateUUID();
            console.log("🆕 AuraWorks: New Unique ID Generated:", id);
        } else {
            console.log("🔄 AuraWorks: Existing ID Restored:", id);
        }

        await this.syncStorage(id);
        return id;
    },

    /**
     * 🛡️ THE TRIPLE-LOCK: Checks all three storage areas
     */
    async getStoredID() {
        // 1. Check Cookie (Partitioned for 2026)
        const cookieId = document.cookie.split('; ').find(row => row.startsWith(`${this.key}=`))?.split('=')[1];
        
        // 2. Check LocalStorage
        const localId = localStorage.getItem(this.key);
        
        // 3. Check IndexedDB (The most durable)
        const dbId = await this.getFromIndexedDB();

        return cookieId || localId || dbId || null;
    },

    /**
     * 🚀 SYNC: Writes the ID to all three locations
     */
    async syncStorage(id) {
        // A. Set CHIPS Cookie (Partitioned; SameSite=None; Secure)
        // This is the 2026 standard for B2B cross-site persistence
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 2); // 2-year persistence
        document.cookie = `${this.key}=${id}; expires=${expiry.toUTCString()}; path=/; SameSite=None; Secure; Partitioned`;

        // B. Set LocalStorage
        localStorage.setItem(this.key, id);

        // C. Set IndexedDB
        await this.saveToIndexedDB(id);
        
        // Update the global aura_uid for tracker.js to pick up
        window.AURA_UID = id;
    },

    /**
     * 🧬 UTILITY: ID Generation & IndexedDB Logic
     */
    generateUUID() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    },

    async getFromIndexedDB() {
        return new Promise((resolve) => {
            const request = indexedDB.open("AuraWorksDB", 1);
            request.onupgradeneeded = (e) => e.target.result.createObjectStore("identity");
            request.onsuccess = (e) => {
                const db = e.target.result;
                const tx = db.transaction("identity", "readonly");
                const store = tx.objectStore("identity");
                const getReq = store.get(this.key);
                getReq.onsuccess = () => resolve(getReq.result);
                getReq.onerror = () => resolve(null);
            };
            request.onerror = () => resolve(null);
        });
    },

    async saveToIndexedDB(id) {
        const request = indexedDB.open("AuraWorksDB", 1);
        request.onsuccess = (e) => {
            const db = e.target.result;
            const tx = db.transaction("identity", "readwrite");
            tx.objectStore("identity").put(id, this.key);
        };
    }
};

// Initialize Persistence
AuraPersistence.init();