# DMRL's Team Live Scores (TLS) - Architecture Document

## Overview

**DMRL's Team Live Scores** is a Sauce for Zwift mod that displays real-time team standings during races. It completes the scoring chain:
1. **Master of Zen (MoZ)** - Calculates individual racer scores and sends to WordPress
2. **S4Z-live** - WordPress plugin that ingests scores, displays them, and calculates team scores
3. **Team Live Scores (TLS)** - Reads live team scores from WordPress and displays them in dedicated windows

## Design Principles

- **Read-Only**: No data modification, only display
- **Live Updates**: Polling-based refresh of team standings
- **Category-Based**: Separate views per category (A, B, C, D, E, etc.)
- **Multi-Window**: Users can open multiple independent windows for different categories
- **Stage Totals**: Additional window type for aggregate stage points
- **Lightweight**: Minimal footprint, focused on display only

## System Architecture

### Data Flow
```
MoZ Mod → S4Z-live WP Plugin → Team Live Scores Mod
(Zwift)   (WordPress REST API)   (Display Windows)
```

### Key Components

#### 1. WordPress REST API Endpoints (Already Implemented)
The S4Z-live plugin provides these endpoints:

**Team Standings (Live Race)**
```
GET /wp-json/s4z-team/v1/team-standings?event_id={eventId}&nocache=true
GET /wp-json/s4z-team/v1/races/{raceId}/team-standings?nocache=true
```

Returns:
```json
{
  "race": {
    "id": 123,
    "name": "Race Name",
    "zwift_event_id": 456,
    "team_scoring_mode": "sum_all"
  },
  "categories": [
    {
      "id": "A",
      "label": "A",
      "event_name": "Race Name (A)",
      "team_count": 8,
      "ranked_team_count": 8,
      "teams": [
        {
          "rank": 1,
          "team_id": 1,
          "team_name": "Team Alpha",
          "team_color": "#FF0000",
          "total_points": 150.5,
          "fin_points": 50.0,
          "fal_points": 60.5,
          "fts_points": 40.0,
          "rider_count": 5,
          "scoring_rider_count": 5,
          "league_points": 8,
          "riders": [
            {
              "rider_id": 123456,
              "rider_name": "John Doe",
              "points": 45.5,
              "fin": 15.0,
              "fal": 20.5,
              "fts": 10.0
            }
          ]
        }
      ],
      "unassigned": [],
      "updated_at": "2025-10-23T12:34:56+00:00",
      "scoring_mode": "sum_all"
    }
  ],
  "combined": [
    {
      "rank": 1,
      "team_id": 1,
      "team_name": "Team Alpha",
      "team_color": "#FF0000",
      "league_points": 24,
      "raw_points": 450.5,
      "category_points": {
        "A": 8,
        "B": 8,
        "C": 8
      }
    }
  ],
  "generated_at": "2025-10-23T12:34:56+00:00"
}
```

**Team Map (Roster)**
```
GET /wp-json/s4z-team/v1/team-map?event_id={eventId}&nocache=true
```

**Race List**
```
GET /wp-json/s4z-team/v1/races
```

#### 2. Mod Structure

```
DMRL-team-live-scores/
├── manifest.json                     # Mod metadata and window definitions
├── README.md                         # User documentation
├── ARCHITECTURE.md                   # This file
├── CHANGELOG.md                      # Version history
├── LICENSE                           # License file
├── pages/
│   ├── images/
│   │   ├── icon128.png              # Mod icon
│   │   └── favicon.png              # Window favicon
│   ├── css/
│   │   ├── common.css               # Shared styles (from MoZ)
│   │   ├── team-live-scores.css    # Main styles
│   │   └── stage-totals.css        # Stage totals window styles
│   ├── src/
│   │   ├── preloads.js             # Sauce API initialization
│   │   ├── api-client.js           # WordPress REST API client
│   │   ├── config-manager.js       # Settings persistence
│   │   ├── race-selector.js        # Race/event dropdown logic
│   │   ├── category-selector.js    # Category filter logic
│   │   ├── team-renderer.js        # Team standings renderer
│   │   ├── stage-renderer.js       # Stage totals renderer
│   │   └── auto-refresh.js         # Polling/refresh logic
│   ├── team-live-scores.html        # Live category scores window
│   ├── team-live-scores-settings.html  # Settings window
│   ├── stage-totals.html           # Stage totals window
│   └── stage-totals-settings.html  # Stage totals settings
└── release-notes/
    └── 0.1.0-beta.md               # Initial release notes
```

## Window Types

### 1. Team Live Scores Window (Category View)
**Purpose**: Display live team standings for a single category

**Features**:
- Race selector dropdown (top)
- Category selector dropdown (A, B, C, D, E, etc.)
- Auto-refresh toggle (on/off)
- Refresh interval selector (5s, 10s, 15s, 30s)
- Team standings table:
  - Rank
  - Team Name (with color indicator)
  - Total Points
  - FIN / FAL / FTS breakdown (optional)
  - Rider count
  - Last updated timestamp
- Expandable rider details per team (click to expand)
- Status indicator (Live/Stale/Error)

**Window Configuration**:
- Overlay: true
- Frame: false
- Default size: 350px × 600px
- Resizable: true
- Multiple instances allowed: true

**State Persistence** (per window instance):
- Selected race ID
- Selected category
- Auto-refresh enabled/disabled
- Refresh interval
- WordPress site URL
- Expanded/collapsed teams

### 2. Stage Totals Window (Combined View)
**Purpose**: Display aggregate team points across all categories for a stage

**Features**:
- Race selector dropdown
- Auto-refresh toggle
- Refresh interval selector
- Combined standings table:
  - Rank
  - Team Name (with color indicator)
  - League Points (sum across categories)
  - Raw Points (sum across categories)
  - Category breakdown (A: 8, B: 7, C: 6, etc.)
  - Last updated timestamp
- Status indicator (Live/Stale/Error)

**Window Configuration**:
- Overlay: true
- Frame: false
- Default size: 450px × 600px
- Resizable: true
- Multiple instances allowed: true

## Technical Implementation

### 3. API Client Module (`src/api-client.js`)

**Responsibilities**:
- Fetch team standings from WordPress REST API
- Handle authentication (if needed)
- Error handling and retry logic
- Cache busting (nocache parameter)

**Key Functions**:
```javascript
class TLSApiClient {
  constructor(baseUrl, accessToken) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
    this.abortController = null;
  }

  async fetchTeamStandings(eventId, options = {}) {
    // GET /wp-json/s4z-team/v1/team-standings?event_id={eventId}&nocache=true
    // Headers: { 'X-TLS-Access-Token': this.accessToken }
    // Returns 401 if password invalid/changed
  }

  async fetchRaceStandings(raceId, options = {}) {
    // GET /wp-json/s4z-team/v1/races/{raceId}/team-standings?nocache=true
    // Headers: { 'X-TLS-Access-Token': this.accessToken }
  }

  async fetchRaces() {
    // GET /wp-json/s4z-team/v1/races
    // Headers: { 'X-TLS-Access-Token': this.accessToken }
  }

  async fetchTeamMap(eventId) {
    // GET /wp-json/s4z-team/v1/team-map?event_id={eventId}
    // Headers: { 'X-TLS-Access-Token': this.accessToken }
  }

  setAccessToken(token) {
    // Update token when user changes it in settings
  }

  cancel() {
    // Abort ongoing requests
  }
}
```

### 4. Configuration Manager (`src/config-manager.js`)

**Responsibilities**:
- Save/load window-specific settings
- Persist WordPress site URL
- Manage refresh intervals
- Handle race/category selections

**Storage**: Uses `sauce.storage` API (LocalStorage-based)

**Settings Schema**:
```javascript
{
  // Global settings
  "tls_wordpress_url": "https://example.com",
  "tls_access_token": "shared-password-from-admin",  // Stored locally after first entry
  "tls_refresh_interval": 30,  // Fixed, not user-configurable
  
  // Shared request coordinator state
  "tls_shared_buffer": {
    "last_fetch_time": 1729701232000,
    "cached_data": {},
    "active_windows": ["window_1", "window_2"]
  },
  
  // Per-window settings (keyed by window ID)
  "tls_window_{windowId}": {
    "race_id": 123,
    "event_id": 456,
    "category_id": "A",
    "auto_refresh": true,
    "show_rider_details": true,
    "show_point_breakdown": true,
    "expanded_teams": [1, 3, 5]
  }
}
```

### 5. Race Selector Module (`src/race-selector.js`)

**Responsibilities**:
- Populate race dropdown from API
- Handle race selection changes
- Store selected race
- Trigger data refresh on selection

**UI Elements**:
- `<select id="raceSelect">` - Race dropdown
- `<button id="refreshRaces">` - Reload races button
- `<span id="raceStatus">` - Status indicator

### 6. Category Selector Module (`src/category-selector.js`)

**Responsibilities**:
- Populate category dropdown from standings data
- Handle category selection changes
- Filter displayed teams by category
- Update when race changes

**UI Elements**:
- `<select id="categorySelect">` - Category dropdown
- Options populated dynamically from API response

### 7. Team Renderer Module (`src/team-renderer.js`)

**Responsibilities**:
- Render team standings table
- Handle team expansion/collapse
- Display rider details
- Update rank, points, colors
- Show last updated timestamp

**Rendering Logic**:
```javascript
class TeamRenderer {
  renderStandings(categoryData, options = {}) {
    // Render table with teams
  }

  renderTeamRow(team, options = {}) {
    // Render individual team row
  }

  renderRiderDetails(riders) {
    // Render expandable rider table
  }

  updateTimestamp(timestamp) {
    // Update "last updated" display
  }

  showError(message) {
    // Display error state
  }

  showLoading() {
    // Display loading state
  }
}
```

### 8. Stage Renderer Module (`src/stage-renderer.js`)

**Responsibilities**:
- Render combined stage standings
- Display league points and category breakdown
- Show aggregate totals

**Rendering Logic**:
```javascript
class StageRenderer {
  renderCombinedStandings(combinedData, options = {}) {
    // Render combined standings table
  }

  renderCategoryBreakdown(categoryPoints) {
    // Render A: 8, B: 7, C: 6 breakdown
  }

  updateTimestamp(timestamp) {
    // Update "last updated" display
  }
}
```

### 9. Auto-Refresh Module (`src/auto-refresh.js`)

**Responsibilities**:
- Manage polling interval (fixed 30-second intervals)
- Coordinate shared fetch across multiple windows
- Handle pause/resume
- Update status indicators
- Manage shared request buffer

**Key Functions**:
```javascript
class AutoRefresh {
  constructor(fetchCallback, interval = 30000) {
    this.fetchCallback = fetchCallback;
    this.interval = 30000;  // Fixed 30 seconds, not configurable
    this.timerId = null;
    this.enabled = false;
  }

  start() {
    // Start polling with shared request coordinator
  }

  stop() {
    // Stop polling
  }

  trigger() {
    // Manual refresh (also respects 30s minimum)
  }
  
  shouldFetch() {
    // Check if 30 seconds have passed since last fetch
    // Coordinate with other open windows
  }
}
```

### 10. Request Coordinator Module (`src/request-coordinator.js`)

**Responsibilities**:
- Ensure only one fetch happens across all windows
- Share fetched data with all windows via buffer
- Enforce 30-second minimum between requests
- Handle concurrent window operations

**Key Functions**:
```javascript
class RequestCoordinator {
  static instance = null;
  
  static getInstance() {
    // Singleton pattern for shared coordinator
  }
  
  async fetchIfNeeded(apiClient, eventId) {
    // Check last fetch time
    // If >30s, fetch new data
    // Store in shared buffer
    // Return data to all requesting windows
  }
  
  getLastFetchTime() {
    // Return timestamp of last successful fetch
  }
  
  getCachedData() {
    // Return cached data for display
  }
  
  registerWindow(windowId) {
    // Track active windows
  }
  
  unregisterWindow(windowId) {
    // Clean up when window closes
  }
}
```

## Data Update Strategy

### Polling Mechanism
- **Fixed refresh interval: 30 seconds** (not user-configurable)
- System-wide setting to prevent server overload (50-100 concurrent clients expected)
- Always uses `nocache=true` parameter
- Visual indicator shows "Live" vs "Stale" (if data is older than 60 seconds)
- **Shared request coordinator**: All open windows share a single fetch operation to minimize server load

### Cache Handling
- Client-side: No caching (always fresh from API)
- Server-side: 20-second transient cache (managed by S4Z-live)
- Use `nocache=true` to force server-side regeneration

### Error Handling
- **401 Unauthorized**: Clear message + button to open settings
  - "Access denied. Your password may have changed or expired."
  - "Please contact a DMRL Jedi for the current access password."
  - Auto-disable refresh until password updated
- **429 Too Many Requests**: Show rate limit message
  - "Server is busy. Please wait before refreshing."
  - Automatic retry after delay
- Network errors: Show "Connection Lost" status
- API errors: Display error message in window
- Retry logic: Exponential backoff (30s, 60s, 120s) - respects minimum interval
- Graceful degradation: Show last successful data with warning

## UI/UX Design

### Visual Style
- Consistent with MoZ mod design patterns
- Dark theme optimized (overlay-friendly)
- Color-coded teams (using team colors from WordPress)
- Highlight scoring riders (bold or icon)
- Responsive layout

### Status Indicators
- **Live** (green): Data refreshed within interval
- **Stale** (yellow): Data older than 2× interval
- **Error** (red): API error or connection lost
- **Loading** (spinner): Fetching data

### Accessibility
- Keyboard navigation
- Screen reader friendly
- High contrast mode support
- Clear error messages

## Settings Windows

### Team Live Scores Settings
- WordPress site URL input
- **Access password input** (required for API access)
  - Entered once, stored locally
  - Shows masked (password field)
  - Test connection button to verify
  - Clear instructions: "Contact DMRL admin for access password"
- Show/hide point breakdown columns
- Show/hide rider details
- Theme selection (if applicable)
- Export/import settings (excludes password for security)

### Stage Totals Settings
- WordPress site URL input
- **Access password input** (shared with Team Live Scores settings)
- Show/hide category breakdown
- Theme selection
- Export/import settings (excludes password for security)

**Note**: Refresh interval is fixed at 30 seconds and not user-configurable to protect server resources.

## Manifest Configuration

```json
{
  "manifest_version": 1,
  "name": "DMRL's Team Live Scores",
  "description": "Display live team standings from WordPress during races",
  "author": "the.Colonel",
  "website_url": "https://dirtymittenracing.com",
  "version": "0.1.0-beta",
  "content_js": [],
  "content_css": [],
  "web_root": "pages",
  "windows": [
    {
      "file": "pages/team-live-scores.html",
      "id": "team-live-scores",
      "name": "TLS Team Live Scores",
      "description": "Display live team standings for a selected category",
      "overlay": true,
      "frame": false,
      "default_bounds": {
        "width": 350,
        "height": 600,
        "x": -400,
        "y": 100
      }
    },
    {
      "file": "pages/stage-totals.html",
      "id": "stage-totals",
      "name": "TLS Stage Totals",
      "description": "Display combined team standings across all categories",
      "overlay": true,
      "frame": false,
      "default_bounds": {
        "width": 450,
        "height": 600,
        "x": -500,
        "y": 100
      }
    }
  ]
}
```

## Development Phases

### Phase 1: Core Infrastructure (v0.1.0-beta)
- [ ] Project scaffolding
- [ ] API client implementation
- [ ] Configuration manager
- [ ] Basic HTML/CSS structure
- [ ] Settings windows

### Phase 2: Live Scores Window (v0.2.0-beta)
- [ ] Race selector
- [ ] Category selector
- [ ] Team standings renderer
- [ ] Auto-refresh mechanism
- [ ] Error handling

### Phase 3: Stage Totals Window (v0.3.0-beta)
- [ ] Combined standings renderer
- [ ] Category breakdown display
- [ ] League points calculation

### Phase 4: Polish & Features (v0.4.0-beta)
- [ ] Rider detail expansion
- [ ] Status indicators
- [ ] Enhanced error messages
- [ ] Performance optimization
- [ ] User testing

### Phase 5: Production Release (v1.0.0)
- [ ] Final testing
- [ ] Documentation
- [ ] Release notes
- [ ] Distribution

## Integration Points

### With Master of Zen
- **No direct integration** - MoZ sends data to WordPress independently
- TLS assumes MoZ is running and sending updates

### With S4Z-live Plugin
- **REST API consumption only**
- No WordPress admin access required
- Public API endpoints (no authentication for read-only)
- Event ID matching for race identification

### With Sauce for Zwift
- Uses standard Sauce mod architecture
- Window management via manifest
- Settings persistence via `sauce.storage`
- No game state access (read-only from WordPress)

## Security Considerations

- **Read-Only**: No write operations to WordPress
- **Access Control**: Shared password authentication via custom header (`X-TLS-Access-Token`)
  - Password entered once in settings, stored locally
  - Same password for all authorized users
  - Admin can rotate password on WordPress if compromised
  - 401 response triggers clear error message and settings prompt
- **CORS**: WordPress must allow cross-origin requests from Sauce
- **Rate Limiting**: WordPress enforces server-side rate limits (can be disabled by admin)
  - Primary: 30-second minimum between requests
  - Backup: 429 response if requests too frequent
  - Protection against 50-100 concurrent clients
- **Data Validation**: Sanitize all API responses
- **Error Messages**: Clear, actionable messages without exposing sensitive details

## Performance Considerations

- **Polling Frequency**: Default 10s to balance freshness vs load
- **Request Cancellation**: Cancel in-flight requests when window closes
- **Efficient Rendering**: Update only changed elements (DOM diffing)
- **Memory Management**: Clean up timers and event listeners
- **Network Optimization**: Gzip compression, minimal payload

## Testing Strategy

- **Unit Tests**: API client, config manager, renderers
- **Integration Tests**: Full data flow from API to display
- **Manual Testing**: Multi-window scenarios, race selection, category switching
- **Error Scenarios**: Network failures, invalid data, missing races
- **Performance**: Stress test with multiple windows and fast refresh rates

## Future Enhancements (Post-v1.0)

- [ ] Historical race browsing
- [ ] Export standings to CSV
- [ ] Team comparison charts
- [ ] Rider performance graphs
- [ ] Mobile companion app
- [ ] WebSocket support (real-time push vs polling)
- [ ] Customizable table columns
- [ ] Sound notifications for rank changes
- [ ] Multi-language support

## Dependencies

### External Libraries
- **None** - Vanilla JavaScript for minimal footprint

### Sauce for Zwift APIs
- `sauce.storage` - Settings persistence
- Window management - Provided by Sauce runtime

### WordPress REST API
- S4Z-live plugin endpoints (already implemented)

## Compatibility

- **Sauce for Zwift**: Latest stable version
- **S4Z-live Plugin**: v0.7.6-beta or higher
- **Master of Zen**: v0.3.8 or higher
- **Browsers**: Chromium-based (Electron)

## License

Same license as Master of Zen mod (to be determined)

---

**Document Version**: 1.0  
**Last Updated**: October 23, 2025  
**Author**: the.Colonel
