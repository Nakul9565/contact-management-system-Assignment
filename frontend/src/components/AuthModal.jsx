import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, mode, onModeChange, onSubmit }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (mode === 'signup') {
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(mode, formData);
      onClose();
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-beige-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-warm-lg relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal-700 p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex bg-beige-100 p-1 rounded-xl mb-6 border border-beige-200">
          <button
            type="button"
            onClick={() => { onModeChange('login'); setErrors({}); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-charcoal-900 shadow-warm-sm'
                : 'text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { onModeChange('signup'); setErrors({}); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-charcoal-900 shadow-warm-sm'
                : 'text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-charcoal-900">
            {mode === 'login' ? 'Welcome Back' : 'Get Started with ContactHub'}
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            {mode === 'login'
              ? 'Enter your credentials to access your saved contacts.'
              : 'Create your account to start managing contacts in MongoDB.'}
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-beige-50 border rounded-xl text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 transition-all ${
                    errors.name ? 'border-red-400 bg-red-50/20' : 'border-beige-200'
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-beige-50 border rounded-xl text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 transition-all ${
                  errors.email ? 'border-red-400 bg-red-50/20' : 'border-beige-200'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-beige-50 border rounded-xl text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 transition-all ${
                  errors.password ? 'border-red-400 bg-red-50/20' : 'border-beige-200'
                }`}
              />
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-clay-500 hover:bg-clay-600 text-white font-medium text-sm shadow-clay-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-70 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
