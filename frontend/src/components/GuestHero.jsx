import React from 'react';
import { Lock, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function GuestHero({ onOpenAuth }) {
  return (
    <div className="py-16 sm:py-24 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white border border-beige-200 rounded-3xl p-8 sm:p-12 shadow-warm-lg text-center relative overflow-hidden">
        
        {/* Subtle decorative background circle */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-clay-50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-beige-100 rounded-full blur-2xl pointer-events-none"></div>

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-clay-100 text-clay-500 mx-auto flex items-center justify-center mb-6 shadow-warm-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight mb-3">
          Secure Contact Management
        </h1>

        <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed mb-8 max-w-lg mx-auto">
          Keep your professional directory organized, private, and encrypted. Sign in or create a free account to view and manage your contacts stored in MongoDB.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-clay-500 hover:bg-clay-600 text-white font-medium text-sm shadow-clay-glow transition-all flex items-center justify-center space-x-2"
          >
            <span>Sign In to Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-beige-100 hover:bg-beige-200 text-charcoal-900 font-medium text-sm border border-beige-200 transition-all"
          >
            Create Free Account
          </button>
        </div>

        {/* Highlights */}
        <div className="pt-8 border-t border-beige-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-charcoal-700 font-medium">
          <div className="flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>JWT Protected Routes</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zod Schema Validation</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Real-time Filtering</span>
          </div>
        </div>

      </div>
    </div>
  );
}
