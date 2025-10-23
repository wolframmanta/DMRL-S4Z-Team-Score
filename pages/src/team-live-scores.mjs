/**
 * Team Live Scores - Main Application
 * Uses Sauce4Zwift common module and localStorage for settings
 */

import * as common from '/pages/src/common.mjs';

const API_BASE_URL = 'https://dirtymittenracing.com';
const REFRESH_INTERVAL = 30000; // 30 seconds

let currentCategory = '';
let refreshTimer = null;
let lastRequestTime = 0;
let cachedData = null; // Cache the data so we can re-render when category changes

// Storage keys
const STORAGE_KEYS = {
  PASSWORD: 'tls_access_password',
  CATEGORY: 'tls_selected_category',
};

/**
 * Update status text
 */
function updateStatus(text) {
  const statusText = document.getElementById('statusText');
  if (statusText) {
    statusText.textContent = text;
  }
}

/**
 * Setup settings link to open in new window
 */
function setupSettingsLink() {
  const settingsLink = document.querySelector('a.open-settings');
  if (settingsLink) {
    settingsLink.addEventListener('click', (e) => {
      e.preventDefault();
      const href = settingsLink.getAttribute('href');
      window.open(href, '_blank');
    });
  }
}

/**
 * Initialize the application
 */
async function initialize() {
  console.log('[TLS] Initializing Team Live Scores - Auto-loading current live race');
  console.log('[TLS] cachedData initial value:', cachedData);
  
  try {
    updateStatus('Initializing...');
    console.log('[TLS] Status updated to Initializing');
    
    // Make titlebar always visible (like MoZ)
    const titlebar = document.querySelector('#titlebar');
    if (titlebar) {
      titlebar.classList.add('always-visible');
      console.log('[TLS] Titlebar set to always-visible');
    }
    
    // Setup settings link handler
    setupSettingsLink();
    console.log('[TLS] Settings link configured');
    
    // Apply display settings
    await applyDisplaySettings();
    console.log('[TLS] Display settings applied');
    
    // Check if we have a password
    const password = localStorage.getItem(STORAGE_KEYS.PASSWORD);
    console.log('[TLS] Password check:', password ? 'Found' : 'Not found');
    if (!password) {
      showError('Please configure your access password in settings');
      updateStatus('Not configured');
      return;
    }
    
    // Load saved category filter
    currentCategory = localStorage.getItem(STORAGE_KEYS.CATEGORY) || '';
    console.log('[TLS] Loaded category filter:', currentCategory || 'All Categories');
    if (currentCategory) {
      const categorySelect = document.getElementById('categorySelect');
      if (categorySelect) {
        categorySelect.value = currentCategory;
      }
    }
    
    // Setup UI
    setupEventListeners();
    console.log('[TLS] Event listeners setup complete');
    
    updateStatus('Loading standings...');
    
    // Load current live race standings immediately
    await loadTeamStandings();
    console.log('[TLS] Standings loaded');
    
    updateStatus('Ready');
    console.log('[TLS] Initialization complete');
    
    // Setup auto-refresh
    startAutoRefresh();
    
  } catch (error) {
    console.error('[TLS] Initialization error:', error);
    console.error('[TLS] Error stack:', error.stack);
    showError(`Initialization failed: ${error.message}`);
    updateStatus('Error');
  }
}

/**
 * Apply display settings from localStorage
 */
async function applyDisplaySettings() {
  try {
    const settings = common.settingsStore.get(null, 'tls-settings');
    
    const fontScale = settings?.fontScale ?? 1.0;
    const lineSpacing = settings?.lineSpacing ?? 1.0;
    const solidBackground = settings?.solidBackground ?? false;
    const backgroundColor = settings?.backgroundColor ?? '#000000';
    
    // Update CSS variables (the CSS uses calc(var(--font-scale) * 0.35em) etc)
    const rootFontScale = 2.8 * fontScale; // Base is 2.8, multiply by user's scale
    document.documentElement.style.setProperty('--font-scale', rootFontScale);
    document.documentElement.style.setProperty('--background-color', backgroundColor);
    document.body.style.lineHeight = lineSpacing;
    
    if (solidBackground) {
      document.documentElement.classList.remove('passive-overlay-scrollbars');
      document.documentElement.classList.add('solid-background');
    } else {
      document.documentElement.classList.add('passive-overlay-scrollbars');
      document.documentElement.classList.remove('solid-background');
    }
  } catch (error) {
    console.error('[TLS] Error applying display settings:', error);
    // Continue with defaults if settings fail to load
  }
}

/**
 * Setup event listeners
 */
/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Category filter
  const categorySelect = document.getElementById('categorySelect');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      currentCategory = e.target.value || null;
      localStorage.setItem(STORAGE_KEYS.CATEGORY, currentCategory || '');
      console.log('[TLS] Category changed to:', currentCategory);
      // Re-render with cached data
      if (cachedData) {
        renderTeamStandings(cachedData);
      }
    });
  }
  
  // Team row click to expand/collapse riders
  document.addEventListener('click', (e) => {
    const teamRow = e.target.closest('.team-row');
    if (teamRow) {
      const ridersRow = teamRow.nextElementSibling;
      if (ridersRow && ridersRow.classList.contains('riders-row')) {
        const isVisible = ridersRow.style.display !== 'none';
        ridersRow.style.display = isVisible ? 'none' : 'table-row';
      }
    }
  });
}

/**
 * Load team standings from API
 */
async function loadTeamStandings() {
  try {
    const password = localStorage.getItem(STORAGE_KEYS.PASSWORD);
    if (!password) {
      document.getElementById('teamStandings').innerHTML = 
        '<p style="padding: 1em;">Please configure your access password in settings</p>';
      updateStatus('Not configured');
      return;
    }
    
    const headers = {
      'X-TLS-Access-Token': password,
    };
    
    // No race_id - server will auto-detect current live race
    const url = `${API_BASE_URL}/wp-json/s4z-tls/v1/team-standings`;
    
    console.log('[TLS] Fetching team standings from:', url);
    updateStatus('Fetching data...');
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid access password');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please wait before trying again');
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }
    
    const data = await response.json();
    console.log('[TLS] Received data:', data);
    
    renderTeamStandings(data);
    updateStatus('Ready');
    
  } catch (error) {
    console.error('[TLS] Error loading team standings:', error);
    document.getElementById('teamStandings').innerHTML = 
      `<p style="padding: 1em; color: #ff6b6b;">Error: ${error.message}</p>`;
    updateStatus('Error');
  }
}

/**
 * Render team standings
 */
function renderTeamStandings(data) {
  const container = document.getElementById('teamStandings');
  
  if (!data) {
    container.innerHTML = '<p style="padding: 1em;">No standings data available</p>';
    return;
  }
  
  // Cache the data for re-rendering
  cachedData = data;
  
  // Data structure from WordPress: { categories: [...], combined: [...] }
  let teams = [];
  
  if (currentCategory) {
    // Find the specific category
    const category = data.categories?.find(cat => cat.label === currentCategory);
    console.log('[TLS] Looking for category:', currentCategory, 'Found:', category);
    if (category && category.teams) {
      teams = category.teams;
    }
  } else {
    // Show combined standings (all categories)
    teams = data.combined || [];
  }
  
  if (teams.length === 0) {
    const msg = currentCategory 
      ? `No teams found for category ${currentCategory}` 
      : 'No team data available yet - waiting for race data...';
    container.innerHTML = `<p style="padding: 1em;">${msg}</p>`;
    return;
  }
  
  // Build HTML
  let html = '<table class="teams-table"><thead><tr>';
  html += '<th>Rank</th><th>Team</th>';
  
  if (currentCategory) {
    // Category view: show raw points
    html += '<th>Points</th>';
  } else {
    // Combined view: show stage points and raw points
    html += '<th>Stage Points</th><th>Raw Points</th>';
  }
  
  html += '</tr></thead><tbody>';
  
  teams.forEach((team, index) => {
    const rank = team.rank || (index + 1);
    const teamName = team.team_name || 'Unknown Team';
    
    html += `
      <tr class="team-row" data-team-id="${team.team_id}">
        <td class="rank">${rank}</td>
        <td class="team-name">${escapeHtml(teamName)}</td>
    `;
    
    if (currentCategory) {
      // Category view: just points
      const points = Math.round(team.total_points || 0);
      html += `<td class="points">${points}</td>`;
    } else {
      // Combined view: stage points and raw points
      const stagePoints = team.league_points || 0;
      const rawPoints = Math.round(team.raw_points || 0);
      html += `<td class="points">${stagePoints}</td>`;
      html += `<td class="points">${rawPoints}</td>`;
    }
    
    html += `</tr>`;
    
    // Add rider details if available (for category view only)
    if (currentCategory && team.riders && team.riders.length > 0) {
      html += `<tr class="riders-row" style="display: none;"><td colspan="3"><div class="riders-list">`;
      team.riders.forEach(rider => {
        const riderName = rider.rider_name || 'Unknown';
        const riderPoints = Math.round(rider.points || 0);
        html += `<div class="rider">${escapeHtml(riderName)}: ${riderPoints} pts</div>`;
      });
      html += `</div></td></tr>`;
    }
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
  
  // Add click handlers for expandable rows
  container.querySelectorAll('.team-row').forEach(row => {
    row.addEventListener('click', () => {
      const nextRow = row.nextElementSibling;
      if (nextRow && nextRow.classList.contains('riders-row')) {
        nextRow.style.display = nextRow.style.display === 'none' ? 'table-row' : 'none';
      }
    });
  });
}

/**
 * Start auto-refresh timer
 */
function startAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  
  refreshTimer = setInterval(async () => {
    await loadTeamStandings();
  }, REFRESH_INTERVAL);
}

/**
 * Update hint text
 */
function updateHint(text) {
  document.getElementById('hintText').textContent = text;
}

/**
 * Show error message
 */
function showError(message) {
  const container = document.getElementById('teamStandings');
  container.innerHTML = `<div style="padding: 1em; color: #ff4444;">${escapeHtml(message)}</div>`;
  updateStatus('Error');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
