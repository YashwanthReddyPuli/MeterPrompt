import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Key, User, BarChart2, FileText, CreditCard, Bell, Settings, LogOut } from 'lucide-react';

export default function Sidebar({ currentRoute, setCurrentRoute }) {
  const { user, logout } = useAuth();

  const customerNavItems = [
    { id: 'console-overview', label: 'Overview', icon: Home },
    { id: 'console-keys', label: 'API Keys', icon: Key },
    { id: 'console-profile', label: 'Profile', icon: User },
    { id: 'console-activity', label: 'Activity & Analytics', icon: BarChart2 },
    { id: 'console-logs', label: 'Inference Logs', icon: FileText },
    { id: 'console-credits', label: 'Credits & Billing', icon: CreditCard },
    { id: 'console-notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'console-preferences', label: 'Preferences', icon: Settings },
  ];

  const adminNavItems = [
    { id: 'console-admin-overview', label: 'Revenue & Churn (MRR)', icon: BarChart2 },
    { id: 'console-admin-events', label: 'Billing Events Stream', icon: Bell },
    { id: 'console-admin-users', label: 'User Directory & Drilldown', icon: User },
    { id: 'console-admin-plans', label: 'Manage Plans (CRUD)', icon: Settings },
    { id: 'console-admin-dunning', label: 'Dunning & Recovery', icon: CreditCard },
  ];


  const navItems = user?.role === 'admin' ? adminNavItems : customerNavItems;

  return (
    <aside className="group fixed top-0 left-0 h-full z-40 bg-white border-r border-zinc-200 transition-all duration-300 ease-in-out w-16 hover:w-64 flex flex-col justify-between py-5 overflow-hidden shadow-sm hover:shadow-xl">
      {/* Upper Navigation & Brand */}
      <div className="flex flex-col gap-6">
        {/* Logo / Brand Pill */}
        <div 
          onClick={() => setCurrentRoute('landing')}
          className="flex items-center px-4 gap-3.5 h-8 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#5865f2] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md shadow-[#5865f2]/20">
            MP
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap tracking-tight">
            <span className="font-extrabold text-zinc-900 text-sm block">MeterPrompt</span>
            {user?.role === 'admin' && (
              <span className="text-[10px] font-extrabold text-[#5865f2] uppercase tracking-wider block">Admin Control</span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 px-2.5">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentRoute(item.id)}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer w-full ${
                  isActive
                    ? 'bg-[#5865f2] text-white font-bold shadow-sm shadow-[#5865f2]/25'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-xs">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>


      {/* User Footer Profile in Sidebar */}
      <div className="px-3 border-t border-zinc-200 pt-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#5865f2]/10 border border-[#5865f2]/30 flex items-center justify-center font-bold text-xs text-[#5865f2] shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 overflow-hidden whitespace-nowrap">
            <p className="text-xs font-bold text-zinc-900 truncate">{user?.name || 'Developer User'}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'user@meterprompt.io'}</p>
          </div>
        </div>

        {logout && (
          <button
            onClick={() => { logout(); setCurrentRoute('landing'); }}
            title="Sign Out"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer shrink-0"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
