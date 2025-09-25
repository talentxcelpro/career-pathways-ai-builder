class LinkedInIntegration {
  constructor() {
    this.init();
  }

  init() {
    console.log('TalentXcel: LinkedIn integration starting...');
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
        case 'extractProfile':
          const profileData = await this.extractProfileData();
          sendResponse({ success: true, data: profileData });
          break;
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  async extractProfileData() {
    return {
      source: 'linkedin',
      name: document.querySelector('h1')?.textContent?.trim() || '',
      headline: document.querySelector('.text-body-medium')?.textContent?.trim() || '',
      location: document.querySelector('.text-body-small')?.textContent?.trim() || '',
      skills: [],
      experience: [],
      education: []
    };
  }

  enhanceJobListings() {
    const jobCards = document.querySelectorAll('.job-card-container, .jobs-search-results__list-item');
    jobCards.forEach(card => this.enhanceJobCard(card));
  }

  enhanceJobCard(card) {
    if (card.querySelector('.txc-job-match-indicator')) return;

    const indicator = document.createElement('div');
    indicator.className = 'txc-job-match-indicator';
    indicator.innerHTML = '85%';
    indicator.title = 'TalentXcel Job Match Score';
    
    card.style.position = 'relative';
    card.appendChild(indicator);
  }
}

new LinkedInIntegration();