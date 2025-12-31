# Changelog

All notable changes to Standup Randomizer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Sections: `[ Added, Changed, Fixed, Removed]`

## [Unreleased]


---

## [0.4.3] - 2025-12-31

### Fixed
- Fixed "Identifier has already been declared" syntax errors when scripts were re-injected
- Fixed duplicate modal creation when clicking "Show Modal" multiple times
- Wrapped variable declarations to prevent redeclaration errors on script re-injection

### Changed
- **State Persistence**: Shuffle order and checkbox states now persist when closing/reopening modal
  - Random order remains the same until explicitly clicking "Reshuffle"
  - Checked-off team members stay checked when modal is reopened
  - Only the "Reshuffle" button resets the order and checkboxes
- Improved modal state management for better user experience during standup sessions
- **Permissions**: Updated manifest permissions for better security and simpler publishing
  - Added `scripting` permission (required for content script injection)
  - Removed `all_urls` host permission to avoid "Host Permission" requirements during Chrome Web Store submission

### Technical
- Added `currentShuffledOrder` variable to track shuffle state
- Modified `showModal()` to preserve existing shuffle order
- Updated `updateModalContent()` to restore checkbox states
- Added conditional variable declarations using `typeof` checks in content.js and storage-adapter.js

---

## [0.4.2] - 2025-12-19

### Fixed
- Copy the `chrome.storage.local` to the sync-storage, and vice-versa, when toggling to maintain only one list of names.
- Fix to modal to reference correct storage location

---

## [0.4.1] - 2025-12-19

### Added
- **Storage Mode Toggle**: Can now choose between local storage and Chrome Sync
  - Toggle switch in Options page under "Storage Settings"
  - Defaults to local storage (device-only)
  - Optional sync mode syncs across all Chrome devices when signed in

### Changed
- Default storage changed from Chrome Sync to local storage
- Storage preference is device-specific

### Technical
- Added `storage-adapter.js` with injector pattern for storage abstraction
- Implemented `StorageAdapter` to switch between `chrome.storage.local` and `chrome.storage.sync`
- Added storage preference UI in options page

---

## [0.4.0] - 2025-12-19

### Added
- **Settings/Options Page**: New dedicated settings page for managing team members
  - Add and remove team members through a user-friendly interface
  - Duplicate name detection
  - Real-time validation and feedback
  - Access via right-click extension icon → "Options"
- **Chrome Storage Integration**: Team names now stored in `chrome.storage.sync`
  - Syncs across all devices where you're signed into Chrome
  - No need to manually edit files
  - Persistent storage between sessions
- **Empty State Handling**: Helpful instructions when no team members are configured

### Changed
- Replaced file-based storage (`names.txt`) with Chrome's sync storage API
- Improved first-run experience with better onboarding

### Technical
- Added `options_page` to manifest
- Implemented `chrome.storage.sync` API for cross-device synchronization

---

## [Pre-0.4.0] - Development Versions

Earlier versions (0.1.0 - 0.3.x) were development releases with the following features:

### Core Features
- Floating, draggable modal for standup order
- Random shuffle of team members using Fisher-Yates algorithm
- Checkbox tracking for completed team members
- Parking lot modal for tracking discussion items
- Collapsible modal with focus/unfocus behavior
- File-based name storage (names.txt)
- Visual feedback with strikethrough for completed items
- Modal shrinking when unfocused for better screen visibility
- Updated vintage microphone icon set

### Known Limitations (Pre-0.4.0)
- Required manual editing of `names.txt` file in extension directory
- No user interface for managing team members
- Names did not sync across devices

