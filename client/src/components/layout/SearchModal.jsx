import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, ArrowRight, Home, Key, CreditCard, FileText, Layers, Users, RefreshCw, Activity, Tag, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SearchModal({ isOpen, onClose, setCurrentRoute, navigateToConsole }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const customerSearchItems = [
    { name: 'Developer Console Overview', route: 'console-overview', icon: Home, category: 'Console' },
    { name: 'API Secret Keys & Management', route: 'console-keys', icon: Key, category: 'Security' },
    { name: 'Credits & Billing Portal', route: 'console-credits', icon: CreditCard, category: 'Billing' },
    { name: 'Inference Logs & Telemetry', route: 'console-logs', icon: FileText, category: 'Logs' },
    { name: 'Models & Pricing Catalog', route: 'pricing', icon: Layers, category: 'Catalog' },
    { name: 'Developer Documentation', route: 'docs', icon: FileText, category: 'Docs' }
  ];

  const adminSearchItems = [
    { name: 'Admin Revenue & Churn (MRR)', route: 'console-admin-overview', icon: Activity, category: 'Admin Analytics' },
    { name: 'User Directory & Drilldown', route: 'console-admin-users', icon: Users, category: 'Admin Users' },
    { name: 'Subscription Plans CRUD', route: 'console-admin-plans', icon: Layers, category: 'Admin Plans' },
    { name: 'Promotions & Coupon Management', route: 'console-admin-coupons', icon: Tag, category: 'Admin Billing' },
    { name: 'Dunning & Payment Recovery', route: 'console-admin-dunning', icon: RefreshCw, category: 'Admin Recovery' },
    { name: 'Billing Events Stream', route: 'console-admin-events', icon: ShieldCheck, category: 'Admin Events' },
    ...customerSearchItems
  ];

  const searchItems = (user?.role === 'admin' ? adminSearchItems : customerSearchItems)
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
      {/* Clean Light Scrim Backdrop Without Blur */}
      <div 
        className="fixed inset-0 bg-black/20 transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Surface Container */}
      <div className="relative z-10 bg-white border border-zinc-300 rounded-2xl p-4 max-w-lg w-full shadow-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
          <Search size={18} className="text-zinc-500" />
          <input 
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models, keys, console views..."
            className="w-full bg-transparent text-xs text-zinc-900 focus:outline-none"
          />
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900 p-1 rounded-lg">
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
                    navigateToConsole(item.route);
                  } else {
                    setCurrentRoute(item.route);
                  }
                  onClose();
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-100 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium text-zinc-900">
                  <item.icon size={15} className="text-[#5865f2]" />
                  {item.name}
                </span>
                <ArrowRight size={14} className="text-zinc-400" />
              </button>
            ))
          ) : (
            <p className="text-xs text-zinc-500 p-4 text-center">No matching items found.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
