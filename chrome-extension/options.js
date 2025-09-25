// TalentXcel Extension Options/Settings Page
class TalentXcelOptions {
  constructor() {
    this.settings = {};
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.loadUserData();
    this.setupEventListeners();
    this.populateForm();
  }

  async loadSettings() {
    // Load all settings from storage
    this.settings = await chrome.storage.sync.get({
      'txc_notifications_enabled': true,
      'txc_job_alerts': true,
      'txc_token_notifications': true,
      'txc_auto_fill_enabled': true,
      'txc_smart_suggestions': true,
      'txc_skill_tracking': true,
      'txc_analytics': true,
      'txc_profile_sync': true,
      'txc_sync_frequency': 30,
      'txc_debug_mode': false
    });
  }

  async loadUserData() {
    try {
      const authData = await chrome.storage.local.get(['txc_user', 'txc_auth_token']);
      
      if (authData.txc_user) {
        // Update account info
        document.getElementById('account-name').textContent = 
          authData.txc_user.user_metadata?.full_name || 'User';
        document.getElementById('account-email').textContent = authData.txc_user.email;

        // Load TXC balance
        const balanceResponse = await chrome.runtime.sendMessage({
          action: 'getTXCBalance',
          userId: authData.txc_user.id
        });

        if (balanceResponse.success) {
          document.getElementById('txc-balance').textContent = balanceResponse.data.balance || '0';
        }

        // Load profile completion
        const completionResponse = await chrome.runtime.sendMessage({
          action: 'getProfileCompletion',
          userId: authData.txc_user.id
        });

        if (completionResponse.success) {
          document.getElementById('profile-completion').textContent = 
            `${completionResponse.data.completion || 0}%`;
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  populateForm() {
    // Populate checkboxes
    document.getElementById('notifications-enabled').checked = this.settings.txc_notifications_enabled;
    document.getElementById('job-alerts').checked = this.settings.txc_job_alerts;
    document.getElementById('token-notifications').checked = this.settings.txc_token_notifications;
    document.getElementById('auto-fill-enabled').checked = this.settings.txc_auto_fill_enabled;
    document.getElementById('smart-suggestions').checked = this.settings.txc_smart_suggestions;
    document.getElementById('skill-tracking').checked = this.settings.txc_skill_tracking;
    document.getElementById('analytics').checked = this.settings.txc_analytics;
    document.getElementById('profile-sync').checked = this.settings.txc_profile_sync;
    document.getElementById('debug-mode').checked = this.settings.txc_debug_mode;

    // Populate select
    document.getElementById('sync-frequency').value = this.settings.txc_sync_frequency;
  }

  setupEventListeners() {
    // Setting checkboxes
    const checkboxes = document.querySelectorAll('.setting-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.saveSettings());
    });

    // Sync frequency select
    document.getElementById('sync-frequency').addEventListener('change', () => {
      this.saveSettings();
    });

    // Action buttons
    document.getElementById('clear-cache-btn').addEventListener('click', () => {
      this.clearCache();
    });

    document.getElementById('export-data-btn').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('view-dashboard-btn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://talentxcel.in/dashboard' });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      this.logout();
    });
  }

  async saveSettings() {
    // Collect all settings from form
    const newSettings = {
      'txc_notifications_enabled': document.getElementById('notifications-enabled').checked,
      'txc_job_alerts': document.getElementById('job-alerts').checked,
      'txc_token_notifications': document.getElementById('token-notifications').checked,
      'txc_auto_fill_enabled': document.getElementById('auto-fill-enabled').checked,
      'txc_smart_suggestions': document.getElementById('smart-suggestions').checked,
      'txc_skill_tracking': document.getElementById('skill-tracking').checked,
      'txc_analytics': document.getElementById('analytics').checked,
      'txc_profile_sync': document.getElementById('profile-sync').checked,
      'txc_debug_mode': document.getElementById('debug-mode').checked,
      'txc_sync_frequency': parseInt(document.getElementById('sync-frequency').value)
    };

    try {
      await chrome.storage.sync.set(newSettings);
      this.settings = { ...this.settings, ...newSettings };
      this.showStatus('Settings saved successfully!', 'success');

      // Update alarms if sync frequency changed
      if (newSettings.txc_sync_frequency !== this.settings.txc_sync_frequency) {
        await this.updateSyncAlarm(newSettings.txc_sync_frequency);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showStatus('Failed to save settings. Please try again.', 'error');
    }
  }

  async updateSyncAlarm(frequency) {
    // Clear existing alarm
    await chrome.alarms.clear('checkJobMatches');

    // Create new alarm if not disabled
    if (frequency !== 'disabled') {
      await chrome.alarms.create('checkJobMatches', { 
        periodInMinutes: frequency 
      });
    }
  }

  async clearCache() {
    try {
      // Clear all local storage except auth data
      const authData = await chrome.storage.local.get(['txc_auth_token', 'txc_user']);
      await chrome.storage.local.clear();
      
      if (authData.txc_auth_token && authData.txc_user) {
        await chrome.storage.local.set(authData);
      }

      this.showStatus('Cache cleared successfully!', 'success');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      this.showStatus('Failed to clear cache. Please try again.', 'error');
    }
  }

  async exportData() {
    try {
      // Get all extension data
      const syncData = await chrome.storage.sync.get();
      const localData = await chrome.storage.local.get();

      // Remove sensitive data
      delete localData.txc_auth_token;
      delete localData.txc_user;

      const exportData = {
        settings: syncData,
        metadata: {
          exportDate: new Date().toISOString(),
          version: chrome.runtime.getManifest().version
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talentxcel-extension-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showStatus('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Failed to export data:', error);
      this.showStatus('Failed to export data. Please try again.', 'error');
    }
  }

  async logout() {
    if (confirm('Are you sure you want to logout? This will clear all your data.')) {
      try {
        await chrome.storage.local.clear();
        this.showStatus('Logged out successfully!', 'success');
        
        // Refresh the page to show logged out state
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('Logout error:', error);
        this.showStatus('Logout failed. Please try again.', 'error');
      }
    }
  }

  showStatus(message, type = 'info') {
    const toast = document.getElementById('status-toast');
    const messageEl = document.getElementById('status-message');
    
    messageEl.textContent = message;
    toast.className = `status-toast ${type}`;
    toast.classList.remove('hidden');

    // Auto-hide after 3 seconds
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TalentXcelOptions();
});