# DMRL's Team Live Scores

A Sauce for Zwift mod that displays real-time team standings during races by reading live scores from WordPress.

## Overview

Team Live Scores (TLS) completes the DMRL race scoring ecosystem:

1. **Master of Zen (MoZ)** → Calculates individual racer scores in Zwift
2. **S4Z-live WordPress Plugin** → Ingests scores and calculates team totals
3. **Team Live Scores (TLS)** → Displays live team standings in Zwift windows

## Features

### 📊 Live Team Standings
- Real-time team scores by category (A, B, C, D, E)
- Auto-refresh with configurable intervals (5s - 60s)
- Expandable rider details per team
- Color-coded teams
- Rank tracking with league points

### 🏆 Stage Totals
- Combined standings across all categories
- League points aggregation
- Category-by-category breakdown
- Overall team rankings

### 🪟 Multi-Window Support
- Open multiple windows for different categories
- Independent category selection per window
- Persistent settings per window instance
- Overlay-friendly design

### ⚙️ Configuration
- Select from available races
- Configure WordPress site URL
- Customize refresh intervals
- Show/hide point breakdowns
- Expand/collapse team details

## Installation

1. Install [Sauce for Zwift](https://www.sauce.llc/)
2. Download the latest release of DMRL's Team Live Scores
3. Extract to your Sauce mods directory
4. Restart Sauce for Zwift
5. Open "TLS Team Live Scores" or "TLS Stage Totals" from Sauce menu

## Setup

1. Open the settings window (gear icon)
2. Enter your WordPress site URL (where S4Z-live is installed)
3. **Enter access password** (contact DMRL admin for password)
4. Click "Test Connection" to verify settings
5. Select a race from the dropdown
6. Choose your category (for Live Scores window)
7. Auto-refresh runs automatically every 30 seconds

## Usage

### Team Live Scores Window
- **Race Selection**: Choose which race to monitor
- **Category Selection**: Pick A, B, C, D, E, or other category
- **Auto-Refresh**: Updates automatically every 30 seconds
- **Expand Teams**: Click team rows to see rider details
- **Multiple Windows**: Open multiple instances for different categories (shares single fetch operation)

### Stage Totals Window
- **Race Selection**: Choose which race to monitor
- **Combined View**: See all teams across all categories
- **Auto-Refresh**: Updates automatically every 30 seconds
- **League Points**: Points awarded based on category rankings
- **Category Breakdown**: See which categories contributed to team totals

## Requirements

- **Sauce for Zwift**: Latest stable version
- **S4Z-live WordPress Plugin**: v0.7.6-beta or higher
- **Master of Zen Mod**: v0.3.8 or higher (for score calculation)

## Data Flow

```
Zwift Race
    ↓
Master of Zen (calculates individual scores)
    ↓
WordPress (S4Z-live plugin calculates team scores)
    ↓
Team Live Scores (displays team standings)
```

## Window Types

### 1. Team Live Scores
Displays live team standings for a **single category**:
- Rank
- Team name (with color)
- Total points
- FIN / FAL / FTS breakdown
- Rider count
- Last updated time

**Default Size**: 350px × 600px

### 2. Stage Totals
Displays combined team standings **across all categories**:
- Rank
- Team name (with color)
- League points (sum)
- Raw points (sum)
- Category breakdown (A: 8, B: 7, etc.)

**Default Size**: 450px × 600px

## Settings

### Global Settings
- WordPress Site URL
- **Access Password** (required - contact DMRL admin)
- Refresh interval (fixed at 30 seconds)
- Theme preferences

### Per-Window Settings
- Selected race
- Selected category (Live Scores only)
- Auto-refresh always enabled
- Expanded teams state
- Display preferences

## API Endpoints

TLS consumes these WordPress REST API endpoints:

- `GET /wp-json/s4z-team/v1/team-standings?event_id={eventId}`
- `GET /wp-json/s4z-team/v1/races/{raceId}/team-standings`
- `GET /wp-json/s4z-team/v1/races`
- `GET /wp-json/s4z-team/v1/team-map?event_id={eventId}`

## Troubleshooting

### No Data Showing
- Verify WordPress URL is correct in settings
- **Check that access password is entered correctly**
- Ensure S4Z-live plugin is active on WordPress
- Check that a race is selected
- Verify Master of Zen is sending data to WordPress

### "Access Denied" Error
- **Your access password may have changed or expired**
- Click the "Update Settings" button shown in the error
- Contact a DMRL Jedi to get the current access password
- Enter the new password in settings
- Auto-refresh will resume once password is updated

### Stale Data
- Auto-refresh runs every 30 seconds automatically
- Check "last updated" timestamp in window
- Verify network connectivity
- Check WordPress site is responding
- Look for error messages in the window

### Categories Not Appearing
- Ensure race has started and riders have scores
- Verify race is configured in S4Z-live plugin
- Check that MoZ is sending data with category information

### Connection Errors
- Check WordPress site is accessible from your network
- Verify access password is correct (401 errors)
- Check for rate limiting (429 errors) - wait 30 seconds
- Verify CORS is enabled on WordPress with custom headers
- Check browser console for detailed error messages

## Development

For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

### Project Structure
```
DMRL-team-live-scores/
├── manifest.json
├── README.md
├── ARCHITECTURE.md
├── pages/
│   ├── css/
│   ├── src/
│   ├── team-live-scores.html
│   ├── team-live-scores-settings.html
│   ├── stage-totals.html
│   └── stage-totals-settings.html
└── release-notes/
```

### Building
1. Clone the repository
2. No build step required (vanilla JavaScript)
3. Copy to Sauce mods directory
4. Reload Sauce

## Roadmap

### v0.1.0-beta (Current)
- Core infrastructure
- API client
- Configuration management

### v0.2.0-beta
- Team Live Scores window
- Race and category selection
- Auto-refresh

### v0.3.0-beta
- Stage Totals window
- Combined standings

### v0.4.0-beta
- Polish and features
- Performance optimization

### v1.0.0
- Production release
- Full documentation

## Contributing

This is a DMRL internal tool. For issues or feature requests, contact the.Colonel.

## License

[To be determined - align with Master of Zen license]

## Credits

**Author**: the.Colonel  
**Organization**: Dirty Mitten Racing League (DMRL)

Part of the DMRL race scoring ecosystem:
- Master of Zen (MoZ) - Score calculation in Zwift
- S4Z-live - WordPress plugin for team scoring
- Team Live Scores (TLS) - Live standings display

## Support

For support, contact DMRL administrators or visit [https://dirtymittenracing.com](https://dirtymittenracing.com)

---

**Version**: 0.1.0-beta  
**Last Updated**: October 23, 2025
