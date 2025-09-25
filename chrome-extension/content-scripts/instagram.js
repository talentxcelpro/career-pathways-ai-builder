// TalentXcel Instagram Content Script
class InstagramIntegration {
  constructor() {
    this.init();
  }

  init() {
    console.log('TalentXcel: Instagram integration starting...');
    this.setupMessageListener();
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
      source: 'instagram',
      handle: this.extractHandle(),
      displayName: this.extractText('h2') || '',
      bio: this.extractBio(),
      followers: 0,
      following: 0,
      posts: 0
    };
  }

  extractHandle() {
    const url = window.location.pathname;
    const match = url.match(/^\/([^\/]+)/);
    return match ? match[1] : '';
  }

  extractText(selector) {
    const element = document.querySelector(selector);
    return element ? element.textContent.trim() : '';
  }

  extractBio() {
    const bioElement = document.querySelector('h1 + div + div');
    return bioElement ? bioElement.textContent.trim() : '';
  }
}

new InstagramIntegration();