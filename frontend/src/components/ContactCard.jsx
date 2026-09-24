import React, { useState } from 'react';
import { Mail, Phone, Edit2, Trash2, Copy, Check } from 'lucide-react';

const AVATAR_BG_COLORS = [
  'bg-clay-100 text-clay-700 border-clay-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-rose-100 text-rose-800 border-rose-200',
];

export default function ContactCard({ contact, onEdit, onDelete, onToast }) {
  const [copiedField, setCopiedField] = useState(null);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getColorClass = (name) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_BG_COLORS[Math.abs(hash) % AVATAR_BG_COLORS.length];
  };

  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      if (onToast) onToast(`Copied ${fieldName} to clipboard!`, 'info');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      if (onToast) onToast('Failed to copy', 'error');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <article className="bg-white border border-beige-200 rounded-2xl p-5 shadow-warm-sm hover:shadow-warm-md hover:border-beige-300 transition-all flex flex-col justify-between group">
      
      {/* Top Header */}
      <div>
        <div className="flex items-start space-x-3.5 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border flex-shrink-0 ${getColorClass(contact.name)}`}>
            {getInitials(contact.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-charcoal-900 text-base leading-snug truncate" title={contact.name}>
              {contact.name}
            </h3>
            <p className="text-xs text-charcoal-500 font-medium mt-0.5">
              Added {formatDate(contact.createdAt)}
            </p>
          </div>
        </div>

        {/* Details Rows */}
        <div className="space-y-2">
          
          {/* Email */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-beige-50 border border-beige-200/80 text-xs">
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center space-x-2 text-charcoal-700 hover:text-clay-600 truncate transition-colors min-w-0"
              title={contact.email}
            >
              <Mail className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
              <span className="truncate">{contact.email}</span>
            </a>
            <button
              onClick={() => handleCopy(contact.email, 'email')}
              title="Copy email"
              className="p-1 rounded-md text-charcoal-400 hover:text-charcoal-900 hover:bg-beige-100 transition-colors ml-1.5 flex-shrink-0"
            >
              {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-beige-50 border border-beige-200/80 text-xs">
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center space-x-2 text-charcoal-700 hover:text-clay-600 truncate transition-colors min-w-0"
              title={contact.phone}
            >
              <Phone className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
              <span className="truncate">{contact.phone}</span>
            </a>
            <button
              onClick={() => handleCopy(contact.phone, 'phone')}
              title="Copy phone"
              className="p-1 rounded-md text-charcoal-400 hover:text-charcoal-900 hover:bg-beige-100 transition-colors ml-1.5 flex-shrink-0"
            >
              {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3.5 mt-4 border-t border-beige-200/80 flex items-center justify-end space-x-2">
        <button
          onClick={() => onEdit(contact)}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-beige-100 hover:bg-beige-200 text-charcoal-700 text-xs font-medium border border-beige-200 transition-all active:scale-95"
        >
          <Edit2 className="w-3 h-3" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(contact)}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium border border-red-200/60 transition-all active:scale-95"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>
      </div>

    </article>
  );
}
