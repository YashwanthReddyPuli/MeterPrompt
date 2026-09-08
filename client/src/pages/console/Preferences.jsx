import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Preferences() {
  const { user, logout, showNotification } = useAuth();
  const [prefName, setPrefName] = useState(user?.name || '');
  const [prefEmail, setPrefEmail] = useState(user?.email || '');

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Account Preferences & Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Update credentials and platform options</p>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4 text-xs">
        <div>
          <label className="font-bold text-foreground block mb-1">Display Name</label>
          <input 
            type="text"
            value={prefName}
            onChange={(e) => setPrefName(e.target.value)}
            className="w-full bg-input border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-foreground block mb-1">Email Address</label>
          <input 
            type="email"
            value={prefEmail}
            onChange={(e) => setPrefEmail(e.target.value)}
            className="w-full bg-input border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-border flex justify-between items-center">
          <button 
            onClick={() => showNotification('success', 'Preferences saved!')}
            className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition shadow-xs"
          >
            Save Changes
          </button>

          <button 
            onClick={logout}
            className="bg-rose-50 text-rose-700 font-bold px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-100 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
