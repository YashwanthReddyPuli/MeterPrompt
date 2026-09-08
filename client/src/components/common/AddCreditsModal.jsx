import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export default function AddCreditsModal({ isOpen, onClose, onAddCredits, isProcessing }) {
  const { currency } = useAuth();
  const [amount, setAmount] = useState('10.00');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 10.00) {
      setValidationError('Minimum balance top-up is $10.00.');
      return;
    }
    
    onAddCredits(Number(parsed.toFixed(2)));
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Clean Light Scrim Backdrop Without Blur */}
      <div 
        className="fixed inset-0 bg-black/20 transition-opacity" 
        onClick={() => !isProcessing && onClose()} 
      />

      {/* Modal Surface Container */}
      <div className="relative z-10 bg-white border border-zinc-300 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in">
        <div>
          <h3 className="text-lg font-extrabold text-[#1e1f24]">Top Up Gateway Credit Balance</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Add prepaid balance to cover usage overages and automated plan renewals ($10.00 minimum).
          </p>
        </div>

        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-[#1e1f24] block mb-1.5">
              Top Up Amount (USD $)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-500 font-bold">$</span>
              <input 
                type="number"
                step="0.01"
                min="10.00"
                required
                disabled={isProcessing}
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setValidationError(''); }}
                className="w-full bg-white border border-zinc-300 rounded-xl pl-8 pr-4 py-2.5 text-xs text-zinc-900 font-mono font-bold outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 transition-all"
                placeholder="10.00"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Minimum top-up: <strong className="text-[#1e1f24]">$10.00</strong></p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button 
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isProcessing}
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-md shadow-[#5865f2]/25 cursor-pointer flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={15} />
                  <span>Confirm $10+ Top Up</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
