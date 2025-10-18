// Tab Alternator Popup Script
// Handles UI interactions and communicates with background script

class PopupController {
  constructor() {
    this.tabHistory = [];
    this.currentIndex = 0;
    
    this.init();
  }

  async init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Load initial data
    await this.loadData();
    
    // Update UI
    this.updateUI();
  }

  setupEventListeners() {
    // Alternate tabs button
    document.getElementById('alternateBtn').addEventListener('click', () => {
      this.alternateTabs();
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', async () => {
      console.log('Refresh button clicked');
      const refreshBtn = document.getElementById('refreshBtn');
      const originalText = refreshBtn.innerHTML;
      
      try {
        // Show loading state
        refreshBtn.innerHTML = '<span class="icon">⏳</span> Refreshing...';
        refreshBtn.disabled = true;
        
        // Try the new refresh functionality first
        try {
          const response = await this.sendMessage({ action: 'refreshTabs' });
          
          if (response.success) {
            this.tabHistory = response.tabHistory || [];
            this.currentIndex = response.currentIndex || 0;
          } else {
            throw new Error('Refresh tabs failed');
          }
        } catch (refreshError) {
          console.log('Refresh tabs failed, falling back to load data');
          // Fallback to simple data loading
          await this.loadData();
        }
        
        this.updateUI();
        console.log('Data refreshed successfully');
        
        // Show success state briefly
        refreshBtn.innerHTML = '<span class="icon">✅</span> Refreshed';
        setTimeout(() => {
          refreshBtn.innerHTML = originalText;
          refreshBtn.disabled = false;
        }, 1000);
        
      } catch (error) {
        console.error('Error refreshing data:', error);
        this.showError('Failed to refresh data');
        
        // Reset button
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
      }
    });

    // Options button
    document.getElementById('optionsBtn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Clear data button
    document.getElementById('clearDataBtn').addEventListener('click', () => {
      this.clearData();
    });
  }

  async loadData() {
    try {
      console.log('Loading data...');
      const response = await this.sendMessage({ action: 'getTabHistory' });
      console.log('Received response:', response);
      this.tabHistory = response.tabHistory || [];
      this.currentIndex = response.currentIndex || 0;
      console.log('Loaded', this.tabHistory.length, 'tabs');
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Failed to load tab history');
    }
  }

  async alternateTabs() {
    try {
      const response = await this.sendMessage({ action: 'alternateTabs' });
      if (response.success) {
        // Refresh data after alternating
        await this.loadData();
        this.updateUI();
      }
    } catch (error) {
      console.error('Error alternating tabs:', error);
      this.showError('Failed to alternate tabs');
    }
  }

  async clearData() {
    if (confirm('Are you sure you want to clear all tab history? This action cannot be undone.')) {
      try {
        const response = await this.sendMessage({ action: 'clearHistory' });
        if (response.success) {
          this.tabHistory = [];
          this.currentIndex = 0;
          this.updateUI();
          this.showSuccess('Tab history cleared');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        this.showError('Failed to clear data');
      }
    }
  }

  updateUI() {
    this.updateStatus();
    this.updateTabList();
  }

  updateStatus() {
    const validTabs = this.getValidTabs();
    
    document.getElementById('tabCount').textContent = validTabs.length;
    document.getElementById('currentPosition').textContent = 
      validTabs.length > 0 ? `${this.currentIndex + 1}/${validTabs.length}` : '-';
  }

  updateTabList() {
    const tabList = document.getElementById('tabList');
    const validTabs = this.getValidTabs();

    if (validTabs.length === 0) {
      tabList.innerHTML = '<div class="loading">No recent tabs found</div>';
      return;
    }

    tabList.innerHTML = validTabs.map((tab, index) => {
      const isCurrent = index === this.currentIndex;
      const timeAgo = this.getTimeAgo(tab.timestamp);
      
      return `
        <div class="tab-item ${isCurrent ? 'current' : ''}" data-index="${index}">
          <div class="domain">${tab.domain}</div>
          <div class="title">${tab.title}</div>
          <div class="time">${timeAgo}</div>
        </div>
      `;
    }).join('');

    // Add click handlers to tab items
    tabList.querySelectorAll('.tab-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.switchToTab(index);
      });
    });
  }

  getValidTabs() {
    // Filter out tabs that might be closed or have invalid data
    return this.tabHistory.filter(tab => 
      tab.tabId && 
      tab.domain && 
      tab.domain !== 'unknown' &&
      tab.url && 
      tab.url !== 'chrome://newtab/'
    );
  }

  async switchToTab(index) {
    try {
      const validTabs = this.getValidTabs();
      if (index >= 0 && index < validTabs.length) {
        const tab = validTabs[index];
        
        // Update current index
        this.currentIndex = index;
        
        // Switch to the tab
        await chrome.tabs.update(tab.tabId, { active: true });
        
        // Update UI
        this.updateUI();
        
        // Close popup
        window.close();
      }
    } catch (error) {
      console.error('Error switching to tab:', error);
      this.showError('Failed to switch to tab');
    }
  }

  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  showError(message) {
    // Simple error display - could be enhanced with a proper notification system
    console.error(message);
    // You could add a toast notification here
  }

  showSuccess(message) {
    // Simple success display - could be enhanced with a proper notification system
    console.log(message);
    // You could add a toast notification here
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});