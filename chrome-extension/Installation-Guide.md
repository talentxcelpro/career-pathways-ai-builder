# TalentXcel Chrome Extension - Installation Guide

## How to Install and Test the Extension

### Option 1: Install from Chrome Web Store (Production)
*Once published, the extension will be available at:*
- Visit Chrome Web Store
- Search for "TalentXcel"
- Click "Add to Chrome"

### Option 2: Developer Installation (Current)

1. **Download the Extension Files**
   - Ensure all files are in a `chrome-extension` folder
   - Verify manifest.json is present

2. **Enable Developer Mode**
   - Open Chrome browser
   - Go to `chrome://extensions/`
   - Toggle "Developer mode" ON (top right)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `chrome-extension` folder
   - Extension should appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "TalentXcel" and click the pin icon
   - Extension icon will appear in toolbar

## Where to See the Extension in Action

### 1. Extension Popup (Main Interface)
- **Access**: Click the TalentXcel icon in Chrome toolbar
- **Features**:
  - Login/Authentication
  - TXC token balance
  - Profile sync controls
  - Quick actions menu
  - Site-specific features

### 2. LinkedIn Integration
- **Visit**: linkedin.com/feed or any LinkedIn profile
- **Features**:
  - Profile sync notifications
  - Job match scoring overlay
  - Skill enhancement suggestions
  - Auto-apply assistance

### 3. Naukri.com Integration
- **Visit**: naukri.com
- **Features**:
  - Profile optimization panel
  - Job matching scores
  - Application tracking

### 4. Job Board Integration
- **Visit**: indeed.com or glassdoor.com
- **Features**:
  - Job match scoring
  - Skill gap analysis
  - Application assistance

### 5. Social Media Integration
- **Visit**: twitter.com/x.com or instagram.com
- **Features**:
  - Professional brand analysis
  - Content optimization suggestions
  - Network building insights

### 6. Settings & Configuration
- **Access**: Right-click extension icon → "Options"
- **Features**:
  - Account preferences
  - Notification settings
  - Privacy controls
  - Sync preferences

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Authentication flow works
- [ ] LinkedIn profile sync activates
- [ ] Job boards show match scores
- [ ] Social media analysis appears
- [ ] Settings page accessible
- [ ] Token balance updates
- [ ] Notifications display properly

## Troubleshooting

### Extension Not Loading
1. Check all files are in correct structure
2. Verify manifest.json syntax
3. Reload extension in chrome://extensions

### Features Not Working
1. Check console for errors (F12)
2. Ensure proper website permissions
3. Verify API connectivity
4. Clear extension storage and re-login

### Performance Issues
1. Check for memory leaks in background script
2. Disable other extensions temporarily
3. Update Chrome to latest version

## Support
For issues or questions, contact the TalentXcel development team.