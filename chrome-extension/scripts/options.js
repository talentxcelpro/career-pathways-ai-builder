// TalentXcel Extension Options Script
class TalentXcelOptions {
  constructor() {
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadSettings();
    await this.checkAccountStatus();
    this.setupAutoSave();
  }

  bindEvents() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Account connection
    document.getElementById('connectAccount')?.addEventListener('click', () => {
      this.connectAccount();
    });

    // Data management
    document.getElementById('exportData')?.addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('clearData')?.addEventListener('click', () => {
      this.clearData();
    });

    // Reset options
    document.getElementById('resetSettings')?.addEventListener('click', () => {
      this.resetSettings();
    });

    document.getElementById('factoryReset')?.addEventListener('click', () => {
      this.factoryReset();
    });

    // All checkboxes and inputs for auto-save
    document.querySelectorAll('input[type="checkbox"], input[type="number"], select').forEach(input => {
      input.addEventListener('change', () => {
        this.saveSettings();
      });
    });

    // Text inputs with debounce
    document.querySelectorAll('input[type="text"]').forEach(input => {
      let timeout;
      input.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => this.saveSettings(), 1000);
      });
    });
  }

  switchTab(tabId) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get();
      
      // Load all setting values
      this.loadCheckboxSettings(settings);
      this.loadSelectSettings(settings);
      this.loadTextSettings(settings);
      this.loadExtensionInfo();
      
      console.log('Settings loaded:', settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  loadCheckboxSettings(settings) {
    const checkboxes = {
      'autoStart': settings.txc_auto_start ?? true,
      'backgroundSync': settings.txc_background_sync ?? true,
      'contextualUI': settings.txc_contextual_ui ?? true,
      'jobMatchNotifications': settings.txc_job_notifications ?? true,
      'applicationUpdates': settings.txc_app_updates ?? true,
      'deadlineReminders': settings.txc_deadline_reminders ?? true,
      'tokenEarnings': settings.txc_token_notifications ?? true,
      'milestoneRewards': settings.txc_milestone_notifications ?? true,
      'profileUpdates': settings.txc_profile_updates ?? false,
      'networkUpdates': settings.txc_network_updates ?? false,
      'autoFillEnabled': settings.txc_auto_fill ?? true,
      'smartFormDetection': settings.txc_smart_forms ?? true,
      'customCoverLetters': settings.txc_cover_letters ?? true,
      'linkedinAutoSync': settings.txc_linkedin_sync ?? true,
      'naukriAutoSync': settings.txc_naukri_sync ?? true,
      'socialMediaSync': settings.txc_social_sync ?? false,
      'aiSuggestions': settings.txc_ai_suggestions ?? true,
      'skillRecommendations': settings.txc_skill_recs ?? true,
      'analyticsData': settings.txc_analytics ?? true,
      'performanceData': settings.txc_performance ?? true,
      'localCache': settings.txc_cache ?? true,
      'biometricAuth': settings.txc_biometric ?? false,
      'debugMode': settings.txc_debug ?? false,
      'verboseLogging': settings.txc_verbose ?? false
    };

    Object.entries(checkboxes).forEach(([id, value]) => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.checked = value;
      }
    });
  }

  loadSelectSettings(settings) {
    const selects = {
      'syncFrequency': settings.txc_sync_frequency ?? '15',
      'cacheRetention': settings.txc_cache_retention ?? '7'
    };

    Object.entries(selects).forEach(([id, value]) => {
      const select = document.getElementById(id);
      if (select) {
        select.value = value;
      }
    });
  }

  loadTextSettings(settings) {
    const textInputs = {
      'requestTimeout': settings.txc_request_timeout ?? 30
    };

    Object.entries(textInputs).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) {
        input.value = value;
      }
    });
  }

  loadExtensionInfo() {
    // Load extension information
    const manifest = chrome.runtime.getManifest();
    document.getElementById('extensionVersion').textContent = manifest.version;

    // Load install date from storage
    chrome.storage.sync.get(['txc_installation_date']).then(result => {
      if (result.txc_installation_date) {
        const installDate = new Date(result.txc_installation_date).toLocaleDateString();
        document.getElementById('installDate').textContent = installDate;
      }
    });

    // Set last updated to now (could be enhanced to track actual updates)
    document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString();
  }

  async saveSettings() {
    try {
      const settings = this.collectAllSettings();
      await chrome.storage.sync.set(settings);
      this.showSaveStatus();
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showError('Failed to save settings');
    }
  }

  collectAllSettings() {
    const settings = {};

    // Collect checkbox settings
    const checkboxes = [
      'autoStart', 'backgroundSync', 'contextualUI', 'jobMatchNotifications',
      'applicationUpdates', 'deadlineReminders', 'tokenEarnings', 'milestoneRewards',
      'profileUpdates', 'networkUpdates', 'autoFillEnabled', 'smartFormDetection',
      'customCoverLetters', 'linkedinAutoSync', 'naukriAutoSync', 'socialMediaSync',
      'aiSuggestions', 'skillRecommendations', 'analyticsData', 'performanceData',
      'localCache', 'biometricAuth', 'debugMode', 'verboseLogging'
    ];

    checkboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        const settingKey = `txc_${id.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}`;
        settings[settingKey] = checkbox.checked;
      }
    });

    // Collect select settings
    const selects = ['syncFrequency', 'cacheRetention'];
    selects.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        const settingKey = `txc_${id.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}`;
        settings[settingKey] = select.value;
      }
    });

    // Collect text input settings
    const textInputs = ['requestTimeout'];
    textInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        const settingKey = `txc_${id.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}`;
        settings[settingKey] = input.value;
      }
    });

    return settings;
  }

  setupAutoSave() {
    // Auto-save when settings change
    const observer = new MutationObserver(() => {
      // Debounce auto-save
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = setTimeout(() => {
        this.saveSettings();
      }, 500);
    });

    observer.observe(document.querySelector('.options-content'), {
      subtree: true,
      attributes: true,
      attributeFilter: ['checked', 'selected']
    });
  }

  async checkAccountStatus() {
    try {
      const authData = await chrome.storage.local.get(['txc_auth_token', 'txc_user']);
      const statusIndicator = document.getElementById('statusIndicator');
      const statusText = document.getElementById('statusText');
      const connectButton = document.getElementById('connectAccount');

      if (authData.txc_auth_token && authData.txc_user) {
        statusIndicator.className = 'status-indicator online';
        statusText.textContent = `Connected as ${authData.txc_user.email}`;
        connectButton.textContent = 'Disconnect';
        connectButton.onclick = () => this.disconnectAccount();
      } else {
        statusIndicator.className = 'status-indicator offline';
        statusText.textContent = 'Not Connected';
        connectButton.textContent = 'Connect to TalentXcel';
        connectButton.onclick = () => this.connectAccount();
      }
    } catch (error) {
      console.error('Failed to check account status:', error);
    }
  }

  async connectAccount() {
    try {
      // Open TalentXcel login page
      chrome.tabs.create({
        url: 'https://talentxcel.in/auth/signin?extension=true'
      });
    } catch (error) {
      console.error('Failed to connect account:', error);
    }
  }

  async disconnectAccount() {
    if (confirm('Are you sure you want to disconnect your TalentXcel account?')) {
      try {
        await chrome.storage.local.remove(['txc_auth_token', 'txc_user', 'txc_auth_expires']);
        await this.checkAccountStatus();
        this.showSuccess('Account disconnected successfully');
      } catch (error) {
        console.error('Failed to disconnect account:', error);
        this.showError('Failed to disconnect account');
      }
    }
  }

  async exportData() {
    try {
      const syncData = await chrome.storage.sync.get();
      const localData = await chrome.storage.local.get();
      
      const exportData = {
        settings: syncData,
        localData: localData,
        exportDate: new Date().toISOString(),
        version: chrome.runtime.getManifest().version
      };

      // Remove sensitive data
      delete exportData.localData.txc_auth_token;
      delete exportData.localData.txc_auth_expires;

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `talentxcel-extension-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.showSuccess('Data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      this.showError('Failed to export data');
    }
  }

  async clearData() {
    if (confirm('Are you sure you want to clear all extension data? This action cannot be undone.')) {
      try {
        await chrome.storage.sync.clear();
        await chrome.storage.local.clear();
        this.showSuccess('All data cleared successfully');
        
        // Reload the page to reset to defaults
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Failed to clear data:', error);
        this.showError('Failed to clear data');
      }
    }
  }

  async resetSettings() {
    if (confirm('Reset all settings to default values?')) {
      try {
        // Clear only sync storage (settings)
        await chrome.storage.sync.clear();
        this.showSuccess('Settings reset to defaults');
        
        // Reload settings
        setTimeout(() => {
          this.loadSettings();
        }, 500);
      } catch (error) {
        console.error('Failed to reset settings:', error);
        this.showError('Failed to reset settings');
      }
    }
  }

  async factoryReset() {
    if (confirm('Perform a factory reset? This will clear ALL data and settings.')) {
      if (confirm('This action cannot be undone. Continue?')) {
        try {
          await chrome.storage.sync.clear();
          await chrome.storage.local.clear();
          this.showSuccess('Factory reset completed');
          
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          console.error('Failed to perform factory reset:', error);
          this.showError('Failed to perform factory reset');
        }
      }
    }
  }

  showSaveStatus() {
    const saveStatus = document.getElementById('saveStatus');
    saveStatus.style.display = 'block';
    setTimeout(() => {
      saveStatus.style.display = 'none';
    }, 2000);
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    });
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Initialize options page
document.addEventListener('DOMContentLoaded', () => {
  new TalentXcelOptions();
});