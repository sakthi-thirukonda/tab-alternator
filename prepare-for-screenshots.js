// Script to prepare Tab Alternator for screenshots
// Run this in the browser console to add sample data

console.log('Preparing Tab Alternator for screenshots...');

// Sample tab data for realistic screenshots
const sampleTabs = [
    {
        tabId: 1001,
        url: 'https://github.com',
        domain: 'github.com',
        title: 'GitHub: Let\'s build from here',
        timestamp: Date.now() - 300000, // 5 minutes ago
        visitCount: 3
    },
    {
        tabId: 1002,
        url: 'https://stackoverflow.com',
        domain: 'stackoverflow.com',
        title: 'Stack Overflow - Where Developers Learn',
        timestamp: Date.now() - 600000, // 10 minutes ago
        visitCount: 2
    },
    {
        tabId: 1003,
        url: 'https://developer.mozilla.org',
        domain: 'developer.mozilla.org',
        title: 'MDN Web Docs',
        timestamp: Date.now() - 900000, // 15 minutes ago
        visitCount: 1
    },
    {
        tabId: 1004,
        url: 'https://www.google.com',
        domain: 'google.com',
        title: 'Google',
        timestamp: Date.now() - 1200000, // 20 minutes ago
        visitCount: 5
    },
    {
        tabId: 1005,
        url: 'https://chrome.google.com/webstore',
        domain: 'chrome.google.com',
        title: 'Chrome Web Store',
        timestamp: Date.now() - 1500000, // 25 minutes ago
        visitCount: 2
    }
];

// Function to add sample data to storage
async function addSampleData() {
    try {
        // Get current data
        const result = await chrome.storage.local.get(['tabHistory', 'currentIndex', 'settings']);
        
        // Add sample data
        const updatedData = {
            tabHistory: sampleTabs,
            currentIndex: 0,
            settings: {
                maxHistorySize: 50,
                dataRetentionDays: 30
            }
        };
        
        // Save to storage
        await chrome.storage.local.set(updatedData);
        
        console.log('✅ Sample data added successfully!');
        console.log('📊 Added', sampleTabs.length, 'sample tabs');
        console.log('🔄 Refresh the extension popup to see the changes');
        
        return true;
    } catch (error) {
        console.error('❌ Error adding sample data:', error);
        return false;
    }
}

// Function to clear sample data
async function clearSampleData() {
    try {
        await chrome.storage.local.clear();
        console.log('✅ Sample data cleared!');
        return true;
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        return false;
    }
}

// Instructions
console.log(`
📸 SCREENSHOT PREPARATION SCRIPT
================================

To prepare for screenshots:

1. Run: addSampleData()
   - Adds realistic sample tab data
   - Makes the popup look professional

2. Take your screenshots:
   - Open the extension popup
   - Open the options page
   - Capture clean, professional images

3. Clean up: clearSampleData()
   - Removes sample data
   - Restores normal state

Commands:
- addSampleData()    - Add sample data
- clearSampleData()  - Clear all data
`);

// Make functions available globally
window.addSampleData = addSampleData;
window.clearSampleData = clearSampleData;

// Auto-run if in extension context
if (typeof chrome !== 'undefined' && chrome.storage) {
    console.log('🚀 Auto-running sample data preparation...');
    addSampleData();
}