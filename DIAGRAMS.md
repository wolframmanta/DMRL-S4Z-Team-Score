# DMRL Team Live Scores - System Diagrams

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DMRL Race Scoring System                     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │
│  Zwift Race  │────▶│ Master of    │────▶│  WordPress   │
│              │     │ Zen (MoZ)    │     │  (S4Z-live)  │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  │ REST API
                                                  ▼
                                         ┌──────────────┐
                                         │  Team Live   │
                                         │  Scores      │
                                         │  (TLS Mod)   │
                                         └──────────────┘
```

---

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                          Data Flow Path                             │
└────────────────────────────────────────────────────────────────────┘

1. RACE EXECUTION
   ┌──────────────┐
   │ Riders race  │  Individual riders compete in Zwift
   │ in Zwift     │  on specified route with segments
   └──────┬───────┘
          │
          │ Game state updates
          ▼
   ┌──────────────┐
   │ Master of    │  Watches game state via Sauce
   │ Zen watches  │  Calculates FTS/FAL/FIN scores
   └──────┬───────┘  Tracks segment times and positions
          │
          │ HTTP POST
          ▼
   ┌──────────────┐
   │ WordPress    │  Receives individual scores
   │ S4Z-live     │  Stores in buffer (s4z_buffer_v2)
   └──────┬───────┘  Groups by category/session
          │
          │
          ▼

2. TEAM AGGREGATION (WordPress)
   ┌──────────────┐
   │ Team Roster  │  Rider → Team mapping
   │ Database     │  Team colors and names
   └──────┬───────┘
          │
          │ Lookup
          ▼
   ┌──────────────┐
   │ Team Scoring │  Aggregates rider scores by team
   │ Engine       │  Applies scoring mode (sum_all, top3, etc.)
   └──────┬───────┘  Calculates league points
          │
          │ Group by category
          ▼
   ┌──────────────┐
   │ REST API     │  Exposes team standings
   │ Endpoints    │  20-second transient cache
   └──────┬───────┘  JSON responses
          │
          │
          ▼

3. DISPLAY (TLS Mod)
   ┌──────────────┐
   │ Auto-Refresh │  Polls every 5-60 seconds
   │ Timer        │  nocache=true parameter
   └──────┬───────┘
          │
          │ HTTP GET
          ▼
   ┌──────────────┐
   │ API Client   │  Fetches team standings
   │              │  Handles errors and retries
   └──────┬───────┘
          │
          │ Parse JSON
          ▼
   ┌──────────────┐
   │ Renderer     │  Updates DOM elements
   │              │  Shows teams, riders, points
   └──────────────┘  Displays status indicators
```

---

## Component Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                 Team Live Scores - Internal Structure               │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  HTML Pages                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  team-live-scores.html           stage-totals.html              │
│  ┌─────────────────┐             ┌─────────────────┐            │
│  │ Title Bar       │             │ Title Bar       │            │
│  ├─────────────────┤             ├─────────────────┤            │
│  │ Controls:       │             │ Controls:       │            │
│  │ - Race Select   │             │ - Race Select   │            │
│  │ - Cat Select    │             │ - Refresh       │            │
│  │ - Auto-Refresh  │             │ - Auto-Refresh  │            │
│  ├─────────────────┤             ├─────────────────┤            │
│  │ Team Standings: │             │ Combined Table: │            │
│  │ - Rank          │             │ - Rank          │            │
│  │ - Team Name     │             │ - Team Name     │            │
│  │ - Points        │             │ - League Pts    │            │
│  │ - [Expand]      │             │ - Category Pts  │            │
│  ├─────────────────┤             ├─────────────────┤            │
│  │ Status Bar      │             │ Status Bar      │            │
│  └─────────────────┘             └─────────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  JavaScript Modules                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ api-client   │    │ config-mgr   │    │ auto-refresh │      │
│  │              │    │              │    │              │      │
│  │ - fetch()    │◀───│ - load()     │───▶│ - start()    │      │
│  │ - retry()    │    │ - save()     │    │ - stop()     │      │
│  │ - cancel()   │    │ - migrate()  │    │ - setInt()   │      │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘      │
│         │                                        │              │
│         │                                        │              │
│         ▼                                        ▼              │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            Data Flow Coordinator                      │      │
│  └──────────────────┬───────────────────────────────────┘      │
│                     │                                           │
│         ┌───────────┴───────────┐                               │
│         │                       │                               │
│         ▼                       ▼                               │
│  ┌──────────────┐        ┌──────────────┐                      │
│  │ team-        │        │ stage-       │                      │
│  │ renderer     │        │ renderer     │                      │
│  │              │        │              │                      │
│  │ - render()   │        │ - render()   │                      │
│  │ - expand()   │        │ - breakdown()│                      │
│  │ - update()   │        │ - update()   │                      │
│  └──────┬───────┘        └──────┬───────┘                      │
│         │                       │                               │
│         └───────────┬───────────┘                               │
│                     ▼                                           │
│              ┌──────────────┐                                   │
│              │     DOM      │                                   │
│              └──────────────┘                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Race Selection Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                     Race Selection Sequence                         │
└────────────────────────────────────────────────────────────────────┘

User Opens Window
       │
       ▼
┌──────────────┐
│ Load Config  │  Read saved race_id from storage
└──────┬───────┘  Get WordPress URL
       │
       ▼
┌──────────────┐
│ Fetch Races  │  GET /wp-json/s4z-team/v1/races
└──────┬───────┘  Returns list of configured races
       │
       ▼
┌──────────────┐
│ Populate     │  Fill <select> with race options
│ Dropdown     │  Set selected = saved race_id
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ User Selects │◀─┐
│ Different    │  │
│ Race         │  │
└──────┬───────┘  │
       │          │
       ▼          │
┌──────────────┐  │
│ Save Race ID │  │
│ to Config    │  │
└──────┬───────┘  │
       │          │
       ▼          │
┌──────────────┐  │
│ Fetch Team   │  │  GET /wp-json/s4z-team/v1/races/{id}/team-standings
│ Standings    │  │
└──────┬───────┘  │
       │          │
       ▼          │
┌──────────────┐  │
│ Extract      │  │
│ Categories   │  │  Parse response.categories[]
└──────┬───────┘  │
       │          │
       ▼          │
┌──────────────┐  │
│ Populate Cat │  │
│ Dropdown     │  │  A, B, C, D, E, etc.
└──────┬───────┘  │
       │          │
       ▼          │
┌──────────────┐  │
│ Render Teams │  │
│ for Category │  │
└──────┬───────┘  │
       │          │
       ▼          │
┌──────────────┐  │
│ Start Auto-  │  │
│ Refresh      │──┘  Loop back every N seconds
└──────────────┘
```

---

## Category Selection Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                    Category Filtering Logic                         │
└────────────────────────────────────────────────────────────────────┘

Team Standings Response
       │
       ▼
{
  "categories": [
    {"id": "A", "label": "A", "teams": [...]},
    {"id": "B", "label": "B", "teams": [...]},
    {"id": "C", "label": "C", "teams": [...]}
  ]
}
       │
       ▼
┌──────────────┐
│ Extract      │  categories.map(cat => cat.id)
│ Category IDs │  → ["A", "B", "C"]
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Populate     │  <option value="A">A</option>
│ <select>     │  <option value="B">B</option>
└──────┬───────┘  <option value="C">C</option>
       │
       ▼
┌──────────────┐
│ User Selects │
│ Category "B" │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Filter Teams │  const selectedCat = categories.find(c => c.id === "B")
│              │  const teams = selectedCat.teams
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Render Teams │  Display only "B" teams
│ for "B"      │  Hide other categories
└──────────────┘
```

---

## Auto-Refresh Mechanism

```
┌────────────────────────────────────────────────────────────────────┐
│                    Auto-Refresh State Machine                       │
└────────────────────────────────────────────────────────────────────┘

              ┌─────────────┐
       ┌──────│   STOPPED   │◀──────┐
       │      └─────────────┘       │
       │                            │
       │ start()                    │ stop()
       │                            │
       ▼                            │
┌─────────────┐              ┌─────────────┐
│  STARTING   │              │  STOPPING   │
└──────┬──────┘              └──────▲──────┘
       │                            │
       │ Timer set                  │ Timer cleared
       │                            │
       ▼                            │
┌─────────────┐                     │
│   RUNNING   │─────────────────────┘
└──────┬──────┘   User toggle/error
       │
       │ Interval expires
       │
       ▼
┌─────────────┐
│  FETCHING   │  Call API
└──────┬──────┘
       │
       ├──────────┬──────────┐
       │          │          │
       ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │Success │ │ Error  │ │Timeout │
   └───┬────┘ └───┬────┘ └───┬────┘
       │          │          │
       │          │          │
       └──────────┴──────────┘
                  │
                  ▼
           ┌─────────────┐
           │   UPDATE    │  Render new data
           │     DOM     │  Update timestamp
           └──────┬──────┘  Show status
                  │
                  ▼
           ┌─────────────┐
           │   WAITING   │  Wait for next interval
           └──────┬──────┘
                  │
                  └──────────┐
                            │
         Interval expires    │
                            │
                  ┌─────────┘
                  │
                  ▼
           Back to FETCHING
```

---

## Error Handling Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                     Error Recovery Strategy                         │
└────────────────────────────────────────────────────────────────────┘

API Request Fails
       │
       ├──────────┬──────────┬──────────┐
       │          │          │          │
       ▼          ▼          ▼          ▼
   Network    404 Race   401 Auth   500 Server
   Timeout    Not Found  Required   Error
       │          │          │          │
       │          │          │          │
       ▼          ▼          ▼          ▼
┌─────────────────────────────────────────┐
│      Classify Error Type                │
└─────────────┬───────────────────────────┘
              │
              ├─────────────────┬─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
      Transient (retry)    Fatal (show error)  Auth (prompt)
              │                 │                 │
              │                 │                 │
              ▼                 ▼                 ▼
      ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
      │ Retry Logic  │   │ Show Error   │  │ Open Settings│
      │              │   │ Message      │  │ Window       │
      │ Wait 5s      │   │              │  │              │
      │ Wait 10s     │   │ Disable      │  │ Prompt User  │
      │ Wait 20s     │   │ Auto-Refresh │  │ for Creds    │
      └──────┬───────┘   └──────────────┘  └──────────────┘
             │
             │ Max retries?
             │
      ┌──────┴───────┐
      │              │
      ▼              ▼
    Success       Failed
      │              │
      │              ▼
      │       ┌──────────────┐
      │       │ Show Fatal   │
      └──────▶│ Error        │
              │ Stop Refresh │
              └──────────────┘
```

---

## Window Independence

```
┌────────────────────────────────────────────────────────────────────┐
│              Multiple Independent Window Instances                  │
└────────────────────────────────────────────────────────────────────┘

┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│ Window 1          │  │ Window 2          │  │ Window 3          │
│                   │  │                   │  │                   │
│ Race: DMRL Stage1 │  │ Race: DMRL Stage1 │  │ Race: DMRL Stage2 │
│ Category: A       │  │ Category: B       │  │ Category: A       │
│ Refresh: 10s      │  │ Refresh: 15s      │  │ Refresh: 10s      │
│                   │  │                   │  │                   │
│ ┌───────────────┐ │  │ ┌───────────────┐ │  │ ┌───────────────┐ │
│ │ Team Alpha    │ │  │ │ Team Beta     │ │  │ │ Team Gamma    │ │
│ │ 150.5 pts     │ │  │ │ 145.0 pts     │ │  │ │ 160.0 pts     │ │
│ └───────────────┘ │  │ └───────────────┘ │  │ └───────────────┘ │
│                   │  │                   │  │                   │
└─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Shared Storage (sauce.storage)                │
├─────────────────────────────────────────────────────────────────┤
│  tls_window_1: {race_id: 1, category: "A", interval: 10}        │
│  tls_window_2: {race_id: 1, category: "B", interval: 15}        │
│  tls_window_3: {race_id: 2, category: "A", interval: 10}        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │
                                 ▼
                      ┌───────────────────┐
                      │  WordPress REST   │
                      │       API         │
                      └───────────────────┘
```

---

## Performance Optimization

```
┌────────────────────────────────────────────────────────────────────┐
│                    Rendering Optimization                           │
└────────────────────────────────────────────────────────────────────┘

New Data Arrives
       │
       ▼
┌──────────────┐
│ Compare with │  Diff current state vs new data
│ Previous     │  Identify changed teams/riders
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ No Changes?  │───Yes───▶ Update timestamp only
└──────┬───────┘
       │ No
       ▼
┌──────────────┐
│ Identify     │  Find DOM nodes to update
│ Changed Rows │  teamRows.filter(changed)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Batch DOM    │  Use DocumentFragment
│ Updates      │  Minimize reflows
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Apply CSS    │  Transition animations
│ Transitions  │  Highlight changed values
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Update       │  Store new state
│ Previous     │  For next comparison
│ State        │
└──────────────┘
```

---

**Document Version**: 1.0  
**Last Updated**: October 23, 2025
