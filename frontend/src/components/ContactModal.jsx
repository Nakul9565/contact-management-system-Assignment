import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Loader2, Sparkles } from 'lucide-react';

export default function ContactModal({ isOpen, onClose, contact, onSave }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
      });
    } else {
      setFormData({ name: '', email: '', phone: '' });
    }
    setErrors({});
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Contact name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    else if (formData.name.trim().length > 50) newErrors.name = 'Name cannot exceed 50 characters';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!emailRegex.test(formData.email.trim())) newErrors.email = 'Please enter a valid email address';

    const digits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (digits.length > 10) newErrors.phone = 'Phone number cannot exceed 10 digits';
    else if (digits.length < 10) newErrors.phone = 'Please enter a valid 10-digit Indian phone number (e.g. 9876543210)';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
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
      <div className="bg-white border border-beige-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-warm-lg relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal-700 p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-clay-50 text-clay-600 text-xs font-semibold mb-2 border border-clay-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{contact ? 'Update Contact' : 'New Directory Entry'}</span>
          </div>
          <h2 className="text-xl font-bold text-charcoal-900">
            {contact ? 'Edit Contact Details' : 'Add New Contact'}
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            {contact ? 'Modify the details below and save your changes.' : 'Enter contact information to save directly to MongoDB.'}
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Full Name <span className="text-clay-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="name"
                placeholder="e.g. Jane Doe"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-beige-50 border rounded-xl text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 transition-all ${
                  errors.name ? 'border-red-400 bg-red-50/20' : 'border-beige-200'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Email Address <span className="text-clay-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                placeholder="jane.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-beige-50 border rounded-xl text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 transition-all ${
                  errors.email ? 'border-red-400 bg-red-50/20' : 'border-beige-200'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Phone Number <span className="text-clay-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-beige-50 border rounded-xl text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 transition-all ${
                  errors.phone ? 'border-red-400 bg-red-50/20' : 'border-beige-200'
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-beige-100 hover:bg-beige-200 text-charcoal-700 text-sm font-medium border border-beige-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-clay-500 hover:bg-clay-600 text-white font-medium text-sm shadow-clay-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{contact ? 'Update Contact' : 'Save Contact'}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
