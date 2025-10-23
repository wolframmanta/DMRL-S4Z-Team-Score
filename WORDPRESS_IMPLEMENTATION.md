# WordPress Implementation Guide - S4Z-live Plugin Updates

This document details the WordPress/PHP code that needs to be added to the S4Z-live plugin to support Team Live Scores authentication and rate limiting.

---

## Overview

**Requirements:**
1. Password-based access control via custom header
2. Admin UI for password management
3. Server-side rate limiting (30-second minimum)
4. Enhanced CORS headers
5. Clear error messages for auth failures

**Expected Load:** 50-100 concurrent clients with 30-second refresh intervals = ~3 requests/second peak

---

## 1. Admin Settings Panel

Add password configuration to S4Z-live admin panel.

### File: `modules/team-scoring/includes/admin.php`

```php
<?php
/**
 * Add TLS Access Control settings to admin panel
 */
function s4z_team_scoring_register_tls_settings() {
    add_settings_section(
        's4z_tls_access_section',
        __('Team Live Scores Access Control', 's4z-team-scoring'),
        's4z_team_scoring_tls_section_callback',
        's4z-team-scoring'
    );

    register_setting('s4z_team_scoring_settings', 's4z_tls_access_token', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default' => '',
    ]);

    add_settings_field(
        's4z_tls_access_token',
        __('TLS Access Password', 's4z-team-scoring'),
        's4z_team_scoring_tls_token_field',
        's4z-team-scoring',
        's4z_tls_access_section'
    );

    register_setting('s4z_team_scoring_settings', 's4z_tls_rate_limiting_enabled', [
        'type' => 'boolean',
        'sanitize_callback' => 'rest_sanitize_boolean',
        'default' => true,
    ]);

    add_settings_field(
        's4z_tls_rate_limiting',
        __('Enable Rate Limiting', 's4z-team-scoring'),
        's4z_team_scoring_tls_rate_limit_field',
        's4z-team-scoring',
        's4z_tls_access_section'
    );
}
add_action('admin_init', 's4z_team_scoring_register_tls_settings');

function s4z_team_scoring_tls_section_callback() {
    echo '<p>' . esc_html__(
        'Configure access control for the Team Live Scores Sauce mod. Set a shared password that authorized users must enter in their mod settings.',
        's4z-team-scoring'
    ) . '</p>';
    echo '<p><strong>' . esc_html__(
        'Important: Share this password only with vetted users. Change it if compromised.',
        's4z-team-scoring'
    ) . '</strong></p>';
}

function s4z_team_scoring_tls_token_field() {
    $value = get_option('s4z_tls_access_token', '');
    ?>
    <input 
        type="password" 
        name="s4z_tls_access_token" 
        value="<?php echo esc_attr($value); ?>"
        class="regular-text"
        autocomplete="off"
    />
    <p class="description">
        <?php esc_html_e('Leave empty to disable access control (not recommended).', 's4z-team-scoring'); ?>
    </p>
    <?php if (!empty($value)): ?>
    <p class="description">
        <strong><?php esc_html_e('Current password is set. Enter new password to change.', 's4z-team-scoring'); ?></strong>
    </p>
    <?php endif;
}

function s4z_team_scoring_tls_rate_limit_field() {
    $enabled = get_option('s4z_tls_rate_limiting_enabled', true);
    ?>
    <label>
        <input 
            type="checkbox" 
            name="s4z_tls_rate_limiting_enabled" 
            value="1"
            <?php checked($enabled, true); ?>
        />
        <?php esc_html_e('Enforce 30-second minimum between requests per client', 's4z-team-scoring'); ?>
    </label>
    <p class="description">
        <?php esc_html_e('Recommended: Keep enabled to prevent server overload. Disable only for testing.', 's4z-team-scoring'); ?>
    </p>
    <?php
}
```

---

## 2. Authentication Function

Add password verification function.

### File: `modules/team-scoring/includes/auth.php` (new file)

```php
<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Check if request has valid TLS access token.
 *
 * @return bool|WP_Error True if authorized, WP_Error if not
 */
function s4z_tls_check_access_token() {
    // Get configured password
    $valid_token = get_option('s4z_tls_access_token', '');
    
    // If no password configured, allow access (backwards compatibility)
    if (empty($valid_token)) {
        return true;
    }
    
    // Get token from request header
    $provided_token = '';
    if (isset($_SERVER['HTTP_X_TLS_ACCESS_TOKEN'])) {
        $provided_token = sanitize_text_field($_SERVER['HTTP_X_TLS_ACCESS_TOKEN']);
    }
    
    // Check if token matches
    if (empty($provided_token)) {
        return new WP_Error(
            'missing_token',
            __('Access token required. Please enter your access password in the Team Live Scores settings. Contact a DMRL Jedi if you need the current password.', 's4z-team-scoring'),
            array('status' => 401)
        );
    }
    
    if ($provided_token !== $valid_token) {
        return new WP_Error(
            'invalid_token',
            __('Invalid access token. Your password may have changed or expired. Please contact a DMRL Jedi for the current password.', 's4z-team-scoring'),
            array('status' => 401)
        );
    }
    
    return true;
}

/**
 * Combined permission check: access token + rate limiting
 *
 * @return bool|WP_Error
 */
function s4z_tls_permission_callback() {
    // Check authentication
    $auth_result = s4z_tls_check_access_token();
    if (is_wp_error($auth_result)) {
        return $auth_result;
    }
    
    // Check rate limiting
    $rate_result = s4z_tls_check_rate_limit();
    if (is_wp_error($rate_result)) {
        return $rate_result;
    }
    
    return true;
}
```

---

## 3. Rate Limiting Function

Enforce 30-second minimum between requests.

### File: `modules/team-scoring/includes/auth.php` (continued)

```php
/**
 * Check if client is respecting rate limits.
 *
 * @return bool|WP_Error True if allowed, WP_Error if rate limited
 */
function s4z_tls_check_rate_limit() {
    // Check if rate limiting is enabled
    if (!get_option('s4z_tls_rate_limiting_enabled', true)) {
        return true;
    }
    
    // Identify client (use IP + User-Agent hash for better uniqueness)
    $client_id = s4z_tls_get_client_id();
    
    // Get last request time for this client
    $transient_key = "s4z_tls_ratelimit_{$client_id}";
    $last_request = get_transient($transient_key);
    
    $now = time();
    $min_interval = 30; // seconds
    
    if ($last_request !== false) {
        $elapsed = $now - $last_request;
        
        if ($elapsed < $min_interval) {
            $retry_after = $min_interval - $elapsed;
            
            return new WP_Error(
                'rate_limit_exceeded',
                sprintf(
                    __('Too many requests. Please wait %d seconds before trying again.', 's4z-team-scoring'),
                    $retry_after
                ),
                array(
                    'status' => 429,
                    'retry_after' => $retry_after,
                )
            );
        }
    }
    
    // Update last request time (expires after 60 seconds)
    set_transient($transient_key, $now, 60);
    
    return true;
}

/**
 * Generate unique client ID for rate limiting.
 *
 * @return string Hashed client identifier
 */
function s4z_tls_get_client_id() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    // Use hash to avoid storing IP directly
    return md5($ip . '|' . $user_agent);
}

/**
 * Add rate limit headers to response.
 *
 * @param WP_REST_Response $response Response object
 * @return WP_REST_Response Modified response
 */
function s4z_tls_add_rate_limit_headers($response) {
    if (!get_option('s4z_tls_rate_limiting_enabled', true)) {
        return $response;
    }
    
    $client_id = s4z_tls_get_client_id();
    $transient_key = "s4z_tls_ratelimit_{$client_id}";
    $last_request = get_transient($transient_key);
    
    if ($last_request !== false) {
        $elapsed = time() - $last_request;
        $remaining = max(0, 30 - $elapsed);
        
        $response->header('X-RateLimit-Limit', '1');
        $response->header('X-RateLimit-Remaining', $remaining > 0 ? '0' : '1');
        $response->header('X-RateLimit-Reset', $last_request + 30);
    }
    
    return $response;
}
```

---

## 4. Update REST Routes

Modify existing REST endpoints to use new authentication.

### File: `modules/team-scoring/includes/rest.php`

```php
// UPDATE existing register_rest_route calls

// Example: Team Standings endpoint
register_rest_route(
    S4Z_TEAM_SCORING_REST_NAMESPACE,
    '/team-standings',
    array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 's4z_team_scoring_rest_get_team_standings',
            'permission_callback' => 's4z_tls_permission_callback', // CHANGED
            'args'                => array(
                'race_id' => array(
                    'type'              => 'integer',
                    'required'          => false,
                    'sanitize_callback' => 'absint',
                ),
                'event_id' => array(
                    'type'              => 'integer',
                    'required'          => false,
                    'sanitize_callback' => 'absint',
                ),
                'nocache' => array(
                    'type'              => 'boolean',
                    'required'          => false,
                ),
            ),
        ),
    )
);

// Add filter to include rate limit headers
add_filter('rest_post_dispatch', 's4z_tls_add_rate_limit_headers', 10, 1);
```

**Apply `'permission_callback' => 's4z_tls_permission_callback'` to these endpoints:**
- `/team-standings`
- `/races/{race_id}/team-standings`
- `/team-map`
- `/races` (if making public - currently requires admin)

---

## 5. Enhanced CORS Headers

Update CORS configuration to allow custom auth header.

### File: `modules/team-scoring/includes/rest.php` (or main plugin file)

```php
/**
 * Add CORS headers for TLS mod support
 */
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($served) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-TLS-Access-Token');
        header('Access-Control-Expose-Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
        header('Access-Control-Allow-Credentials: false');
        
        return $served;
    });
}, 15);

/**
 * Handle OPTIONS preflight requests
 */
add_action('rest_api_init', function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit;
    }
});
```

---

## 6. Load New Files

Update main module file to load authentication functions.

### File: `modules/team-scoring/class-s4z-team-scoring.php`

```php
function s4z_team_scoring_require_files(): void {
    $includes = array(
        'includes/scoring.php',
        'includes/db.php',
        'includes/standings.php',
        'includes/auth.php',      // ADD THIS
        'includes/rest.php',
        'includes/admin.php',
    );

    foreach ($includes as $relative_path) {
        $full_path = S4Z_TEAM_SCORING_PATH . $relative_path;

        if (file_exists($full_path)) {
            require_once $full_path;
        } else {
            error_log(sprintf('[s4z-team-scoring] Missing include: %s', $relative_path));
        }
    }
}
```

---

## 7. Testing

### Test Authentication

```bash
# Test with valid password
curl -H "X-TLS-Access-Token: your-password" \
     https://your-site.com/wp-json/s4z-team/v1/team-standings?event_id=123

# Test with invalid password (should return 401)
curl -H "X-TLS-Access-Token: wrong-password" \
     https://your-site.com/wp-json/s4z-team/v1/team-standings?event_id=123

# Test without password (should return 401)
curl https://your-site.com/wp-json/s4z-team/v1/team-standings?event_id=123
```

### Test Rate Limiting

```bash
# Make 3 rapid requests (3rd should return 429)
for i in {1..3}; do
  echo "Request $i:"
  curl -H "X-TLS-Access-Token: your-password" \
       https://your-site.com/wp-json/s4z-team/v1/team-standings?event_id=123
  echo ""
done
```

### Test CORS

```bash
# OPTIONS preflight with custom header
curl -X OPTIONS \
     -H "Origin: http://localhost" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-TLS-Access-Token" \
     -v \
     https://your-site.com/wp-json/s4z-team/v1/team-standings
```

---

## 8. Admin UI Screenshot

After implementation, the S4Z-live admin panel should show:

```
┌────────────────────────────────────────────────────────────┐
│ Team Live Scores Access Control                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Configure access control for the Team Live Scores Sauce   │
│ mod. Set a shared password that authorized users must     │
│ enter in their mod settings.                              │
│                                                            │
│ Important: Share this password only with vetted users.    │
│ Change it if compromised.                                 │
│                                                            │
│ TLS Access Password                                       │
│ [••••••••••••••]                                          │
│ Leave empty to disable access control (not recommended).  │
│                                                            │
│ ☑ Enable Rate Limiting                                    │
│ Enforce 30-second minimum between requests per client     │
│ Recommended: Keep enabled to prevent server overload.     │
│ Disable only for testing.                                 │
│                                                            │
│                                       [Save Changes]       │
└────────────────────────────────────────────────────────────┘
```

---

## 9. Security Considerations

### Password Storage
- Stored as plain text in WordPress options (acceptable for this use case)
- Not hashed since it's a shared secret, not user passwords
- Admin-only access to settings panel
- Consider using `wp-config.php` constant for extra security:

```php
// Optional: Define in wp-config.php instead
define('S4Z_TLS_ACCESS_TOKEN', 'your-secret-password');

// Then in auth.php:
function s4z_tls_check_access_token() {
    $valid_token = defined('S4Z_TLS_ACCESS_TOKEN') 
        ? S4Z_TLS_ACCESS_TOKEN 
        : get_option('s4z_tls_access_token', '');
    // ... rest of function
}
```

### Rate Limiting
- Tracks by IP + User-Agent hash
- Transients auto-expire after 60 seconds
- Admin can disable for emergencies
- Consider adding IP whitelist for trusted IPs if needed

### CORS
- Allows all origins (`*`) since auth is via header
- Could restrict to specific origins if desired
- Credentials not needed (no cookies)

---

## 10. Migration Notes

### For Existing Users
- If password is not set, endpoints remain open (backwards compatible)
- Once password is set, all TLS mod users must update their settings
- Consider notification system to alert users of password changes

### Deployment
1. Deploy S4Z-live plugin update
2. Set password in admin panel
3. Distribute password to authorized users via secure channel
4. Users update TLS mod settings with password
5. Monitor error logs for failed auth attempts

---

## 11. Monitoring

### WordPress Error Log
```php
// Add logging for auth failures (optional)
function s4z_tls_log_auth_failure($client_id, $reason) {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log(sprintf(
            '[TLS Auth] Failed attempt from %s: %s',
            $client_id,
            $reason
        ));
    }
}
```

### Metrics to Track
- Failed authentication attempts
- Rate limit violations
- Peak concurrent requests
- Average response times

---

## Summary

**Files to Create:**
- `modules/team-scoring/includes/auth.php`

**Files to Modify:**
- `modules/team-scoring/includes/admin.php` - Add settings UI
- `modules/team-scoring/includes/rest.php` - Update permission callbacks, add CORS
- `modules/team-scoring/class-s4z-team-scoring.php` - Require auth.php

**Admin Configuration:**
1. Navigate to S4Z-live settings
2. Set TLS Access Password
3. Enable/disable rate limiting as needed
4. Save changes
5. Distribute password to authorized users

**Expected Behavior:**
- Unauthorized requests return 401 with clear error message
- Rate-limited requests return 429 with retry-after info
- Valid requests process normally
- All windows share authentication state
- Server handles 50-100 concurrent clients comfortably

---

**Last Updated**: October 23, 2025  
**Version**: 1.0  
**Target Plugin**: S4Z-live v0.7.7+
