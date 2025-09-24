// TalentXcel LinkedIn Content Script
class LinkedInIntegration {
  constructor() {
    this.init();
  }

  async init() {
    console.log('TalentXcel LinkedIn integration loaded');
    
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
    } else {
      this.setupIntegration();
    }
  }

  setupIntegration() {
    this.addTalentXcelUI();
    this.setupProfileExtraction();
    this.setupJobApplicationHelper();
    this.observePageChanges();
  }

  addTalentXcelUI() {
    // Add TalentXcel floating action button
    const fab = this.createFloatingActionButton();
    document.body.appendChild(fab);

    // Add TalentXcel panel to profile pages
    if (this.isProfilePage()) {
      this.addProfilePanel();
    }

    // Add job match indicators to job listings
    if (this.isJobsPage()) {
      this.addJobMatchIndicators();
    }
  }

  createFloatingActionButton() {
    const fab = document.createElement('div');
    fab.className = 'txc-fab';
    fab.innerHTML = `
      <div class="txc-fab-button" id="txcFab">
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="TalentXcel">
        <span class="txc-fab-tooltip">TalentXcel Actions</span>
      </div>
      <div class="txc-fab-menu" id="txcFabMenu" style="display: none;">
        <button class="txc-fab-menu-item" data-action="syncProfile">
          <span>🔄</span> Sync Profile
        </button>
        <button class="txc-fab-menu-item" data-action="findMatches">
          <span>🎯</span> Find Matches
        </button>
        <button class="txc-fab-menu-item" data-action="earnTokens">
          <span>💰</span> Earn TXC
        </button>
        <button class="txc-fab-menu-item" data-action="autoFill">
          <span>📝</span> Auto-fill Application
        </button>
      </div>
    `;

    // Add event listeners
    const fabButton = fab.querySelector('#txcFab');
    const fabMenu = fab.querySelector('#txcFabMenu');

    fabButton.addEventListener('click', () => {
      const isVisible = fabMenu.style.display !== 'none';
      fabMenu.style.display = isVisible ? 'none' : 'block';
    });

    // Handle menu actions
    fab.querySelectorAll('.txc-fab-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleFabAction(action);
        fabMenu.style.display = 'none';
      });
    });

    return fab;
  }

  addProfilePanel() {
    const profileSection = document.querySelector('.pv-top-card') || 
                          document.querySelector('.profile-header');
    
    if (!profileSection) return;

    const panel = document.createElement('div');
    panel.className = 'txc-profile-panel';
    panel.innerHTML = `
      <div class="txc-panel-header">
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="TalentXcel">
        <span>TalentXcel Insights</span>
      </div>
      <div class="txc-panel-content">
        <div class="txc-sync-status">
          <button class="txc-btn txc-btn-primary" id="syncLinkedInProfile">
            Sync to TalentXcel
          </button>
        </div>
        <div class="txc-profile-score" id="profileScore" style="display: none;">
          <div class="score-label">Profile Strength</div>
          <div class="score-value">
            <span class="score-number" id="scoreNumber">0</span>
            <span class="score-max">/100</span>
          </div>
          <div class="score-bar">
            <div class="score-fill" id="scoreFill" style="width: 0%"></div>
          </div>
        </div>
        <div class="txc-suggestions" id="txcSuggestions">
          <!-- AI suggestions will be populated here -->
        </div>
      </div>
    `;

    profileSection.appendChild(panel);

    // Add sync functionality
    const syncButton = panel.querySelector('#syncLinkedInProfile');
    syncButton.addEventListener('click', () => this.syncProfile());
  }

  addJobMatchIndicators() {
    const jobCards = document.querySelectorAll('.job-card-container, .jobs-search-results__list-item');
    
    jobCards.forEach(card => {
      if (card.querySelector('.txc-match-indicator')) return; // Already processed

      const indicator = document.createElement('div');
      indicator.className = 'txc-match-indicator';
      indicator.innerHTML = `
        <div class="txc-match-badge" data-match="unknown">
          <span class="match-icon">🎯</span>
          <span class="match-text">Analyzing...</span>
        </div>
      `;

      card.style.position = 'relative';
      card.appendChild(indicator);

      // Analyze job match
      this.analyzeJobMatch(card, indicator);
    });
  }

  setupProfileExtraction() {
    // Monitor for profile data changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if profile data was updated
          if (this.isProfilePage()) {
            this.extractProfileData();
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setupJobApplicationHelper() {
    // Look for job application forms
    const observer = new MutationObserver(() => {
      const applyButton = document.querySelector('[data-control-name="jobdetails_topcard_inapply"]');
      if (applyButton && !applyButton.hasAttribute('data-txc-enhanced')) {
        this.enhanceApplyButton(applyButton);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  enhanceApplyButton(applyButton) {
    applyButton.setAttribute('data-txc-enhanced', 'true');
    
    // Add TalentXcel auto-fill option
    const helper = document.createElement('div');
    helper.className = 'txc-apply-helper';
    helper.innerHTML = `
      <button class="txc-btn txc-btn-secondary" id="txcAutoFill">
        <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="TalentXcel">
        Auto-fill with TalentXcel
      </button>
    `;

    applyButton.parentNode.insertBefore(helper, applyButton.nextSibling);

    helper.querySelector('#txcAutoFill').addEventListener('click', () => {
      this.autoFillApplication();
    });
  }

  async extractProfileData() {
    try {
      const profileData = {
        name: this.getProfileName(),
        headline: this.getProfileHeadline(),
        location: this.getProfileLocation(),
        summary: this.getProfileSummary(),
        experience: this.getExperienceData(),
        education: this.getEducationData(),
        skills: this.getSkillsData(),
        connectionCount: this.getConnectionCount(),
        profileUrl: window.location.href,
        profileImage: this.getProfileImage()
      };

      console.log('Extracted LinkedIn profile data:', profileData);
      return profileData;
    } catch (error) {
      console.error('Profile extraction error:', error);
      return null;
    }
  }

  getProfileName() {
    const nameSelectors = [
      '.text-heading-xlarge',
      '.pv-text-details__left-panel h1',
      '.profile-header__name'
    ];

    for (const selector of nameSelectors) {
      const element = document.querySelector(selector);
      if (element) return element.textContent.trim();
    }

    return '';
  }

  getProfileHeadline() {
    const headlineSelectors = [
      '.text-body-medium.break-words',
      '.pv-text-details__left-panel .text-body-medium',
      '.profile-header__headline'
    ];

    for (const selector of headlineSelectors) {
      const element = document.querySelector(selector);
      if (element) return element.textContent.trim();
    }

    return '';
  }

  getProfileLocation() {
    const locationSelectors = [
      '.text-body-small.inline.t-black--light.break-words',
      '.pv-text-details__left-panel .text-body-small',
      '.profile-header__location'
    ];

    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.includes('•')) {
        continue; // Skip elements with bullets (likely not location)
      }
      if (element) return element.textContent.trim();
    }

    return '';
  }

  getProfileSummary() {
    const summarySelectors = [
      '.pv-shared-text-with-see-more .inline-show-more-text span[aria-hidden="true"]',
      '.summary-section .pv-entity__summary-info',
      '.about-section .inline-show-more-text'
    ];

    for (const selector of summarySelectors) {
      const element = document.querySelector(selector);
      if (element) return element.textContent.trim();
    }

    return '';
  }

  getExperienceData() {
    const experiences = [];
    const experienceItems = document.querySelectorAll('.pvs-list__item--line-separated .pvs-entity');

    experienceItems.forEach(item => {
      const titleElement = item.querySelector('.mr1.t-bold span[aria-hidden="true"]');
      const companyElement = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
      const durationElement = item.querySelector('.pvs-entity__caption-wrapper span[aria-hidden="true"]');

      if (titleElement) {
        experiences.push({
          title: titleElement.textContent.trim(),
          company: companyElement ? companyElement.textContent.trim() : '',
          duration: durationElement ? durationElement.textContent.trim() : ''
        });
      }
    });

    return experiences;
  }

  getEducationData() {
    const education = [];
    const educationItems = document.querySelectorAll('.education-section .pv-entity__summary-info');

    educationItems.forEach(item => {
      const schoolElement = item.querySelector('.pv-entity__school-name');
      const degreeElement = item.querySelector('.pv-entity__degree-name');
      const datesElement = item.querySelector('.pv-entity__dates');

      if (schoolElement) {
        education.push({
          school: schoolElement.textContent.trim(),
          degree: degreeElement ? degreeElement.textContent.trim() : '',
          dates: datesElement ? datesElement.textContent.trim() : ''
        });
      }
    });

    return education;
  }

  getSkillsData() {
    const skills = [];
    const skillElements = document.querySelectorAll('.pvs-list__item--line-separated .hoverable-link-text span[aria-hidden="true"]');

    skillElements.forEach(element => {
      const skill = element.textContent.trim();
      if (skill && !skills.includes(skill)) {
        skills.push(skill);
      }
    });

    return skills;
  }

  getConnectionCount() {
    const connectionElement = document.querySelector('.t-black--light.t-normal a span');
    if (connectionElement) {
      const text = connectionElement.textContent;
      const match = text.match(/(\d+(?:,\d+)?)/);
      return match ? parseInt(match[1].replace(',', '')) : 0;
    }
    return 0;
  }

  getProfileImage() {
    const imgElement = document.querySelector('.pv-top-card__photo img, .profile-photo img');
    return imgElement ? imgElement.src : '';
  }

  async syncProfile() {
    const profileData = await this.extractProfileData();
    if (!profileData) {
      this.showNotification('Failed to extract profile data', 'error');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'extractProfile',
        site: 'linkedin',
        data: profileData
      });

      if (response.success) {
        await chrome.runtime.sendMessage({
          action: 'syncToTalentXcel',
          profileData: response.data
        });

        // Award tokens for syncing
        await chrome.runtime.sendMessage({
          action: 'earnTokens',
          activity: 'linkedin_profile_sync',
          amount: 50
        });

        this.showNotification('Profile synced successfully! You earned 50 TXC tokens.', 'success');
        this.updateProfileScore(response.data);
      } else {
        this.showNotification('Failed to sync profile', 'error');
      }
    } catch (error) {
      console.error('Sync error:', error);
      this.showNotification('Sync failed. Please try again.', 'error');
    }
  }

  async analyzeJobMatch(jobCard, indicator) {
    try {
      // Extract job details
      const jobTitle = jobCard.querySelector('.job-card-list__title, .t-16.t-black.t-bold a')?.textContent?.trim();
      const company = jobCard.querySelector('.job-card-container__company-name, .t-14.t-black--light a')?.textContent?.trim();
      
      if (!jobTitle) return;

      // Get match score from TalentXcel
      const response = await chrome.runtime.sendMessage({
        action: 'checkJobMatches',
        userProfile: await this.extractProfileData()
      });

      if (response.success && response.data.length > 0) {
        const match = response.data.find(m => 
          m.job_title?.toLowerCase().includes(jobTitle.toLowerCase()) ||
          m.company_name?.toLowerCase().includes(company?.toLowerCase())
        );

        if (match) {
          this.updateMatchIndicator(indicator, match.match_score);
        }
      }
    } catch (error) {
      console.error('Job match analysis error:', error);
    }
  }

  updateMatchIndicator(indicator, score) {
    const badge = indicator.querySelector('.txc-match-badge');
    let matchLevel = 'low';
    let matchText = 'Low Match';
    let matchIcon = '🔴';

    if (score >= 80) {
      matchLevel = 'high';
      matchText = 'High Match';
      matchIcon = '🟢';
    } else if (score >= 60) {
      matchLevel = 'medium';
      matchText = 'Good Match';
      matchIcon = '🟡';
    }

    badge.setAttribute('data-match', matchLevel);
    badge.innerHTML = `
      <span class="match-icon">${matchIcon}</span>
      <span class="match-text">${matchText} (${score}%)</span>
    `;
  }

  updateProfileScore(profileData) {
    const scoreElement = document.querySelector('#profileScore');
    const scoreNumber = document.querySelector('#scoreNumber');
    const scoreFill = document.querySelector('#scoreFill');

    if (scoreElement && profileData.profileScore) {
      scoreElement.style.display = 'block';
      scoreNumber.textContent = profileData.profileScore;
      scoreFill.style.width = `${profileData.profileScore}%`;
    }
  }

  async autoFillApplication() {
    try {
      // Get user profile data from TalentXcel
      const response = await chrome.runtime.sendMessage({
        action: 'getUserProfile'
      });

      if (response.success) {
        const profile = response.data;
        
        // Fill form fields
        this.fillFormField('input[name*="firstName"], input[id*="firstName"]', profile.firstName);
        this.fillFormField('input[name*="lastName"], input[id*="lastName"]', profile.lastName);
        this.fillFormField('input[name*="email"], input[id*="email"]', profile.email);
        this.fillFormField('input[name*="phone"], input[id*="phone"]', profile.phone);
        this.fillFormField('textarea[name*="cover"], textarea[id*="cover"]', profile.coverLetter);

        // Award tokens for auto-fill
        await chrome.runtime.sendMessage({
          action: 'earnTokens',
          activity: 'auto_fill_application',
          amount: 25
        });

        this.showNotification('Application auto-filled! You earned 25 TXC tokens.', 'success');
      }
    } catch (error) {
      console.error('Auto-fill error:', error);
      this.showNotification('Auto-fill failed. Please try again.', 'error');
    }
  }

  fillFormField(selector, value) {
    const field = document.querySelector(selector);
    if (field && value) {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  handleFabAction(action) {
    switch (action) {
      case 'syncProfile':
        this.syncProfile();
        break;
      case 'findMatches':
        this.findJobMatches();
        break;
      case 'earnTokens':
        this.showEarnTokensOptions();
        break;
      case 'autoFill':
        this.autoFillApplication();
        break;
    }
  }

  async findJobMatches() {
    try {
      const profileData = await this.extractProfileData();
      const response = await chrome.runtime.sendMessage({
        action: 'checkJobMatches',
        userProfile: profileData
      });

      if (response.success && response.data.length > 0) {
        // Open TalentXcel job matches page
        window.open('https://talentxcel.in/jobs/matches', '_blank');
      } else {
        this.showNotification('No new job matches found. Keep optimizing your profile!', 'info');
      }
    } catch (error) {
      console.error('Find matches error:', error);
    }
  }

  showEarnTokensOptions() {
    const modal = document.createElement('div');
    modal.className = 'txc-modal';
    modal.innerHTML = `
      <div class="txc-modal-content">
        <h3>Earn TXC Tokens</h3>
        <div class="earn-options">
          <div class="earn-option" data-action="complete-profile">
            <span class="earn-icon">📝</span>
            <span class="earn-text">Complete Profile</span>
            <span class="earn-tokens">+100 TXC</span>
          </div>
          <div class="earn-option" data-action="add-skills">
            <span class="earn-icon">🎯</span>
            <span class="earn-text">Add Skills</span>
            <span class="earn-tokens">+25 TXC</span>
          </div>
          <div class="earn-option" data-action="share-profile">
            <span class="earn-icon">📤</span>
            <span class="earn-text">Share Profile</span>
            <span class="earn-tokens">+50 TXC</span>
          </div>
        </div>
        <button class="txc-btn txc-btn-secondary" id="closeEarnModal">Close</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#closeEarnModal').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `txc-notification txc-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  observePageChanges() {
    let lastUrl = location.href;
    
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => this.setupIntegration(), 1000);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  isProfilePage() {
    return window.location.pathname.includes('/in/') && 
           !window.location.pathname.includes('/jobs/');
  }

  isJobsPage() {
    return window.location.pathname.includes('/jobs/');
  }
}

// Initialize LinkedIn integration
new LinkedInIntegration();