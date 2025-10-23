# DMRL's Team Live Scores - Development Roadmap

## Project Overview

**Goal**: Create a read-only Sauce for Zwift mod that displays live team standings from WordPress during races.

**Timeline**: 4-6 weeks to v1.0.0

---

## Phase 1: Core Infrastructure (Week 1)
**Version**: 0.1.0-beta  
**Status**: Planning Complete ✓

### Tasks
- [x] Project architecture design
- [x] Documentation structure (README, ARCHITECTURE, CHANGELOG)
- [x] Manifest.json configuration
- [ ] Create directory structure
- [ ] Copy common assets from MoZ (CSS, images)
- [ ] Create basic HTML templates
- [ ] Set up development environment

### Deliverables
- Project scaffolding
- Base HTML/CSS files
- Settings window templates
- Development guidelines

### Testing
- Verify Sauce loads the mod
- Check window definitions work
- Validate settings persistence mechanism

---

## Phase 2: API Integration (Week 2)
**Version**: 0.2.0-beta  
**Status**: Not Started

### Tasks
- [ ] Implement `api-client.js`
  - [ ] fetchTeamStandings()
  - [ ] fetchRaceStandings()
  - [ ] fetchRaces()
  - [ ] fetchTeamMap()
  - [ ] Error handling and retries
  - [ ] Request cancellation
- [ ] Implement `config-manager.js`
  - [ ] Settings save/load
  - [ ] WordPress URL persistence
  - [ ] Per-window configuration
  - [ ] Migration utilities
- [ ] Create settings windows
  - [ ] WordPress URL input
  - [ ] Refresh interval selector
  - [ ] Display preferences
  - [ ] Save/load buttons

### Deliverables
- Working API client
- Configuration management
- Functional settings UI
- API unit tests

### Testing
- Test API calls to live S4Z-live instance
- Verify error handling (network failures, invalid URLs)
- Test settings persistence across sessions
- Validate CORS handling

---

## Phase 3: Team Live Scores Window (Week 3)
**Version**: 0.3.0-beta  
**Status**: Not Started

### Tasks
- [ ] Implement `race-selector.js`
  - [ ] Populate race dropdown
  - [ ] Handle selection changes
  - [ ] Race metadata display
- [ ] Implement `category-selector.js`
  - [ ] Dynamic category population
  - [ ] Category filtering logic
  - [ ] Handle "All" option
- [ ] Implement `team-renderer.js`
  - [ ] Team standings table
  - [ ] Color-coded team names
  - [ ] Point breakdown columns
  - [ ] Rank display
  - [ ] Last updated timestamp
- [ ] Implement `auto-refresh.js`
  - [ ] Polling mechanism
  - [ ] Start/stop controls
  - [ ] Interval configuration
  - [ ] Status indicators
- [ ] Rider detail expansion
  - [ ] Expandable rows
  - [ ] Rider table rendering
  - [ ] Highlight scoring riders
- [ ] CSS styling
  - [ ] Dark theme
  - [ ] Responsive layout
  - [ ] Team colors
  - [ ] Status badges

### Deliverables
- Fully functional Team Live Scores window
- Race and category selection
- Auto-refresh mechanism
- Expandable rider details
- Error handling UI

### Testing
- Test with live race data
- Verify category switching
- Test multi-window independence
- Validate refresh intervals
- Check expanded state persistence
- Test error scenarios

---

## Phase 4: Stage Totals Window (Week 4)
**Version**: 0.4.0-beta  
**Status**: Not Started

### Tasks
- [ ] Implement `stage-renderer.js`
  - [ ] Combined standings table
  - [ ] League points display
  - [ ] Category breakdown rendering
  - [ ] Raw points totals
- [ ] Race selector integration
- [ ] Auto-refresh for stage totals
- [ ] CSS styling for stage view
- [ ] Settings window for stage totals

### Deliverables
- Fully functional Stage Totals window
- Combined standings display
- Category breakdown
- League points calculation display

### Testing
- Test with multi-category race data
- Verify league points accuracy
- Test category breakdown display
- Validate sorting logic
- Check auto-refresh behavior

---

## Phase 5: Polish & Features (Week 5)
**Version**: 0.5.0-beta  
**Status**: Not Started

### Tasks
- [ ] Performance optimization
  - [ ] Efficient DOM updates
  - [ ] Request debouncing
  - [ ] Memory leak prevention
- [ ] Enhanced error messages
  - [ ] Network error details
  - [ ] API error display
  - [ ] Recovery suggestions
- [ ] Status indicators
  - [ ] Live/Stale/Error badges
  - [ ] Visual feedback
  - [ ] Connection status
- [ ] UI improvements
  - [ ] Loading states
  - [ ] Transitions/animations
  - [ ] Accessibility enhancements
- [ ] User preferences
  - [ ] Show/hide columns
  - [ ] Sorting options
  - [ ] Compact/expanded view
- [ ] Documentation updates
  - [ ] User guide
  - [ ] Screenshots
  - [ ] Troubleshooting guide

### Deliverables
- Optimized performance
- Enhanced UX
- Comprehensive error handling
- Updated documentation

### Testing
- Performance testing (multiple windows)
- Stress testing (fast refresh rates)
- Error scenario testing
- Accessibility testing
- User acceptance testing

---

## Phase 6: Beta Testing (Week 6)
**Version**: 0.9.0-beta  
**Status**: Not Started

### Tasks
- [ ] Beta testing with DMRL members
- [ ] Bug fixes from beta feedback
- [ ] Documentation refinements
- [ ] Release notes preparation
- [ ] Final code review

### Deliverables
- Beta release candidate
- Bug fix updates
- Final documentation
- Release notes

### Testing
- Real-world race testing
- Multi-user scenarios
- Edge case validation
- Final QA pass

---

## Phase 7: Production Release (Week 7)
**Version**: 1.0.0  
**Status**: Not Started

### Tasks
- [ ] Final testing
- [ ] Version number update
- [ ] Release notes finalization
- [ ] Package for distribution
- [ ] Deployment

### Deliverables
- Production release (v1.0.0)
- Complete documentation
- Distribution package
- Release announcement

### Testing
- Final smoke tests
- Installation verification
- Cross-platform checks

---

## Future Enhancements (Post-v1.0)

### v1.1.0 - Historical Data
- [ ] Browse past race results
- [ ] Historical standings view
- [ ] Stage comparison

### v1.2.0 - Data Export
- [ ] Export to CSV
- [ ] Export to PDF
- [ ] Share standings

### v1.3.0 - Analytics
- [ ] Team performance charts
- [ ] Rider trends
- [ ] Category analysis

### v1.4.0 - Real-time Push
- [ ] WebSocket integration
- [ ] Instant updates
- [ ] Push notifications

### v1.5.0 - Customization
- [ ] Custom themes
- [ ] Column configuration
- [ ] Layout templates

### v2.0.0 - Mobile Companion
- [ ] Mobile app
- [ ] Remote viewing
- [ ] Notifications

---

## Dependencies

### External Dependencies
- **Sauce for Zwift**: Latest stable
- **S4Z-live Plugin**: v0.7.6-beta+
- **Master of Zen**: v0.3.8+

### Internal Dependencies
- Common CSS from MoZ
- Sauce APIs (storage, window management)
- WordPress REST API

---

## Risk Assessment

### Technical Risks
- **CORS Issues**: May need WordPress configuration
  - *Mitigation*: Document CORS setup, provide troubleshooting
- **API Changes**: S4Z-live API may evolve
  - *Mitigation*: Version compatibility checks, graceful degradation
- **Performance**: Multiple windows + fast refresh
  - *Mitigation*: Request throttling, efficient rendering

### User Experience Risks
- **Complex Setup**: WordPress URL configuration
  - *Mitigation*: Clear setup instructions, validation feedback
- **Data Staleness**: Polling delay vs real-time
  - *Mitigation*: Configurable intervals, status indicators
- **Network Issues**: Connectivity problems during races
  - *Mitigation*: Robust error handling, retry logic

---

## Success Criteria

### Phase 1-4 (Beta)
- [x] Architecture documented
- [ ] Both window types functional
- [ ] Settings persistence working
- [ ] Auto-refresh operational
- [ ] Error handling in place

### v1.0.0 (Production)
- [ ] No critical bugs
- [ ] Performance meets targets (<100ms render)
- [ ] Documentation complete
- [ ] User testing successful
- [ ] DMRL approval

### Post-Launch
- [ ] Positive user feedback
- [ ] No data loss issues
- [ ] Stable in production races
- [ ] Adoption by DMRL members

---

## Notes

- Keep aligned with MoZ design patterns
- Maintain read-only philosophy (no data modifications)
- Prioritize reliability over features
- Test extensively with live race data
- Document all API assumptions

---

**Document Version**: 1.0  
**Last Updated**: October 23, 2025  
**Next Review**: Start of Phase 2
