// Container of modal appended to bottom of document body
let standupModal = null;
let parkingLotModal = null;
let namesData = [];
let completedNames = new Set();
let parkingLotItems = [];
let globalClickListenerAdded = false;

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
    <div id="standupModal" class="standup-modal-content">
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
        <button id="parkingLotBtn" class="standup-btn parking-lot">🚗 View Parking Lot</button>
      </div>
    </div>
  `;

  return modalHTML;
}

// Create the parking lot modal HTML
function createParkingLotModal() {
  const modalHTML = `
    <div id="parkingLotModal" class="standup-modal-content parking-lot-modal">
      <div class="standup-header">
        <h2>🚗 Parking Lot</h2>
        <div class="standup-controls">
          <button id="closeParkingLotBtn" class="standup-btn close">✕</button>
        </div>
      </div>
      <div class="parking-lot-content">
        <div id="parkingLotList" class="standup-list">
          ${parkingLotItems.length === 0 ? 
            '<div class="empty-parking-lot">No parking lot items yet</div>' :
            parkingLotItems.map((item, index) => `
              <div class="standup-item parking-lot-item" data-item="${item}">
                <span class="standup-number">${index + 1}</span>
                <span class="standup-name">${item}</span>
                <button class="remove-item-btn" data-item="${item}">🗑️</button>
              </div>
            `).join('')
          }
        </div>
        <div class="parking-lot-add-section">
          <button id="addParkingLotBtn" class="standup-btn add-item">+ Add Parking Lot Item</button>
          <div id="addItemForm" class="add-item-form" style="display: none;">
            <input type="text" id="parkingLotInput" placeholder="Enter parking lot item..." maxlength="100">
            <div class="form-buttons">
              <button id="saveItemBtn" class="standup-btn primary">Save</button>
              <button id="cancelItemBtn" class="standup-btn secondary">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  return modalHTML;
}

// Show the modal
async function showModal() {
  console.log("standup modal: ", standupModal);
  if (standupModal && standupModal.style.display == "none") {
    standupModal.style.display = "block";
    return;
  }

  const names = await loadNames();
  const shuffledNames = shuffleArray(names);

  // Create modal element
  // This roundabout process is most efficient way creating complex DOM
  // elements from HTML templates string in vanilla JS
  const modalDiv = document.createElement("div");
  modalDiv.innerHTML = createModal(shuffledNames);
  standupModal = modalDiv.firstElementChild;

  document.body.appendChild(standupModal);

  // Add event listeners
  setupModalEventListeners();

  // Make modal draggable
  makeDraggable(standupModal);
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

  // Parking lot button
  standupModal
    .querySelector("#parkingLotBtn")
    .addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent standup modal from stealing focus back
      showParkingLotModal();
    });

  // Make modal focusable and handle focus/blur for transparency
  standupModal.setAttribute("tabindex", "-1");

  // Add click listener to focus modal when clicked
  standupModal.addEventListener("click", (e) => {
    // Don't steal focus from interactive elements
    if (!e.target.matches('input, button, textarea, select')) {
      standupModal.focus();
    }
  });

  // Add click listener to header to expand modal when collapsed
  const header = standupModal.querySelector(".standup-header");
  header.addEventListener("click", (e) => {
    // Only expand if clicking on header itself or title, not buttons
    if (e.target.matches('.standup-header, .standup-header h2, .standup-header h2 *')) {
      standupModal.focus();
      expandModal();
    }
  });

  // Make modal opaque when focused
  standupModal.addEventListener("focus", () => {
    standupModal.style.opacity = "1";
    expandModal();
  });

  // Make modal semi-transparent when focus is lost
  standupModal.addEventListener("blur", (e) => {
    // Only make transparent if focus moved completely outside the modal
    setTimeout(() => {
      if (!standupModal.contains(document.activeElement)) {
        standupModal.style.opacity = "0.6";
        collapseModal();
      }
    }, 0);
  });


  // Setup global click listener once
  setupGlobalClickListener();

  // Initial focus to start with full opacity
  standupModal.focus();
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

// Show parking lot modal
function showParkingLotModal() {
  if (parkingLotModal) {
    parkingLotModal.style.display = "block";
    // Ensure standup modal becomes semi-transparent immediately
    standupModal.style.opacity = "0.6";
    parkingLotModal.style.opacity = "1";
    parkingLotModal.focus();
    return;
  }

  // Create parking lot modal
  const modalDiv = document.createElement("div");
  modalDiv.innerHTML = createParkingLotModal();
  parkingLotModal = modalDiv.firstElementChild;

  // Position it offset from the standup modal
  parkingLotModal.style.top = "20px";
  parkingLotModal.style.left = "390px"; // 350px width + 20px gap + 20px original left

  document.body.appendChild(parkingLotModal);

  // Setup parking lot event listeners
  setupParkingLotEventListeners();

  // Make parking lot modal focusable and draggable
  parkingLotModal.setAttribute('tabindex', '-1');
  parkingLotModal.addEventListener('click', (e) => {
    // Don't steal focus from interactive elements
    if (!e.target.matches('input, button, textarea, select')) {
      parkingLotModal.focus();
    }
  });
  parkingLotModal.addEventListener('focus', () => {
    parkingLotModal.style.opacity = '1';
  });
  parkingLotModal.addEventListener('blur', (e) => {
    // Only make transparent if focus moved completely outside the modal
    setTimeout(() => {
      if (!parkingLotModal.contains(document.activeElement)) {
        parkingLotModal.style.opacity = '0.6';
      }
    }, 0);
  });

  makeDraggable(parkingLotModal);
  
  // Ensure standup modal becomes semi-transparent immediately
  standupModal.style.opacity = "0.6";
  parkingLotModal.focus();
}

// Hide parking lot modal
function hideParkingLotModal() {
  if (parkingLotModal) {
    parkingLotModal.style.display = "none";
  }
}

// Setup parking lot modal event listeners
function setupParkingLotEventListeners() {
  // Close button
  parkingLotModal
    .querySelector("#closeParkingLotBtn")
    .addEventListener("click", hideParkingLotModal);

  // Add item button
  parkingLotModal
    .querySelector("#addParkingLotBtn")
    .addEventListener("click", () => {
      document.getElementById("addItemForm").style.display = "block";
      document.getElementById("addParkingLotBtn").style.display = "none";
      document.getElementById("parkingLotInput").focus();
    });

  // Save button
  parkingLotModal
    .querySelector("#saveItemBtn")
    .addEventListener("click", saveParkingLotItem);

  // Cancel button
  parkingLotModal
    .querySelector("#cancelItemBtn")
    .addEventListener("click", cancelAddItem);

  // Enter key in input
  parkingLotModal
    .querySelector("#parkingLotInput")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        saveParkingLotItem();
      }
    });

  // Setup remove item listeners
  setupRemoveItemListeners();
}

// Save parking lot item
function saveParkingLotItem() {
  const input = document.getElementById("parkingLotInput");
  const value = input.value.trim();
  
  if (value && !parkingLotItems.includes(value)) {
    parkingLotItems.push(value);
    refreshParkingLotList();
  }
  
  cancelAddItem();
}

// Cancel add item
function cancelAddItem() {
  document.getElementById("addItemForm").style.display = "none";
  document.getElementById("addParkingLotBtn").style.display = "block";
  document.getElementById("parkingLotInput").value = "";
}

// Refresh parking lot list
function refreshParkingLotList() {
  const listContainer = parkingLotModal.querySelector("#parkingLotList");
  listContainer.innerHTML = parkingLotItems.length === 0 ? 
    '<div class="empty-parking-lot">No parking lot items yet</div>' :
    parkingLotItems.map((item, index) => `
      <div class="standup-item parking-lot-item" data-item="${item}">
        <span class="standup-number">${index + 1}</span>
        <span class="standup-name">${item}</span>
        <button class="remove-item-btn" data-item="${item}">🗑️</button>
      </div>
    `).join('');
  
  setupRemoveItemListeners();
}

// Setup remove item listeners
function setupRemoveItemListeners() {
  const removeButtons = parkingLotModal.querySelectorAll(".remove-item-btn");
  removeButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const item = e.target.dataset.item;
      parkingLotItems = parkingLotItems.filter(i => i !== item);
      refreshParkingLotList();
    });
  });
}

// Make element draggable with boundary constraints
function makeDraggable(element) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  const header = element.querySelector(".standup-header");

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

// Collapse modal (hide list and footer)
function collapseModal() {
  if (standupModal) {
    const list = standupModal.querySelector(".standup-list");
    const footer = standupModal.querySelector(".standup-footer");
    if (list) list.style.display = "none";
    if (footer) footer.style.display = "none";
    standupModal.classList.add("collapsed");
  }
}

// Expand modal (show list and footer)
function expandModal() {
  if (standupModal) {
    const list = standupModal.querySelector(".standup-list");
    const footer = standupModal.querySelector(".standup-footer");
    if (list) list.style.display = "block";
    if (footer) footer.style.display = "block";
    standupModal.classList.remove("collapsed");
  }
}

// Setup global click listener to handle clicks outside modals
function setupGlobalClickListener() {
  if (globalClickListenerAdded) return;
  
  document.addEventListener("click", (e) => {
    // Check if click is outside both modals
    const clickedOutsideStandup = standupModal && !standupModal.contains(e.target);
    const clickedOutsideParkingLot = !parkingLotModal || !parkingLotModal.contains(e.target);
    
    // If clicked outside standup modal, collapse it
    if (clickedOutsideStandup && clickedOutsideParkingLot) {
      standupModal.style.opacity = "0.6";
      collapseModal();
    }
    
    // If clicked outside parking lot modal but inside standup, focus standup
    if (clickedOutsideParkingLot && !clickedOutsideStandup) {
      if (parkingLotModal && parkingLotModal.style.display !== "none") {
        standupModal.style.opacity = "1";
        expandModal();
        standupModal.focus();
      }
    }
  });
  
  globalClickListenerAdded = true;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showModal") {
    showModal();
  } else if (request.action === "hideModal") {
    hideModal();
  }
});
