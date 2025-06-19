document.addEventListener("DOMContentLoaded", function() {
  const showModalBtn = document.getElementById("showModal");
  const hideModalBtn = document.getElementById("hideModal");

  showModalBtn.addEventListener("click", function() {
    // Send message to content script to show modal
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "showModal" });
      window.close(); // Close popup after showing modal
    });
  });

  hideModalBtn.addEventListener("click", function() {
    // Send message to content script to hide modal
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "hideModal" });
      window.close(); // Close popup
    });
  });
});
