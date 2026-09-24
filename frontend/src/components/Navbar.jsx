import React from 'react';
import { Users, Plus, LogOut, LogIn, Database } from 'lucide-react';

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  onOpenAddModal,
  contactCount,
}) {
  return (
    <header className="bg-white border-b border-beige-200 sticky top-0 z-30 transition-all shadow-warm-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3.5">
        
        {/* Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-clay-500 text-white flex items-center justify-center shadow-clay-glow transition-transform hover:scale-105">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-charcoal-900 leading-tight">
              Contact<span className="text-clay-500">Hub</span>
            </div>
            <p className="text-xs text-charcoal-500 font-medium">Smart Contact Directory</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          
          {/* MongoDB Status Chip */}
          <div className="hidden sm:inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-beige-100 border border-beige-200 text-xs font-medium text-charcoal-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>MongoDB</span>
          </div>

          {user ? (
            <>
              {/* Add Contact Button */}
              <button
                id="openAddContactBtn"
                onClick={onOpenAddModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-clay-500 hover:bg-clay-600 text-white font-medium text-sm shadow-clay-glow transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Add Contact</span>
              </button>

              {/* User Profile Chip */}
              <div className="flex items-center space-x-2 pl-2 border-l border-beige-200">
                <div className="w-8 h-8 rounded-full bg-beige-200 text-charcoal-900 font-semibold text-xs flex items-center justify-center border border-beige-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-sm font-medium text-charcoal-900 max-w-[120px] truncate">
                  {user.name}
                </span>
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-beige-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-beige-100 hover:bg-beige-200 text-charcoal-900 font-medium text-sm border border-beige-200 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4 text-clay-500" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
