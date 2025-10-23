# DMRL's Team Live Scores - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Historical race browsing
- Export standings to CSV
- Team comparison charts
- Rider performance graphs
- WebSocket support for real-time updates
- Customizable table columns
- Sound notifications for rank changes
- Multi-language support

## [0.1.0-prototype] - 2025-10-23

### Added
- Initial working prototype of Team Live Scores (TLS)
- Live team standings with category filter (A/B/C/D/E/All)
- All Categories view shows Stage Points Earned + Raw Points
- Category view shows Points and expandable rider details
- Fixed 30s auto-refresh
- Always-visible title bar with gear icon for settings
- Settings: theme, background, font scale, line spacing
- WordPress base URL hardcoded to https://dirtymittenracing.com
- Authentication via X-TLS-Access-Token header (password in settings)
- Status indicator updates (Initializing, Fetching, Ready, Error)
- Packaging script/steps and repository bootstrap

### Server Integration
- WordPress REST namespace: `s4z-tls/v1`
- Endpoints: `/team-standings` (auto-detect current live), `/races` (public), `/team-map`
- Rate limiting toggle in WordPress admin (S4Z Live → Settings)

### Added
- Initial project architecture
- Architecture documentation (ARCHITECTURE.md)
- README with user documentation
- Manifest.json with window definitions
- Changelog structure

### Technical
- Designed API client for WordPress REST API
- Designed configuration manager for settings persistence
- Designed rendering modules for team standings
- Designed auto-refresh mechanism with polling
- Designed two window types: Team Live Scores and Stage Totals

### Infrastructure
- Project folder structure
- Module organization plan
- Development phase roadmap
- Testing strategy
- Security and performance considerations

---

## Version History Summary

- **0.1.0-prototype** - First working prototype pushed to GitHub
- **Next** - Stage Totals window, polish, and additional features
