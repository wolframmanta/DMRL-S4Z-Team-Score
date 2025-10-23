# DMRL Team Live Scores (TLS)

A Sauce for Zwift mod that displays real-time team standings during races by reading live scores from WordPress.

## Overview

Team Live Scores (TLS) completes the DMRL race scoring ecosystem:

1. **Master of Zen (MoZ)** → Calculates individual racer scores in Zwift
2. **S4Z-live WordPress Plugin** → Ingests scores and calculates team totals
3. **Team Live Scores (TLS)** → Displays live team standings in Zwift windows

## Features

### 📊 Live Team Standings
- Real-time team scores by category (A, B, C, D, E)
- Auto-refresh every 30 seconds (fixed)
- Expandable rider details per team (category view)
- “All Categories” shows Stage Points Earned + Raw Points
- Category view shows Points (raw points in that category)

### 🏆 Stage Totals (TBD)
- Combined standings across all categories (planned)
- League points aggregation (planned)
- Category-by-category breakdown (planned)

### 🪟 Multi-Window Support
- Open multiple windows for different categories
- Independent category selection per window
- Persistent settings per window instance
- Overlay-friendly design

### ⚙️ Configuration
- WordPress base URL is fixed: https://dirtymittenracing.com
- Enter access password (provided by DMRL)
- Choose category (A, B, C, D, E, or All)
- Display: theme, background, font scale, line spacing

## Installation

1. Install Sauce for Zwift
2. Download the latest release ZIP or clone this repo
3. Place the folder under your Sauce mods directory (no build step required)
4. Restart Sauce for Zwift (or reload the window)
5. Open "TLS Team Live Scores" from Sauce’s menu

## Setup

1. Open the settings window (gear icon in the title bar; title bar is always visible)
2. Base URL is fixed to https://dirtymittenracing.com (displayed, non-editable)
3. Enter the access password (from DMRL) and click "Test Connection"
4. Close settings — the window will auto-load the current live race
5. Use the Category dropdown to filter (A/B/C/D/E or All)
6. Auto-refresh runs automatically every 30 seconds

## Usage

### Team Live Scores Window
- No race selector — it always displays the most recent live race
- Category Selection: Pick A, B, C, D, E, or All Categories
- Auto-Refresh: Updates automatically every 30 seconds
- Expand Teams: Click team rows to see rider details (category view)
- Multiple Windows: Open multiple instances for different categories

### Stage Totals Window (Planned)
- Combined View across all categories
- League Points and Raw Points summary
- Auto-Refresh: 30 seconds
- Category breakdown planned

## Requirements

- **Sauce for Zwift**: Latest stable version
- **S4Z-live WordPress Plugin**: feature/team-live-scores-auth (or later)
- **Master of Zen Mod**: v0.3.8 or higher (for score calculation)

## Data Flow

```
Zwift Race
    ↓
Master of Zen (calculates individual scores)
    ↓
WordPress (S4Z-live plugin calculates team totals)
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

**Default Size**: 450px × 600px (planned)

## Settings

### Global Settings
- Base URL (fixed to https://dirtymittenracing.com)
- Access Password (required; contact DMRL admin)
- Auto-refresh (fixed at 30 seconds)
- Display: font scale, line spacing, background

### Per-Window Settings
- Selected category (Live Scores only)
- Expanded teams state (category view)
- Display preferences

## API Endpoints

TLS consumes these WordPress REST API endpoints:

- `GET /wp-json/s4z-tls/v1/team-standings` (no params; server auto-detects current live race)
- `GET /wp-json/s4z-tls/v1/races` (public; informational)
- `GET /wp-json/s4z-tls/v1/team-map` (auth required; roster map)

## Troubleshooting

### No Data Showing
- Ensure the access password is entered correctly in settings
- Ensure S4Z-live plugin is active on WordPress
- Verify MoZ has produced scores for the current race
- Check WordPress admin: S4Z Live → Settings (rate limiting may block frequent calls)

### "Access Denied" (401)
- Password may be incorrect — update in settings
- Click Test Connection to verify
- Contact DMRL admin for the current access password

### Rate Limited (429)
- WordPress can enforce a 30-second minimum between requests
- For testing, admins can disable the TLS rate limiter in WordPress: S4Z Live → Settings

### Categories Not Appearing
- Wait for race scoring to begin (MoZ → WordPress ingest)
- Verify categories exist in the standings payload

### Connection Errors
- Verify WordPress is reachable
- Verify password (401)
- Rate limiting (429): wait or disable in WordPress for testing
- Check browser console for details

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

### Building / Packaging
No build is required for local development. To create a distributable ZIP:

```
cd DMRL-team-live-scores
rm -rf dist && mkdir -p dist/dmrl-team-live-scores
cp -r pages dist/dmrl-team-live-scores/
cp manifest.json dist/dmrl-team-live-scores/
cp README.md CHANGELOG.md dist/dmrl-team-live-scores/
cd dist && zip -r dmrl-team-live-scores-v0.1.0-prototype.zip dmrl-team-live-scores/
```

## Roadmap

See CHANGELOG for details.

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

**Version**: 0.1.0-prototype  
**Last Updated**: October 23, 2025
