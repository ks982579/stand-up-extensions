// DOM elements
const nameInput = document.getElementById('nameInput');
const addButton = document.getElementById('addButton');
const namesList = document.getElementById('namesList');
const nameCount = document.getElementById('nameCount');
const statusMessage = document.getElementById('statusMessage');

// Load and display names when page opens
document.addEventListener('DOMContentLoaded', loadNames);

// Add name on button click
addButton.addEventListener('click', addName);

// Add name on Enter key
nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addName();
  }
});

// Load names from storage
function loadNames() {
  chrome.storage.sync.get(['teamNames'], (result) => {
    const names = result.teamNames || [];
    displayNames(names);
  });
}

// Display names in the list
function displayNames(names) {
  nameCount.textContent = names.length;

  if (names.length === 0) {
    namesList.innerHTML = `
      <div class="empty-state">
        <p>No team members yet.</p>
        <p>Add your first team member above to get started!</p>
      </div>
    `;
    return;
  }

  namesList.innerHTML = names
    .map((name, index) => `
      <div class="name-item">
        <span class="name-text">${escapeHtml(name)}</span>
        <button class="btn-danger" data-index="${index}">Remove</button>
      </div>
    `)
    .join('');

  // Add event listeners to remove buttons
  const removeButtons = namesList.querySelectorAll('.btn-danger');
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      removeName(index);
    });
  });
}

// Add a new name
function addName() {
  const name = nameInput.value.trim();

  if (!name) {
    showStatus('Please enter a name', 'error');
    return;
  }

  chrome.storage.sync.get(['teamNames'], (result) => {
    const names = result.teamNames || [];

    // Check for duplicates
    if (names.includes(name)) {
      showStatus('This name already exists', 'error');
      return;
    }

    // Add the new name
    names.push(name);

    // Save to storage
    chrome.storage.sync.set({ teamNames: names }, () => {
      if (chrome.runtime.lastError) {
        showStatus('Error saving name: ' + chrome.runtime.lastError.message, 'error');
        return;
      }

      nameInput.value = '';
      displayNames(names);
      showStatus('Name added successfully!', 'success');
      nameInput.focus();
    });
  });
}

// Remove a name
function removeName(index) {
  chrome.storage.sync.get(['teamNames'], (result) => {
    const names = result.teamNames || [];
    const removedName = names[index];

    names.splice(index, 1);

    chrome.storage.sync.set({ teamNames: names }, () => {
      if (chrome.runtime.lastError) {
        showStatus('Error removing name: ' + chrome.runtime.lastError.message, 'error');
        return;
      }

      displayNames(names);
      showStatus(`Removed "${removedName}"`, 'success');
    });
  });
}

// Show status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';

  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
