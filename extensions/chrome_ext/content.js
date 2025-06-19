let standupModal = null;
let namesData = [];
let completedNames = new Set();

// Load names from file
async function loadNames() {
  try {
    const response = await fetch(chrome.runtime.getURL("names.txt"));
    const text = await response.text();
    namesData = text
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    return namesData;
  } catch (error) {
    console.error("Error loading names:", error);
    // Fallback names if file can't be loaded
    return ["Alice", "Bob", "Charlie", "Diana", "Eve"];
  }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Create the modal HTML
function createModal(names) {
  const modalHTML = `
    <div id="standupModal" class="standup-modal">
      <div class="standup-modal-content">
        <div class="standup-header">
          <h2>🎲 Standup Order</h2>
          <div class="standup-controls">
            <button id="reshuffleBtn" class="standup-btn secondary">🔄 Reshuffle</button>
            <button id="closeModalBtn" class="standup-btn close">✕</button>
          </div>
        </div>
        <div class="standup-list">
          ${names
      .map(
        (name, index) => `
            <div class="standup-item" data-name="${name}">
              <span class="standup-number">${index + 1}</span>
              <label class="standup-checkbox-container">
                <input type="checkbox" class="standup-checkbox" data-name="${name}">
                <span class="standup-name">${name}</span>
              </label>
            </div>
          `,
      )
      .join("")}
        </div>
        <div class="standup-footer">
          <span class="standup-count">${names.length} team members</span>
        </div>
      </div>
    </div>
  `;

  return modalHTML;
}

// Show the modal
async function showModal() {
  if (standupModal) {
    standupModal.style.display = "flex";
    return;
  }

  const names = await loadNames();
  const shuffledNames = shuffleArray(names);

  // Create modal element
  const modalDiv = document.createElement("div");
  modalDiv.innerHTML = createModal(shuffledNames);
  standupModal = modalDiv.firstElementChild;

  document.body.appendChild(standupModal);

  // Add event listeners
  setupModalEventListeners();

  // Make modal draggable
  makeDraggable(standupModal.querySelector(".standup-modal-content"));
}

// Setup event listeners for the modal
function setupModalEventListeners() {
  // Close button
  standupModal
    .querySelector("#closeModalBtn")
    .addEventListener("click", hideModal);

  // Reshuffle button
  standupModal
    .querySelector("#reshuffleBtn")
    .addEventListener("click", async () => {
      const names = await loadNames();
      const shuffledNames = shuffleArray(names);
      completedNames.clear(); // Reset completed status

      // Update modal content
      const listContainer = standupModal.querySelector(".standup-list");
      listContainer.innerHTML = shuffledNames
        .map(
          (name, index) => `
      <div class="standup-item" data-name="${name}">
        <span class="standup-number">${index + 1}</span>
        <label class="standup-checkbox-container">
          <input type="checkbox" class="standup-checkbox" data-name="${name}">
          <span class="standup-name">${name}</span>
        </label>
      </div>
    `,
        )
        .join("");

      // Re-attach checkbox listeners
      setupCheckboxListeners();
    });

  // Setup checkbox listeners
  setupCheckboxListeners();

  // Close modal when clicking outside
  standupModal.addEventListener("click", (e) => {
    if (e.target === standupModal) {
      hideModal();
    }
  });
}

// Setup checkbox event listeners
function setupCheckboxListeners() {
  const checkboxes = standupModal.querySelectorAll(".standup-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const name = e.target.dataset.name;
      const item = standupModal.querySelector(`[data-name="${name}"]`);

      if (e.target.checked) {
        completedNames.add(name);
        item.classList.add("completed");
      } else {
        completedNames.delete(name);
        item.classList.remove("completed");
      }
    });
  });
}

// Hide the modal
function hideModal() {
  if (standupModal) {
    standupModal.style.display = "none";
  }
}

// Make element draggable with boundary constraints
function makeDraggable(element) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  const header = element.querySelector(".standup-header");

  // Set initial position
  element.style.position = "fixed";
  element.style.top = "20px";
  element.style.left = "20px";

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // Calculate new position
    let newTop = element.offsetTop - pos2;
    let newLeft = element.offsetLeft - pos1;

    // Get window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;

    // Constrain to screen boundaries
    // Keep at least 20px of the element visible on each side
    newLeft = Math.max(
      20 - elementWidth + 100,
      Math.min(newLeft, windowWidth - 100),
    );
    newTop = Math.max(0, Math.min(newTop, windowHeight - 60)); // Keep header visible

    element.style.top = newTop + "px";
    element.style.left = newLeft + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showModal") {
    showModal();
  } else if (request.action === "hideModal") {
    hideModal();
  }
});
