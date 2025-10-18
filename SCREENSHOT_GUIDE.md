# 📸 Screenshot Guide for Chrome Web Store

## Quick Start

1. **Open the helper page:** `file:///Users/sak/tab-alternator/screenshot-helper.html`
2. **Follow the instructions** in each section
3. **Take screenshots** as described
4. **Upload to Chrome Web Store**

## Required Screenshots

### 1. Popup Interface Screenshot
**Purpose:** Show the main extension functionality

**Steps:**
1. Load the extension in Chrome
2. Open several tabs with different websites
3. Click the Tab Alternator icon
4. Take a screenshot of the popup

**What to show:**
- Recent tabs list with realistic data
- "Alternate Tabs" button
- Privacy badge ("🔒 Local Storage Only")
- Clean, professional appearance

**Size:** At least 350x400 pixels

### 2. Options Page Screenshot
**Purpose:** Show settings and privacy controls

**Steps:**
1. Right-click the extension icon
2. Select "Options" (or go to chrome://extensions/ → Details → Extension options)
3. Take a screenshot of the full options page

**What to show:**
- Privacy settings section
- Data management controls
- Keyboard shortcut information
- Professional layout

**Size:** At least 800x600 pixels

### 3. In Action Screenshot (Optional)
**Purpose:** Show the extension working

**Steps:**
1. Open multiple tabs
2. Use Ctrl+Shift+A to switch between tabs
3. Capture the browser with multiple tabs visible

## Screenshot Preparation

### Add Sample Data (Optional)
To make screenshots look more professional:

1. **Open Chrome DevTools:** F12
2. **Go to Console tab**
3. **Paste this code:**
```javascript
// Copy and paste the content from prepare-for-screenshots.js
```

4. **Run:** `addSampleData()`
5. **Refresh the extension popup**

### Clear Sample Data (After Screenshots)
```javascript
clearSampleData()
```

## Screenshot Tools

### Chrome DevTools (Recommended)
1. **Open DevTools:** F12
2. **Click device toolbar icon** (mobile/tablet icon)
3. **Select "Responsive"**
4. **Set dimensions** (e.g., 350x400 for popup)
5. **Click screenshot icon** (camera icon)

### System Screenshots
- **macOS:** Cmd+Shift+4 (area selection)
- **Windows:** Win+Shift+S (area selection)
- **Linux:** Built-in screenshot tools

## Screenshot Requirements

### Technical Requirements
- **Format:** PNG or JPEG
- **Size:** At least 1280x800 pixels
- **Quality:** High resolution, clear text
- **Aspect ratio:** 16:9 or 4:3 recommended

### Content Requirements
- **Realistic data:** Not empty states
- **Professional appearance:** Clean, modern UI
- **Readable text:** All text should be clear
- **Full windows:** Don't crop important parts

## File Organization

Save screenshots as:
```
tab-alternator/
├── screenshots/
│   ├── popup-screenshot.png
│   ├── options-screenshot.png
│   └── action-screenshot.png (optional)
```

## Common Mistakes to Avoid

❌ **Don't:**
- Show empty states (no tabs)
- Use low resolution
- Crop important UI elements
- Show personal/private data
- Use blurry or dark images

✅ **Do:**
- Show realistic, professional data
- Use high resolution
- Capture full windows
- Use consistent browser theme
- Ensure text is readable

## Upload to Chrome Web Store

1. **Go to:** [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. **Click "Add new item"**
3. **Upload your extension ZIP file**
4. **Add screenshots in the "Screenshots" section**
5. **Fill out all other required information**
6. **Submit for review**

## Troubleshooting

### Extension Not Loading
- Check that all files are in the ZIP
- Verify manifest.json is valid
- Test locally first

### Screenshots Look Unprofessional
- Add sample data using the preparation script
- Use consistent browser theme
- Ensure good lighting/contrast

### Popup Not Showing Data
- Make sure you've visited some websites
- Check that the extension is tracking tabs
- Use the sample data script if needed

## Final Checklist

Before uploading to Chrome Web Store:

- [ ] Popup screenshot shows recent tabs
- [ ] Options screenshot shows settings
- [ ] All text is readable
- [ ] Images are high resolution
- [ ] No personal data visible
- [ ] Professional appearance
- [ ] Extension ZIP file ready
- [ ] Privacy policy ready
- [ ] Description written

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify the extension loads properly
3. Test all functionality before screenshots
4. Use the sample data script for better results