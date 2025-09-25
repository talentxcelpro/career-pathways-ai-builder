// TalentXcel Naukri.com Content Script
class NaukriIntegration {
  constructor() {
    this.init();
  }

  init() {
    console.log('TalentXcel: Naukri integration starting...');
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
      source: 'naukri',
      name: this.extractText('.fullname') || '',
      title: this.extractText('.designation') || '',
      location: this.extractText('.location') || '',
      experience: this.extractText('.exp') || '',
      skills: [],
      education: []
    };
  }

  extractText(selector) {
    const element = document.querySelector(selector);
    return element ? element.textContent.trim() : '';
  }

  enhanceJobListings() {
    const jobCards = document.querySelectorAll('.jobTuple, .job-result');
    jobCards.forEach(card => this.enhanceJobCard(card));
  }

  enhanceJobCard(card) {
    if (card.querySelector('.txc-job-match-indicator')) return;

    const indicator = document.createElement('div');
    indicator.className = 'txc-job-match-indicator';
    indicator.innerHTML = '82%';
    indicator.title = 'TalentXcel Job Match Score';
    
    card.style.position = 'relative';
    card.appendChild(indicator);
  }
}

new NaukriIntegration();