// TalentXcel Job Boards Content Script
class JobBoardIntegration {
  constructor() {
    this.currentSite = this.detectSite();
    this.init();
  }

  detectSite() {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.includes('indeed.com')) return 'indeed';
    if (hostname.includes('glassdoor.com')) return 'glassdoor';
    return 'generic';
  }

  init() {
    console.log(`TalentXcel: ${this.currentSite} integration starting...`);
    this.setupMessageListener();
    this.enhanceJobListings();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'analyzeCurrentJob':
          await this.analyzeCurrentJob();
          sendResponse({ success: true });
          break;
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  enhanceJobListings() {
    const jobCards = document.querySelectorAll('.jobsearch-SerpJobCard, .react-job-listing');
    jobCards.forEach(card => this.enhanceJobCard(card));
  }

  enhanceJobCard(card) {
    if (card.querySelector('.txc-job-match-indicator')) return;

    const indicator = document.createElement('div');
    indicator.className = 'txc-job-match-indicator';
    indicator.innerHTML = '88%';
    indicator.title = 'TalentXcel Job Match Score';
    
    card.style.position = 'relative';
    card.appendChild(indicator);
  }

  async analyzeCurrentJob() {
    // Analyze current job page
  }
}

new JobBoardIntegration();
