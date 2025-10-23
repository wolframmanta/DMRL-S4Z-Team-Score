# DMRL's Team Live Scores - Quick Reference

## Quick Start

1. **Install**: Extract to Sauce mods directory
2. **Configure**: Open settings → Enter WordPress URL
3. **Enter Password**: Enter access password (contact DMRL admin)
4. **Select Race**: Choose race from dropdown
5. **Pick Category**: Select category to display
6. **Auto-Refresh**: Automatically updates every 30 seconds

---

## Window Types

### Team Live Scores
**Purpose**: Single category live standings  
**Size**: 350×600px  
**Key Features**:
- Category-specific view
- Expandable rider details
- Auto-refresh
- Multiple instances allowed

### Stage Totals
**Purpose**: Combined multi-category standings  
**Size**: 450×600px  
**Key Features**:
- League points totals
- Category breakdown
- Overall rankings
- Auto-refresh

---

## Key Shortcuts

| Action | Method |
|--------|--------|
| Open Settings | Click ⚙️ icon |
| Refresh Data | Click ↻ button |
| Expand Team | Click team row |
| Change Category | Use category dropdown |
| Toggle Auto-Refresh | Use checkbox in controls |

---

## API Endpoints Reference

```
WordPress Base URL: https://your-site.com

Team Standings by Event ID:
GET /wp-json/s4z-team/v1/team-standings?event_id={eventId}&nocache=true

Team Standings by Race ID:
GET /wp-json/s4z-team/v1/races/{raceId}/team-standings?nocache=true

Available Races:
GET /wp-json/s4z-team/v1/races

Team Map (Roster):
GET /wp-json/s4z-team/v1/team-map?event_id={eventId}&nocache=true
```

---

## Settings Storage Keys

```javascript
// Global settings
"tls_wordpress_url"           // WordPress site URL
"tls_access_token"            // Access password (stored securely)
"tls_refresh_interval"        // Fixed at 30 seconds

// Shared request coordinator
"tls_shared_buffer": {
  "last_fetch_time": 1729701232000,
  "cached_data": {},
  "active_windows": ["window_1", "window_2"]
}

// Per-window settings (replace {windowId} with actual ID)
"tls_window_{windowId}": {
  "race_id": 123,              // Selected race
  "event_id": 456,             // Zwift event ID
  "category_id": "A",          // Selected category
  "auto_refresh": true,        // Auto-refresh enabled
  "expanded_teams": [1, 3, 5]  // Expanded team IDs
}
```

---

## Data Structure Reference

### Team Standings Response
```json
{
  "race": {
    "id": 123,
    "name": "Race Name",
    "zwift_event_id": 456
  },
  "categories": [
    {
      "id": "A",
      "label": "A",
      "teams": [
        {
          "rank": 1,
          "team_id": 1,
          "team_name": "Team Alpha",
          "team_color": "#FF0000",
          "total_points": 150.5,
          "riders": [...]
        }
      ]
    }
  ],
  "combined": [
    {
      "rank": 1,
      "team_id": 1,
      "team_name": "Team Alpha",
      "league_points": 24,
      "category_points": {"A": 8, "B": 8, "C": 8}
    }
  ]
}
```

---

## Status Indicators

| Status | Meaning | Color |
|--------|---------|-------|
| **Live** | Data is fresh | 🟢 Green |
| **Stale** | Data is old (>2× interval) | 🟡 Yellow |
| **Error** | Connection/API error | 🔴 Red |
| **Loading** | Fetching data | ⏳ Spinner |

---

## Common Issues & Fixes

### No Data Displaying
✓ Check WordPress URL in settings  
✓ **Verify access password is correct**  
✓ Verify S4Z-live plugin is active  
✓ Ensure race is selected  
✓ Confirm MoZ is sending data

### Access Denied / 401 Error
✓ **Access password may have changed**  
✓ Click "Update Settings" button in error message  
✓ Contact DMRL Jedi for current password  
✓ Re-enter password in settings window  

### Stale Data Warning
✓ Enable auto-refresh  
✓ Check network connection  
✓ Verify WordPress is responding  
✓ Try manual refresh (↻)  

### Categories Not Listed
✓ Wait for race to start  
✓ Verify riders have scores  
✓ Check MoZ is running  
✓ Confirm race configuration  

### Connection Errors
✓ Test WordPress URL in browser  
✓ Check CORS configuration  
✓ Verify network connectivity  
✓ Review browser console errors  

---

## Refresh Interval

**Fixed Interval**: 30 seconds (not user-configurable)

**Rationale**: With 50-100 concurrent clients, a fixed 30-second interval prevents server overload while still providing near-real-time updates. All open windows share a single fetch operation to minimize server load.

---

## File Structure Quick Map

```
DMRL-team-live-scores/
├── manifest.json                  # Mod configuration
├── README.md                      # User documentation
├── ARCHITECTURE.md                # Technical architecture
├── ROADMAP.md                     # Development plan
├── CHANGELOG.md                   # Version history
├── pages/
│   ├── images/
│   │   ├── icon128.png           # Mod icon
│   │   └── favicon.png           # Favicon
│   ├── css/
│   │   ├── common.css            # Shared styles
│   │   ├── team-live-scores.css  # Live scores styles
│   │   └── stage-totals.css      # Stage totals styles
│   ├── src/
│   │   ├── preloads.js           # Sauce initialization
│   │   ├── api-client.js         # WordPress API client
│   │   ├── config-manager.js     # Settings management
│   │   ├── race-selector.js      # Race dropdown
│   │   ├── category-selector.js  # Category dropdown
│   │   ├── team-renderer.js      # Team standings renderer
│   │   ├── stage-renderer.js     # Stage totals renderer
│   │   └── auto-refresh.js       # Polling mechanism
│   ├── team-live-scores.html             # Main window
│   ├── team-live-scores-settings.html    # Settings
│   ├── stage-totals.html                 # Stage window
│   └── stage-totals-settings.html        # Stage settings
└── release-notes/
    └── 0.1.0-beta.md             # Release notes
```

---

## Module Responsibilities

| Module | Purpose |
|--------|---------|
| **api-client.js** | Fetch data from WordPress |
| **config-manager.js** | Save/load settings |
| **race-selector.js** | Race dropdown management |
| **category-selector.js** | Category filtering |
| **team-renderer.js** | Display team standings |
| **stage-renderer.js** | Display stage totals |
| **auto-refresh.js** | Polling timer management |

---

## Development Commands

```bash
# Copy to Sauce mods directory
cp -r DMRL-team-live-scores ~/.config/Sauce4Zwift/mods/

# Watch for changes (requires file watcher)
fswatch -o pages/ | xargs -n1 -I{} cp -r pages/* ~/.config/Sauce4Zwift/mods/DMRL-team-live-scores/pages/

# Reload Sauce (restart required for manifest changes)
# Use Sauce menu → Developer → Reload
```

---

## Testing Checklist

### Unit Testing
- [ ] API client handles errors
- [ ] Config manager persists data
- [ ] Renderers update correctly
- [ ] Auto-refresh starts/stops

### Integration Testing
- [ ] Full data flow from API to display
- [ ] Settings saved across sessions
- [ ] Multiple windows work independently
- [ ] Error recovery works

### User Testing
- [ ] Race selection intuitive
- [ ] Category switching responsive
- [ ] Auto-refresh reliable
- [ ] Error messages clear

---

## Support Resources

- **Documentation**: README.md, ARCHITECTURE.md
- **Issues**: Contact the.Colonel
- **DMRL Site**: https://dirtymittenracing.com
- **Sauce Docs**: https://www.sauce.llc/products/sauce4zwift

---

## Version Compatibility Matrix

| Component | Minimum Version | Recommended |
|-----------|----------------|-------------|
| Sauce for Zwift | Latest stable | Latest |
| S4Z-live Plugin | v0.7.6-beta | Latest |
| Master of Zen | v0.3.8 | Latest |
| WordPress | 5.0+ | Latest |

---

**Last Updated**: October 23, 2025  
**Document Version**: 1.0
