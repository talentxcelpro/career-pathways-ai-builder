// TalentXcel Twitter/X Content Script
class TwitterIntegration {
  constructor() {
    this.init();
  }

  async init() {
    console.log('TalentXcel Twitter integration loaded');
    this.setupIntegration();
  }

  setupIntegration() {
    this.addTalentXcelButton();
    this.observePageChanges();
  }

  addTalentXcelButton() {
    const profileHeader = document.querySelector('[data-testid="UserProfileHeader_Items"]');
    if (profileHeader && !profileHeader.querySelector('.txc-twitter-btn')) {
      const button = document.createElement('button');
      button.className = 'txc-twitter-btn';
      button.innerHTML = `
        <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="TalentXcel">
        Sync to TalentXcel
      `;
      button.addEventListener('click', () => this.syncProfile());
      profileHeader.appendChild(button);
    }
  }

  async syncProfile() {
    const profileData = this.extractTwitterProfile();
    await chrome.runtime.sendMessage({
      action: 'syncToTalentXcel',
      profileData: profileData
    });
  }

  extractTwitterProfile() {
    return {
      username: document.querySelector('[data-testid="UserName"] span')?.textContent || '',
      displayName: document.querySelector('[data-testid="UserName"] div span')?.textContent || '',
      bio: document.querySelector('[data-testid="UserDescription"]')?.textContent || '',
      source: 'twitter'
    };
  }

  observePageChanges() {
    new MutationObserver(() => {
      setTimeout(() => this.addTalentXcelButton(), 1000);
    }).observe(document, { subtree: true, childList: true });
  }
}

new TwitterIntegration();