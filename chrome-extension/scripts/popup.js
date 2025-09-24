// TalentXcel Chrome Extension Popup Script
class TalentXcelPopup {
  constructor() {
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.checkAuthStatus();
    await this.getCurrentSiteInfo();
  }

  bindEvents() {
    // Authentication form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Auth links
    document.getElementById('signupLink')?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://talentxcel.in/signup' });
    });

    document.getElementById('forgotLink')?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://talentxcel.in/forgot-password' });
    });

    // Dashboard actions
    document.getElementById('syncProfileBtn')?.addEventListener('click', () => {
      this.syncProfile();
    });

    document.getElementById('findJobsBtn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://talentxcel.in/jobs' });
    });

    document.getElementById('skillVerifyBtn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://talentxcel.in/skills' });
    });

    document.getElementById('inviteContactsBtn')?.addEventListener('click', () => {
      this.showInviteOptions();
    });

    document.getElementById('earnTokensBtn')?.addEventListener('click', () => {
      this.showEarnTokensOptions();
    });

    document.getElementById('settingsBtn')?.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      this.handleLogout();
    });

    document.getElementById('retryBtn')?.addEventListener('click', () => {
      this.init();
    });
  }

  async checkAuthStatus() {
    try {
      const authData = await chrome.storage.local.get(['txc_auth_token', 'txc_user']);
      
      if (authData.txc_auth_token && authData.txc_user) {
        await this.showDashboard(authData.txc_user);
      } else {
        this.showAuthSection();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      this.showError('Failed to check authentication status');
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
      this.showError('Please enter both email and password');
      return;
    }

    this.showLoading('Signing in...');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'authenticate',
        credentials: { email, password }
      });

      if (response.success) {
        await this.showDashboard(response.data.user);
      } else {
        this.showError(response.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Login failed. Please check your connection.');
    }
  }

  async showDashboard(user) {
    this.hideAll();
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('statusIndicator').className = 'status-indicator online';

    // Update user info
    document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
    document.getElementById('userTitle').textContent = 'TalentXcel Member';

    if (user.user_metadata?.avatar_url) {
      document.getElementById('userAvatar').src = user.user_metadata.avatar_url;
    }

    // Load dashboard data
    await this.loadDashboardData();
    await this.loadNotifications();
  }

  async loadDashboardData() {
    try {
      const authData = await chrome.storage.local.get(['txc_user']);
      if (!authData.txc_user) return;

      // Load TXC balance
      const balanceResponse = await chrome.runtime.sendMessage({
        action: 'getTXCBalance',
        userId: authData.txc_user.id
      });

      if (balanceResponse?.success) {
        document.getElementById('txcBalance').textContent = 
          balanceResponse.data.balance || 0;
      }

      // Load profile completion
      const profileResponse = await chrome.runtime.sendMessage({
        action: 'getProfileCompletion',
        userId: authData.txc_user.id
      });

      if (profileResponse?.success) {
        this.updateProfileCompletion(profileResponse.data);
      }
    } catch (error) {
      console.error('Dashboard data loading error:', error);
    }
  }

  updateProfileCompletion(data) {
    // You can add UI to show profile completion percentage
    console.log('Profile completion:', data);
  }

  async loadNotifications() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getNotifications'
      });

      if (response?.success) {
        this.updateNotifications(response.data);
      }
    } catch (error) {
      console.error('Notifications loading error:', error);
    }
  }

  updateNotifications(notifications) {
    const notificationsList = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
      notificationsList.innerHTML = '<div class="no-notifications">No new notifications</div>';
      return;
    }

    notificationsList.innerHTML = notifications.map(notification => `
      <div class="notification-item" data-id="${notification.id}">
        <div class="notification-icon">${this.getNotificationIcon(notification.type)}</div>
        <div class="notification-content">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
          <div class="notification-time">${this.formatTime(notification.created_at)}</div>
        </div>
      </div>
    `).join('');

    // Add click handlers
    notificationsList.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const notificationId = item.dataset.id;
        this.handleNotificationClick(notificationId);
      });
    });
  }

  async getCurrentSiteInfo() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = new URL(tab.url);
      const domain = url.hostname;

      const siteActions = document.getElementById('siteActions');
      const siteTitle = document.getElementById('siteTitle');
      const siteSpecificActions = document.getElementById('siteSpecificActions');

      if (domain.includes('linkedin.com')) {
        siteTitle.textContent = 'LinkedIn Actions';
        siteSpecificActions.innerHTML = this.getLinkedInActions();
      } else if (domain.includes('naukri.com')) {
        siteTitle.textContent = 'Naukri Actions';
        siteSpecificActions.innerHTML = this.getNaukriActions();
      } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
        siteTitle.textContent = 'Twitter/X Actions';
        siteSpecificActions.innerHTML = this.getTwitterActions();
      } else if (domain.includes('instagram.com')) {
        siteTitle.textContent = 'Instagram Actions';
        siteSpecificActions.innerHTML = this.getInstagramActions();
      } else {
        siteActions.style.display = 'none';
      }

      this.bindSiteSpecificEvents();
    } catch (error) {
      console.error('Site info error:', error);
    }
  }

  getLinkedInActions() {
    return `
      <div class="site-action-grid">
        <button class="site-action-btn" data-action="extractLinkedInProfile">
          <span class="action-icon">👤</span>
          <span class="action-text">Extract Profile</span>
        </button>
        <button class="site-action-btn" data-action="analyzeConnections">
          <span class="action-icon">🔗</span>
          <span class="action-text">Analyze Network</span>
        </button>
        <button class="site-action-btn" data-action="enhanceLinkedInProfile">
          <span class="action-icon">✨</span>
          <span class="action-text">Enhance Profile</span>
        </button>
        <button class="site-action-btn" data-action="findLinkedInJobs">
          <span class="action-icon">💼</span>
          <span class="action-text">Better Job Matches</span>
        </button>
      </div>
    `;
  }

  getNaukriActions() {
    return `
      <div class="site-action-grid">
        <button class="site-action-btn" data-action="extractNaukriProfile">
          <span class="action-icon">📋</span>
          <span class="action-text">Sync Profile</span>
        </button>
        <button class="site-action-btn" data-action="analyzeJobMatches">
          <span class="action-icon">🎯</span>
          <span class="action-text">Analyze Jobs</span>
        </button>
        <button class="site-action-btn" data-action="autoApplyJobs">
          <span class="action-icon">🚀</span>
          <span class="action-text">Smart Apply</span>
        </button>
        <button class="site-action-btn" data-action="skillGapAnalysis">
          <span class="action-icon">📊</span>
          <span class="action-text">Skill Analysis</span>
        </button>
      </div>
    `;
  }

  getTwitterActions() {
    return `
      <div class="site-action-grid">
        <button class="site-action-btn" data-action="extractTwitterProfile">
          <span class="action-icon">🐦</span>
          <span class="action-text">Sync Profile</span>
        </button>
        <button class="site-action-btn" data-action="analyzeTwitterNetwork">
          <span class="action-icon">📈</span>
          <span class="action-text">Network Analysis</span>
        </button>
        <button class="site-action-btn" data-action="findTwitterOpportunities">
          <span class="action-icon">🔍</span>
          <span class="action-text">Find Opportunities</span>
        </button>
        <button class="site-action-btn" data-action="shareCareerUpdates">
          <span class="action-icon">📢</span>
          <span class="action-text">Share Updates</span>
        </button>
      </div>
    `;
  }

  getInstagramActions() {
    return `
      <div class="site-action-grid">
        <button class="site-action-btn" data-action="extractInstagramProfile">
          <span class="action-icon">📸</span>
          <span class="action-text">Sync Profile</span>
        </button>
        <button class="site-action-btn" data-action="personalBrandAnalysis">
          <span class="action-icon">✨</span>
          <span class="action-text">Brand Analysis</span>
        </button>
        <button class="site-action-btn" data-action="contentSuggestions">
          <span class="action-icon">💡</span>
          <span class="action-text">Content Ideas</span>
        </button>
        <button class="site-action-btn" data-action="networkBuilding">
          <span class="action-icon">👥</span>
          <span class="action-text">Network Growth</span>
        </button>
      </div>
    `;
  }

  bindSiteSpecificEvents() {
    document.querySelectorAll('.site-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleSiteAction(action);
      });
    });
  }

  async handleSiteAction(action) {
    this.showLoading(`Executing ${action}...`);

    try {
      // Send message to content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: action,
        source: 'popup'
      });

      if (response?.success) {
        this.showSuccess(`${action} completed successfully!`);
        // Refresh dashboard data
        await this.loadDashboardData();
      } else {
        this.showError(response?.error || `Failed to execute ${action}`);
      }
    } catch (error) {
      console.error('Site action error:', error);
      this.showError('Action failed. Please try again.');
    }
  }

  async syncProfile() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = new URL(tab.url);
      
      let site = 'unknown';
      if (url.hostname.includes('linkedin.com')) site = 'linkedin';
      else if (url.hostname.includes('naukri.com')) site = 'naukri';
      else if (url.hostname.includes('twitter.com') || url.hostname.includes('x.com')) site = 'twitter';
      else if (url.hostname.includes('instagram.com')) site = 'instagram';

      if (site === 'unknown') {
        this.showError('Profile sync not supported on this site');
        return;
      }

      this.showLoading('Syncing profile...');

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'syncProfile',
        site: site
      });

      if (response?.success) {
        this.showSuccess('Profile synced successfully!');
        await this.loadDashboardData();
      } else {
        this.showError('Profile sync failed. Please try again.');
      }
    } catch (error) {
      console.error('Profile sync error:', error);
      this.showError('Sync failed. Please check if you\'re on a supported site.');
    }
  }

  showInviteOptions() {
    // Create invite modal
    const modal = document.createElement('div');
    modal.className = 'invite-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Invite Contacts to TalentXcel</h3>
        <div class="invite-options">
          <button class="invite-option" data-method="email">
            <span class="invite-icon">📧</span>
            <span class="invite-text">Invite via Email</span>
            <span class="invite-reward">+25 TXC per invite</span>
          </button>
          <button class="invite-option" data-method="social">
            <span class="invite-icon">📱</span>
            <span class="invite-text">Share on Social Media</span>
            <span class="invite-reward">+50 TXC per signup</span>
          </button>
          <button class="invite-option" data-method="copy">
            <span class="invite-icon">🔗</span>
            <span class="invite-text">Copy Invite Link</span>
            <span class="invite-reward">+10 TXC per click</span>
          </button>
        </div>
        <button class="close-modal">Close</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle modal events
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelectorAll('.invite-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const method = e.currentTarget.dataset.method;
        this.handleInvite(method);
        modal.remove();
      });
    });
  }

  showEarnTokensOptions() {
    chrome.tabs.create({ url: 'https://talentxcel.in/earn-tokens' });
  }

  async handleInvite(method) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateInviteLink',
        method: method
      });

      if (response?.success) {
        const inviteLink = response.data.link;
        
        switch (method) {
          case 'email':
            chrome.tabs.create({ 
              url: `mailto:?subject=Join me on TalentXcel&body=Check out this amazing career platform: ${inviteLink}` 
            });
            break;
          case 'social':
            chrome.tabs.create({ 
              url: `https://twitter.com/intent/tweet?text=Just discovered TalentXcel - an amazing AI-powered career platform! Check it out: ${inviteLink}` 
            });
            break;
          case 'copy':
            await navigator.clipboard.writeText(inviteLink);
            this.showSuccess('Invite link copied to clipboard!');
            break;
        }
      }
    } catch (error) {
      console.error('Invite error:', error);
      this.showError('Failed to generate invite link');
    }
  }

  async handleLogout() {
    try {
      await chrome.storage.local.remove(['txc_auth_token', 'txc_user', 'txc_auth_expires']);
      this.showAuthSection();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  showAuthSection() {
    this.hideAll();
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('statusIndicator').className = 'status-indicator offline';
  }

  showLoading(message = 'Loading...') {
    this.hideAll();
    const loadingElement = document.getElementById('loadingState');
    loadingElement.style.display = 'block';
    loadingElement.querySelector('p').textContent = message;
  }

  showError(message) {
    this.hideAll();
    const errorElement = document.getElementById('errorMessage');
    errorElement.style.display = 'block';
    document.getElementById('errorText').textContent = message;
  }

  showSuccess(message) {
    // Show temporary success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  hideAll() {
    const sections = ['authSection', 'dashboardSection', 'loadingState', 'errorMessage'];
    sections.forEach(section => {
      const element = document.getElementById(section);
      if (element) element.style.display = 'none';
    });
  }

  getNotificationIcon(type) {
    const icons = {
      job_match: '🎯',
      connection: '👥',
      token_earned: '💰',
      profile_update: '👤',
      message: '💬',
      system: '⚙️'
    };
    return icons[type] || '📢';
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  handleNotificationClick(notificationId) {
    // Mark notification as read and navigate to relevant page
    chrome.runtime.sendMessage({
      action: 'markNotificationRead',
      notificationId: notificationId
    });
  }

  updateProfileCompletion(data) {
    // Update UI elements based on profile completion data
    if (data.completionPercentage) {
      // You could add a progress indicator here
      console.log('Profile completion:', data.completionPercentage + '%');
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TalentXcelPopup();
});