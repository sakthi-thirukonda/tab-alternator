// Tab Alternator Options Page Script
// Handles settings management and data controls

class OptionsController {
  constructor() {
    this.settings = {
      maxHistorySize: 50,
      dataRetentionDays: 30
    };
    
    this.init();
  }

  async init() {
    // Load current settings
    await this.loadSettings();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI with current values
    this.updateUI();
    
    // Load data info
    await this.updateDataInfo();
  }

  setupEventListeners() {
    // Save button
    document.getElementById('saveBtn').addEventListener('click', () => {
      this.saveSettings();
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.resetToDefaults();
    });

    // Clear all data button
    document.getElementById('clearAllDataBtn').addEventListener('click', () => {
      this.clearAllData();
    });

    // Export data button
    document.getElementById('exportDataBtn').addEventListener('click', () => {
      this.exportData();
    });

    // Import data button
    document.getElementById('importDataBtn').addEventListener('click', () => {
      this.importData();
    });

    // Privacy policy link
    document.getElementById('privacyPolicyLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showPrivacyPolicy();
    });
  }

  async loadSettings() {
    try {
      const response = await this.sendMessage({ action: 'getSettings' });
      this.settings = response || this.settings;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      // Get values from form
      this.settings.maxHistorySize = parseInt(document.getElementById('maxHistorySize').value);
      this.settings.dataRetentionDays = parseInt(document.getElementById('dataRetentionDays').value);

      // Save to background script
      const response = await this.sendMessage({ 
        action: 'updateSettings', 
        settings: this.settings 
      });

      if (response.success) {
        this.showNotification('Settings saved successfully!', 'success');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showNotification('Failed to save settings', 'error');
    }
  }

  resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      this.settings = {
        maxHistorySize: 50,
        dataRetentionDays: 30
      };
      
      this.updateUI();
      this.showNotification('Settings reset to defaults', 'info');
    }
  }

  async clearAllData() {
    if (confirm('Are you sure you want to clear ALL tab history data? This action cannot be undone.')) {
      try {
        const response = await this.sendMessage({ action: 'clearHistory' });
        
        if (response.success) {
          this.showNotification('All data cleared successfully', 'success');
          await this.updateDataInfo();
        } else {
          throw new Error('Failed to clear data');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        this.showNotification('Failed to clear data', 'error');
      }
    }
  }

  async exportData() {
    try {
      const response = await this.sendMessage({ action: 'getTabHistory' });
      
      if (response.tabHistory) {
        const exportData = {
          tabHistory: response.tabHistory,
          settings: this.settings,
          exportDate: new Date().toISOString(),
          version: '1.0.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `tab-alternator-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Data exported successfully', 'success');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showNotification('Failed to export data', 'error');
    }
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        if (importData.tabHistory && Array.isArray(importData.tabHistory)) {
          // Import tab history
          await this.sendMessage({ 
            action: 'importData', 
            data: importData.tabHistory 
          });
          
          // Import settings if available
          if (importData.settings) {
            this.settings = { ...this.settings, ...importData.settings };
            this.updateUI();
          }
          
          this.showNotification('Data imported successfully', 'success');
          await this.updateDataInfo();
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        this.showNotification('Failed to import data. Please check the file format.', 'error');
      }
    };
    
    input.click();
  }

  showPrivacyPolicy() {
    const policy = `
Tab Alternator Privacy Policy

Data Collection:
- We only collect tab URLs, domains, titles, and visit timestamps
- No personal information, passwords, or sensitive data is collected
- No data is sent to external servers

Data Storage:
- All data is stored locally on your device using Chrome's storage API
- Data is automatically cleaned up based on your retention settings
- You can clear all data at any time

Data Usage:
- Data is used solely to provide tab switching functionality
- No data is shared with third parties
- No analytics or tracking is performed

Your Rights:
- You can export your data at any time
- You can delete all data at any time
- You can uninstall the extension to remove all data

Contact:
For privacy questions, please contact us through the Chrome Web Store.
    `;
    
    alert(policy);
  }

  updateUI() {
    document.getElementById('maxHistorySize').value = this.settings.maxHistorySize;
    document.getElementById('dataRetentionDays').value = this.settings.dataRetentionDays;
  }

  async updateDataInfo() {
    try {
      const response = await this.sendMessage({ action: 'getTabHistory' });
      
      if (response.tabHistory) {
        const historyCount = response.tabHistory.length;
        document.getElementById('currentHistoryCount').textContent = historyCount;
        
        // Estimate storage usage (rough calculation)
        const estimatedSize = Math.round(JSON.stringify(response.tabHistory).length / 1024);
        document.getElementById('storageUsed').textContent = `${estimatedSize} KB`;
      }
    } catch (error) {
      console.error('Error updating data info:', error);
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

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '6px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    });

    // Set background color based on type
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8',
      warning: '#ffc107'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OptionsController();
});