// Storage adapter that switches between local and sync storage
// The sync preference itself is always stored in local storage (device-specific setting)

// Only define StorageAdapter if it doesn't already exist
if (typeof StorageAdapter === 'undefined') {
    var StorageAdapter = {
        // Get the appropriate storage backend based on user preference
        async getStorage() {
            return new Promise((resolve) => {
                // Always check local storage for the sync preference
                chrome.storage.local.get(['useSyncStorage'], (result) => {
                    const useSyncStorage = result.useSyncStorage || false;
                    resolve(useSyncStorage ? chrome.storage.sync : chrome.storage.local);
                });
            });
        },

        // Get data from the appropriate storage
        async get(keys) {
            const storage = await this.getStorage();
            return new Promise((resolve) => {
                storage.get(keys, (result) => {
                    resolve(result);
                });
            });
        },

        // Set data in the appropriate storage
        async set(data) {
            const storage = await this.getStorage();
            return new Promise((resolve) => {
                storage.set(data, () => {
                    resolve();
                });
            });
        },

        // Get the sync preference setting
        async getSyncEnabled() {
            return new Promise((resolve) => {
                chrome.storage.local.get(['useSyncStorage'], (result) => {
                    resolve(result.useSyncStorage || false);
                });
            });
        },

        // Set the sync preference setting
        async setSyncEnabled(enabled) {
            return new Promise((resolve) => {
                chrome.storage.local.set({ useSyncStorage: enabled }, () => {
                    resolve();
                });
            });
        }
    };
}
