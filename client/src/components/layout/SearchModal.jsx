import React, { useState } from 'react';
import { Search, X, ArrowRight, Home, Key, CreditCard, FileText, Cpu, Layers } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, setCurrentRoute, navigateToConsole }) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const searchItems = [
    { name: 'Developer Console Overview', route: 'console-overview', icon: Home },
    { name: 'API Secret Keys', route: 'console-keys', icon: Key },
    { name: 'Credits & Billing', route: 'console-credits', icon: CreditCard },
    { name: 'Inference Logs', route: 'console-logs', icon: FileText },
    { name: 'Models & Pricing Catalog', route: 'pricing', icon: Layers }
  ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-foreground/40 backdrop-blur-xs flex items-start justify-center p-4 pt-20 z-50 transition-opacity"
    >
      <div className="bg-card border border-border rounded-2xl p-4 max-w-lg w-full shadow-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Search size={18} className="text-muted-foreground" />
          <input 
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models, keys, console views..."
            className="w-full bg-transparent text-xs text-foreground focus:outline-none"
          />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1 text-xs max-h-60 overflow-y-auto">
          {searchItems.length > 0 ? (
            searchItems.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  if (item.route.startsWith('console-')) {
                    navigateToConsole(item.route.replace('console-', ''));
                  } else {
                    setCurrentRoute(item.route);
                  }
                  onClose();
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-secondary flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2 font-medium">
                  <item.icon size={15} className="text-primary" />
                  {item.name}
                </span>
                <ArrowRight size={14} className="text-muted-foreground" />
              </button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground p-4 text-center">No matching items found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
