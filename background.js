// Tab Alternator - Background Service Worker
// Privacy-first tab switching with local-only storage

class TabAlternator {
  constructor() {
    this.tabHistory = [];
    this.currentIndex = 0;
    this.maxHistorySize = 50;
    this.dataRetentionDays = 30;
    
    this.init();
  }

  async init() {
    // Load existing data from local storage
    await this.loadData();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set up periodic cleanup
    this.setupCleanup();
    
    console.log('Tab Alternator initialized with privacy-first approach');
  }

  setupEventListeners() {
    // Track tab activation (when user switches to a tab)
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.trackTabVisit(activeInfo.tabId);
    });

    // Track tab updates (when page loads)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.trackTabVisit(tabId, tab.url);
      }
    });

    // Track new tab creation
    chrome.tabs.onCreated.addListener((tab) => {
      if (tab.url) {
        this.trackTabVisit(tab.id, tab.url);
      }
    });

    // Handle tab removal
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.removeTabFromHistory(tabId);
    });

    // Handle keyboard shortcut
    chrome.commands.onCommand.addListener((command) => {
      if (command === 'alternate-tabs') {
        this.alternateTabs();
      }
    });

    // Handle messages from popup/options
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  async trackTabVisit(tabId, url = null) {
    try {
      // Get tab information
      const tab = await chrome.tabs.get(tabId);
      
      // Skip only specific internal Chrome pages that shouldn't be tracked
      if (!tab.url || 
          tab.url.startsWith('chrome://extensions/') || 
          tab.url.startsWith('chrome://settings/') ||
          tab.url.startsWith('chrome://history/') ||
          tab.url.startsWith('chrome://bookmarks/') ||
          tab.url.startsWith('chrome://downloads/') ||
          tab.url.startsWith('chrome-extension://') ||
          tab.url.startsWith('chrome://version/') ||
          tab.url.startsWith('chrome://flags/')) {
        return; // Skip specific internal Chrome pages
      }

      // Create tab entry with privacy-focused data
      const tabEntry = {
        tabId: tabId,
        url: url || tab.url,
        domain: this.extractDomain(tab.url),
        title: tab.title || (tab.url === 'chrome://newtab/' ? 'New Tab' : 'Untitled'),
        timestamp: Date.now(),
        visitCount: 1
      };

      // Remove existing entry for this tab
      this.tabHistory = this.tabHistory.filter(entry => entry.tabId !== tabId);
      
      // Add new entry at the beginning (most recent first)
      this.tabHistory.unshift(tabEntry);
      
      // Limit history size for privacy
      if (this.tabHistory.length > this.maxHistorySize) {
        this.tabHistory = this.tabHistory.slice(0, this.maxHistorySize);
      }

      // Save to local storage
      await this.saveData();
      
      console.log(`Tracked visit: ${tabEntry.domain} (${this.tabHistory.length} tabs in history)`);
    } catch (error) {
      console.error('Error tracking tab visit:', error);
    }
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      // Handle special cases
      if (url.startsWith('chrome://newtab/')) {
        return 'New Tab';
      } else if (url.startsWith('chrome://')) {
        return 'Chrome Internal';
      } else if (url.startsWith('file://')) {
        return 'Local File';
      } else {
        return urlObj.hostname;
      }
    } catch {
      return 'unknown';
    }
  }

  removeTabFromHistory(tabId) {
    this.tabHistory = this.tabHistory.filter(entry => entry.tabId !== tabId);
    this.saveData();
  }

  async alternateTabs() {
    try {
      // Filter out closed tabs
      const openTabs = await this.getOpenTabs();
      const validHistory = this.tabHistory.filter(entry => 
        openTabs.some(tab => tab.id === entry.tabId)
      );

      if (validHistory.length < 2) {
        console.log('Not enough tabs to alternate');
        return;
      }

      // Move to next tab in history
      this.currentIndex = (this.currentIndex + 1) % validHistory.length;
      const targetTab = validHistory[this.currentIndex];

      // Switch to the target tab
      await chrome.tabs.update(targetTab.tabId, { active: true });
      
      console.log(`Switched to: ${targetTab.domain} (${this.currentIndex + 1}/${validHistory.length})`);
    } catch (error) {
      console.error('Error alternating tabs:', error);
    }
  }

  async getOpenTabs() {
    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        resolve(tabs);
      });
    });
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['tabHistory', 'currentIndex', 'settings']);
      
      this.tabHistory = result.tabHistory || [];
      this.currentIndex = result.currentIndex || 0;
      
      if (result.settings) {
        this.maxHistorySize = result.settings.maxHistorySize || 50;
        this.dataRetentionDays = result.settings.dataRetentionDays || 30;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async saveData() {
    try {
      await chrome.storage.local.set({
        tabHistory: this.tabHistory,
        currentIndex: this.currentIndex,
        settings: {
          maxHistorySize: this.maxHistorySize,
          dataRetentionDays: this.dataRetentionDays
        }
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  setupCleanup() {
    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  cleanupOldData() {
    const cutoffTime = Date.now() - (this.dataRetentionDays * 24 * 60 * 60 * 1000);
    const initialLength = this.tabHistory.length;
    
    this.tabHistory = this.tabHistory.filter(entry => entry.timestamp > cutoffTime);
    
    if (this.tabHistory.length !== initialLength) {
      this.saveData();
      console.log(`Cleaned up ${initialLength - this.tabHistory.length} old entries`);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    console.log('Background received message:', request.action);
    
    switch (request.action) {
      case 'getTabHistory':
        console.log('Sending tab history:', this.tabHistory.length, 'tabs');
        sendResponse({
          tabHistory: this.tabHistory,
          currentIndex: this.currentIndex
        });
        break;
        
      case 'refreshTabs':
        // Force refresh by getting current open tabs and updating history
        try {
          const openTabs = await this.getOpenTabs();
          console.log('Found', openTabs.length, 'open tabs');
          
          // Update history with current open tabs
          for (const tab of openTabs) {
            if (tab.url && !tab.url.startsWith('chrome://extensions/') && 
                !tab.url.startsWith('chrome://settings/') &&
                !tab.url.startsWith('chrome://history/') &&
                !tab.url.startsWith('chrome://bookmarks/') &&
                !tab.url.startsWith('chrome://downloads/') &&
                !tab.url.startsWith('chrome-extension://')) {
              await this.trackTabVisit(tab.id, tab.url);
            }
          }
          
          sendResponse({
            success: true,
            tabHistory: this.tabHistory,
            currentIndex: this.currentIndex
          });
        } catch (error) {
          console.error('Error refreshing tabs:', error);
          sendResponse({ error: 'Failed to refresh tabs' });
        }
        break;
        
      case 'alternateTabs':
        await this.alternateTabs();
        sendResponse({ success: true });
        break;
        
      case 'clearHistory':
        this.tabHistory = [];
        this.currentIndex = 0;
        await this.saveData();
        sendResponse({ success: true });
        break;
        
      case 'getSettings':
        sendResponse({
          maxHistorySize: this.maxHistorySize,
          dataRetentionDays: this.dataRetentionDays
        });
        break;
        
      case 'updateSettings':
        this.maxHistorySize = request.settings.maxHistorySize || 50;
        this.dataRetentionDays = request.settings.dataRetentionDays || 30;
        await this.saveData();
        sendResponse({ success: true });
        break;
        
      case 'importData':
        if (request.data && Array.isArray(request.data)) {
          this.tabHistory = request.data;
          this.currentIndex = 0;
          await this.saveData();
          sendResponse({ success: true });
        } else {
          sendResponse({ error: 'Invalid data format' });
        }
        break;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }
}

// Initialize the Tab Alternator
new TabAlternator();