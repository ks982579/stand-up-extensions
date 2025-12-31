document.addEventListener("DOMContentLoaded", function() {
    const showModalBtn = document.getElementById("showModal");
    const hideModalBtn = document.getElementById("hideModal");

    showModalBtn.addEventListener("click", async function() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Inject CSS and scripts into the current tab
        try {
            // Inject CSS first
            await chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ["modal.css"]
            });

            // Inject storage adapter and content script
            // These scripts now handle duplicate injection gracefully
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["storage-adapter.js", "content.js"]
            });

            // Send message to show modal
            chrome.tabs.sendMessage(tab.id, { action: "showModal" });
            window.close(); // Close popup after showing modal
        } catch (error) {
            console.error("Error injecting scripts:", error);
        }
    });

    hideModalBtn.addEventListener("click", async function() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Send message to content script to hide modal
        try {
            chrome.tabs.sendMessage(tab.id, { action: "hideModal" });
            window.close(); // Close popup
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });
});
