/**
 * ContactHub API Client
 * Centralized HTTP service communicating with the Express backend
 * Supports JWT Authentication and Protected Contact Routes
 */

const API_BASE = '/api';

// In-memory / session-scoped auth token (no localStorage)
let authToken = sessionStorage.getItem('contacthub_token') || null;

/**
 * Handle API responses and throw structured errors
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.errors = data?.errors || null;
    throw error;
  }

  return data;
}

/**
 * Helper to build headers with Authorization Bearer token
 */
function getHeaders(contentType = true) {
  const headers = {};
  if (contentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

export const api = {
  // Token management
  setToken(token) {
    authToken = token;
    if (token) {
      sessionStorage.setItem('contacthub_token', token);
    } else {
      sessionStorage.removeItem('contacthub_token');
    }
  },

  getToken() {
    return authToken;
  },

  isAuthenticated() {
    return !!authToken;
  },

  clearToken() {
    authToken = null;
    sessionStorage.removeItem('contacthub_token');
  },

  // ------------------------------------------------------------------------
  // Authentication Endpoints
  // ------------------------------------------------------------------------
  async signup(userData) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(res);
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(res);
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async getMe() {
    if (!authToken) return null;
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  // ------------------------------------------------------------------------
  // Protected Contacts Endpoints
  // ------------------------------------------------------------------------
  async getContacts(search = '') {
    const query = search ? `?search=${encodeURIComponent(search.trim())}` : '';
    const res = await fetch(`${API_BASE}/contacts${query}`, {
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  async getContactById(id) {
    const res = await fetch(`${API_BASE}/contacts/${id}`, {
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  async createContact(contactData) {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(contactData),
    });
    return handleResponse(res);
  },

  async updateContact(id, contactData) {
    const res = await fetch(`${API_BASE}/contacts/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(contactData),
    });
    return handleResponse(res);
  },

  async deleteContact(id) {
    const res = await fetch(`${API_BASE}/contacts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE}/contacts/reset-demo`, {
      method: 'POST',
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  // Health check
  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      return handleResponse(res);
    } catch {
      return { status: 'offline', connected: false, database: 'MongoDB' };
    }
  },
};
