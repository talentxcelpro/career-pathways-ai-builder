// TalentXcel Job Boards Content Script (Indeed & Glassdoor)
class JobBoardsIntegration {
  constructor() {
    this.platform = this.detectPlatform();
    this.init();
  }

  detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('indeed.com')) return 'indeed';
    if (hostname.includes('glassdoor.com')) return 'glassdoor';
    return 'unknown';
  }

  async init() {
    console.log(`TalentXcel ${this.platform} integration loaded`);
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
    } else {
      this.setupIntegration();
    }
  }

  setupIntegration() {
    this.addTalentXcelUI();
    this.enhanceJobListings();
    this.setupApplicationHelper();
    this.observePageChanges();
  }

  addTalentXcelUI() {
    const fab = this.createFloatingActionButton();
    document.body.appendChild(fab);

    if (this.isJobSearchPage()) {
      this.addJobSearchEnhancements();
    }

    if (this.isJobDetailPage()) {
      this.addJobDetailEnhancements();
    }
  }

  createFloatingActionButton() {
    const fab = document.createElement('div');
    fab.className = `txc-fab txc-${this.platform}-fab`;
    fab.innerHTML = `
      <div class="txc-fab-button" id="txc${this.platform}Fab">
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="TalentXcel">
        <span class="txc-fab-tooltip">TalentXcel Job Tools</span>
      </div>
      <div class="txc-fab-menu" id="txc${this.platform}FabMenu" style="display: none;">
        <button class="txc-fab-menu-item" data-action="smartMatch">
          <span>🎯</span> Smart Job Matching
        </button>
        <button class="txc-fab-menu-item" data-action="salaryInsights">
          <span>💰</span> Salary Insights
        </button>
        <button class="txc-fab-menu-item" data-action="companyResearch">
          <span>🏢</span> Company Research
        </button>
        <button class="txc-fab-menu-item" data-action="autoApplication">
          <span>🚀</span> Auto Application
        </button>
        <button class="txc-fab-menu-item" data-action="trackApplication">
          <span>📋</span> Track Application
        </button>
      </div>
    `;

    this.setupFabEvents(fab);
    return fab;
  }

  setupFabEvents(fab) {
    const fabButton = fab.querySelector(`#txc${this.platform}Fab`);
    const fabMenu = fab.querySelector(`#txc${this.platform}FabMenu`);

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

  addJobSearchEnhancements() {
    const searchContainer = this.getSearchContainer();
    if (!searchContainer) return;

    const enhancementPanel = document.createElement('div');
    enhancementPanel.className = 'txc-search-enhancement';
    enhancementPanel.innerHTML = `
      <div class="txc-enhancement-header">
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="TalentXcel">
        <span>TalentXcel Job Intelligence</span>
      </div>
      <div class="txc-enhancement-content">
        <button class="txc-btn txc-btn-primary" id="enhanceSearch">
          Enhance Search with AI
        </button>
        <button class="txc-btn txc-btn-secondary" id="saveSearch">
          Save Search & Get Alerts
        </button>
      </div>
    `;

    searchContainer.appendChild(enhancementPanel);

    enhancementPanel.querySelector('#enhanceSearch').addEventListener('click', () => {
      this.enhanceJobSearch();
    });

    enhancementPanel.querySelector('#saveSearch').addEventListener('click', () => {
      this.saveJobSearch();
    });
  }

  addJobDetailEnhancements() {
    const jobDetail = this.getJobDetailContainer();
    if (!jobDetail) return;

    const analysisPanel = document.createElement('div');
    analysisPanel.className = 'txc-job-analysis';
    analysisPanel.innerHTML = `
      <div class="txc-analysis-header">
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="TalentXcel">
        <span>Job Analysis</span>
      </div>
      <div class="txc-analysis-content">
        <div class="txc-match-score" id="matchScore">
          <div class="score-label">Match Score</div>
          <div class="score-circle">
            <span class="score-number" id="scoreNumber">--</span>
            <span class="score-percent">%</span>
          </div>
        </div>
        <div class="txc-analysis-actions">
          <button class="txc-btn txc-btn-primary" id="analyzeJob">
            Analyze Job Fit
          </button>
          <button class="txc-btn txc-btn-secondary" id="autoFillApp">
            Auto-fill Application
          </button>
        </div>
        <div class="txc-job-insights" id="jobInsights" style="display: none;">
          <!-- Insights will be populated here -->
        </div>
      </div>
    `;

    jobDetail.appendChild(analysisPanel);

    analysisPanel.querySelector('#analyzeJob').addEventListener('click', () => {
      this.analyzeJobFit();
    });

    analysisPanel.querySelector('#autoFillApp').addEventListener('click', () => {
      this.autoFillApplication();
    });
  }

  enhanceJobListings() {
    const jobCards = this.getJobCards();
    
    jobCards.forEach(card => {
      if (card.querySelector('.txc-job-enhancement')) return; // Already enhanced

      const enhancement = document.createElement('div');
      enhancement.className = 'txc-job-enhancement';
      enhancement.innerHTML = `
        <div class="txc-match-indicator" data-match="analyzing">
          <span class="match-icon">🔄</span>
          <span class="match-text">Analyzing...</span>
        </div>
        <div class="txc-quick-actions">
          <button class="txc-quick-btn" data-action="quickApply" title="Quick Apply">
            ⚡
          </button>
          <button class="txc-quick-btn" data-action="saveJob" title="Save Job">
            💾
          </button>
          <button class="txc-quick-btn" data-action="researchCompany" title="Research Company">
            🔍
          </button>
        </div>
      `;

      card.style.position = 'relative';
      card.appendChild(enhancement);

      // Set up quick action events
      enhancement.querySelectorAll('.txc-quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = e.currentTarget.dataset.action;
          this.handleQuickAction(action, card);
        });
      });

      // Analyze job match
      this.analyzeJobCard(card, enhancement);
    });
  }

  async analyzeJobCard(jobCard, enhancement) {
    try {
      const jobData = this.extractJobDataFromCard(jobCard);
      
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeJobMatch',
        platform: this.platform,
        jobData: jobData
      });

      if (response.success) {
        this.updateMatchIndicator(enhancement, response.data.matchScore);
      }
    } catch (error) {
      console.error('Job analysis error:', error);
    }
  }

  async handleFabAction(action) {
    this.showLoading(`Executing ${action}...`);

    try {
      switch (action) {
        case 'smartMatch':
          await this.performSmartMatching();
          break;
        case 'salaryInsights':
          await this.showSalaryInsights();
          break;
        case 'companyResearch':
          await this.performCompanyResearch();
          break;
        case 'autoApplication':
          await this.autoFillApplication();
          break;
        case 'trackApplication':
          await this.trackApplication();
          break;
      }
    } catch (error) {
      console.error('Job board action error:', error);
      this.showNotification('Action failed. Please try again.', 'error');
    }
  }

  async handleQuickAction(action, jobCard) {
    const jobData = this.extractJobDataFromCard(jobCard);

    switch (action) {
      case 'quickApply':
        await this.quickApply(jobData);
        break;
      case 'saveJob':
        await this.saveJob(jobData);
        break;
      case 'researchCompany':
        await this.researchCompany(jobData.company);
        break;
    }
  }

  extractJobDataFromCard(jobCard) {
    if (this.platform === 'indeed') {
      return this.extractIndeedJobData(jobCard);
    } else if (this.platform === 'glassdoor') {
      return this.extractGlassdoorJobData(jobCard);
    }
    return {};
  }

  extractIndeedJobData(jobCard) {
    return {
      title: jobCard.querySelector('[data-jk] h2 a span')?.textContent?.trim() || '',
      company: jobCard.querySelector('[data-testid="company-name"]')?.textContent?.trim() || '',
      location: jobCard.querySelector('[data-testid="job-location"]')?.textContent?.trim() || '',
      salary: jobCard.querySelector('[data-testid="attribute_snippet_testid"]')?.textContent?.trim() || '',
      description: jobCard.querySelector('[data-testid="job-snippet"]')?.textContent?.trim() || '',
      url: jobCard.querySelector('[data-jk] h2 a')?.href || '',
      platform: 'indeed'
    };
  }

  extractGlassdoorJobData(jobCard) {
    return {
      title: jobCard.querySelector('[data-test="job-title"]')?.textContent?.trim() || '',
      company: jobCard.querySelector('[data-test="employer-name"]')?.textContent?.trim() || '',
      location: jobCard.querySelector('[data-test="job-location"]')?.textContent?.trim() || '',
      salary: jobCard.querySelector('[data-test="detailSalary"]')?.textContent?.trim() || '',
      description: jobCard.querySelector('[data-test="job-description"]')?.textContent?.trim() || '',
      url: jobCard.querySelector('[data-test="job-title"] a')?.href || '',
      platform: 'glassdoor'
    };
  }

  getSearchContainer() {
    if (this.platform === 'indeed') {
      return document.querySelector('#searchform') || document.querySelector('.jobsearch-SerpJobCard');
    } else if (this.platform === 'glassdoor') {
      return document.querySelector('#SearchBar') || document.querySelector('.jobsList');
    }
    return null;
  }

  getJobDetailContainer() {
    if (this.platform === 'indeed') {
      return document.querySelector('.jobsearch-ViewJobLayout-jobDisplay') || 
             document.querySelector('.jobsearch-JobInfoHeader-title-container');
    } else if (this.platform === 'glassdoor') {
      return document.querySelector('.jobHeader') || 
             document.querySelector('[data-test="job-title"]').closest('.css-1j389e');
    }
    return null;
  }

  getJobCards() {
    if (this.platform === 'indeed') {
      return document.querySelectorAll('[data-jk]:not([data-jk=""])');
    } else if (this.platform === 'glassdoor') {
      return document.querySelectorAll('[data-test="job-result"]');
    }
    return [];
  }

  updateMatchIndicator(enhancement, score) {
    const indicator = enhancement.querySelector('.txc-match-indicator');
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

    indicator.setAttribute('data-match', matchLevel);
    indicator.innerHTML = `
      <span class="match-icon">${matchIcon}</span>
      <span class="match-text">${matchText} (${score}%)</span>
    `;
  }

  async performSmartMatching() {
    const response = await chrome.runtime.sendMessage({
      action: 'performSmartJobMatching',
      platform: this.platform,
      url: window.location.href
    });

    if (response.success) {
      this.displayMatchResults(response.data);
      this.showNotification('Smart matching complete!', 'success');
    }
  }

  async analyzeJobFit() {
    const jobData = this.extractCurrentJobData();
    
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeJobFit',
      platform: this.platform,
      jobData: jobData
    });

    if (response.success) {
      this.displayJobAnalysis(response.data);
      this.showNotification('Job analysis complete!', 'success');
    }
  }

  async autoFillApplication() {
    const response = await chrome.runtime.sendMessage({
      action: 'autoFillJobApplication',
      platform: this.platform
    });

    if (response.success) {
      this.fillApplicationForm(response.data);
      this.showNotification('Application auto-filled!', 'success');
      
      await chrome.runtime.sendMessage({
        action: 'earnTokens',
        activity: `${this.platform}_auto_fill`,
        amount: 30
      });
    }
  }

  fillApplicationForm(profileData) {
    // Fill common form fields
    this.fillField('input[name*="firstName"], input[id*="firstName"]', profileData.firstName);
    this.fillField('input[name*="lastName"], input[id*="lastName"]', profileData.lastName);
    this.fillField('input[name*="email"], input[id*="email"]', profileData.email);
    this.fillField('input[name*="phone"], input[id*="phone"]', profileData.phone);
    this.fillField('textarea[name*="cover"], textarea[id*="cover"]', profileData.coverLetter);

    // Platform-specific field filling
    if (this.platform === 'indeed') {
      this.fillIndeedSpecificFields(profileData);
    } else if (this.platform === 'glassdoor') {
      this.fillGlassdoorSpecificFields(profileData);
    }
  }

  fillField(selector, value) {
    const field = document.querySelector(selector);
    if (field && value) {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  isJobSearchPage() {
    const path = window.location.pathname;
    if (this.platform === 'indeed') {
      return path.includes('/jobs') || path.includes('/q-');
    } else if (this.platform === 'glassdoor') {
      return path.includes('/Jobs') || path.includes('/job-listing');
    }
    return false;
  }

  isJobDetailPage() {
    const path = window.location.pathname;
    if (this.platform === 'indeed') {
      return path.includes('/viewjob');
    } else if (this.platform === 'glassdoor') {
      return path.includes('/job-listing/');
    }
    return false;
  }

  observePageChanges() {
    new MutationObserver(() => {
      setTimeout(() => {
        this.enhanceJobListings();
        if (this.isJobDetailPage()) {
          this.addJobDetailEnhancements();
        }
      }, 1000);
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

  displayJobAnalysis(analysis) {
    const insightsContainer = document.querySelector('#jobInsights');
    if (!insightsContainer) return;

    insightsContainer.style.display = 'block';
    insightsContainer.innerHTML = `
      <div class="txc-job-analysis-results">
        <div class="analysis-section">
          <h5>Skills Match</h5>
          <div class="skills-match">
            ${analysis.skillsMatch.map(skill => `
              <span class="skill-tag ${skill.match ? 'match' : 'missing'}">${skill.name}</span>
            `).join('')}
          </div>
        </div>
        <div class="analysis-section">
          <h5>Recommendations</h5>
          <ul class="recommendations">
            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    // Update match score
    const scoreNumber = document.querySelector('#scoreNumber');
    if (scoreNumber) {
      scoreNumber.textContent = analysis.overallScore;
    }
  }
}

// Initialize job boards integration
new JobBoardsIntegration();