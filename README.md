# Stand-Up Extensions

> v0.4.1

## Features:

🎲 Randomized order - Names are shuffled each time you show the modal
✅ Checkboxes - Click to mark people as done (they get grayed out and crossed out)
⚙️ Settings page - Easy UI to add/remove team members
🔄 Reshuffle button - Generate a new random order anytime
🎨 Draggable modal - Drag it around the screen so it doesn't block your Jira board
🚗 Parking Lot - Track topics to revisit after standup, each with an optional reason
☁️ Storage options - Choose between local-only or cloud-synced storage

## How to use:

### First-time Setup:
1. Install the extension (load unpacked folder in `chrome://extensions/`)
2. Right-click the extension icon → Select "Options"
3. Add your team member names using the settings page
4. (Optional) Toggle "Enable Chrome Sync" if you want names to sync across devices

### Daily Standup:
1. On any web page, click the extension icon
2. Click "Show Standup Modal"
3. The modal appears with randomized names - drag it to a good spot
4. Check off people as they finish their standup updates
5. Click "Reshuffle" for a new random order anytime
6. Use the 🚗 button to add items to the Parking Lot

### Parking Lot:
- Click the 🚗 button next to a name to add them to the Parking Lot — the modal opens with their name pre-selected and the cursor in the reason field
- Type an optional reason and click Save (or press Enter), or leave it blank and just save the name
- The same person can have multiple entries with different reasons
- Click "View Parking Lot" in the footer or use the 🚗 button to open the Parking Lot modal directly
- Click "+ Add Parking Lot Item" inside the Parking Lot modal to add an entry manually
- Remove individual entries with the 🗑️ button

### Managing Team Members:
Right-click the extension icon → "Options" to add or remove team members.
The modal is designed to be unobtrusive during screen sharing - it's compact,
draggable, and has a clean professional look. Perfect for standups!

## Data Storage:

Team names are stored using Chrome's storage API with two options:

**Local Storage (Default)**
- Stored only on this device
- 10MB storage limit
- Works whether you're signed into Chrome or not

**Chrome Sync (Optional)**
- Syncs across all devices where you're signed into Chrome
- 100KB storage limit (plenty for team names)
- Falls back to local storage if not signed in

Toggle between storage modes in the Options page under "Storage Settings". 

## Attributes:

The icon was created with [HotPot.AI](https://hotpot.ai/ai-image-generator/create) free AI Image Generator using the icon style.
