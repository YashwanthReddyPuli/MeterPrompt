import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function CreateKeyModal({ isOpen, onClose, onCreateKey }) {
  const [keyName, setKeyName] = useState('Production Key');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateKey(keyName);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Explicit Single Backdrop Layer */}
      <div 
        className="fixed inset-0 bg-zinc-950/20 transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Surface Container */}
      <div className="relative z-10 bg-white border border-zinc-300 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
        <h3 className="text-base font-bold text-zinc-900">Create New Secret Key</h3>
        <p className="text-xs text-zinc-500">
          Provide a label for this key to identify it in usage logs.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-900 block mb-1">Key Name</label>
            <input 
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#5865f2]/40"
              placeholder="e.g. Production Backend"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-[#5865f2] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#4752c4] transition shadow-xs cursor-pointer"
            >
              Create Key
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
