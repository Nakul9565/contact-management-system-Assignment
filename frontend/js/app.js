/**
 * ContactHub Main Application Controller
 * Handles State, JWT Authentication, Validation, Contact CRUD, Search & Filters
 */

import { api } from './api.js';

// Application State
const state = {
  currentUser: null,
  contacts: [],
  searchQuery: '',
  sortBy: 'newest',
  editingContactId: null,
  deletingContact: null,
  theme: 'dark',
  authMode: 'login', // 'login' | 'signup'
};

// Avatar Color Gradients (Deterministic by name)
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #06b6d4, #0284c7)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #ec4899, #be185d)',
  'linear-gradient(135deg, #8b5cf6, #d946ef)',
];

// DOM Elements Cache
const elements = {
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  storageBadge: document.getElementById('storageBadge'),
  storageModeText: document.getElementById('storageModeText'),
  openAddModalBtn: document.getElementById('openAddModalBtn'),
  fabAddBtn: document.getElementById('fabAddBtn'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  sortSelect: document.getElementById('sortSelect'),
  resetDemoBtn: document.getElementById('resetDemoBtn'),
  contactCountBadge: document.getElementById('contactCountBadge'),
  resultsLabel: document.getElementById('resultsLabel'),
  loadingIndicator: document.getElementById('loadingIndicator'),
  contactsGrid: document.getElementById('contactsGrid'),
  emptyState: document.getElementById('emptyState'),
  emptyTitle: document.getElementById('emptyTitle'),
  emptySubtitle: document.getElementById('emptySubtitle'),
  emptyActionBtn: document.getElementById('emptyActionBtn'),
  emptyActionBtnText: document.getElementById('emptyActionBtnText'),

  // Auth & Profile Elements
  openAuthModalBtn: document.getElementById('openAuthModalBtn'),
  userProfileChip: document.getElementById('userProfileChip'),
  userChipAvatar: document.getElementById('userChipAvatar'),
  userChipName: document.getElementById('userChipName'),
  logoutBtn: document.getElementById('logoutBtn'),
  guestWelcomeSection: document.getElementById('guestWelcomeSection'),
  authenticatedSection: document.getElementById('authenticatedSection'),
  guestLoginBtn: document.getElementById('guestLoginBtn'),
  guestSignupBtn: document.getElementById('guestSignupBtn'),

  // Auth Modal
  authModal: document.getElementById('authModal'),
  tabLoginBtn: document.getElementById('tabLoginBtn'),
  tabSignupBtn: document.getElementById('tabSignupBtn'),
  closeAuthModalBtn: document.getElementById('closeAuthModalBtn'),
  authForm: document.getElementById('authForm'),
  authGroupName: document.getElementById('authGroupName'),
  authName: document.getElementById('authName'),
  authNameError: document.getElementById('authNameError'),
  authGroupEmail: document.getElementById('authGroupEmail'),
  authEmail: document.getElementById('authEmail'),
  authEmailError: document.getElementById('authEmailError'),
  authGroupPassword: document.getElementById('authGroupPassword'),
  authPassword: document.getElementById('authPassword'),
  authPasswordError: document.getElementById('authPasswordError'),
  authSubmitBtn: document.getElementById('authSubmitBtn'),
  authSubmitBtnText: document.getElementById('authSubmitBtnText'),
  authSpinner: document.getElementById('authSpinner'),

  // Contact Modal
  contactModal: document.getElementById('contactModal'),
  contactForm: document.getElementById('contactForm'),
  modalTitle: document.getElementById('modalTitle'),
  modalSubtitle: document.getElementById('modalSubtitle'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  saveContactBtn: document.getElementById('saveContactBtn'),
  saveBtnText: document.getElementById('saveBtnText'),
  saveSpinner: document.getElementById('saveSpinner'),
  contactId: document.getElementById('contactId'),
  contactName: document.getElementById('contactName'),
  contactEmail: document.getElementById('contactEmail'),
  contactPhone: document.getElementById('contactPhone'),
  groupName: document.getElementById('groupName'),
  groupEmail: document.getElementById('groupEmail'),
  groupPhone: document.getElementById('groupPhone'),
  nameError: document.getElementById('nameError'),
  emailError: document.getElementById('emailError'),
  phoneError: document.getElementById('phoneError'),

  // Delete Modal
  deleteModal: document.getElementById('deleteModal'),
  deleteTargetName: document.getElementById('deleteTargetName'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  deleteBtnText: document.getElementById('deleteBtnText'),
  deleteSpinner: document.getElementById('deleteSpinner'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer'),
};

// --------------------------------------------------------------------------
// Validation Logic
// --------------------------------------------------------------------------
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[\d\s().-]{7,20}$/;

function validateContactField(field, value) {
  const val = (value || '').trim();

  switch (field) {
    case 'name':
      if (!val) return 'Full name is required.';
      if (val.length < 2) return 'Name must be at least 2 characters long.';
      if (val.length > 50) return 'Name cannot exceed 50 characters.';
      return '';

    case 'email':
      if (!val) return 'Email address is required.';
      if (!EMAIL_REGEX.test(val)) return 'Please enter a valid email address.';
      return '';

    case 'phone':
      if (!val) return 'Phone number is required.';
      if (!PHONE_REGEX.test(val)) return 'Please enter a valid phone number.';
      const digits = val.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        return 'Phone number must contain between 7 and 15 digits.';
      }
      return '';

    default:
      return '';
  }
}

function updateContactValidationUI(field) {
  let inputEl, groupEl, errorEl;
  if (field === 'name') {
    inputEl = elements.contactName;
    groupEl = elements.groupName;
    errorEl = elements.nameError;
  } else if (field === 'email') {
    inputEl = elements.contactEmail;
    groupEl = elements.groupEmail;
    errorEl = elements.emailError;
  } else if (field === 'phone') {
    inputEl = elements.contactPhone;
    groupEl = elements.groupPhone;
    errorEl = elements.phoneError;
  }

  const error = validateContactField(field, inputEl.value);

  if (error) {
    groupEl.classList.add('has-error');
    groupEl.classList.remove('is-valid');
    errorEl.textContent = error;
    return false;
  } else {
    groupEl.classList.remove('has-error');
    if (inputEl.value.trim().length > 0) {
      groupEl.classList.add('is-valid');
    } else {
      groupEl.classList.remove('is-valid');
    }
    errorEl.textContent = '';
    return true;
  }
}

function resetContactFormValidation() {
  [elements.groupName, elements.groupEmail, elements.groupPhone].forEach((g) => {
    g.classList.remove('has-error', 'is-valid');
  });
  elements.nameError.textContent = '';
  elements.emailError.textContent = '';
  elements.phoneError.textContent = '';
}

// --------------------------------------------------------------------------
// UI Rendering & Avatar Helpers
// --------------------------------------------------------------------------
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarGradient(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderContacts() {
  if (!state.currentUser) return;

  const contacts = getFilteredAndSortedContacts();
  elements.contactCountBadge.textContent = contacts.length;

  if (state.searchQuery) {
    elements.resultsLabel.textContent = `Contacts matching "${state.searchQuery}" (of ${state.contacts.length})`;
  } else {
    elements.resultsLabel.textContent = `Total Saved Contacts`;
  }

  // Handle Empty State
  if (contacts.length === 0) {
    elements.contactsGrid.innerHTML = '';
    elements.contactsGrid.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');

    if (state.searchQuery) {
      elements.emptyTitle.textContent = 'No matching contacts found';
      elements.emptySubtitle.textContent = `We couldn't find any contacts matching "${state.searchQuery}".`;
      elements.emptyActionBtnText.textContent = 'Clear Search';
      elements.emptyActionBtn.onclick = () => {
        elements.searchInput.value = '';
        state.searchQuery = '';
        elements.clearSearchBtn.style.display = 'none';
        renderContacts();
      };
    } else {
      elements.emptyTitle.textContent = 'No contacts saved yet';
      elements.emptySubtitle.textContent = 'Create your first contact or load sample contacts.';
      elements.emptyActionBtnText.textContent = 'Add Contact';
      elements.emptyActionBtn.onclick = () => openContactModal();
    }
    return;
  }

  elements.emptyState.classList.add('hidden');
  elements.contactsGrid.classList.remove('hidden');

  elements.contactsGrid.innerHTML = contacts
    .map((c) => {
      const initials = getInitials(c.name);
      const gradient = getAvatarGradient(c.name);
      const createdStr = formatDate(c.createdAt);

      return `
        <article class="contact-card" data-id="${c.id}">
          <div class="contact-top">
            <div class="contact-avatar" style="background: ${gradient};">
              ${initials}
            </div>
            <div class="contact-info">
              <h3 class="contact-name" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</h3>
              <span class="contact-meta-date">Added ${createdStr}</span>
            </div>
          </div>

          <div class="contact-details">
            <!-- Email -->
            <div class="detail-row">
              <a href="mailto:${escapeHtml(c.email)}" class="detail-link-group" title="Send email to ${escapeHtml(c.email)}">
                <span class="detail-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <span class="detail-text">${escapeHtml(c.email)}</span>
              </a>
              <button class="copy-mini-btn" data-copy="${escapeHtml(c.email)}" title="Copy email address" aria-label="Copy email">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>

            <!-- Phone -->
            <div class="detail-row">
              <a href="tel:${escapeHtml(c.phone)}" class="detail-link-group" title="Call ${escapeHtml(c.phone)}">
                <span class="detail-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <span class="detail-text">${escapeHtml(c.phone)}</span>
              </a>
              <button class="copy-mini-btn" data-copy="${escapeHtml(c.phone)}" title="Copy phone number" aria-label="Copy phone">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-card-action action-edit" data-id="${c.id}" title="Edit Contact" aria-label="Edit ${escapeHtml(c.name)}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Edit</span>
            </button>
            <button class="btn-card-action action-delete" data-id="${c.id}" title="Delete Contact" aria-label="Delete ${escapeHtml(c.name)}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  attachCardEventListeners();
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getFilteredAndSortedContacts() {
  let list = [...state.contacts];

  // Filter by search query (name, email, phone)
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }

  // Sort
  if (state.sortBy === 'name-asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sortBy === 'name-desc') {
    list.sort((a, b) => b.name.localeCompare(a.name));
  } else {
    // Newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return list;
}

// --------------------------------------------------------------------------
// Card Event Listeners
// --------------------------------------------------------------------------
function attachCardEventListeners() {
  document.querySelectorAll('.action-edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const contact = state.contacts.find((c) => c.id === id);
      if (contact) openContactModal(contact);
    });
  });

  document.querySelectorAll('.action-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const contact = state.contacts.find((c) => c.id === id);
      if (contact) openDeleteModal(contact);
    });
  });

  document.querySelectorAll('.copy-mini-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`Copied "${textToCopy}" to clipboard!`, 'info');
      } catch {
        showToast('Failed to copy to clipboard', 'error');
      }
    });
  });
}

// --------------------------------------------------------------------------
// Authentication Flow & UI Switching
// --------------------------------------------------------------------------
function updateAuthUI() {
  if (state.currentUser) {
    // Authenticated state
    elements.guestWelcomeSection.classList.add('hidden');
    elements.authenticatedSection.classList.remove('hidden');

    elements.openAuthModalBtn.classList.add('hidden');
    elements.userProfileChip.classList.remove('hidden');
    elements.openAddModalBtn.classList.remove('hidden');
    elements.fabAddBtn.classList.remove('hidden');

    elements.userChipName.textContent = state.currentUser.name;
    elements.userChipAvatar.textContent = getInitials(state.currentUser.name);
  } else {
    // Guest state
    elements.guestWelcomeSection.classList.remove('hidden');
    elements.authenticatedSection.classList.add('hidden');

    elements.openAuthModalBtn.classList.remove('hidden');
    elements.userProfileChip.classList.add('hidden');
    elements.openAddModalBtn.classList.add('hidden');
    elements.fabAddBtn.classList.add('hidden');

    state.contacts = [];
    renderContacts();
  }
}

function openAuthModal(mode = 'login') {
  setAuthMode(mode);
  resetAuthForm();
  elements.authModal.classList.remove('hidden');
  if (mode === 'signup') {
    setTimeout(() => elements.authName.focus(), 80);
  } else {
    setTimeout(() => elements.authEmail.focus(), 80);
  }
}

function closeAuthModal() {
  elements.authModal.classList.add('hidden');
  resetAuthForm();
}

function setAuthMode(mode) {
  state.authMode = mode;
  if (mode === 'signup') {
    elements.tabSignupBtn.classList.add('active');
    elements.tabLoginBtn.classList.remove('active');
    elements.authGroupName.classList.remove('hidden');
    elements.authSubmitBtnText.textContent = 'Create Account';
  } else {
    elements.tabLoginBtn.classList.add('active');
    elements.tabSignupBtn.classList.remove('active');
    elements.authGroupName.classList.add('hidden');
    elements.authSubmitBtnText.textContent = 'Log In';
  }
}

function resetAuthForm() {
  elements.authForm.reset();
  elements.authNameError.textContent = '';
  elements.authEmailError.textContent = '';
  elements.authPasswordError.textContent = '';
}

async function handleAuthSubmit(e) {
  e.preventDefault();

  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;
  const name = elements.authName.value.trim();

  let hasError = false;
  elements.authNameError.textContent = '';
  elements.authEmailError.textContent = '';
  elements.authPasswordError.textContent = '';

  if (state.authMode === 'signup') {
    if (!name) {
      elements.authNameError.textContent = 'Name is required.';
      hasError = true;
    } else if (name.length < 2) {
      elements.authNameError.textContent = 'Name must be at least 2 characters.';
      hasError = true;
    }
  }

  if (!email) {
    elements.authEmailError.textContent = 'Email is required.';
    hasError = true;
  } else if (!EMAIL_REGEX.test(email)) {
    elements.authEmailError.textContent = 'Please enter a valid email address.';
    hasError = true;
  }

  if (!password) {
    elements.authPasswordError.textContent = 'Password is required.';
    hasError = true;
  } else if (password.length < 6) {
    elements.authPasswordError.textContent = 'Password must be at least 6 characters.';
    hasError = true;
  }

  if (hasError) return;

  elements.authSpinner.classList.remove('hidden');
  elements.authSubmitBtn.disabled = true;

  try {
    let res;
    if (state.authMode === 'signup') {
      res = await api.signup({ name, email, password });
      showToast(`Welcome to ContactHub, ${res.user.name}!`, 'success');
    } else {
      res = await api.login({ email, password });
      showToast(`Welcome back, ${res.user.name}!`, 'success');
    }

    state.currentUser = res.user;
    updateAuthUI();
    closeAuthModal();
    loadContacts();
  } catch (err) {
    if (err.errors) {
      if (err.errors.name) elements.authNameError.textContent = err.errors.name;
      if (err.errors.email) elements.authEmailError.textContent = err.errors.email;
      if (err.errors.password) elements.authPasswordError.textContent = err.errors.password;
    }
    showToast(err.message || 'Authentication failed', 'error');
  } finally {
    elements.authSpinner.classList.add('hidden');
    elements.authSubmitBtn.disabled = false;
  }
}

function handleLogout() {
  api.clearToken();
  state.currentUser = null;
  updateAuthUI();
  showToast('You have been logged out.', 'info');
}

// --------------------------------------------------------------------------
// Modal Management (Add / Edit)
// --------------------------------------------------------------------------
function openContactModal(contact = null) {
  resetContactFormValidation();

  if (contact) {
    state.editingContactId = contact.id;
    elements.contactId.value = contact.id;
    elements.contactName.value = contact.name;
    elements.contactEmail.value = contact.email;
    elements.contactPhone.value = contact.phone;

    elements.modalTitle.textContent = 'Edit Contact';
    elements.modalSubtitle.textContent = 'Update contact details in MongoDB.';
    elements.saveBtnText.textContent = 'Update Contact';
  } else {
    state.editingContactId = null;
    elements.contactForm.reset();
    elements.contactId.value = '';

    elements.modalTitle.textContent = 'Add New Contact';
    elements.modalSubtitle.textContent = 'Fill in contact details to save to MongoDB.';
    elements.saveBtnText.textContent = 'Save Contact';
  }

  elements.contactModal.classList.remove('hidden');
  setTimeout(() => elements.contactName.focus(), 80);
}

function closeContactModal() {
  elements.contactModal.classList.add('hidden');
  resetContactFormValidation();
  state.editingContactId = null;
}

// --------------------------------------------------------------------------
// Delete Modal Management
// --------------------------------------------------------------------------
function openDeleteModal(contact) {
  state.deletingContact = contact;
  elements.deleteTargetName.textContent = contact.name;
  elements.deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  elements.deleteModal.classList.add('hidden');
  state.deletingContact = null;
}

// --------------------------------------------------------------------------
// Toast Notification Dispatcher
// --------------------------------------------------------------------------
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#06b6d4" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-content">${escapeHtml(message)}</div>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --------------------------------------------------------------------------
// Data Loading & API Calls
// --------------------------------------------------------------------------
async function loadContacts() {
  if (!state.currentUser) return;

  try {
    elements.loadingIndicator.classList.remove('hidden');
    elements.contactsGrid.classList.add('hidden');
    elements.emptyState.classList.add('hidden');

    const result = await api.getContacts();
    state.contacts = result.data || [];
    renderContacts();
  } catch (error) {
    if (error.status === 401) {
      handleLogout();
    } else {
      showToast(error.message || 'Failed to load contacts', 'error');
    }
  } finally {
    elements.loadingIndicator.classList.add('hidden');
  }
}

async function checkDatabaseStatus() {
  const health = await api.checkHealth();
  if (health.connected) {
    elements.storageModeText.textContent = 'MongoDB Connected';
    elements.storageBadge.title = `Connected to MongoDB database '${health.dbName}'`;
  } else {
    elements.storageModeText.textContent = 'MongoDB Offline';
    elements.storageBadge.title = 'Cannot connect to MongoDB. Check server logs.';
  }
}

// --------------------------------------------------------------------------
// Form Submit Handler
// --------------------------------------------------------------------------
async function handleContactFormSubmit(e) {
  e.preventDefault();

  const isNameValid = updateContactValidationUI('name');
  const isEmailValid = updateContactValidationUI('email');
  const isPhoneValid = updateContactValidationUI('phone');

  if (!isNameValid || !isEmailValid || !isPhoneValid) {
    showToast('Please fix the validation errors in the form.', 'error');
    return;
  }

  const payload = {
    name: elements.contactName.value.trim(),
    email: elements.contactEmail.value.trim(),
    phone: elements.contactPhone.value.trim(),
  };

  elements.saveSpinner.classList.remove('hidden');
  elements.saveContactBtn.disabled = true;

  try {
    if (state.editingContactId) {
      const res = await api.updateContact(state.editingContactId, payload);
      const index = state.contacts.findIndex((c) => c.id === state.editingContactId);
      if (index !== -1) {
        state.contacts[index] = res.data;
      }
      showToast(`Contact "${payload.name}" updated successfully!`, 'success');
    } else {
      const res = await api.createContact(payload);
      state.contacts.unshift(res.data);
      showToast(`Contact "${payload.name}" added successfully!`, 'success');
    }

    closeContactModal();
    renderContacts();
  } catch (err) {
    if (err.errors) {
      if (err.errors.name) {
        elements.groupName.classList.add('has-error');
        elements.nameError.textContent = err.errors.name;
      }
      if (err.errors.email) {
        elements.groupEmail.classList.add('has-error');
        elements.emailError.textContent = err.errors.email;
      }
      if (err.errors.phone) {
        elements.groupPhone.classList.add('has-error');
        elements.phoneError.textContent = err.errors.phone;
      }
    }
    showToast(err.message || 'Failed to save contact', 'error');
  } finally {
    elements.saveSpinner.classList.add('hidden');
    elements.saveContactBtn.disabled = false;
  }
}

// --------------------------------------------------------------------------
// Delete Handler
// --------------------------------------------------------------------------
async function handleDeleteConfirm() {
  if (!state.deletingContact) return;

  const target = state.deletingContact;
  elements.deleteSpinner.classList.remove('hidden');
  elements.confirmDeleteBtn.disabled = true;

  try {
    await api.deleteContact(target.id);
    state.contacts = state.contacts.filter((c) => c.id !== target.id);
    showToast(`Contact "${target.name}" was deleted.`, 'success');
    closeDeleteModal();
    renderContacts();
  } catch (error) {
    showToast(error.message || 'Failed to delete contact', 'error');
  } finally {
    elements.deleteSpinner.classList.add('hidden');
    elements.confirmDeleteBtn.disabled = false;
  }
}

// --------------------------------------------------------------------------
// Reset Demo Data Handler
// --------------------------------------------------------------------------
async function handleResetDemo() {
  if (!confirm('Populate your account with sample demo contacts?')) {
    return;
  }
  try {
    const res = await api.resetDemoData();
    state.contacts = res.data || [];
    showToast('Sample contacts loaded into your MongoDB account!', 'success');
    renderContacts();
  } catch (err) {
    showToast(err.message || 'Failed to load demo contacts', 'error');
  }
}

// --------------------------------------------------------------------------
// Theme Toggle Logic
// --------------------------------------------------------------------------
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const newTheme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
}

// --------------------------------------------------------------------------
// Initialization & Event Binding
// --------------------------------------------------------------------------
async function init() {
  applyTheme(state.theme);
  checkDatabaseStatus();

  // Check if session token exists
  if (api.isAuthenticated()) {
    try {
      const meRes = await api.getMe();
      if (meRes && meRes.user) {
        state.currentUser = meRes.user;
        updateAuthUI();
        loadContacts();
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  } else {
    updateAuthUI();
  }

  // Theme Toggle
  elements.themeToggleBtn.addEventListener('click', toggleTheme);

  // Auth Modal Triggers
  elements.openAuthModalBtn.addEventListener('click', () => openAuthModal('login'));
  elements.guestLoginBtn.addEventListener('click', () => openAuthModal('login'));
  elements.guestSignupBtn.addEventListener('click', () => openAuthModal('signup'));
  elements.tabLoginBtn.addEventListener('click', () => setAuthMode('login'));
  elements.tabSignupBtn.addEventListener('click', () => setAuthMode('signup'));
  elements.closeAuthModalBtn.addEventListener('click', closeAuthModal);
  elements.logoutBtn.addEventListener('click', handleLogout);
  elements.authForm.addEventListener('submit', handleAuthSubmit);

  // Contact Modal Triggers
  elements.openAddModalBtn.addEventListener('click', () => openContactModal());
  elements.fabAddBtn.addEventListener('click', () => openContactModal());
  elements.closeModalBtn.addEventListener('click', closeContactModal);
  elements.cancelModalBtn.addEventListener('click', closeContactModal);

  // Backdrop modal close
  elements.authModal.addEventListener('click', (e) => {
    if (e.target === elements.authModal) closeAuthModal();
  });
  elements.contactModal.addEventListener('click', (e) => {
    if (e.target === elements.contactModal) closeContactModal();
  });
  elements.deleteModal.addEventListener('click', (e) => {
    if (e.target === elements.deleteModal) closeDeleteModal();
  });

  // Delete modal
  elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  elements.confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);

  // Contact Form
  elements.contactForm.addEventListener('submit', handleContactFormSubmit);

  // Real-time inline validation
  ['name', 'email', 'phone'].forEach((field) => {
    let inputEl;
    if (field === 'name') inputEl = elements.contactName;
    if (field === 'email') inputEl = elements.contactEmail;
    if (field === 'phone') inputEl = elements.contactPhone;

    inputEl.addEventListener('input', () => updateContactValidationUI(field));
    inputEl.addEventListener('blur', () => updateContactValidationUI(field));
  });

  // Search
  let debounceTimer;
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.searchQuery = e.target.value.trim();
      elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
      renderContacts();
    }, 120);
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearchBtn.style.display = 'none';
    elements.searchInput.focus();
    renderContacts();
  });

  // Sort
  elements.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderContacts();
  });

  // Reset Demo
  elements.resetDemoBtn.addEventListener('click', handleResetDemo);

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!elements.authModal.classList.contains('hidden')) closeAuthModal();
      if (!elements.contactModal.classList.contains('hidden')) closeContactModal();
      if (!elements.deleteModal.classList.contains('hidden')) closeDeleteModal();
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && state.currentUser) {
      e.preventDefault();
      elements.searchInput.focus();
    }
  });
}

// Start app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
