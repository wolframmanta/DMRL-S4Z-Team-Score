# WordPress REST API Specification for Team Live Scores

This document details the WordPress REST API endpoints provided by the S4Z-live plugin that Team Live Scores (TLS) will consume.

---

## Base URL

```
{wordpress_site}/wp-json/s4z-team/v1
```

**Example**: `https://dirtymittenracing.com/wp-json/s4z-team/v1`

---

## Authentication

All endpoints require **shared password authentication** via custom header.

- **Authentication Method**: Custom header `X-TLS-Access-Token`
- **Access Control**: Single shared password for all authorized users
  - Password configured in WordPress admin panel (S4Z-live settings)
  - Same password distributed to all vetted users
  - Admin can rotate password if compromised
- **Permission Callback**: Checks `X-TLS-Access-Token` header against stored password
- **Response Codes**:
  - `401 Unauthorized`: Invalid or missing access token
  - `403 Forbidden`: Token valid but user lacks permissions (admin endpoints only)
- **CORS**: WordPress must allow cross-origin requests with custom headers
- **Rate Limiting**: Server enforces 30-second minimum between requests (admin can disable)

---

## Endpoints

### 1. Get Team Standings (by Event ID)

Retrieve live team standings for a race using Zwift Event ID.

**Endpoint**: `GET /team-standings`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_id` | integer | Yes* | Zwift event/subgroup ID |
| `race_id` | integer | Yes* | Internal race ID (alternative to event_id) |
| `nocache` | boolean | No | Force cache bypass (default: false) |

*Either `event_id` OR `race_id` must be provided.

**Example Request**:
```http
GET /wp-json/s4z-team/v1/team-standings?event_id=123456&nocache=true
Headers:
  X-TLS-Access-Token: your-shared-password-here
```

**Response** (200 OK):
```json
{
  "race": {
    "id": 42,
    "name": "DMRL Stage 1",
    "zwift_event_id": 123456,
    "starts_at": "2025-10-23T19:00:00+00:00",
    "team_scoring_mode": "sum_all",
    "team_scoring_mode_label": "Sum of All Riders"
  },
  "categories": [
    {
      "id": "A",
      "label": "A",
      "event_name": "DMRL Stage 1 (A)",
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
          "scoring_rider_ids": [123, 456, 789, 234, 567],
          "league_points": 8,
          "scoring_mode": "sum_all",
          "scoring_mode_label": "Sum of All Riders",
          "riders": [
            {
              "rider_id": 123456,
              "rider_name": "John Doe",
              "points": 45.5,
              "fin": 15.0,
              "fal": 20.5,
              "fts": 10.0,
              "team_id": 1,
              "team_name": "Team Alpha"
            }
          ]
        }
      ],
      "unassigned": [
        {
          "rider_id": 999999,
          "rider_name": "Jane Smith",
          "points": 25.0
        }
      ],
      "unassigned_points": 25.0,
      "updated_at": "2025-10-23T19:45:32+00:00",
      "scoring_mode": "sum_all",
      "scoring_mode_label": "Sum of All Riders"
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
  "generated_at": "2025-10-23T19:45:32+00:00",
  "updated_at": "2025-10-23T19:45:30+00:00",
  "source_sessions": ["session_abc123"],
  "team_lookup": [
    {
      "rider_id": 123456,
      "team_id": 1,
      "team_name": "Team Alpha",
      "rider_name": "John Doe"
    }
  ],
  "scoring_mode": "sum_all",
  "scoring_mode_label": "Sum of All Riders",
  "cache_hit": false
}
```

**Response Fields**:

#### `race` Object
- `id` (integer): Internal race ID
- `name` (string): Race name
- `zwift_event_id` (integer): Zwift event ID
- `starts_at` (string|null): Race start time (ISO 8601)
- `team_scoring_mode` (string): Scoring mode identifier
- `team_scoring_mode_label` (string): Human-readable scoring mode

#### `categories` Array
Array of category-specific standings.

**Category Object**:
- `id` (string): Category identifier (e.g., "A", "B", "C")
- `label` (string): Display label
- `event_name` (string): Full event name with category
- `team_count` (integer): Total teams in category
- `ranked_team_count` (integer): Teams with points
- `teams` (array): Team standings (see Team Object)
- `unassigned` (array): Riders without team assignment
- `unassigned_points` (float): Total points for unassigned riders
- `updated_at` (string): Last update timestamp (ISO 8601)
- `scoring_mode` (string): Scoring mode for category
- `scoring_mode_label` (string): Human-readable mode

**Team Object**:
- `rank` (integer): Position in standings (1-based)
- `team_id` (integer): Unique team ID
- `team_name` (string): Team name
- `team_color` (string|null): Hex color code (e.g., "#FF0000")
- `total_points` (float): Total team points
- `fin_points` (float): Finish points
- `fal_points` (float): Fast At Line points
- `fts_points` (float): Fast Through Segment points
- `rider_count` (integer): Number of riders scored
- `scoring_rider_count` (integer): Riders contributing to team score
- `scoring_rider_ids` (array): IDs of scoring riders
- `league_points` (integer): League points (rank-based)
- `scoring_mode` (string): Scoring mode applied
- `scoring_mode_label` (string): Human-readable mode
- `riders` (array): Individual rider details (see Rider Object)

**Rider Object**:
- `rider_id` (integer): Zwift athlete ID
- `rider_name` (string): Rider name
- `points` (float): Total rider points
- `fin` (float): Finish points
- `fal` (float): Fast At Line points
- `fts` (float): Fast Through Segment points
- `team_id` (integer): Team assignment
- `team_name` (string): Team name

#### `combined` Array
Aggregated standings across all categories.

**Combined Team Object**:
- `rank` (integer): Overall rank
- `team_id` (integer): Team ID
- `team_name` (string): Team name
- `team_color` (string|null): Hex color
- `league_points` (integer): Total league points (sum of category league points)
- `raw_points` (float): Total raw points (sum of category totals)
- `category_points` (object): League points per category (e.g., `{"A": 8, "B": 7}`)

#### Metadata
- `generated_at` (string): Response generation time (ISO 8601)
- `updated_at` (string|null): Last data update time
- `source_sessions` (array): Session IDs used
- `team_lookup` (array): Quick rider→team lookup
- `scoring_mode` (string): Default scoring mode
- `scoring_mode_label` (string): Human-readable mode
- `cache_hit` (boolean): Whether response was cached

**Error Responses**:

```json
// 400 Bad Request - Missing identifier
{
  "code": "missing_identifier",
  "message": "Race ID or Event ID is required.",
  "data": {
    "status": 400
  }
}

// 404 Not Found - Race not found
{
  "code": "race_not_found",
  "message": "Race not found for the requested identifier.",
  "data": {
    "status": 404
  }
}

// 500 Internal Server Error
{
  "code": "not_ready",
  "message": "Race storage is unavailable.",
  "data": {
    "status": 500
  }
}
```

---

### 2. Get Team Standings (by Race ID)

Alternative endpoint using internal race ID.

**Endpoint**: `GET /races/{race_id}/team-standings`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `race_id` | integer | Yes | Internal race ID (in URL path) |
| `nocache` | boolean | No | Force cache bypass |

**Example Request**:
```http
GET /wp-json/s4z-team/v1/races/42/team-standings?nocache=true
```

**Response**: Same as endpoint #1

---

### 3. Get Available Races

Retrieve list of configured races.

**Endpoint**: `GET /races`

**Parameters**: None

**Authentication**: Requires `manage_options` capability (admin only)

**Example Request**:
```http
GET /wp-json/s4z-team/v1/races
```

**Response** (200 OK):
```json
[
  {
    "id": 42,
    "name": "DMRL Stage 1",
    "zwift_event_id": 123456,
    "starts_at": "2025-10-23T19:00:00+00:00",
    "team_scoring_mode": "sum_all",
    "team_scoring_mode_label": "Sum of All Riders",
    "created_at": "2025-10-20T12:00:00+00:00",
    "updated_at": "2025-10-23T18:00:00+00:00"
  },
  {
    "id": 43,
    "name": "DMRL Stage 2",
    "zwift_event_id": 123457,
    "starts_at": "2025-10-24T19:00:00+00:00",
    "team_scoring_mode": "top3",
    "team_scoring_mode_label": "Top 3 Riders",
    "created_at": "2025-10-20T12:00:00+00:00",
    "updated_at": "2025-10-23T18:00:00+00:00"
  }
]
```

**Note**: TLS may need a public version of this endpoint, or rely on pre-configured race IDs.

---

### 4. Get Team Map (Roster)

Retrieve rider→team mapping for a race.

**Endpoint**: `GET /team-map`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_id` | integer | Yes* | Zwift event ID |
| `race_id` | integer | Yes* | Internal race ID |
| `nocache` | boolean | No | Force cache bypass |

*Either `event_id` OR `race_id` must be provided.

**Example Request**:
```http
GET /wp-json/s4z-team/v1/team-map?event_id=123456&nocache=true
```

**Response** (200 OK):
```json
{
  "race": {
    "id": 42,
    "name": "DMRL Stage 1",
    "zwift_event_id": 123456
  },
  "team_map": {
    "123456": {
      "team_id": 1,
      "team_name": "Team Alpha",
      "team_color": "#FF0000",
      "team_slug": "team-alpha"
    },
    "234567": {
      "team_id": 2,
      "team_name": "Team Beta",
      "team_color": "#00FF00",
      "team_slug": "team-beta"
    }
  },
  "assigned_count": 25,
  "unassigned": [
    {
      "rider_id": 999999,
      "rider_name": "Jane Smith"
    }
  ],
  "generated_at": "2025-10-23T19:45:32+00:00",
  "request": {
    "race_id": 42,
    "event_id": 123456
  },
  "cache_hit": false
}
```

**Response Fields**:
- `race` (object): Race metadata
- `team_map` (object): Keyed by rider_id, value is team info
- `assigned_count` (integer): Number of riders assigned to teams
- `unassigned` (array): Riders without team assignment
- `generated_at` (string): Generation timestamp
- `request` (object): Request parameters echoed back
- `cache_hit` (boolean): Cache status

---

### 5. Health Check

Check plugin status and database schema.

**Endpoint**: `GET /health`

**Parameters**: None

**Example Request**:
```http
GET /wp-json/s4z-team/v1/health
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "version": "0.7.6-beta",
  "schema_version": "0.7.4",
  "table_status": {
    "races": "ready",
    "teams": "ready",
    "team_members": "ready"
  },
  "missing_tables": [],
  "wp_rest_namespace": "s4z-team/v1",
  "time": "2025-10-23 19:45:32"
}
```

**Status Values**:
- `ok`: All systems operational
- `degraded`: Some tables missing or issues detected

---

## Scoring Modes

The `team_scoring_mode` field can have these values:

| Mode | Description |
|------|-------------|
| `sum_all` | Sum of all riders' points |
| `top3` | Sum of top 3 riders only |
| `top4` | Sum of top 4 riders only |
| `top5` | Sum of top 5 riders only |
| `average` | Average of all riders' points |
| `average_drop2` | Average after dropping 2 lowest scores |

---

## Caching Behavior

### Server-Side (WordPress)
- **Cache Duration**: 20 seconds (transient)
- **Cache Key**: Based on race_id or event_id
- **Bypass**: Use `nocache=true` parameter
- **Cache Storage**: WordPress transients

### Recommended Client-Side (TLS)
- **Polling Interval**: 10 seconds (default)
- **No Client Cache**: Always fetch fresh data
- **Stale Threshold**: 2× polling interval

---

## Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad request (missing parameters)
- `401`: Unauthorized (invalid/missing access token)
- `403`: Forbidden (valid token but insufficient permissions for admin endpoints)
- `404`: Not found (race/event doesn't exist)
- `429`: Too many requests (rate limit exceeded)
- `500`: Server error

### Error Response Format
```json
{
  "code": "error_identifier",
  "message": "Human-readable error message",
  "data": {
    "status": 400
  }
}
```

### Common Errors
- `missing_identifier`: No race_id or event_id provided
- `race_not_found`: Race doesn't exist in database
- `not_ready`: Plugin not fully initialized
- `rest_forbidden`: Insufficient permissions (admin endpoints)
- `invalid_token`: Missing or invalid X-TLS-Access-Token header
- `rate_limit_exceeded`: Too many requests (minimum 30s between calls)

---

## Rate Limiting

### Client-Side (TLS)
- **Fixed Interval**: 30 seconds (not user-configurable)
- **Shared Request Coordinator**: Single fetch shared across all open windows
- **Request Timeout**: 10 seconds
- **Retry Delay**: 30s, 60s, 120s (respects minimum interval)
- **Expected Load**: 50-100 concurrent clients
- **Manual Refresh**: Also enforces 30-second minimum

### Server-Side (WordPress)
- **Enforced Minimum**: 30 seconds between requests per client
- **Response Code**: `429 Too Many Requests` if limit exceeded
- **Admin Override**: Can disable rate limiting if needed (for testing/emergencies)
- **Tracking**: By IP address or access token (TBD based on implementation)
- **Caching**: 20-second transient cache for standings data
- **Additional Protections**:
  - Consider WordPress caching plugins
  - Use CDN for static assets
  - Enable object caching (Redis/Memcached)
  - Monitor API usage and adjust limits as needed

### Rationale
With 50-100 concurrent clients requesting every 30 seconds, the server will handle:
- **Worst case**: ~100 requests per 30 seconds = ~3.3 requests/second
- **With shared coordinator**: Reduced by ~50% (users with multiple windows)
- **With caching**: Most requests served from 20-second cache

---

## CORS Configuration

WordPress must allow cross-origin requests with custom authentication header.

**Required Headers**:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-TLS-Access-Token
Access-Control-Expose-Headers: X-RateLimit-Remaining, X-RateLimit-Reset
```

**WordPress Plugin** (required for S4Z-live):
```php
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-TLS-Access-Token');
        header('Access-Control-Expose-Headers: X-RateLimit-Remaining, X-RateLimit-Reset');
        return $value;
    });
}, 15);
```

**Authentication Check** (to be added to S4Z-live):
```php
function s4z_tls_check_access_token() {
    $provided_token = $_SERVER['HTTP_X_TLS_ACCESS_TOKEN'] ?? '';
    $valid_token = get_option('s4z_tls_access_token', '');
    
    if (empty($valid_token)) {
        return true; // No token configured, allow access
    }
    
    if (empty($provided_token) || $provided_token !== $valid_token) {
        return new WP_Error(
            'invalid_token',
            'Invalid or missing access token. Contact DMRL admin for access password.',
            array('status' => 401)
        );
    }
    
    return true;
}

// Add to all TLS endpoints
'permission_callback' => 's4z_tls_check_access_token'
```

**Rate Limiting** (to be added to S4Z-live):
```php
function s4z_tls_check_rate_limit() {
    // Check if rate limiting is enabled (admin can disable)
    if (!get_option('s4z_tls_rate_limiting_enabled', true)) {
        return true;
    }
    
    $client_id = $_SERVER['REMOTE_ADDR']; // Or use token
    $last_request = get_transient("s4z_tls_ratelimit_{$client_id}");
    
    if ($last_request && (time() - $last_request) < 30) {
        return new WP_Error(
            'rate_limit_exceeded',
            'Too many requests. Please wait 30 seconds between requests.',
            array('status' => 429)
        );
    }
    
    set_transient("s4z_tls_ratelimit_{$client_id}", time(), 60);
    return true;
}
```

---

## Testing with curl

### Get Team Standings
```bash
curl -X GET \
  'https://your-site.com/wp-json/s4z-team/v1/team-standings?event_id=123456&nocache=true' \
  -H 'Accept: application/json'
```

### Get Races (requires auth)
```bash
curl -X GET \
  'https://your-site.com/wp-json/s4z-team/v1/races' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Accept: application/json'
```

### Health Check
```bash
curl -X GET \
  'https://your-site.com/wp-json/s4z-team/v1/health' \
  -H 'Accept: application/json'
```

### Test CORS
```bash
curl -X OPTIONS \
  'https://your-site.com/wp-json/s4z-team/v1/team-standings' \
  -H 'Origin: http://localhost' \
  -H 'Access-Control-Request-Method: GET' \
  -v
```

---

## Example Integration (JavaScript)

```javascript
// API Client implementation with authentication
class TLSApiClient {
  constructor(baseUrl, accessToken) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.namespace = '/wp-json/s4z-team/v1';
    this.accessToken = accessToken;
  }
  
  setAccessToken(token) {
    this.accessToken = token;
  }

  async fetchTeamStandings(eventId, options = {}) {
    const params = new URLSearchParams({
      event_id: eventId,
      nocache: options.nocache !== false ? 'true' : 'false'
    });
    
    const url = `${this.baseUrl}${this.namespace}/team-standings?${params}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'X-TLS-Access-Token': this.accessToken
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        throw new Error('AUTH_REQUIRED: Invalid or expired access token');
      }
      
      if (response.status === 429) {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        throw new Error(`RATE_LIMITED: Too many requests. Try again after ${resetTime || '30 seconds'}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  async fetchTeamMap(eventId) {
    const params = new URLSearchParams({
      event_id: eventId,
      nocache: 'true'
    });
    
    const url = `${this.baseUrl}${this.namespace}/team-map?${params}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  }

  async checkHealth() {
    const url = `${this.baseUrl}${this.namespace}/health`;
    const response = await fetch(url);
    return await response.json();
  }
}

// Usage
const client = new TLSApiClient('https://dirtymittenracing.com');
const standings = await client.fetchTeamStandings(123456);
console.log(standings.categories[0].teams);
```

---

## Changelog

### Version 0.7.6-beta (Current)
- Team standings endpoint with category support
- Combined standings for stage totals
- Team map for roster lookups
- Caching with nocache parameter
- League points calculation

---

## Support

For API issues or questions:
- **S4Z-live Plugin**: Check WordPress error logs
- **TLS Mod**: Check browser console
- **DMRL Admin**: Contact the.Colonel

---

**Document Version**: 1.0  
**Last Updated**: October 23, 2025  
**Plugin Version**: S4Z-live 0.7.6-beta
