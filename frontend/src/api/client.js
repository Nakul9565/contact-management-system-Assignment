/**
 * ContactHub API Client
 */

const API_BASE = '/api';

let token = sessionStorage.getItem('contacthub_token') || null;

export const api = {
  setToken(newToken) {
    token = newToken;
    if (newToken) {
      sessionStorage.setItem('contacthub_token', newToken);
    } else {
      sessionStorage.removeItem('contacthub_token');
    }
  },

  getToken() {
    return token;
  },

  isAuthenticated() {
    return !!token;
  },

  clearToken() {
    token = null;
    sessionStorage.removeItem('contacthub_token');
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.errors = data?.errors || null;
      throw error;
    }

    return data;
  },

  // Auth Endpoints
  async signup({ name, email, password }) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  },

  async login({ email, password }) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  },

  async getMe() {
    return this.request('/auth/me');
  },

  // Contact Endpoints
  async getContacts(search = '') {
    const query = search ? `?search=${encodeURIComponent(search.trim())}` : '';
    return this.request(`/contacts${query}`);
  },

  async createContact(contactData) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  async updateContact(id, contactData) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  },

  async deleteContact(id) {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  },

  async resetDemo() {
    return this.request('/contacts/reset-demo', {
      method: 'POST',
    });
  },

  async checkHealth() {
    try {
      return await this.request('/health');
    } catch {
      return { status: 'offline', connected: false };
    }
  },
};
