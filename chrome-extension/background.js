// TalentXcel Chrome Extension Background Service Worker
class TalentXcelBackground {
  constructor() {
    this.API_BASE = 'https://dthlgsnakhoftinssokm.supabase.co';
    this.ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
    this.initializeExtension();
  }

  async initializeExtension() {
    // Set up notification handlers
    chrome.notifications.onClicked.addListener((notificationId) => {
      this.handleNotificationClick(notificationId);
    });

    // Set up message handlers
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Set up installation handler
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Set up periodic job checks
    this.setupPeriodicChecks();
  }

  async handleInstallation(details) {
    if (details.reason === 'install') {
      // Open welcome page
      chrome.tabs.create({
        url: 'https://talentxcel.in/extension-welcome'
      });

      // Set default preferences
      await chrome.storage.sync.set({
        'txc_notifications_enabled': true,
        'txc_auto_fill_enabled': true,
        'txc_skill_tracking': true,
        'txc_job_alerts': true,
        'txc_installation_date': new Date().toISOString()
      });
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'authenticate':
          const authResult = await this.authenticateUser(request.credentials);
          sendResponse({ success: true, data: authResult });
          break;

        case 'extractProfile':
          const profileData = await this.extractProfileData(request.site, request.data);
          sendResponse({ success: true, data: profileData });
          break;

        case 'syncToTalentXcel':
          const syncResult = await this.syncProfileToTalentXcel(request.profileData);
          sendResponse({ success: true, data: syncResult });
          break;

        case 'checkJobMatches':
          const matches = await this.checkJobMatches(request.userProfile);
          sendResponse({ success: true, data: matches });
          break;

        case 'trackActivity':
          await this.trackUserActivity(request.activity);
          sendResponse({ success: true });
          break;

        case 'earnTokens':
          const tokens = await this.awardTokens(request.activity, request.amount);
          sendResponse({ success: true, data: tokens });
          break;

        case 'getNotifications':
          const notifications = await this.getNotifications();
          sendResponse({ success: true, data: notifications });
          break;

        case 'getUserProfile':
          const profileResult = await this.callChromeExtensionAPI('getUserProfile');
          sendResponse(profileResult);
          break;

        case 'getTXCBalance':
          const balanceResult = await this.callChromeExtensionAPI('getTXCBalance', { userId: request.userId });
          sendResponse(balanceResult);
          break;

        case 'getProfileCompletion':
          const completionResult = await this.callChromeExtensionAPI('getProfileCompletion', { userId: request.userId });
          sendResponse(completionResult);
          break;

        case 'analyzeJobMatch':
          const matchResult = await this.callChromeExtensionAPI('analyzeJobMatch', request);
          sendResponse(matchResult);
          break;

        case 'analyzeBrand':
          const brandResult = await this.callChromeExtensionAPI('analyzeBrand', request);
          sendResponse(brandResult);
          break;

        case 'generateContentIdeas':
          const contentResult = await this.callChromeExtensionAPI('generateContentIdeas', request);
          sendResponse(contentResult);
          break;

        case 'analyzeNetworkGrowth':
          const networkResult = await this.callChromeExtensionAPI('analyzeNetworkGrowth', request);
          sendResponse(networkResult);
          break;

        case 'performSmartJobMatching':
          const smartMatchResult = await this.callChromeExtensionAPI('performSmartJobMatching', request);
          sendResponse(smartMatchResult);
          break;

        case 'analyzeJobFit':
          const jobFitResult = await this.callChromeExtensionAPI('analyzeJobFit', request);
          sendResponse(jobFitResult);
          break;

        case 'autoFillJobApplication':
          const autoFillResult = await this.callChromeExtensionAPI('autoFillJobApplication', request);
          sendResponse(autoFillResult);
          break;

        case 'generateInviteLink':
          const inviteResult = await this.callChromeExtensionAPI('generateInviteLink', request);
          sendResponse(inviteResult);
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async authenticateUser(credentials) {
    try {
      const response = await fetch(`${this.API_BASE}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.ANON_KEY
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();
      
      if (data.access_token) {
        // Store auth token securely
        await chrome.storage.local.set({
          'txc_auth_token': data.access_token,
          'txc_user': data.user,
          'txc_auth_expires': Date.now() + (data.expires_in * 1000)
        });

        // Set up periodic token refresh
        this.scheduleTokenRefresh(data.expires_in);

        return { authenticated: true, user: data.user };
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async callChromeExtensionAPI(action, payload = {}) {
    try {
      const authData = await chrome.storage.local.get(['txc_auth_token']);
      
      const response = await fetch(`${this.API_BASE}/functions/v1/chrome-extension-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.txc_auth_token}`,
          'apikey': this.ANON_KEY
        },
        body: JSON.stringify({
          action,
          authToken: authData.txc_auth_token,
          ...payload
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Chrome Extension API error:', error);
      return { success: false, error: error.message };
    }
  }

  async extractProfileData(site, rawData) {
    const extractors = {
      linkedin: this.extractLinkedInData,
      naukri: this.extractNaukriData,
      twitter: this.extractTwitterData,
      instagram: this.extractInstagramData
    };

    const extractor = extractors[site];
    if (!extractor) {
      throw new Error(`No extractor for site: ${site}`);
    }

    return extractor.call(this, rawData);
  }

  extractLinkedInData(data) {
    return {
      name: data.name || '',
      title: data.headline || '',
      location: data.location || '',
      summary: data.summary || '',
      experience: data.experience || [],
      education: data.education || [],
      skills: data.skills || [],
      connections: data.connectionCount || 0,
      profileUrl: data.profileUrl || '',
      profileImage: data.profileImage || '',
      source: 'linkedin'
    };
  }

  extractNaukriData(data) {
    return {
      name: data.name || '',
      title: data.designation || '',
      location: data.location || '',
      experience: data.totalExperience || '',
      currentCompany: data.currentCompany || '',
      skills: data.keySkills || [],
      education: data.education || [],
      profileUrl: data.profileUrl || '',
      source: 'naukri'
    };
  }

  extractTwitterData(data) {
    return {
      handle: data.username || '',
      name: data.displayName || '',
      bio: data.bio || '',
      followers: data.followersCount || 0,
      following: data.followingCount || 0,
      location: data.location || '',
      website: data.website || '',
      profileImage: data.profileImage || '',
      source: 'twitter'
    };
  }

  extractInstagramData(data) {
    return {
      handle: data.username || '',
      name: data.fullName || '',
      bio: data.biography || '',
      followers: data.followersCount || 0,
      following: data.followingCount || 0,
      posts: data.postsCount || 0,
      profileImage: data.profilePicture || '',
      source: 'instagram'
    };
  }

  async syncProfileToTalentXcel(profileData) {
    const authData = await chrome.storage.local.get(['txc_auth_token', 'txc_user']);
    
    if (!authData.txc_auth_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.API_BASE}/rest/v1/profile_sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.txc_auth_token}`,
        'apikey': this.ANON_KEY
      },
      body: JSON.stringify({
        user_id: authData.txc_user.id,
        profile_data: profileData,
        sync_timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to sync profile');
    }

    // Award tokens for profile sync
    await this.awardTokens('profile_sync', 50);

    return await response.json();
  }

  async checkJobMatches(userProfile) {
    const authData = await chrome.storage.local.get(['txc_auth_token']);
    
    if (!authData.txc_auth_token) {
      return [];
    }

    const response = await fetch(`${this.API_BASE}/rest/v1/rpc/get_ai_job_matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.txc_auth_token}`,
        'apikey': this.ANON_KEY
      },
      body: JSON.stringify({
        user_profile: userProfile,
        limit: 10
      })
    });

    if (response.ok) {
      const matches = await response.json();
      
      // Show notification if new matches found
      if (matches.length > 0) {
        this.showJobMatchNotification(matches.length);
      }
      
      return matches;
    }

    return [];
  }

  async awardTokens(activity, amount) {
    const authData = await chrome.storage.local.get(['txc_auth_token', 'txc_user']);
    
    if (!authData.txc_auth_token) {
      return null;
    }

    try {
      const response = await fetch(`${this.API_BASE}/rest/v1/txc_transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.txc_auth_token}`,
          'apikey': this.ANON_KEY
        },
        body: JSON.stringify({
          user_id: authData.txc_user.id,
          transaction_type: 'earn',
          amount: amount,
          description: `Extension activity: ${activity}`,
          source: 'chrome_extension'
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show token earning notification
        this.showTokenEarnedNotification(amount, activity);
        
        return result;
      }
    } catch (error) {
      console.error('Token award error:', error);
    }

    return null;
  }

  async trackUserActivity(activity) {
    const authData = await chrome.storage.local.get(['txc_auth_token', 'txc_user']);
    
    if (!authData.txc_auth_token) {
      return;
    }

    try {
      await fetch(`${this.API_BASE}/rest/v1/user_activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.txc_auth_token}`,
          'apikey': this.ANON_KEY
        },
        body: JSON.stringify({
          user_id: authData.txc_user.id,
          activity_type: activity.type,
          activity_data: activity.data,
          source: 'chrome_extension',
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Activity tracking error:', error);
    }
  }

  async showJobMatchNotification(matchCount) {
    const settings = await chrome.storage.sync.get(['txc_notifications_enabled']);
    
    if (!settings.txc_notifications_enabled) {
      return;
    }

    chrome.notifications.create('job_matches', {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'New Job Matches Found!',
      message: `${matchCount} new job${matchCount > 1 ? 's' : ''} match your profile. Click to view.`
    });
  }

  async showTokenEarnedNotification(amount, activity) {
    chrome.notifications.create('tokens_earned', {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'TXC Tokens Earned!',
      message: `You earned ${amount} TXC tokens for ${activity}. Keep it up!`
    });
  }

  handleNotificationClick(notificationId) {
    if (notificationId === 'job_matches') {
      chrome.tabs.create({ url: 'https://talentxcel.in/jobs/matches' });
    } else if (notificationId === 'tokens_earned') {
      chrome.tabs.create({ url: 'https://talentxcel.in/wallet' });
    }
    
    chrome.notifications.clear(notificationId);
  }

  setupPeriodicChecks() {
    // Check for new job matches every 30 minutes
    chrome.alarms.create('checkJobMatches', { periodInMinutes: 30 });
    
    chrome.alarms.onAlarm.addListener(async (alarm) => {
      if (alarm.name === 'checkJobMatches') {
        try {
          const authData = await chrome.storage.local.get(['txc_user']);
          if (authData.txc_user) {
            await this.checkJobMatches(authData.txc_user);
          }
        } catch (error) {
          console.error('Periodic job check error:', error);
        }
      }
    });
  }

  scheduleTokenRefresh(expiresIn) {
    // Refresh token 5 minutes before expiry
    const refreshTime = (expiresIn - 300) * 1000;
    
    setTimeout(async () => {
      try {
        await this.refreshAuthToken();
      } catch (error) {
        console.error('Token refresh error:', error);
      }
    }, refreshTime);
  }

  async refreshAuthToken() {
    const authData = await chrome.storage.local.get(['txc_auth_token']);
    
    if (!authData.txc_auth_token) {
      return;
    }

    try {
      const response = await fetch(`${this.API_BASE}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.txc_auth_token}`,
          'apikey': this.ANON_KEY
        }
      });

      const data = await response.json();
      
      if (data.access_token) {
        await chrome.storage.local.set({
          'txc_auth_token': data.access_token,
          'txc_auth_expires': Date.now() + (data.expires_in * 1000)
        });

        this.scheduleTokenRefresh(data.expires_in);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid token
      await chrome.storage.local.remove(['txc_auth_token', 'txc_user', 'txc_auth_expires']);
    }
  }

  async getNotifications() {
    const authData = await chrome.storage.local.get(['txc_auth_token']);
    
    if (!authData.txc_auth_token) {
      return [];
    }

    try {
      const response = await fetch(`${this.API_BASE}/rest/v1/notifications?is_read=eq.false&order=created_at.desc&limit=10`, {
        headers: {
          'Authorization': `Bearer ${authData.txc_auth_token}`,
          'apikey': this.ANON_KEY
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }

    return [];
  }
}

// Initialize background service
new TalentXcelBackground();