import React, { useState } from 'react';

export default function CreateKeyModal({ isOpen, onClose, onCreateKey }) {
  const [keyName, setKeyName] = useState('Production Key');

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateKey(keyName);
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-foreground/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity"
    >
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
        <h3 className="text-base font-bold text-foreground">Create New Secret Key</h3>
        <p className="text-xs text-muted-foreground">
          Provide a label for this key to identify it in usage logs.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Key Name</label>
            <input 
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="w-full bg-input border border-border rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="e.g. Production Backend"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition shadow-xs"
            >
              Create Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
