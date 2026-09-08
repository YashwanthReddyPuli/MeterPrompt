import React from "react";
import { createPortal } from "react-dom";
import { Zap } from "lucide-react";

export default function ConfirmModal({ 
  isOpen, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel, 
  isLoading 
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Explicit Single Backdrop Layer */}
      <div 
        className="fixed inset-0 bg-zinc-950/20 transition-opacity" 
        onClick={onCancel} 
      />

      {/* Modal Surface */}
      <div className="relative z-10 bg-white border border-zinc-200 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <Zap size={18} />
          </div>
          <h3 className="text-base font-extrabold text-zinc-900 leading-tight">{title}</h3>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed font-medium">{message}</p>

        {/* Fixed Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 mt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText || 'Cancel'}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center whitespace-nowrap px-5 py-2 text-xs font-semibold text-white bg-[#5865f2] hover:bg-[#4752c4] rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Processing...</span>
              </span>
            ) : (
              confirmText || 'Confirm Tier Switch'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
