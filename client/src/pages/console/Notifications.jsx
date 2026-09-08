import React, { useState } from 'react';

export default function Notifications() {
  const [notifConfig, setNotifConfig] = useState({
    quotaAlert: true,
    dunningAlert: true,
    priceChangeAlert: false
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Notifications & Threshold Alerts</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manage automated quota and past-due dunning alerts</p>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <h4 className="font-bold text-foreground">80% Token Quota Alert</h4>
            <p className="text-muted-foreground">Receive notification when token usage reaches 80% of your plan quota.</p>
          </div>
          <input 
            type="checkbox" 
            checked={notifConfig.quotaAlert}
            onChange={(e) => setNotifConfig({ ...notifConfig, quotaAlert: e.target.checked })}
            className="w-4 h-4 accent-primary"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <h4 className="font-bold text-foreground">Dunning & Grace Period Warning</h4>
            <p className="text-muted-foreground">Receive reminders if invoice payment fails before grace period expiry.</p>
          </div>
          <input 
            type="checkbox" 
            checked={notifConfig.dunningAlert}
            onChange={(e) => setNotifConfig({ ...notifConfig, dunningAlert: e.target.checked })}
            className="w-4 h-4 accent-primary"
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <h4 className="font-bold text-foreground">Model Pricing Updates</h4>
            <p className="text-muted-foreground">Get notified when new models or updated token rates become available.</p>
          </div>
          <input 
            type="checkbox" 
            checked={notifConfig.priceChangeAlert}
            onChange={(e) => setNotifConfig({ ...notifConfig, priceChangeAlert: e.target.checked })}
            className="w-4 h-4 accent-primary"
          />
        </div>
      </div>
    </div>
  );
}
