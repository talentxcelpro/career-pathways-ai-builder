// TalentXcel Naukri Content Script
class NaukriIntegration {
  constructor() {
    this.init();
  }

  async init() {
    console.log('TalentXcel Naukri integration loaded');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
    } else {
      this.setupIntegration();
    }
  }

  setupIntegration() {
    this.addTalentXcelUI();
    this.setupProfileExtraction();
    this.setupJobSearchEnhancement();
    this.observePageChanges();
  }

  addTalentXcelUI() {
    // Add floating action button
    const fab = this.createFloatingActionButton();
    document.body.appendChild(fab);

    // Add profile enhancement panel
    if (this.isProfilePage()) {
      this.addProfilePanel();
    }

    // Add job enhancement for job listings
    if (this.isJobSearchPage()) {
      this.enhanceJobListings();
    }

    // Add application helper for job details
    if (this.isJobDetailPage()) {
      this.addApplicationHelper();
    }
  }

  createFloatingActionButton() {
    const fab = document.createElement('div');
    fab.className = 'txc-fab txc-naukri-fab';
    fab.innerHTML = `
      <div class="txc-fab-button" id="txcNaukriFab">
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="TalentXcel">
        <span class="txc-fab-tooltip">TalentXcel</span>
      </div>
      <div class="txc-fab-menu" id="txcNaukriFabMenu" style="display: none;">
        <button class="txc-fab-menu-item" data-action="syncProfile">
          <span>🔄</span> Sync Naukri Profile
        </button>
        <button class="txc-fab-menu-item" data-action="enhanceProfile">
          <span>✨</span> Enhance Profile
        </button>
        <button class="txc-fab-menu-item" data-action="findBetterJobs">
          <span>🎯</span> Find Better Jobs
        </button>
        <button class="txc-fab-menu-item" data-action="autoApply">
          <span>🚀</span> Smart Apply
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
    const fabButton = fab.querySelector('#txcNaukriFab');
    const fabMenu = fab.querySelector('#txcNaukriFabMenu');

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

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!fab.contains(e.target)) {
        fabMenu.style.display = 'none';
      }
    });
  }

  addProfilePanel() {
    const profileContainer = document.querySelector('.profileDet, .pdet, .profile-container');
    if (!profileContainer) return;

    const panel = document.createElement('div');
    panel.className = 'txc-naukri-panel';
    panel.innerHTML = `
      <div class="txc-panel-header">
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="TalentXcel">
        <span>TalentXcel Profile Insights</span>
      </div>
      <div class="txc-panel-content">
        <div class="txc-profile-analysis" id="profileAnalysis">
          <div class="analysis-item">
            <span class="analysis-label">Profile Strength:</span>
            <div class="strength-bar">
              <div class="strength-fill" id="strengthFill" style="width: 0%"></div>
            </div>
            <span class="strength-score" id="strengthScore">0%</span>
          </div>
          <div class="analysis-suggestions" id="suggestions">
            <h4>AI Recommendations</h4>
            <ul id="suggestionsList">
              <li>Analyzing your profile...</li>
            </ul>
          </div>
        </div>
        <div class="txc-actions">
          <button class="txc-btn txc-btn-primary" id="syncNaukriProfile">
            Sync to TalentXcel
          </button>
          <button class="txc-btn txc-btn-secondary" id="optimizeProfile">
            AI Optimize
          </button>
        </div>
      </div>
    `;

    profileContainer.appendChild(panel);
    this.setupPanelEvents(panel);
    this.analyzeProfile();
  }

  setupPanelEvents(panel) {
    panel.querySelector('#syncNaukriProfile').addEventListener('click', () => {
      this.syncProfile();
    });

    panel.querySelector('#optimizeProfile').addEventListener('click', () => {
      this.optimizeProfile();
    });
  }

  enhanceJobListings() {
    const jobCards = document.querySelectorAll('.jobTuple, .jdBlock, .job-card');
    
    jobCards.forEach(card => {
      if (card.querySelector('.txc-job-enhancement')) return;

      const enhancement = document.createElement('div');
      enhancement.className = 'txc-job-enhancement';
      enhancement.innerHTML = `
        <div class="txc-job-match">
          <span class="match-icon">🎯</span>
          <span class="match-text">Analyzing fit...</span>
          <div class="match-score" id="matchScore-${Date.now()}"></div>
        </div>
        <div class="txc-job-actions">
          <button class="txc-job-action" data-action="smartApply">
            <span>🚀</span> Smart Apply
          </button>
          <button class="txc-job-action" data-action="saveForLater">
            <span>💾</span> Save to TalentXcel
          </button>
        </div>
      `;

      card.appendChild(enhancement);
      this.analyzeJobMatch(card, enhancement);
      this.setupJobActions(enhancement);
    });
  }

  addApplicationHelper() {
    const applyButton = document.querySelector('.applyBtn, .apply-btn, .btnApply');
    if (!applyButton || applyButton.hasAttribute('data-txc-enhanced')) return;

    applyButton.setAttribute('data-txc-enhanced', 'true');
    
    const helper = document.createElement('div');
    helper.className = 'txc-apply-helper';
    helper.innerHTML = `
      <div class="txc-apply-options">
        <button class="txc-btn txc-btn-primary" id="smartApply">
          <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="TalentXcel">
          Smart Apply with TalentXcel
        </button>
        <button class="txc-btn txc-btn-secondary" id="improveApplication">
          <span>✨</span> Improve Application
        </button>
      </div>
      <div class="txc-application-tips" id="applicationTips">
        <h4>Application Tips</h4>
        <ul id="tipsList">
          <li>Loading personalized tips...</li>
        </ul>
      </div>
    `;

    applyButton.parentNode.insertBefore(helper, applyButton.nextSibling);
    this.setupApplicationHelper(helper);
    this.generateApplicationTips();
  }

  async extractNaukriProfile() {
    try {
      const profileData = {
        name: this.getProfileName(),
        designation: this.getDesignation(),
        location: this.getLocation(),
        totalExperience: this.getTotalExperience(),
        currentCompany: this.getCurrentCompany(),
        education: this.getEducation(),
        keySkills: this.getKeySkills(),
        summary: this.getProfileSummary(),
        profileUrl: window.location.href,
        lastActive: this.getLastActive(),
        profileViews: this.getProfileViews()
      };

      console.log('Extracted Naukri profile data:', profileData);
      return profileData;
    } catch (error) {
      console.error('Naukri profile extraction error:', error);
      return null;
    }
  }

  getProfileName() {
    const selectors = [
      '.fullName',
      '.pName',
      '.profile-name',
      '[data-label="Name"] span'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element.textContent.trim();
    }
    return '';
  }

  getDesignation() {
    const selectors = [
      '.designation',
      '.currentDesignation',
      '.profile-designation',
      '[data-label="Designation"] span'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element.textContent.trim();
    }
    return '';
  }

  getLocation() {
    const selectors = [
      '.locIcn + span',
      '.location',
      '.profile-location',
      '[data-label="Location"] span'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element.textContent.trim();
    }
    return '';
  }

  getTotalExperience() {
    const selectors = [
      '.expIcn + span',
      '.totalExp',
      '.experience-total',
      '[data-label="Experience"] span'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element.textContent.trim();
    }
    return '';
  }

  getCurrentCompany() {
    const selectors = [
      '.currentOrganization',
      '.current-company',
      '.companyName:first-child'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element.textContent.trim();
    }
    return '';
  }

  getEducation() {
    const education = [];
    const eduElements = document.querySelectorAll('.eduBlock, .education-item');

    eduElements.forEach(item => {
      const course = item.querySelector('.course, .degree')?.textContent?.trim();
      const institute = item.querySelector('.institute, .school')?.textContent?.trim();
      const year = item.querySelector('.year, .passing-year')?.textContent?.trim();

      if (course || institute) {
        education.push({ course, institute, year });
      }
    });

    return education;
  }

  getKeySkills() {
    const skills = [];
    const skillElements = document.querySelectorAll('.skillDet a, .skill-tag, .skills-list li');

    skillElements.forEach(element => {
      const skill = element.textContent.trim();
      if (skill && !skills.includes(skill)) {
        skills.push(skill);
      }
    });

    return skills;
  }

  getProfileSummary() {
    const selectors = [
      '.resumeHeadline',
      '.profile-summary',
      '.summary-text'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element.textContent.trim();
    }
    return '';
  }

  getLastActive() {
    const element = document.querySelector('.lastActive, .last-active');
    return element ? element.textContent.trim() : '';
  }

  getProfileViews() {
    const element = document.querySelector('.profileViews, .profile-views');
    return element ? element.textContent.trim() : '';
  }

  async syncProfile() {
    const profileData = await this.extractNaukriProfile();
    if (!profileData) {
      this.showNotification('Failed to extract profile data', 'error');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'extractProfile',
        site: 'naukri',
        data: profileData
      });

      if (response.success) {
        await chrome.runtime.sendMessage({
          action: 'syncToTalentXcel',
          profileData: response.data
        });

        await chrome.runtime.sendMessage({
          action: 'earnTokens',
          activity: 'naukri_profile_sync',
          amount: 50
        });

        this.showNotification('Naukri profile synced successfully! You earned 50 TXC tokens.', 'success');
        this.updateProfileAnalysis(response.data);
      }
    } catch (error) {
      console.error('Sync error:', error);
      this.showNotification('Sync failed. Please try again.', 'error');
    }
  }

  async analyzeProfile() {
    const profileData = await this.extractNaukriProfile();
    if (!profileData) return;

    // Calculate profile strength
    let strength = 0;
    const checks = [
      { field: 'name', weight: 10, label: 'Profile name' },
      { field: 'designation', weight: 15, label: 'Current designation' },
      { field: 'summary', weight: 20, label: 'Profile summary' },
      { field: 'keySkills', weight: 15, label: 'Key skills', condition: (val) => val.length >= 5 },
      { field: 'education', weight: 10, label: 'Education details' },
      { field: 'totalExperience', weight: 15, label: 'Experience details' },
      { field: 'location', weight: 10, label: 'Location' },
      { field: 'currentCompany', weight: 5, label: 'Current company' }
    ];

    const suggestions = [];
    checks.forEach(check => {
      const value = profileData[check.field];
      if (check.condition ? check.condition(value) : value) {
        strength += check.weight;
      } else {
        suggestions.push(`Add ${check.label} to improve your profile`);
      }
    });

    this.updateProfileStrength(strength);
    this.updateSuggestions(suggestions);
  }

  updateProfileStrength(strength) {
    const strengthFill = document.querySelector('#strengthFill');
    const strengthScore = document.querySelector('#strengthScore');

    if (strengthFill && strengthScore) {
      strengthFill.style.width = `${strength}%`;
      strengthScore.textContent = `${strength}%`;

      // Color coding
      if (strength >= 80) {
        strengthFill.style.backgroundColor = '#10b981';
      } else if (strength >= 60) {
        strengthFill.style.backgroundColor = '#f59e0b';
      } else {
        strengthFill.style.backgroundColor = '#ef4444';
      }
    }
  }

  updateSuggestions(suggestions) {
    const suggestionsList = document.querySelector('#suggestionsList');
    if (!suggestionsList) return;

    if (suggestions.length === 0) {
      suggestionsList.innerHTML = '<li class="success">Your profile looks great! Keep it updated.</li>';
    } else {
      suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
    }
  }

  async analyzeJobMatch(jobCard, enhancement) {
    try {
      // Extract job details
      const jobTitle = jobCard.querySelector('.jobTitle, .job-title, .title a')?.textContent?.trim();
      const company = jobCard.querySelector('.companyName, .company-name, .company')?.textContent?.trim();
      const skills = Array.from(jobCard.querySelectorAll('.skill, .skills span, .key-skill'))
        .map(el => el.textContent.trim());

      if (!jobTitle) return;

      // Get user profile for matching
      const profileData = await this.extractNaukriProfile();
      
      // Calculate match score based on skills and experience
      let matchScore = 0;
      const userSkills = profileData.keySkills || [];
      
      // Skill matching (40% weight)
      const skillMatches = skills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      const skillScore = skills.length > 0 ? (skillMatches.length / skills.length) * 40 : 20;

      // Experience relevance (30% weight)
      const expScore = this.calculateExperienceScore(profileData, jobTitle);

      // Profile completeness (30% weight)
      const completenessScore = this.calculateCompletenessScore(profileData);

      matchScore = Math.round(skillScore + expScore + completenessScore);

      this.updateJobMatchDisplay(enhancement, matchScore, skillMatches);
    } catch (error) {
      console.error('Job match analysis error:', error);
    }
  }

  calculateExperienceScore(profile, jobTitle) {
    // Simple heuristic based on job title relevance
    const currentDesignation = profile.designation?.toLowerCase() || '';
    const jobTitleLower = jobTitle.toLowerCase();
    
    // Check if current designation is related to job title
    const keywords = jobTitleLower.split(' ');
    const matches = keywords.filter(keyword => 
      currentDesignation.includes(keyword) && keyword.length > 2
    );
    
    return matches.length > 0 ? 30 : 15;
  }

  calculateCompletenessScore(profile) {
    let score = 0;
    if (profile.name) score += 5;
    if (profile.designation) score += 5;
    if (profile.summary && profile.summary.length > 50) score += 10;
    if (profile.keySkills && profile.keySkills.length >= 5) score += 10;
    
    return score;
  }

  updateJobMatchDisplay(enhancement, score, skillMatches) {
    const matchText = enhancement.querySelector('.match-text');
    const matchScore = enhancement.querySelector('[id^="matchScore"]');

    let level = 'Low';
    let color = '#ef4444';
    
    if (score >= 80) {
      level = 'Excellent';
      color = '#10b981';
    } else if (score >= 70) {
      level = 'Very Good';
      color = '#059669';
    } else if (score >= 60) {
      level = 'Good';
      color = '#f59e0b';
    } else if (score >= 50) {
      level = 'Fair';
      color = '#f97316';
    }

    matchText.textContent = `${level} Match`;
    matchScore.innerHTML = `
      <span style="color: ${color}; font-weight: bold;">${score}%</span>
      <div class="skill-matches">
        ${skillMatches.length > 0 ? `${skillMatches.length} skill matches` : 'No skill matches'}
      </div>
    `;
  }

  setupJobActions(enhancement) {
    enhancement.querySelectorAll('.txc-job-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        if (action === 'smartApply') {
          this.smartApply(enhancement.closest('.jobTuple, .jdBlock, .job-card'));
        } else if (action === 'saveForLater') {
          this.saveJob(enhancement.closest('.jobTuple, .jdBlock, .job-card'));
        }
      });
    });
  }

  async smartApply(jobCard) {
    try {
      // Extract job details
      const jobData = this.extractJobDetails(jobCard);
      
      // Get optimized application from TalentXcel
      const response = await chrome.runtime.sendMessage({
        action: 'optimizeApplication',
        jobData: jobData,
        userProfile: await this.extractNaukriProfile()
      });

      if (response.success) {
        // Pre-fill application form if available
        this.fillApplicationForm(response.data);
        
        // Award tokens for smart apply
        await chrome.runtime.sendMessage({
          action: 'earnTokens',
          activity: 'smart_apply_naukri',
          amount: 25
        });

        this.showNotification('Application optimized and submitted! You earned 25 TXC tokens.', 'success');
      }
    } catch (error) {
      console.error('Smart apply error:', error);
      this.showNotification('Smart apply failed. Please try manual application.', 'error');
    }
  }

  async saveJob(jobCard) {
    try {
      const jobData = this.extractJobDetails(jobCard);
      
      const response = await chrome.runtime.sendMessage({
        action: 'saveJob',
        jobData: jobData,
        source: 'naukri'
      });

      if (response.success) {
        await chrome.runtime.sendMessage({
          action: 'earnTokens',
          activity: 'save_job',
          amount: 10
        });

        this.showNotification('Job saved to TalentXcel! You earned 10 TXC tokens.', 'success');
      }
    } catch (error) {
      console.error('Save job error:', error);
    }
  }

  extractJobDetails(jobCard) {
    return {
      title: jobCard.querySelector('.jobTitle, .job-title, .title a')?.textContent?.trim(),
      company: jobCard.querySelector('.companyName, .company-name, .company')?.textContent?.trim(),
      location: jobCard.querySelector('.location, .job-location')?.textContent?.trim(),
      experience: jobCard.querySelector('.experience, .exp-range')?.textContent?.trim(),
      salary: jobCard.querySelector('.salary, .salary-range')?.textContent?.trim(),
      skills: Array.from(jobCard.querySelectorAll('.skill, .skills span, .key-skill'))
        .map(el => el.textContent.trim()),
      url: jobCard.querySelector('.jobTitle a, .title a')?.href || window.location.href
    };
  }

  handleFabAction(action) {
    switch (action) {
      case 'syncProfile':
        this.syncProfile();
        break;
      case 'enhanceProfile':
        this.enhanceProfile();
        break;
      case 'findBetterJobs':
        this.findBetterJobs();
        break;
      case 'autoApply':
        this.showAutoApplyOptions();
        break;
      case 'earnTokens':
        this.showEarnTokensOptions();
        break;
    }
  }

  async enhanceProfile() {
    window.open('https://talentxcel.in/profile/enhance', '_blank');
  }

  async findBetterJobs() {
    const profileData = await this.extractNaukriProfile();
    const queryParams = new URLSearchParams({
      skills: profileData.keySkills?.join(',') || '',
      experience: profileData.totalExperience || '',
      location: profileData.location || ''
    });
    
    window.open(`https://talentxcel.in/jobs/search?${queryParams}`, '_blank');
  }

  showAutoApplyOptions() {
    // Implementation for auto-apply options modal
    this.showNotification('Auto-apply feature coming soon!', 'info');
  }

  showEarnTokensOptions() {
    // Implementation for earn tokens modal
    this.showNotification('Complete your profile and apply to jobs to earn more TXC tokens!', 'info');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `txc-notification txc-notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
      </div>
      <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);

    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    return icons[type] || icons.info;
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
    return window.location.pathname.includes('/my-profile') || 
           window.location.pathname.includes('/profile');
  }

  isJobSearchPage() {
    return window.location.pathname.includes('/jobs') && 
           !window.location.pathname.includes('/job-detail');
  }

  isJobDetailPage() {
    return window.location.pathname.includes('/job-detail');
  }
}

// Initialize Naukri integration
new NaukriIntegration();