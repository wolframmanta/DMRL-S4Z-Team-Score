/**
 * Team Live Scores - Settings Page
 * Uses Sauce's settingsStore for persistence
 */

import * as common from '/pages/src/common.mjs';

const API_BASE_URL = 'https://dirtymittenracing.com';

/**
 * Initialize settings page
 */
async function initialize() {
  console.log('[TLS Settings] Initializing');
  
  const form = document.getElementById('options');
  if (!form) return;
  
  // Load saved settings using Sauce's settings store
  const settings = common.settingsStore.get(null, 'tls-settings') || {};
  
  // Populate form fields
  populateForm(form, settings);
  
  // Setup event listeners
  setupEventListeners(form);
  
  // Handle test connection button
  setupTestConnection();
  
  // Setup close button handler
  const closeButton = document.querySelector('.button.close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      window.close();
    });
  }
}

/**
 * Populate form with saved settings
 */
function populateForm(form, settings) {
  const defaults = {
    solidBackground: false,
    backgroundColor: '#000000',
    fontScale: 1.0,
    lineSpacing: 1.0,
    accessPassword: '',
    defaultCategory: ''
  };
  
  // Merge with defaults
  const values = { ...defaults, ...settings };
  
  // Also check localStorage for password (backward compat)
  if (!values.accessPassword) {
    values.accessPassword = localStorage.getItem('tls_access_password') || '';
  }
  
  // Set form values
  for (const [key, value] of Object.entries(values)) {
    const inputs = form.querySelectorAll(`[name="${key}"]`);
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        input.checked = value;
      } else if (input.type === 'password' || input.type === 'text' || input.type === 'color') {
        input.value = value;
      } else if (input.type === 'range' || input.type === 'number') {
        input.value = value;
      } else if (input.tagName === 'SELECT') {
        input.value = value;
      }
    });
  }
  
  // Handle dependent fields
  handleDependencies(form);
}

/**
 * Setup event listeners for auto-save
 */
function setupEventListeners(form) {
  form.addEventListener('change', async (e) => {
    const input = e.target;
    const name = input.name;
    if (!name) return;
    
    let value = input.type === 'checkbox' ? input.checked : input.value;
    
    // Convert numeric values
    if (input.type === 'number' || input.type === 'range') {
      value = parseFloat(value);
    }
    
    // Get current settings
    const settings = common.settingsStore.get(null, 'tls-settings') || {};
    
    // Update value
    settings[name] = value;
    
    // Save to Sauce settings store
    common.settingsStore.set(null, settings, 'tls-settings');
    
    // Also save password to localStorage for backward compat
    if (name === 'accessPassword') {
      localStorage.setItem('tls_access_password', value);
    }
    
    // Handle dependencies
    handleDependencies(form);
    
    // Sync paired inputs (range/number)
    if (input.type === 'range' || input.type === 'number') {
      const pairs = form.querySelectorAll(`[name="${name}"]`);
      pairs.forEach(pair => {
        if (pair !== input) {
          pair.value = value;
        }
      });
    }
    
    console.log('[TLS Settings] Saved:', name, '=', value);
  });
}

/**
 * Handle data-depends-on attributes
 */
function handleDependencies(form) {
  const dependentFields = form.querySelectorAll('[data-depends-on]');
  
  dependentFields.forEach(field => {
    const dependsOn = field.getAttribute('data-depends-on');
    const checkbox = form.querySelector(`input[name="${dependsOn}"][type="checkbox"]`);
    
    if (checkbox) {
      const label = field.closest('label');
      if (label) {
        if (checkbox.checked) {
          label.style.display = 'flex';
          field.disabled = false;
        } else {
          label.style.display = 'none';
          field.disabled = true;
        }
      }
    }
  });
}

/**
 * Setup test connection button
 */
function setupTestConnection() {
  const button = document.getElementById('testConnection');
  const statusDiv = document.getElementById('connectionStatus');
  
  if (!button || !statusDiv) return;
  
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Testing...';
    statusDiv.style.display = 'none';
    
    try {
      // Get password from form or localStorage
      const passwordInput = document.querySelector('input[name="accessPassword"]');
      const password = passwordInput?.value || localStorage.getItem('tls_access_password') || '';
      
      if (!password) {
        throw new Error('Please enter an access password');
      }
      
      // Test connection to team-map endpoint (lightest endpoint)
      const response = await fetch(`${API_BASE_URL}/wp-json/s4z-tls/v1/team-map`, {
        headers: {
          'X-TLS-Access-Token': password
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Success
      statusDiv.textContent = '✓ Successfully connected to API';
      statusDiv.style.display = 'block';
      statusDiv.style.background = '#2d5';
      statusDiv.style.color = 'white';
      
    } catch (error) {
      // Error
      statusDiv.textContent = `✗ ${error.message}`;
      statusDiv.style.display = 'block';
      statusDiv.style.background = '#d22';
      statusDiv.style.color = 'white';
    } finally {
      button.disabled = false;
      button.textContent = 'Test Connection';
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
