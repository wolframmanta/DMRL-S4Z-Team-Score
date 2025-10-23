# 🚀 START HERE - DMRL Team Live Scores

Welcome to **DMRL's Team Live Scores**! This guide will point you to the right documentation based on what you need.

---

## 👤 Who Are You?

Click your role below to jump to your section:
- [I'm an End User](#-for-end-users) - Want to install and use the mod
- [I'm a Developer](#-for-developers) - Want to build or contribute
- [I'm a Project Manager](#-for-project-managers) - Want to track progress
- [I'm Just Curious](#-for-the-curious) - Want to understand what this is

---

## 🎮 For End Users

### What is this?
Team Live Scores displays live team standings during Zwift races. It reads data from WordPress and shows it in an overlay window.

### What do I need?
- Sauce for Zwift (installed)
- WordPress site with S4Z-live plugin
- Master of Zen mod (for scoring)

### Where do I start?
**👉 Read [README.md](README.md)** - Complete installation and usage guide

### Quick Links
- [Installation Instructions](README.md#installation)
- [Setup Guide](README.md#setup)
- [Usage Instructions](README.md#usage)
- [Troubleshooting](README.md#troubleshooting)

---

## 💻 For Developers

### What is this?
A Sauce for Zwift mod that consumes WordPress REST API endpoints to display team standings. Built with vanilla JavaScript, HTML, and CSS.

### What do I need to know?
- JavaScript (ES6+)
- HTML5 & CSS3
- REST APIs
- Async/await patterns

### Where do I start?
**👉 Read these in order:**
1. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - 10-minute overview
2. **[GETTING_STARTED.md](GETTING_STARTED.md)** - Environment setup
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical deep-dive
4. **[DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md)** - Start building!

### Quick Links
- [System Architecture](ARCHITECTURE.md#system-architecture)
- [API Documentation](API_SPECIFICATION.md)
- [Visual Diagrams](DIAGRAMS.md)
- [Development Roadmap](ROADMAP.md)
- [Quick Reference](QUICK_REFERENCE.md)

### Current Status
- **Phase**: 1 - Core Infrastructure (Architecture Complete ✅)
- **Next Task**: Copy base assets from MoZ
- **Target Release**: v1.0.0 in ~7 weeks

---

## 📊 For Project Managers

### What is this?
A 7-week project to build the final component of the DMRL scoring ecosystem. Completes the chain: MoZ → S4Z-live → Team Live Scores.

### Where do I start?
**👉 Read these for project oversight:**
1. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Executive overview
2. **[ROADMAP.md](ROADMAP.md)** - 7-phase development plan
3. **[DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md)** - Progress tracking

### Quick Links
- [Timeline & Phases](ROADMAP.md)
- [Success Criteria](PROJECT_SUMMARY.md#-success-criteria)
- [Risk Assessment](ROADMAP.md#risk-assessment)
- [Version History](CHANGELOG.md)

### Key Metrics
- **Total Effort**: ~7 weeks
- **Phases**: 7 (Infrastructure → Production)
- **Documentation**: 12 files, 100% complete
- **Implementation**: 0% (starting Phase 1)

---

## 🤔 For the Curious

### What is Team Live Scores?
It's a Sauce for Zwift mod that displays real-time team standings during races by reading scores from a WordPress site.

### How does it work?
```
Zwift Race → Master of Zen → WordPress → Team Live Scores
           (calculates)      (aggregates)  (displays)
```

1. **Riders race** in Zwift
2. **Master of Zen** calculates individual scores (FTS, FAL, FIN)
3. **WordPress** (S4Z-live plugin) aggregates into team scores
4. **Team Live Scores** polls WordPress API and displays standings

### What can it do?
- Display live team standings by category (A, B, C, D, E)
- Show individual rider details per team
- Calculate and display league points
- Show stage totals across all categories
- Auto-refresh every 5-60 seconds
- Open multiple independent windows

### Where do I learn more?
**👉 Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete overview

---

## 📚 Complete Documentation Index

### User Documentation
- **[README.md](README.md)** - Installation, setup, usage
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick lookup and troubleshooting

### Developer Documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical design
- **[API_SPECIFICATION.md](API_SPECIFICATION.md)** - WordPress REST API reference
- **[DIAGRAMS.md](DIAGRAMS.md)** - Visual system diagrams
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Developer onboarding
- **[DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md)** - Task tracking

### Project Documentation
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Executive overview
- **[ROADMAP.md](ROADMAP.md)** - Development timeline
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
- **[INDEX.md](INDEX.md)** - Documentation navigation

### Configuration
- **[manifest.json](manifest.json)** - Sauce mod configuration

---

## 🎯 Quick Actions

### I want to...

**...install and use the mod**
→ [README.md](README.md)

**...understand the architecture**
→ [ARCHITECTURE.md](ARCHITECTURE.md)

**...start developing**
→ [GETTING_STARTED.md](GETTING_STARTED.md)

**...see what needs to be done**
→ [DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md)

**...look up an API endpoint**
→ [API_SPECIFICATION.md](API_SPECIFICATION.md)

**...visualize the data flow**
→ [DIAGRAMS.md](DIAGRAMS.md)

**...check project status**
→ [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

**...track progress**
→ [ROADMAP.md](ROADMAP.md)

**...troubleshoot an issue**
→ [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

**...see version history**
→ [CHANGELOG.md](CHANGELOG.md)

**...navigate all docs**
→ [INDEX.md](INDEX.md)

---

## 🚦 Project Status

### Current Phase
**Phase 1: Core Infrastructure** (Week 1)

### Completed
- ✅ Complete architecture documentation
- ✅ System design and planning
- ✅ API specification
- ✅ Development roadmap

### Next Steps
- ⏳ Copy base assets from MoZ
- ⏳ Create HTML templates
- ⏳ Basic CSS styling
- ⏳ Test window loading

### Timeline
- **Started**: October 23, 2025
- **Target v1.0**: ~7 weeks from start
- **Current Week**: 1 of 7

---

## 🤝 Getting Help

### Documentation Questions
- Check **[INDEX.md](INDEX.md)** for complete doc navigation
- Search docs using your editor (Cmd/Ctrl+Shift+F)

### Technical Questions
- Review **[ARCHITECTURE.md](ARCHITECTURE.md)** for design
- Check **[API_SPECIFICATION.md](API_SPECIFICATION.md)** for endpoints
- Look at MoZ code for patterns

### DMRL-Specific Questions
- Contact **the.Colonel**
- Visit https://dirtymittenracing.com

---

## 🎓 Learning Path

### First 30 Minutes
1. Read this file (you are here!)
2. Skim **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
3. Look at **[DIAGRAMS.md](DIAGRAMS.md)** for visuals

### First Hour
4. Read **[README.md](README.md)** or **[ARCHITECTURE.md](ARCHITECTURE.md)** (based on role)
5. Check **[ROADMAP.md](ROADMAP.md)** to understand timeline

### Before Starting Work
6. Read **[GETTING_STARTED.md](GETTING_STARTED.md)** thoroughly
7. Review **[DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md)**
8. Set up your environment

---

## 📊 Project Statistics

### Documentation
- **Total Files**: 12 documentation files
- **Total Lines**: ~4,500+ lines
- **Coverage**: 100% (architecture phase)
- **Last Updated**: October 23, 2025

### Code (To Be Written)
- **Estimated Lines**: ~2,000 lines
- **Modules**: 7 JavaScript modules
- **HTML Files**: 4 pages
- **CSS Files**: 3 stylesheets

### Timeline
- **Phase 1**: Week 1 (Current)
- **Development**: Weeks 2-5
- **Testing**: Week 6
- **Release**: Week 7
- **Total**: ~7 weeks to v1.0

---

## 🎉 Ready to Begin?

### End Users
**👉 Go to [README.md](README.md)**

### Developers
**👉 Go to [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) → [GETTING_STARTED.md](GETTING_STARTED.md)**

### Project Managers
**👉 Go to [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) → [ROADMAP.md](ROADMAP.md)**

### Need a Map?
**👉 Go to [INDEX.md](INDEX.md)**

---

**Welcome to the Team Live Scores project! 🚴‍♂️🚴‍♀️**

---

**Version**: 1.0  
**Last Updated**: October 23, 2025  
**Status**: Architecture Complete ✅  
**Author**: the.Colonel
