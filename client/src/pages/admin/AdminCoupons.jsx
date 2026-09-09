import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Tag, Plus, CheckCircle, X, Percent, Calendar, Hash } from 'lucide-react';

export default function AdminCouponsView() {
  const { showNotification } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountPercent: 20,
    validTill: '2026-12-31',
    maxRedemptions: 100
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/coupons');
      if (res.success && res.data) {
        setCoupons(res.data);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post('/admin/coupons', formData);
      if (res.success) {
        showNotification('success', `Coupon '${formData.code.toUpperCase()}' minted successfully!`);
        setShowModal(false);
        setFormData({ code: '', discountPercent: 20, validTill: '2026-12-31', maxRedemptions: 100 });
        await fetchCoupons();
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to mint promotional coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const res = await apiClient.patch(`/admin/coupons/${id}/toggle`, {});
      if (res.success) {
        showNotification('success', `Coupon ${!currentStatus ? 'activated' : 'disabled'} successfully.`);
        await fetchCoupons();
      }
    } catch (err) {
      showNotification('error', 'Failed to toggle coupon status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & MINT BUTTON */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1e1f24] tracking-tight flex items-center gap-2">
            <Tag size={22} className="text-[#5865f2]" /> Promotions & Coupon Management
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Mint promotional discount codes, enforce redemption caps & govern expiration horizons</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-xl shadow-md shadow-[#5865f2]/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} /> Mint New Coupon
        </button>

      </div>

      {/* COUPONS TABLE */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-5">Promo Code</th>
              <th className="py-3.5 px-5">Discount Rate</th>
              <th className="py-3.5 px-5">Expiration Date</th>
              <th className="py-3.5 px-5">Redemption Cap</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-zinc-700 font-medium">
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-zinc-400 font-mono">Loading promotion registry...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-zinc-400 font-mono">No active promotional coupons created yet.</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-zinc-900 flex items-center gap-1.5">
                    🏷️ {c.code}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-emerald-600 font-bold">{c.discountPercent}% OFF</td>
                  <td className="py-3.5 px-5 font-mono text-zinc-600">
                    {new Date(c.validTill).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-zinc-700 font-semibold">
                    {c.timesRedeemed || 0} / {c.maxRedemptions || '∞'}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {c.isActive ? '● Active' : '● Disabled'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleToggle(c._id, c.isActive)}
                      className="text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:underline cursor-pointer"
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MINT COUPON MODAL */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={() => !submitting && setShowModal(false)} />

          <div className="relative z-10 bg-white rounded-2xl p-6 border border-zinc-200 shadow-2xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-extrabold text-[#1e1f24]">Mint Promotional Coupon</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-900 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAUNCH50"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs uppercase font-mono outline-none focus:ring-2 focus:ring-[#5865f2] bg-zinc-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Discount (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#5865f2]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Max Uses</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxRedemptions}
                    onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#5865f2]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={formData.validTill}
                  onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#5865f2]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-extrabold text-white bg-[#5865f2] hover:bg-[#4752c4] rounded-xl shadow-xs transition cursor-pointer"
                >
                  {submitting ? 'Minting...' : 'Mint Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
