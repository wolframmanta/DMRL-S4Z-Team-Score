# DMRL's Team Live Scores - Project Summary

## 🎯 Project Vision

**Team Live Scores (TLS)** is the final piece of the DMRL race scoring ecosystem, providing real-time team standings display during Zwift races. It creates a complete chain from in-game score calculation to live web-based team standings to in-game visual display.

---

## 📊 The Complete Ecosystem

```
┌─────────────────────────────────────────────────────────────────┐
│                    DMRL Scoring Ecosystem                        │
└─────────────────────────────────────────────────────────────────┘

    Zwift Game              Sauce Mod           WordPress           Sauce Mod
┌──────────────┐       ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │       │              │    │              │    │              │
│  Race        │──────▶│  Master of   │───▶│  S4Z-live    │◀───│  Team Live   │
│  Execution   │       │  Zen (MoZ)   │    │  Plugin      │    │  Scores      │
│              │       │              │    │              │    │  (TLS)       │
└──────────────┘       └──────────────┘    └──────────────┘    └──────────────┘
   Game State         Individual Scores     Team Scoring       Live Display
   - Riders             - FIN/FAL/FTS        - Aggregation      - By Category
   - Positions          - Segments           - Rosters          - Stage Totals
   - Timing             - Laps               - League Pts       - Auto-refresh
```

---

## 📦 What We've Built (Architecture Phase)

### ✅ Completed Documentation
1. **README.md** - User-facing documentation
2. **ARCHITECTURE.md** - Technical design and system architecture
3. **ROADMAP.md** - Development phases and timeline
4. **QUICK_REFERENCE.md** - Developer quick lookup guide
5. **DIAGRAMS.md** - Visual system diagrams and flows
6. **GETTING_STARTED.md** - Developer onboarding guide
7. **API_SPECIFICATION.md** - Complete WordPress REST API docs
8. **CHANGELOG.md** - Version history structure
9. **manifest.json** - Sauce mod configuration
10. **This file** - Project summary

### 📁 Project Structure Created
```
DMRL-team-live-scores/
├── Documentation (10 files) ✅
├── manifest.json ✅
├── pages/ (to be implemented)
│   ├── images/
│   ├── css/
│   ├── src/
│   └── *.html
└── release-notes/
```

---

## 🎨 Key Features Designed

### 1. Team Live Scores Window
**Purpose**: Display live standings for a single category

**Features**:
- Race selection dropdown
- Category filtering (A, B, C, D, E)
- Team standings with rank, points, colors
- Expandable rider details
- Auto-refresh (5s - 60s intervals)
- Status indicators (Live/Stale/Error)
- Multiple independent window instances

**Default Size**: 350×600px

### 2. Stage Totals Window
**Purpose**: Display combined standings across all categories

**Features**:
- Race selection dropdown
- Combined team rankings
- League points (rank-based scoring)
- Category breakdown display
- Auto-refresh
- Status indicators

**Default Size**: 450×600px

---

## 🏗️ Technical Architecture

### Core Components
1. **API Client** (`api-client.js`)
   - Fetches data from WordPress REST API
   - Error handling and retries
   - Request cancellation
   - Timeout management

2. **Configuration Manager** (`config-manager.js`)
   - Settings persistence via `sauce.storage`
   - Per-window configuration
   - WordPress URL management
   - Migration utilities

3. **Race Selector** (`race-selector.js`)
   - Populates race dropdown
   - Handles selection changes
   - Triggers data refresh

4. **Category Selector** (`category-selector.js`)
   - Dynamic category population
   - Filters teams by category
   - Updates on race change

5. **Team Renderer** (`team-renderer.js`)
   - Renders team standings table
   - Handles expansion/collapse
   - Updates DOM efficiently
   - Displays status

6. **Stage Renderer** (`stage-renderer.js`)
   - Renders combined standings
   - Shows category breakdown
   - Displays league points

7. **Auto-Refresh** (`auto-refresh.js`)
   - Polling mechanism
   - Start/stop controls
   - Interval management
   - Status updates

### Data Flow
```
1. TLS polls WordPress API (every 10s)
2. WordPress queries S4Z-live team scoring
3. S4Z-live aggregates MoZ individual scores
4. Response includes categories, teams, riders
5. TLS renders standings in window
6. User sees live updates
```

---

## 🔌 API Integration

### WordPress Endpoints (S4Z-live v0.7.6-beta)

**Team Standings**:
```
GET /wp-json/s4z-team/v1/team-standings?event_id={id}&nocache=true
```

**Race List** (admin):
```
GET /wp-json/s4z-team/v1/races
```

**Team Map**:
```
GET /wp-json/s4z-team/v1/team-map?event_id={id}&nocache=true
```

**Health Check**:
```
GET /wp-json/s4z-team/v1/health
```

### Response Structure
- `race`: Race metadata
- `categories[]`: Per-category standings
  - `teams[]`: Team objects with rank, points, riders
  - `unassigned[]`: Riders without teams
- `combined[]`: Aggregated stage standings
- `team_lookup[]`: Quick rider→team mapping

---

## 📅 Development Timeline

### Phase 1: Core Infrastructure (Week 1) ← CURRENT
- [x] Project architecture design
- [x] Complete documentation suite
- [x] Manifest configuration
- [ ] Copy base assets from MoZ
- [ ] Create HTML templates
- [ ] Basic CSS styling

### Phase 2: API Integration (Week 2)
- [ ] Implement API client
- [ ] Implement config manager
- [ ] Create settings windows
- [ ] Test API connectivity

### Phase 3: Team Live Scores (Week 3)
- [ ] Race/category selectors
- [ ] Team renderer
- [ ] Auto-refresh
- [ ] Rider details

### Phase 4: Stage Totals (Week 4)
- [ ] Stage renderer
- [ ] Combined standings
- [ ] Category breakdown

### Phase 5: Polish (Week 5)
- [ ] Performance optimization
- [ ] Enhanced error handling
- [ ] UI improvements
- [ ] Documentation updates

### Phase 6: Beta Testing (Week 6)
- [ ] DMRL member testing
- [ ] Bug fixes
- [ ] Final QA

### Phase 7: Production (Week 7)
- [ ] v1.0.0 release
- [ ] Distribution package
- [ ] Release announcement

---

## 🎯 Success Criteria

### Technical
- ✅ Architecture documented
- ✅ API specification complete
- ✅ Development plan established
- ⏳ Both window types functional
- ⏳ Auto-refresh reliable
- ⏳ Error handling robust
- ⏳ Performance optimized (<100ms render)

### User Experience
- ⏳ Easy setup (WordPress URL entry)
- ⏳ Intuitive race/category selection
- ⏳ Clear visual feedback
- ⏳ Stable during live races
- ⏳ Multiple windows work independently

### Business
- ✅ Completes DMRL scoring ecosystem
- ⏳ Adopted by DMRL members
- ⏳ Positive user feedback
- ⏳ No critical bugs in production

---

## 🔧 Technology Stack

### Languages
- **JavaScript** (ES6+) - Business logic
- **HTML5** - Structure
- **CSS3** - Styling

### APIs
- **Sauce for Zwift API** - Window management, storage
- **WordPress REST API** - Team standings data
- **S4Z-live Plugin** - Team scoring backend

### Tools
- **VS Code** - Development
- **Git** - Version control
- **curl** - API testing
- **Browser DevTools** - Debugging

### No Build Required
- Vanilla JavaScript (no bundler)
- Direct deployment to Sauce mods directory
- No compilation step

---

## 📖 Documentation Map

### For Users
- **README.md** - Installation, setup, usage
- **QUICK_REFERENCE.md** - Shortcuts, troubleshooting

### For Developers
- **GETTING_STARTED.md** - Onboarding guide
- **ARCHITECTURE.md** - System design
- **DIAGRAMS.md** - Visual flows
- **API_SPECIFICATION.md** - API reference
- **ROADMAP.md** - Development plan

### For Project Management
- **CHANGELOG.md** - Version history
- **This file** - Project summary

---

### 🔐 Design Principles

1. **Read-Only** - No data modifications, only display
2. **Lightweight** - Minimal performance impact, shared requests
3. **Server-Friendly** - Fixed 30s interval, coordinated fetches for 50-100 clients
4. **Secured** - Password-protected API access
5. **Independent** - Multiple windows with isolated state
6. **Resilient** - Graceful error handling with clear messages
7. **Consistent** - Matches MoZ design patterns
8. **Accessible** - Keyboard navigation, screen readers
9. **Transparent** - Clear status indicators and error messages

---

## 🚀 Next Immediate Steps

### As a Developer Starting Phase 1
1. **Copy Assets from MoZ**
   ```bash
   cp ../DMRL-Master-of-Zen/pages/images/* pages/images/
   cp ../DMRL-Master-of-Zen/pages/css/common.css pages/css/
   cp ../DMRL-Master-of-Zen/pages/src/preloads.js pages/src/
   ```

2. **Create Base HTML Template**
   - Use `pages/points-leaderboard.html` from MoZ as reference
   - Create `pages/team-live-scores.html`
   - Include: title bar, controls, content area, status bar

3. **Create Base CSS**
   - Create `pages/css/team-live-scores.css`
   - Dark theme, overlay-friendly
   - Responsive layout

4. **Test Window Loading**
   ```bash
   # Symlink to Sauce mods directory
   ln -s ~/Documents/SauceMods/DMRL-team-live-scores \
         ~/.config/Sauce4Zwift/mods/DMRL-team-live-scores
   
   # Restart Sauce and open window
   ```

5. **Move to Phase 2**
   - Implement `src/api-client.js`
   - Test API connectivity
   - Implement `src/config-manager.js`

---

## 📊 Project Metrics

### Documentation
- **Total Documents**: 10 comprehensive files
- **Total Lines**: ~3,500+ lines
- **Coverage**: Architecture, API, development, user guides

### Code (To Be Written)
- **Estimated Lines**: ~2,000 lines
- **Modules**: 7 JavaScript modules
- **HTML Files**: 4 pages
- **CSS Files**: 3 stylesheets

### Timeline
- **Architecture Phase**: 1 day (complete ✅)
- **Development**: 6 weeks (estimated)
- **Total to v1.0**: ~7 weeks

---

## 🎓 Key Learnings from Architecture Phase

### What Went Well
- ✅ Comprehensive documentation before coding
- ✅ Clear separation of concerns in modules
- ✅ Reusable patterns from MoZ
- ✅ Well-defined API contracts
- ✅ Multiple visual diagrams for clarity

### What to Watch For
- ⚠️ CORS configuration on WordPress
- ⚠️ Performance with multiple windows + fast refresh
- ⚠️ Error handling for network issues
- ⚠️ Category identification consistency (A, B, C vs numeric IDs)
- ⚠️ Cache coherency between server and client

### Dependencies to Verify
- ✓ S4Z-live plugin v0.7.6-beta or higher
- ✓ Master of Zen v0.3.8 or higher
- ✓ WordPress 5.0+ with REST API enabled
- ✓ Sauce for Zwift latest stable

---

## 🤝 Integration Points

### With Master of Zen
- **Relationship**: Sibling mods
- **Interaction**: None direct (both independent)
- **Shared**: CSS styling patterns, Sauce API usage
- **Assumption**: MoZ is running and sending data to WordPress

### With S4Z-live Plugin
- **Relationship**: Consumer of API
- **Interaction**: REST API calls only
- **Shared**: Event IDs, race IDs, team data
- **Requirement**: Plugin must be active and race configured

### With Sauce for Zwift
- **Relationship**: Host platform
- **Interaction**: Window management, storage API
- **Shared**: Mod architecture, manifest format
- **Requirement**: Latest stable Sauce version

---

## 📝 Open Questions / Decisions Needed

1. **License Selection**
   - [ ] Choose license (align with MoZ?)
   - [ ] Add LICENSE file

2. **Race List Access**
   - [ ] Races endpoint requires admin auth
   - [ ] Options: Public endpoint, pre-configured list, or config file?
   - [ ] Decision: Recommend pre-configured race IDs in settings

3. **CORS Handling**
   - [ ] Document WordPress CORS plugin installation
   - [ ] Provide troubleshooting guide
   - [ ] Test with various WordPress configurations

4. **Icon Design**
   - [ ] Use MoZ icon or create new TLS-specific icon?
   - [ ] Decision: Start with MoZ icon, customize later if desired

5. **Release Distribution**
   - [ ] How will users install? (GitHub releases, direct download, etc.)
   - [ ] Auto-update mechanism?
   - [ ] Documentation hosting?

---

## 🎉 Conclusion

We've completed the **architecture phase** of DMRL's Team Live Scores mod. The foundation is solid:

- ✅ **10 comprehensive documentation files**
- ✅ **Clear technical architecture**
- ✅ **Well-defined API contracts**
- ✅ **7-week development roadmap**
- ✅ **Visual diagrams and flows**
- ✅ **Developer onboarding guide**

**Ready for Phase 1 implementation** - copying assets and creating base HTML/CSS templates.

The mod will complete the DMRL scoring ecosystem by providing real-time, in-game team standings displays that update automatically during races. It's designed to be lightweight, reliable, and user-friendly, with support for multiple categories and independent window instances.

---

**Project Status**: Architecture Complete ✅  
**Next Phase**: Core Infrastructure (Week 1)  
**Target Release**: v1.0.0 in ~7 weeks  
**Last Updated**: October 23, 2025

---

**Author**: the.Colonel  
**Organization**: Dirty Mitten Racing League (DMRL)  
**License**: TBD

---

🚴‍♂️ **Let's build something great!** 🚴‍♀️
