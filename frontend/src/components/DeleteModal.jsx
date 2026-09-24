import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, contact, onConfirm }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !contact) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(contact.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-beige-200 rounded-3xl max-w-sm w-full p-6 shadow-warm-lg text-center">
        
        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4 border border-red-100">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-charcoal-900 mb-1.5">Delete Contact?</h3>
        
        <p className="text-xs text-charcoal-600 mb-6 leading-relaxed">
          Are you sure you want to remove <strong className="text-charcoal-900 font-semibold">{contact.name}</strong> from your contacts? This cannot be undone.
        </p>

        <div className="flex items-center justify-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-beige-100 hover:bg-beige-200 text-charcoal-700 text-xs font-semibold border border-beige-200 transition-all"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-warm-sm transition-all flex items-center justify-center space-x-1.5 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Delete</span>}
          </button>
        </div>

      </div>
    </div>
  );
}
