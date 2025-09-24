// TalentXcel Instagram Content Script
class InstagramIntegration {
  constructor() {
    this.init();
  }

  async init() {
    console.log('TalentXcel Instagram integration loaded');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
    } else {
      this.setupIntegration();
    }
  }

  setupIntegration() {
    this.addTalentXcelUI();
    this.setupCreatorAnalytics();
    this.observePageChanges();
  }

  addTalentXcelUI() {
    // Add floating action button
    const fab = this.createFloatingActionButton();
    document.body.appendChild(fab);

    // Add profile panel for creator profiles
    if (this.isProfilePage()) {
      this.addCreatorPanel();
    }
  }

  createFloatingActionButton() {
    const fab = document.createElement('div');
    fab.className = 'txc-fab txc-instagram-fab';
    fab.innerHTML = `
      <div class="txc-fab-button" id="txcInstagramFab">
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="TalentXcel">
        <span class="txc-fab-tooltip">TalentXcel Creator Tools</span>
      </div>
      <div class="txc-fab-menu" id="txcInstagramFabMenu" style="display: none;">
        <button class="txc-fab-menu-item" data-action="syncProfile">
          <span>📸</span> Sync Creator Profile
        </button>
        <button class="txc-fab-menu-item" data-action="brandAnalysis">
          <span>✨</span> Brand Analysis
        </button>
        <button class="txc-fab-menu-item" data-action="contentSuggestions">
          <span>💡</span> Content Ideas
        </button>
        <button class="txc-fab-menu-item" data-action="networkGrowth">
          <span>👥</span> Network Growth
        </button>
        <button class="txc-fab-menu-item" data-action="earnTokens">
          <span>💰</span> Earn TXC
        </button>
      </div>
    `;

    this.setupFabEvents(fab);
    return fab;
  }

  setupFabEvents(fab) {
    const fabButton = fab.querySelector('#txcInstagramFab');
    const fabMenu = fab.querySelector('#txcInstagramFabMenu');

    fabButton.addEventListener('click', () => {
      const isVisible = fabMenu.style.display !== 'none';
      fabMenu.style.display = isVisible ? 'none' : 'block';
    });

    fab.querySelectorAll('.txc-fab-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleFabAction(action);
        fabMenu.style.display = 'none';
      });
    });

    document.addEventListener('click', (e) => {
      if (!fab.contains(e.target)) {
        fabMenu.style.display = 'none';
      }
    });
  }

  addCreatorPanel() {
    const profileSection = document.querySelector('header section');
    
    if (!profileSection) return;

    const panel = document.createElement('div');
    panel.className = 'txc-creator-panel';
    panel.innerHTML = `
      <div class="txc-panel-header">
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="TalentXcel">
        <span>Creator Insights</span>
      </div>
      <div class="txc-panel-content">
        <div class="txc-sync-status">
          <button class="txc-btn txc-btn-primary" id="syncInstagramProfile">
            Sync to TalentXcel
          </button>
        </div>
        <div class="txc-creator-score" id="creatorScore" style="display: none;">
          <div class="score-label">Brand Strength</div>
          <div class="score-value">
            <span class="score-number" id="brandScoreNumber">0</span>
            <span class="score-max">/100</span>
          </div>
          <div class="score-bar">
            <div class="score-fill" id="brandScoreFill" style="width: 0%"></div>
          </div>
        </div>
        <div class="txc-creator-insights" id="creatorInsights">
          <!-- Insights will be populated here -->
        </div>
      </div>
    `;

    profileSection.appendChild(panel);

    const syncButton = panel.querySelector('#syncInstagramProfile');
    syncButton.addEventListener('click', () => this.syncProfile());
  }

  async handleFabAction(action) {
    this.showLoading(`Executing ${action}...`);

    try {
      switch (action) {
        case 'syncProfile':
          await this.syncProfile();
          break;
        case 'brandAnalysis':
          await this.performBrandAnalysis();
          break;
        case 'contentSuggestions':
          await this.generateContentSuggestions();
          break;
        case 'networkGrowth':
          await this.analyzeNetworkGrowth();
          break;
        case 'earnTokens':
          await this.earnTokens();
          break;
      }
    } catch (error) {
      console.error('Instagram action error:', error);
      this.showNotification('Action failed. Please try again.', 'error');
    }
  }

  async syncProfile() {
    const profileData = await this.extractInstagramProfile();
    if (!profileData) {
      this.showNotification('Failed to extract profile data', 'error');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'extractProfile',
        site: 'instagram',
        data: profileData
      });

      if (response.success) {
        await chrome.runtime.sendMessage({
          action: 'syncToTalentXcel',
          profileData: response.data
        });

        await chrome.runtime.sendMessage({
          action: 'earnTokens',
          activity: 'instagram_profile_sync',
          amount: 40
        });

        this.showNotification('Creator profile synced! You earned 40 TXC tokens.', 'success');
        this.updateCreatorScore(response.data);
      } else {
        this.showNotification('Failed to sync profile', 'error');
      }
    } catch (error) {
      console.error('Sync error:', error);
      this.showNotification('Sync failed. Please try again.', 'error');
    }
  }

  async extractInstagramProfile() {
    try {
      const profileData = {
        username: this.getUsername(),
        displayName: this.getDisplayName(),
        bio: this.getBio(),
        followersCount: this.getFollowersCount(),
        followingCount: this.getFollowingCount(),
        postsCount: this.getPostsCount(),
        profileImage: this.getProfileImage(),
        isVerified: this.getVerificationStatus(),
        website: this.getWebsite(),
        profileUrl: window.location.href,
        source: 'instagram'
      };

      console.log('Extracted Instagram profile data:', profileData);
      return profileData;
    } catch (error) {
      console.error('Profile extraction error:', error);
      return null;
    }
  }

  getUsername() {
    const usernameElement = document.querySelector('h2');
    return usernameElement ? usernameElement.textContent.trim() : '';
  }

  getDisplayName() {
    const nameElement = document.querySelector('h1');
    return nameElement ? nameElement.textContent.trim() : '';
  }

  getBio() {
    const bioElement = document.querySelector('h1').parentElement.nextElementSibling;
    return bioElement ? bioElement.textContent.trim() : '';
  }

  getFollowersCount() {
    const stats = document.querySelectorAll('a span');
    for (const stat of stats) {
      if (stat.textContent.includes('followers')) {
        const prev = stat.previousElementSibling;
        return prev ? this.parseCount(prev.textContent) : 0;
      }
    }
    return 0;
  }

  getFollowingCount() {
    const stats = document.querySelectorAll('a span');
    for (const stat of stats) {
      if (stat.textContent.includes('following')) {
        const prev = stat.previousElementSibling;
        return prev ? this.parseCount(prev.textContent) : 0;
      }
    }
    return 0;
  }

  getPostsCount() {
    const stats = document.querySelectorAll('span');
    for (const stat of stats) {
      if (stat.textContent.includes('posts')) {
        const prev = stat.previousElementSibling;
        return prev ? this.parseCount(prev.textContent) : 0;
      }
    }
    return 0;
  }

  getProfileImage() {
    const imgElement = document.querySelector('img[alt*="profile picture"]');
    return imgElement ? imgElement.src : '';
  }

  getVerificationStatus() {
    return !!document.querySelector('svg[aria-label="Verified"]');
  }

  getWebsite() {
    const linkElement = document.querySelector('a[href^="http"]');
    return linkElement ? linkElement.href : '';
  }

  parseCount(text) {
    if (!text) return 0;
    text = text.replace(/,/g, '');
    if (text.includes('k')) {
      return parseInt(text) * 1000;
    } else if (text.includes('m')) {
      return parseInt(text) * 1000000;
    }
    return parseInt(text) || 0;
  }

  async performBrandAnalysis() {
    const profileData = await this.extractInstagramProfile();
    
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeBrand',
      platform: 'instagram',
      profileData: profileData
    });

    if (response.success) {
      this.displayBrandInsights(response.data);
      this.showNotification('Brand analysis complete!', 'success');
    } else {
      this.showNotification('Brand analysis failed', 'error');
    }
  }

  async generateContentSuggestions() {
    const response = await chrome.runtime.sendMessage({
      action: 'generateContentIdeas',
      platform: 'instagram'
    });

    if (response.success) {
      this.displayContentSuggestions(response.data);
      this.showNotification('Content suggestions generated!', 'success');
    } else {
      this.showNotification('Failed to generate suggestions', 'error');
    }
  }

  async analyzeNetworkGrowth() {
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeNetworkGrowth',
      platform: 'instagram'
    });

    if (response.success) {
      this.displayNetworkInsights(response.data);
      this.showNotification('Network analysis complete!', 'success');
    } else {
      this.showNotification('Network analysis failed', 'error');
    }
  }

  async earnTokens() {
    await chrome.runtime.sendMessage({
      action: 'earnTokens',
      activity: 'instagram_engagement',
      amount: 20
    });

    this.showNotification('You earned 20 TXC tokens for engagement!', 'success');
  }

  updateCreatorScore(profileData) {
    const scoreElement = document.querySelector('#creatorScore');
    const scoreNumber = document.querySelector('#brandScoreNumber');
    const scoreFill = document.querySelector('#brandScoreFill');

    if (scoreElement && profileData.brandScore) {
      scoreElement.style.display = 'block';
      scoreNumber.textContent = profileData.brandScore;
      scoreFill.style.width = `${profileData.brandScore}%`;
    }
  }

  displayBrandInsights(insights) {
    const insightsContainer = document.querySelector('#creatorInsights');
    if (!insightsContainer) return;

    insightsContainer.innerHTML = `
      <div class="txc-insights">
        <h4>Brand Insights</h4>
        ${insights.map(insight => `
          <div class="insight-item">
            <span class="insight-icon">${insight.icon}</span>
            <span class="insight-text">${insight.text}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  displayContentSuggestions(suggestions) {
    this.showModal('Content Suggestions', `
      <div class="content-suggestions">
        ${suggestions.map(suggestion => `
          <div class="suggestion-item">
            <h5>${suggestion.title}</h5>
            <p>${suggestion.description}</p>
            <div class="suggestion-tags">
              ${suggestion.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `);
  }

  displayNetworkInsights(insights) {
    this.showModal('Network Growth Insights', `
      <div class="network-insights">
        <div class="insight-metric">
          <span class="metric-label">Growth Rate:</span>
          <span class="metric-value">${insights.growthRate}%</span>
        </div>
        <div class="insight-metric">
          <span class="metric-label">Engagement Rate:</span>
          <span class="metric-value">${insights.engagementRate}%</span>
        </div>
        <div class="recommendations">
          <h5>Recommendations:</h5>
          ${insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </div>
      </div>
    `);
  }

  isProfilePage() {
    return window.location.pathname.match(/^\/[^\/]+\/?$/);
  }

  observePageChanges() {
    new MutationObserver(() => {
      setTimeout(() => this.addTalentXcelUI(), 1000);
    }).observe(document, { subtree: true, childList: true });
  }

  showLoading(message) {
    this.showNotification(message, 'loading');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `txc-notification txc-notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'txc-modal';
    modal.innerHTML = `
      <div class="txc-modal-content">
        <div class="txc-modal-header">
          <h3>${title}</h3>
          <button class="txc-modal-close">&times;</button>
        </div>
        <div class="txc-modal-body">
          ${content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.txc-modal-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}

// Initialize Instagram integration
new InstagramIntegration();