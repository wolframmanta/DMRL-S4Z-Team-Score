# Getting Started - DMRL Team Live Scores (TLS)

This guide helps you develop and test the DMRL Team Live Scores mod.

---

## Prerequisites

### Software
- Sauce for Zwift (latest)
- VS Code or another editor
- Git
- Chromium-based browser (for DevTools)

### Knowledge
- JavaScript (ES modules / async/await)
- HTML5 & CSS3
- REST APIs
- DOM manipulation

---

## Project Setup

```bash
# Navigate to Sauce mods directory
cd ~/Documents/SauceMods/

# Project lives here
cd DMRL-team-live-scores/

# Optional: verify structure
ls -la
```

Notes:
- No build step — Sauce loads directly from this folder
- Use .mjs ES modules and Sauce common: `import * as common from '/pages/src/common.mjs'`
- Titlebar is always visible; click the gear icon for settings

---

## Current Prototype Behavior

- Race selection: Not required — server auto-detects the current live race
- Category filter: A/B/C/D/E or All Categories
- Authentication: Settings → Access Password (sent as `X-TLS-Access-Token`)
- Display: Font scale, line spacing, solid background, background color
- Refresh: Fixed 30-second auto-refresh

---

## File Structure

```
DMRL-team-live-scores/
├── manifest.json
├── README.md
├── CHANGELOG.md
├── GETTING_STARTED.md
├── ARCHITECTURE.md
├── QUICK_REFERENCE.md
├── pages/
│   ├── css/
│   │   └── common.css
│   ├── images/
│   ├── src/
│   │   ├── team-live-scores.mjs
│   │   └── team-live-scores-settings.mjs
│   ├── team-live-scores.html
│   └── team-live-scores-settings.html
└── dist/
```

---

## Testing Checklist (Prototype)

- [ ] API calls succeed with valid password
- [ ] 401 handled (invalid password)
- [ ] 429 handled (rate limiting)
- [ ] Settings persist (password, display, category)
- [ ] Test Connection works
- [ ] Category switching re-renders from cached data
- [ ] Status text transitions: Initializing → Fetching → Ready

---

## Data Model (Server Response)

- All Categories: `combined[]` entries with `league_points` (Stage Points Earned) and `raw_points`
- Category view: `categories[].teams[]` entries with `total_points` and `riders[]`

---

## API Testing

```bash
BASE=https://dirtymittenracing.com
TOKEN=your-password-here

# Races (public)
curl "$BASE/wp-json/s4z-tls/v1/races"

# Current live standings (auth)
curl -H "X-TLS-Access-Token: $TOKEN" \
     "$BASE/wp-json/s4z-tls/v1/team-standings"

# Rate limiting (expect 429 during rapid calls)
for i in {1..5}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
       -H "X-TLS-Access-Token: $TOKEN" \
       "$BASE/wp-json/s4z-tls/v1/team-standings"
  sleep 5
done
```

---

## Browser Console Quick Checks

```javascript
// Verify stored preferences
localStorage.getItem('tls_access_password')
localStorage.getItem('tls_selected_category')

// Check status text
document.getElementById('statusText').textContent
```

---

## Packaging (Release ZIP)

```bash
cd DMRL-team-live-scores
rm -rf dist && mkdir -p dist/dmrl-team-live-scores
cp -r pages dist/dmrl-team-live-scores/
cp manifest.json dist/dmrl-team-live-scores/
cp README.md CHANGELOG.md dist/dmrl-team-live-scores/
cd dist && zip -r dmrl-team-live-scores-v0.1.0-prototype.zip dmrl-team-live-scores/
```

---

## Planned Next

- Stage Totals window (combined standings)
- Additional polish and features

---

Document Version: 1.1  
Last Updated: October 23, 2025  
Author: the.Colonel
# Getting Started - DMRL Team Live Scores Development

This guide will help you get started developing the DMRL Team Live Scores mod.

---

## Prerequisites

### Required Software
- **Sauce for Zwift** - Latest stable version
- **Text Editor/IDE** - VS Code, Sublime, or similar
- **Git** - For version control
- **Web Browser** - For testing (Chromium-based)

### Required Knowledge
- JavaScript (ES6+)
- HTML5 & CSS3
- REST APIs
- Async/await patterns
- DOM manipulation

### Recommended Knowledge
- Sauce for Zwift API
- WordPress REST API
- Electron basics

---

## Development Environment Setup

### 1. Clone/Setup Project

```bash
# Navigate to Sauce mods directory
cd ~/Documents/SauceMods/

# Project should already exist at:
cd DMRL-team-live-scores/

# Verify structure
ls -la
```

### 2. Understand Existing Infrastructure

Before starting development, familiarize yourself with:

**Master of Zen (MoZ)**
- Location: `~/Documents/SauceMods/DMRL-Master-of-Zen/`
- Study: `manifest.json`, `pages/points-leaderboard.html`
- Key patterns: Settings persistence, Sauce API usage

**S4Z-live WordPress Plugin**
- Location: `~/Documents/s4z-live/`
- Study: `modules/team-scoring/includes/rest.php`
- Key endpoints: `/wp-json/s4z-team/v1/*`

### 3. Install Development Tools

```bash
# Optional: Install http-server for local testing
npm install -g http-server

# Optional: Install browser-sync for live reload
npm install -g browser-sync
```

---

## Project Structure Overview

```
DMRL-team-live-scores/
├── manifest.json              # Sauce mod configuration ✓
├── README.md                  # User documentation ✓
├── ARCHITECTURE.md            # Technical design ✓
├── ROADMAP.md                 # Development plan ✓
├── QUICK_REFERENCE.md         # Quick lookup ✓
├── DIAGRAMS.md                # System diagrams ✓
├── GETTING_STARTED.md         # This file ✓
├── CHANGELOG.md               # Version history ✓
├── LICENSE                    # License file (TODO)
│
├── pages/                     # Web content root
│   ├── images/               # Assets
│   │   ├── icon128.png       # (TODO: Copy from MoZ)
│   │   └── favicon.png       # (TODO: Copy from MoZ)
│   │
│   ├── css/                  # Stylesheets
│   │   ├── common.css        # (TODO: Copy from MoZ)
│   │   ├── team-live-scores.css  # (TODO: Create)
│   │   └── stage-totals.css      # (TODO: Create)
│   │
│   ├── src/                  # JavaScript modules
│   │   ├── preloads.js           # (TODO: Copy from MoZ)
│   │   ├── api-client.js         # (TODO: Implement)
│   │   ├── config-manager.js     # (TODO: Implement)
│   │   ├── race-selector.js      # (TODO: Implement)
│   │   ├── category-selector.js  # (TODO: Implement)
│   │   ├── team-renderer.js      # (TODO: Implement)
│   │   ├── stage-renderer.js     # (TODO: Implement)
│   │   └── auto-refresh.js       # (TODO: Implement)
│   │
│   ├── team-live-scores.html           # (TODO: Create)
│   ├── team-live-scores-settings.html  # (TODO: Create)
│   ├── stage-totals.html               # (TODO: Create)
│   └── stage-totals-settings.html      # (TODO: Create)
│
└── release-notes/
    └── 0.1.0-beta.md         # (TODO: Create)
```

---

## Development Phases

### Phase 1: Core Infrastructure (Current)
**Goal**: Set up project scaffolding and copy base assets

#### Tasks
1. **Copy Common Assets from MoZ**
   ```bash
   # From MoZ to TLS
   cp ../DMRL-Master-of-Zen/pages/images/icon128.png pages/images/
   cp ../DMRL-Master-of-Zen/pages/images/favicon.png pages/images/
   cp ../DMRL-Master-of-Zen/pages/css/common.css pages/css/
   cp ../DMRL-Master-of-Zen/pages/src/preloads.js pages/src/
   ```

2. **Create Base HTML Templates**
   - Start with `team-live-scores.html`
   - Use MoZ's `points-leaderboard.html` as reference
   - Include: title bar, controls, content area, status bar

3. **Create Base CSS**
   - `team-live-scores.css` - Main window styles
   - Use MoZ's `points-leaderboard.css` as reference
   - Dark theme, overlay-friendly

4. **Test Window Loading**
   ```bash
   # Symlink to Sauce mods directory
   ln -s ~/Documents/SauceMods/DMRL-team-live-scores \
         ~/.config/Sauce4Zwift/mods/DMRL-team-live-scores
   
   # Restart Sauce
   # Open mod from Sauce menu
   ```

### Testing Phase 2
- [ ] API calls succeed with valid password
- [ ] 401 errors handled correctly (invalid password)
- [ ] 429 errors handled correctly (rate limiting)
- [ ] Settings persist across sessions
- [ ] Access token stored securely
- [ ] Test Connection button works
- [ ] Error messages display correctly
- [ ] WordPress URL validation works
- [ ] No memory leaks in API client
- [ ] Request coordinator shares data between windows

### Phase 3: Live Scores Window
**Goal**: Implement category-based team standings display

#### Tasks
1. **Race Selector**
   - Fetch races from API
   - Populate dropdown
   - Handle selection changes

2. **Category Selector**
   - Extract categories from standings
   - Filter teams by category
   - Update on race change

3. **Team Renderer**
   - Create standings table
   - Display rank, team, points
   - Add expand/collapse for riders

4. **Auto-Refresh**
   - Set up 30-second polling timer (fixed)
   - Integrate with request coordinator
   - Status indicators (respects 60s stale threshold)
   - No user controls (always active)

### Phase 4: Stage Totals Window
**Goal**: Implement combined standings view

#### Tasks
1. **Stage Renderer**
   - Combined standings table
   - League points display
   - Category breakdown

2. **Integration**
   - Race selector
   - Auto-refresh
   - Settings

---

## Testing Strategy

### Local Testing
```bash
# 1. Start with WordPress test site
# Ensure S4Z-live plugin is active

# 2. Configure TLS mod
# Open settings, enter WordPress URL

# 3. Test race selection
# Verify dropdown populates

# 4. Test category filtering
# Switch between categories

# 5. Test auto-refresh
# Enable/disable, change intervals
```

### API Testing
```bash
# Test endpoints directly with curl (use your actual password)

# Get races (with authentication)
curl -H "X-TLS-Access-Token: your-password-here" \
     https://your-site.com/wp-json/s4z-team/v1/races

# Get standings (with authentication)
curl -H "X-TLS-Access-Token: your-password-here" \
     'https://your-site.com/wp-json/s4z-team/v1/team-standings?event_id=123&nocache=true'

# Test invalid password (should return 401)
curl -H "X-TLS-Access-Token: wrong-password" \
     https://your-site.com/wp-json/s4z-team/v1/races

# Test rate limiting (rapid requests should return 429)
for i in {1..5}; do
  curl -H "X-TLS-Access-Token: your-password-here" \
       'https://your-site.com/wp-json/s4z-team/v1/team-standings?event_id=123&nocache=true'
  sleep 5
done

# Verify CORS with custom header
curl -H "Origin: http://localhost" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-TLS-Access-Token" \
     -X OPTIONS \
     https://your-site.com/wp-json/s4z-team/v1/races
```

### Browser Console Testing
```javascript
// Open browser DevTools (F12)
// Test API client
const client = new TLSApiClient('https://your-site.com');
const standings = await client.fetchTeamStandings(123);
console.log(standings);

// Test config manager
const config = new ConfigManager();
await config.save('test', {race_id: 123});
const loaded = await config.load('test');
console.log(loaded);
```

---

## Common Development Patterns

### Pattern 1: Async Data Fetching
```javascript
async function loadAndRenderStandings() {
  try {
    showLoading();
    const standings = await apiClient.fetchTeamStandings(eventId);
    renderer.render(standings);
    hideLoading();
  } catch (error) {
    showError(error.message);
  }
}
```

### Pattern 2: Settings Persistence
```javascript
async function saveSettings() {
  const settings = {
    race_id: parseInt(raceSelect.value),
    category_id: categorySelect.value,
    auto_refresh: autoRefreshCheckbox.checked,
    refresh_interval: parseInt(intervalSelect.value)
  };
  await configManager.save(windowId, settings);
}
```

### Pattern 3: Auto-Refresh with Request Coordinator
```javascript
class AutoRefresh {
  constructor(callback) {
    this.callback = callback;
    this.interval = 30000; // Fixed 30 seconds
    this.timerId = null;
  }
  
  start() {
    if (this.timerId) return;
    
    // Use request coordinator for shared fetch
    const coordinator = RequestCoordinator.getInstance();
    
    const wrappedCallback = async () => {
      try {
        const data = await coordinator.fetchIfNeeded(apiClient, eventId);
        this.callback(data);
      } catch (error) {
        if (error.message === 'AUTH_REQUIRED') {
          this.stop();
          showAuthError(); // Prompt user to update password
        } else if (error.message === 'RATE_LIMITED') {
          // Will retry on next interval
          showRateLimitWarning();
        }
      }
    };
    
    wrappedCallback(); // Immediate first call
    this.timerId = setInterval(wrappedCallback, this.interval);
  }
  
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
```

### Pattern 4: DOM Updates
```javascript
function updateTeamRow(teamId, newData) {
  const row = document.querySelector(`tr[data-team-id="${teamId}"]`);
  if (!row) return;
  
  // Update only changed elements
  const pointsCell = row.querySelector('.points');
  if (pointsCell.textContent !== newData.points.toString()) {
    pointsCell.textContent = newData.points;
    pointsCell.classList.add('updated');
    setTimeout(() => pointsCell.classList.remove('updated'), 1000);
  }
}
```

---

## Debugging Tips

### Enable Sauce Debug Mode
```javascript
// In browser console
sauce.options.debug = true;
sauce.storage.get('tls_window_1').then(console.log);
```

### Check API Responses
```javascript
// Log all fetch responses
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  console.log('Fetch:', args[0], response.status);
  return response;
};
```

### Monitor Auto-Refresh
```javascript
// Add logging to refresh callback
autoRefresh.callback = async () => {
  console.log('[TLS] Auto-refresh triggered at', new Date());
  await loadAndRenderStandings();
};
```

### Inspect Storage
```javascript
// List all TLS settings
sauce.storage.keys().then(keys => {
  const tlsKeys = keys.filter(k => k.startsWith('tls_'));
  return Promise.all(tlsKeys.map(k => sauce.storage.get(k)));
}).then(console.log);
```

---

## Code Style Guidelines

### JavaScript
- Use ES6+ features (const, let, arrow functions)
- Prefer async/await over promises
- Use descriptive variable names
- Comment complex logic
- Handle errors gracefully

### HTML
- Semantic markup
- Accessible (ARIA labels)
- Consistent indentation (2 spaces)
- Class names: kebab-case

### CSS
- Mobile-first approach
- Use CSS variables for colors
- Consistent spacing
- Comment sections

---

## Resources

### Documentation
- [Sauce for Zwift Docs](https://www.sauce.llc/products/sauce4zwift)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Reference Projects
- **Master of Zen**: `~/Documents/SauceMods/DMRL-Master-of-Zen/`
- **S4Z-live Plugin**: `~/Documents/s4z-live/`

### Internal Docs
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [ROADMAP.md](./ROADMAP.md) - Development plan
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - API reference
- [DIAGRAMS.md](./DIAGRAMS.md) - Visual diagrams

---

## Next Steps

1. ✓ **Review Architecture** - Read ARCHITECTURE.md thoroughly
2. ✓ **Understand Data Flow** - Study DIAGRAMS.md
3. ✓ **Check Roadmap** - Review ROADMAP.md phases
4. **Start Phase 1** - Copy base assets, create HTML templates
5. **Test Window Loading** - Verify Sauce loads the mod
6. **Begin Phase 2** - Implement API client
7. **Iterate** - Build, test, refine

---

## Getting Help

- **Questions**: Contact the.Colonel
- **Issues**: Check browser console for errors
- **Reference**: Look at MoZ implementation
- **Testing**: Use live WordPress site with S4Z-live

---

**Happy Coding! 🚴‍♂️**

---

**Document Version**: 1.0  
**Last Updated**: October 23, 2025  
**Author**: the.Colonel
