import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Zap, AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import apiClient from "../../services/apiClient";

export default function ConfirmModal({ 
  isOpen, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  showCouponInput = false,
  variant = "primary", // "primary" | "destructive"
  onConfirm, 
  onCancel, 
  isLoading 
}) {
  const [showPromoField, setShowPromoField] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const data = await apiClient.post('/coupons/apply', { code: couponCode.trim() });
      if (data && data.success) {
        setAppliedCoupon(data);
      } else {
        setCouponError('Invalid or expired promotional code.');
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid promotional code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const couponApplied = Boolean(appliedCoupon);
  const isDestructive = variant === "destructive";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Clean Light Scrim Backdrop Without Blur */}
      <div 
        className="fixed inset-0 bg-black/20 transition-opacity" 
        onClick={onCancel} 
      />

      {/* Modal Surface */}
      <div className="relative z-10 bg-white border border-zinc-200 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
            isDestructive ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-primary/10 text-primary'
          }`}>
            {isDestructive ? <AlertTriangle size={18} /> : <Zap size={18} />}
          </div>
          <h3 className="text-base font-extrabold text-zinc-900 leading-tight">{title}</h3>
        </div>

        {message && <p className="text-xs text-zinc-600 leading-relaxed font-medium">{message}</p>}

        {/* PROMO CODE SECTION */}
        {showCouponInput && (
          <div className="pt-2">
            {!couponApplied ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowPromoField(!showPromoField)}
                  className="text-xs text-[#5865f2] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  {showPromoField ? 'Hide promo code' : 'Have a promo code?'}
                </button>

                {showPromoField && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. BUILDWITHAI20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 text-xs px-3 py-2 border border-zinc-300 rounded-xl uppercase font-mono bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-3 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      {couponLoading ? 'Validating...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-red-600 font-semibold">{couponError}</p>}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  🏷️ Code {appliedCoupon.code} ({appliedCoupon.discountPercent}% OFF)
                </span>
                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Discount Applied
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
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
            onClick={() => onConfirm(appliedCoupon)}
            disabled={isLoading}
            className={`inline-flex items-center justify-center whitespace-nowrap px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' 
                : 'bg-[#5865f2] hover:bg-[#4752c4] shadow-[#5865f2]/20'
            }`}
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
              confirmText || 'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
