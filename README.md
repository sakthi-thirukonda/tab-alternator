# Tab Alternator Chrome Extension

A privacy-first Chrome extension that allows you to alternate between tabs in the order of recently visited.

## Features

- **Privacy-First**: All data stored locally, no external servers
- **Smart Tab Switching**: Alternate between tabs based on recent visit order
- **Keyboard Shortcuts**: Quick access with Ctrl+Shift+Tab
- **Data Management**: Export/import data, automatic cleanup
- **Minimal Permissions**: Only requests necessary Chrome APIs

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your extensions bar

## Usage

### Basic Usage
- Use **Ctrl+Shift+Tab** to alternate between recently visited tabs
- Click the extension icon to see recent tabs and manually switch
- Access settings through the extension popup

### Privacy Features
- All tab history is stored locally on your device
- No data is sent to external servers
- Automatic cleanup of old data (configurable)
- Full control over your data with export/import options

## Permissions

- `tabs`: Required for tab switching functionality
- `storage`: Required for local data persistence
- `activeTab`: Minimal tab access (only when user activates)

## Data Storage

The extension stores the following data locally:
- Tab URLs and domains
- Visit timestamps
- Tab titles
- Visit counts

**No personal information, passwords, or sensitive data is collected.**

## Settings

Access settings through the extension popup:
- **Maximum History Size**: Control how many tabs to remember (25-200)
- **Data Retention**: Set how long to keep history (7-90 days)
- **Data Management**: Export, import, or clear all data

## Development

### Project Structure
```
tab-alternator/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for tab tracking
├── popup.html            # Extension popup interface
├── popup.css             # Popup styles
├── popup.js              # Popup functionality
├── options.html          # Settings page
├── options.css           # Settings styles
├── options.js            # Settings functionality
└── icons/                # Extension icons
```

### Key Components

- **Background Script**: Tracks tab visits and manages history
- **Popup Interface**: Quick access to recent tabs and controls
- **Options Page**: Comprehensive settings and data management
- **Local Storage**: Privacy-first data persistence

## Privacy Policy

This extension:
- ✅ Stores all data locally on your device
- ✅ Never sends data to external servers
- ✅ Automatically cleans up old data
- ✅ Allows you to export/delete all data
- ✅ Uses minimal required permissions

## License

MIT License - Feel free to use and modify as needed.

## Support

For issues or questions, please check the Chrome Web Store listing or create an issue in the repository.