import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Plus,
  Users,
  Inbox,
  X,
  Loader2,
} from 'lucide-react';
import { api } from './api/client';
import Navbar from './components/Navbar';
import GuestHero from './components/GuestHero';
import ContactCard from './components/ContactCard';
import ContactModal from './components/ContactModal';
import DeleteModal from './components/DeleteModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [contactModal, setContactModal] = useState({ isOpen: false, contact: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, contact: null });

  // Toast state
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check initial authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (api.isAuthenticated()) {
        try {
          const res = await api.getMe();
          if (res?.user) {
            setUser(res.user);
          } else {
            api.clearToken();
          }
        } catch {
          api.clearToken();
        }
      }
      setLoadingUser(false);
    };
    checkAuth();
  }, []);

  // Fetch contacts whenever user logs in
  const fetchContacts = async () => {
    if (!user) return;
    setLoadingContacts(true);
    try {
      const res = await api.getContacts();
      setContacts(res.data || []);
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
      } else {
        addToast(err.message || 'Failed to load contacts', 'error');
      }
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    } else {
      setContacts([]);
    }
  }, [user]);

  // Auth Handlers
  const handleAuthSubmit = async (mode, formData) => {
    let res;
    if (mode === 'signup') {
      res = await api.signup(formData);
      addToast(`Welcome to ContactHub, ${res.user.name}!`, 'success');
    } else {
      res = await api.login(formData);
      addToast(`Welcome back, ${res.user.name}!`, 'success');
    }
    setUser(res.user);
  };

  const handleLogout = () => {
    api.clearToken();
    setUser(null);
    setContacts([]);
    addToast('You have been logged out.', 'info');
  };

  // Contact CRUD Handlers
  const handleSaveContact = async (formData) => {
    if (contactModal.contact) {
      // Edit
      const res = await api.updateContact(contactModal.contact.id, formData);
      setContacts((prev) =>
        prev.map((c) => (c.id === contactModal.contact.id ? res.data : c))
      );
      addToast(`Contact "${formData.name}" updated!`, 'success');
    } else {
      // Add
      const res = await api.createContact(formData);
      setContacts((prev) => [res.data, ...prev]);
      addToast(`Contact "${formData.name}" added to MongoDB!`, 'success');
    }
  };

  const handleDeleteConfirm = async (id) => {
    await api.deleteContact(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    addToast('Contact deleted.', 'success');
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Load 5 sample demo contacts into your MongoDB account?')) return;
    try {
      const res = await api.resetDemo();
      setContacts(res.data || []);
      addToast('Sample contacts loaded into MongoDB!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to load sample contacts', 'error');
    }
  };

  // Filtered & Sorted Contacts
  const filteredContacts = useMemo(() => {
    let list = [...contacts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      // Newest
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [contacts, searchQuery, sortBy]);

  // Global Keyboard Shortcut: '/' focuses search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && user) {
        e.preventDefault();
        const searchInput = document.getElementById('mainSearchInput');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-clay-500 animate-spin" />
          <p className="text-xs font-medium text-charcoal-500">Connecting to ContactHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-beige-50 text-charcoal-900 font-poppins">
      
      {/* Top Navigation */}
      <Navbar
        user={user}
        contactCount={contacts.length}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        onLogout={handleLogout}
        onOpenAddModal={() => setContactModal({ isOpen: true, contact: null })}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {!user ? (
          <GuestHero onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })} />
        ) : (
          <div>
            
            {/* Control Panel (Search, Sort, Demo Loader) */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
              
              {/* Search Box */}
              <div className="relative flex-1 max-w-lg">
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="mainSearchInput"
                  type="text"
                  placeholder="Search contacts by name, email, or phone... (Press '/' to focus)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-beige-200 rounded-2xl text-sm text-charcoal-900 placeholder:text-charcoal-400 shadow-warm-sm focus:outline-none focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-charcoal-400 hover:text-charcoal-700 p-0.5 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls Right */}
              <div className="flex items-center space-x-3 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
                
                {/* Sort Dropdown */}
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full md:w-auto pl-3 pr-8 py-2.5 bg-white border border-beige-200 rounded-2xl text-xs font-semibold text-charcoal-700 shadow-warm-sm focus:outline-none focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 cursor-pointer appearance-none"
                  >
                    <option value="newest">Recently Added</option>
                    <option value="name-asc">Name (A → Z)</option>
                    <option value="name-desc">Name (Z → A)</option>
                  </select>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-charcoal-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>

                {/* Load Demo Data Button */}
                <button
                  onClick={handleResetDemo}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-white hover:bg-beige-100 text-charcoal-700 text-xs font-semibold rounded-2xl border border-beige-200 shadow-warm-sm transition-all active:scale-95"
                  title="Populate with sample contacts"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-clay-500" />
                  <span className="hidden sm:inline">Load Sample Contacts</span>
                  <span className="sm:hidden">Samples</span>
                </button>

              </div>

            </div>

            {/* Results Count Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-beige-200">
              <div className="flex items-center space-x-2 text-xs font-medium text-charcoal-600">
                <span className="px-2 py-0.5 rounded-full bg-clay-100 text-clay-700 font-bold">
                  {filteredContacts.length}
                </span>
                <span>
                  {searchQuery
                    ? `Matching "${searchQuery}" (out of ${contacts.length} total)`
                    : 'Total Saved Contacts'}
                </span>
              </div>
            </div>

            {/* Contacts Grid / Loading / Empty State */}
            {loadingContacts ? (
              <div className="py-20 text-center flex flex-col items-center space-y-3">
                <Loader2 className="w-8 h-8 text-clay-500 animate-spin" />
                <p className="text-xs font-medium text-charcoal-500">Fetching your contacts from MongoDB...</p>
              </div>
            ) : filteredContacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onToast={addToast}
                    onEdit={(c) => setContactModal({ isOpen: true, contact: c })}
                    onDelete={(c) => setDeleteModal({ isOpen: true, contact: c })}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 px-4 bg-white border border-beige-200 rounded-3xl text-center shadow-warm-sm max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-beige-100 text-charcoal-400 mx-auto flex items-center justify-center mb-4">
                  <Inbox className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 mb-1">
                  {searchQuery ? 'No matching contacts found' : 'No contacts saved yet'}
                </h3>
                <p className="text-xs text-charcoal-500 mb-6 max-w-xs mx-auto">
                  {searchQuery
                    ? `We couldn't find any contact matching "${searchQuery}". Try another keyword or clear the search.`
                    : 'Your directory is currently empty. Add your first contact or load sample demo data.'}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-beige-100 hover:bg-beige-200 text-charcoal-800 text-xs font-semibold border border-beige-200 transition-all"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={() => setContactModal({ isOpen: true, contact: null })}
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-clay-500 hover:bg-clay-600 text-white text-xs font-semibold shadow-clay-glow transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Contact</span>
                  </button>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Mobile Floating Action Button (FAB) */}
      {user && (
        <button
          onClick={() => setContactModal({ isOpen: true, contact: null })}
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-clay-500 hover:bg-clay-600 text-white shadow-clay-glow flex items-center justify-center z-40 transition-transform active:scale-95"
          title="Add Contact"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-beige-200 py-6 text-center text-xs text-charcoal-500 mt-auto bg-white/50">
        <p>ContactHub &bull; Technical Assignment &bull; Built with React, Tailwind CSS, Node.js &amp; MongoDB</p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onModeChange={(mode) => setAuthModal((prev) => ({ ...prev, mode }))}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleAuthSubmit}
      />

      <ContactModal
        isOpen={contactModal.isOpen}
        contact={contactModal.contact}
        onClose={() => setContactModal({ isOpen: false, contact: null })}
        onSave={handleSaveContact}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        contact={deleteModal.contact}
        onClose={() => setDeleteModal({ isOpen: false, contact: null })}
        onConfirm={handleDeleteConfirm}
      />

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
