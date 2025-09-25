// TalentXcel Chrome Extension Popup Script
class TalentXcelPopup {
  constructor() {
    this.currentUser = null;
    this.currentSite = null;
    this.init();
  }

  async init() {
    await this.checkAuthStatus();
    this.setupEventListeners();
    await this.detectCurrentSite();
    this.setupSiteFeatures();
  }

  async checkAuthStatus() {
    try {
      const authData = await chrome.storage.local.get(['txc_auth_token', 'txc_user']);
      
      if (authData.txc_auth_token && authData.txc_user) {
        this.currentUser = authData.txc_user;
        this.showMainSection();
        await this.loadUserData();
      } else {
        this.showAuthSection();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      this.showAuthSection();
    }
  }

  showAuthSection() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('main-section').classList.add('hidden');
    document.getElementById('loading-section').classList.add('hidden');
  }

  showMainSection() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-section').classList.remove('hidden');
    document.getElementById('loading-section').classList.add('hidden');
  }

  showLoadingSection() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-section').classList.add('hidden');
    document.getElementById('loading-section').classList.remove('hidden');
  }

  setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });

    // Quick actions
    document.getElementById('sync-profile-btn').addEventListener('click', () => {
      this.syncProfile();
    });

    document.getElementById('job-matches-btn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://talentxcel.in/jobs/matches' });
    });

    document.getElementById('analyze-brand-btn').addEventListener('click', () => {
      this.analyzeBrand();
    });

    document.getElementById('earn-tokens-btn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://talentxcel.in/wallet' });
    });

    // Settings and logout
    document.getElementById('settings-btn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      this.logout();
    });
  }

  async handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      this.showStatus('Please enter both email and password', 'error');
      return;
    }

    this.showLoadingSection();

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'authenticate',
        credentials: { email, password }
      });

      if (response.success) {
        this.currentUser = response.data.user;
        this.showMainSection();
        await this.loadUserData();
        this.showStatus('Successfully signed in!', 'success');
      } else {
        this.showAuthSection();
        this.showStatus('Authentication failed. Please check your credentials.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showAuthSection();
      this.showStatus('Login failed. Please try again.', 'error');
    }
  }

  async loadUserData() {
    if (!this.currentUser) return;

    // Update user info
    document.getElementById('user-name').textContent = this.currentUser.user_metadata?.full_name || 'User';
    document.getElementById('user-email').textContent = this.currentUser.email;

    // Load TXC balance
    try {
      const balanceResponse = await chrome.runtime.sendMessage({
        action: 'getTXCBalance',
        userId: this.currentUser.id
      });

      if (balanceResponse.success) {
        document.getElementById('txc-balance').textContent = balanceResponse.data.balance || '0';
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  }

  async detectCurrentSite() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = new URL(tab.url);
      const domain = url.hostname.toLowerCase();

      if (domain.includes('linkedin.com')) {
        this.currentSite = 'linkedin';
      } else if (domain.includes('naukri.com')) {
        this.currentSite = 'naukri';
      } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
        this.currentSite = 'twitter';
      } else if (domain.includes('instagram.com')) {
        this.currentSite = 'instagram';
      } else if (domain.includes('indeed.com') || domain.includes('glassdoor.com')) {
        this.currentSite = 'job-board';
      }
    } catch (error) {
      console.error('Site detection error:', error);
    }
  }

  setupSiteFeatures() {
    const siteFeatures = document.getElementById('site-features');
    const siteName = document.getElementById('site-name');

    if (!this.currentSite) {
      siteFeatures.classList.add('hidden');
      return;
    }

    siteFeatures.classList.remove('hidden');

    // Hide all feature lists
    document.querySelectorAll('.feature-list').forEach(list => {
      list.classList.add('hidden');
    });

    switch (this.currentSite) {
      case 'linkedin':
        siteName.textContent = 'LinkedIn Features';
        document.getElementById('linkedin-features').classList.remove('hidden');
        break;
      case 'naukri':
        siteName.textContent = 'Naukri Features';
        document.getElementById('linkedin-features').classList.remove('hidden');
        break;
      case 'job-board':
        siteName.textContent = 'Job Board Features';
        document.getElementById('job-board-features').classList.remove('hidden');
        break;
      case 'twitter':
      case 'instagram':
        siteName.textContent = 'Social Media Features';
        document.getElementById('social-features').classList.remove('hidden');
        break;
    }

    // Add feature button listeners
    this.setupFeatureButtons();
  }

  setupFeatureButtons() {
    document.querySelectorAll('.feature-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.textContent.trim();
        await this.handleFeatureAction(action);
      });
    });
  }

  async handleFeatureAction(action) {
    this.showStatus('Processing...', 'info');

    try {
      switch (action) {
        case 'Extract Profile Data':
          await this.extractProfileData();
          break;
        case 'Optimize Profile':
          await this.optimizeProfile();
          break;
        case 'Connection Insights':
          await this.getConnectionInsights();
          break;
        case 'Analyze Job Fit':
          await this.analyzeJobFit();
          break;
        case 'Auto-Fill Application':
          await this.autoFillApplication();
          break;
        case 'Salary Insights':
          await this.getSalaryInsights();
          break;
        case 'Content Ideas':
          await this.generateContentIdeas();
          break;
        case 'Brand Optimization':
          await this.analyzeBrand();
          break;
        case 'Network Growth':
          await this.analyzeNetworkGrowth();
          break;
        default:
          this.showStatus('Feature coming soon!', 'info');
      }
    } catch (error) {
      console.error('Feature action error:', error);
      this.showStatus('Action failed. Please try again.', 'error');
    }
  }

  async syncProfile() {
    this.showStatus('Syncing profile...', 'info');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'extractProfile'
      });

      if (response && response.success) {
        const syncResponse = await chrome.runtime.sendMessage({
          action: 'syncToTalentXcel',
          profileData: response.data
        });

        if (syncResponse.success) {
          this.showStatus('Profile synced successfully! +50 TXC tokens earned.', 'success');
          await this.loadUserData();
        } else {
          this.showStatus('Sync failed. Please try again.', 'error');
        }
      } else {
        this.showStatus('Could not extract profile data from this page.', 'error');
      }
    } catch (error) {
      console.error('Profile sync error:', error);
      this.showStatus('Sync failed. Make sure you\'re on a supported platform.', 'error');
    }
  }

  async analyzeBrand() {
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeBrand',
      site: this.currentSite
    });

    if (response.success) {
      this.showStatus('Brand analysis complete! Check your dashboard for insights.', 'success');
    } else {
      this.showStatus('Brand analysis failed. Please try again.', 'error');
    }
  }

  async extractProfileData() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.tabs.sendMessage(tab.id, {
      action: 'extractAndShow'
    });

    this.showStatus('Profile data extracted!', 'success');
  }

  async optimizeProfile() {
    const response = await chrome.runtime.sendMessage({
      action: 'getUserProfile'
    });

    if (response.success) {
      chrome.tabs.create({ 
        url: 'https://talentxcel.in/profile/optimizer' 
      });
    }
  }

  async getConnectionInsights() {
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeNetworkGrowth'
    });

    if (response.success) {
      this.showStatus('Network insights generated! Check your dashboard.', 'success');
    }
  }

  async analyzeJobFit() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.tabs.sendMessage(tab.id, {
      action: 'analyzeCurrentJob'
    });
  }

  async autoFillApplication() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.tabs.sendMessage(tab.id, {
      action: 'autoFillForm'
    });

    this.showStatus('Application form filled!', 'success');
  }

  async getSalaryInsights() {
    chrome.tabs.create({ 
      url: 'https://talentxcel.in/salary-insights' 
    });
  }

  async generateContentIdeas() {
    const response = await chrome.runtime.sendMessage({
      action: 'generateContentIdeas',
      platform: this.currentSite
    });

    if (response.success) {
      this.showStatus('Content ideas generated! Check your dashboard.', 'success');
    }
  }

  async analyzeNetworkGrowth() {
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeNetworkGrowth'
    });

    if (response.success) {
      this.showStatus('Network analysis complete!', 'success');
    }
  }

  async logout() {
    await chrome.storage.local.clear();
    this.currentUser = null;
    this.showAuthSection();
    this.showStatus('Logged out successfully', 'success');
  }

  showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    
    // Clear status after 3 seconds
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'status-message';
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TalentXcelPopup();
});