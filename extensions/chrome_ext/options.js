// DOM elements
const nameInput = document.getElementById('nameInput');
const addButton = document.getElementById('addButton');
const namesList = document.getElementById('namesList');
const nameCount = document.getElementById('nameCount');
const statusMessage = document.getElementById('statusMessage');
const syncToggle = document.getElementById('syncToggle');

// Load and display names when page opens
document.addEventListener('DOMContentLoaded', () => {
  loadSyncSetting();
  loadNames();
});

// Add name on button click
addButton.addEventListener('click', addName);

// Add name on Enter key
nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addName();
  }
});

// Handle sync toggle changes
syncToggle.addEventListener('change', async () => {
  const enabled = syncToggle.checked;

  // Get names from the current (old) storage before switching
  const currentNames = await StorageAdapter.get(['teamNames']);
  const names = currentNames.teamNames || [];

  // Switch to the new storage mode
  await StorageAdapter.setSyncEnabled(enabled);

  // Copy names to the new storage mode
  await StorageAdapter.set({ teamNames: names });

  // Reload the display to show the names
  await loadNames();

  showStatus(
    enabled
      ? 'Chrome Sync enabled - names copied and will sync across devices'
      : 'Chrome Sync disabled - names copied to local storage only',
    'success'
  );
});

// Load sync setting
async function loadSyncSetting() {
  const enabled = await StorageAdapter.getSyncEnabled();
  syncToggle.checked = enabled;
}

// Load names from storage
async function loadNames() {
  const result = await StorageAdapter.get(['teamNames']);
  const names = result.teamNames || [];
  displayNames(names);
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
async function addName() {
  const name = nameInput.value.trim();

  if (!name) {
    showStatus('Please enter a name', 'error');
    return;
  }

  const result = await StorageAdapter.get(['teamNames']);
  const names = result.teamNames || [];

  // Check for duplicates
  if (names.includes(name)) {
    showStatus('This name already exists', 'error');
    return;
  }

  // Add the new name
  names.push(name);

  // Save to storage
  await StorageAdapter.set({ teamNames: names });

  nameInput.value = '';
  displayNames(names);
  showStatus('Name added successfully!', 'success');
  nameInput.focus();
}

// Remove a name
async function removeName(index) {
  const result = await StorageAdapter.get(['teamNames']);
  const names = result.teamNames || [];
  const removedName = names[index];

  names.splice(index, 1);

  await StorageAdapter.set({ teamNames: names });

  displayNames(names);
  showStatus(`Removed "${removedName}"`, 'success');
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
