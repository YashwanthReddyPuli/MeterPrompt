import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, CheckCircle2, Zap } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function AdminPlans() {
  const { showNotification } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Confirm Deactivate Modal State
  const [deactivatePlanTarget, setDeactivatePlanTarget] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceUSD: '',
    priceINR: '',
    billingCycle: 'monthly',
    maxRequestsPerMinute: 60,
    maxTokensPerMonth: 100000,
    allowedModels: 'gpt-4o, gpt-4o-mini'
  });

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get('/plans');
      if (res.success && res.data) {
        setPlans(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch plan catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      priceUSD: '29.99',
      priceINR: '2399',
      billingCycle: 'monthly',
      maxRequestsPerMinute: 120,
      maxTokensPerMonth: 250000,
      allowedModels: 'gpt-4o, gpt-4o-mini'
    });
    setIsModalOpen(true);
  };

  const handleDeactivateClick = (plan) => {
    setDeactivatePlanTarget(plan);
  };

  const executeDeactivate = async () => {
    if (!deactivatePlanTarget) return;
    setIsDeactivating(true);
    try {
      const res = await apiClient.delete(`/plans/${deactivatePlanTarget._id}`);
      if (res.success) {
        showNotification('success', `Plan '${deactivatePlanTarget.name}' deactivated successfully.`);
        await fetchPlans();
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to deactivate plan.');
    } finally {
      setIsDeactivating(false);
      setDeactivatePlanTarget(null);
    }
  };

  const openEditModal = (p) => {
    setEditingPlan(p);
    setFormData({
      name: p.name,
      description: p.description || '',
      priceUSD: p.priceUSD || p.price || 0,
      priceINR: p.priceINR || Math.round((p.priceUSD || 0) * 80),
      billingCycle: p.billingCycle || 'monthly',
      maxRequestsPerMinute: p.featureLimits?.maxRequestsPerMinute || 60,
      maxTokensPerMonth: p.featureLimits?.maxTokensPerMonth || 100000,
      allowedModels: Array.isArray(p.featureLimits?.allowedModels) 
        ? p.featureLimits.allowedModels.join(', ') 
        : 'gpt-4o, gpt-4o-mini'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      priceUSD: parseFloat(formData.priceUSD),
      priceINR: parseFloat(formData.priceINR),
      billingCycle: formData.billingCycle,
      featureLimits: {
        maxRequestsPerMinute: parseInt(formData.maxRequestsPerMinute),
        maxTokensPerMonth: parseInt(formData.maxTokensPerMonth),
        allowedModels: formData.allowedModels.split(',').map(m => m.trim()).filter(Boolean)
      }
    };

    try {
      if (editingPlan) {
        const res = await apiClient.put(`/plans/${editingPlan._id || editingPlan.id}`, payload);
        if (res.success) {
          showNotification('success', `Plan '${formData.name}' updated successfully.`);
        }
      } else {
        const res = await apiClient.post('/plans', payload);
        if (res.success) {
          showNotification('success', `New plan '${formData.name}' created successfully.`);
        }
      }
      setIsModalOpen(false);
      await fetchPlans();
    } catch (err) {
      showNotification('error', err.message || 'Failed to save plan configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id, planName) => {
    if (!window.confirm(`Deactivate plan '${planName}'? Existing subscribers will retain access until cycle end.`)) return;
    try {
      const res = await apiClient.delete(`/plans/${id}`);
      if (res.success) {
        showNotification('success', `Plan '${planName}' deactivated.`);
        await fetchPlans();
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to deactivate plan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & CREATE BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1e1f24] tracking-tight">Dynamic Plan Management (CRUD)</h2>
          <p className="text-xs text-zinc-500 mt-1">Configure subscription pricing, rate limits & token quotas without code deployments</p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-md shadow-[#5865f2]/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Create New Tier
        </button>

      </div>

      {/* PLANS TABLE */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5">Tier Name & Description</th>
                <th className="py-3.5 px-5">Pricing (USD / INR)</th>
                <th className="py-3.5 px-5">Cycle</th>
                <th className="py-3.5 px-5">Rate Limit</th>
                <th className="py-3.5 px-5">Token Quota</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">Loading plan catalog...</td>
                </tr>
              ) : plans.map((p) => (
                <tr key={p._id || p.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-extrabold text-zinc-900 flex items-center gap-1.5">
                      {p.name}
                      {p.name.toLowerCase() === 'pro' && <Zap size={13} className="text-amber-500 fill-amber-500" />}
                    </div>
                    <div className="text-[11px] text-zinc-500 max-w-xs truncate">{p.description}</div>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-zinc-900">
                    ${(p.priceUSD || p.price || 0).toFixed(2)} / ₹{p.priceINR || Math.round((p.priceUSD || 0) * 80)}
                  </td>
                  <td className="py-3.5 px-5 uppercase font-bold text-zinc-600">{p.billingCycle || 'monthly'}</td>
                  <td className="py-3.5 px-5 font-mono">{p.featureLimits?.maxRequestsPerMinute || 60} req/min</td>
                  <td className="py-3.5 px-5 font-mono font-bold text-emerald-700">
                    {(p.featureLimits?.maxTokensPerMonth || 100000).toLocaleString()} tokens
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {p.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer"
                      title="Edit Tier"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeactivateClick(p)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Deactivate Tier"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM DEACTIVATE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deactivatePlanTarget)}
        title={`Deactivate Plan '${deactivatePlanTarget?.name}'?`}
        message={`Are you sure you want to deactivate the '${deactivatePlanTarget?.name}' plan tier? Existing active subscribers will retain access until the end of their current billing cycle.`}
        confirmText="Deactivate Tier"
        cancelText="Keep Active"
        variant="destructive"
        isLoading={isDeactivating}
        onConfirm={executeDeactivate}
        onCancel={() => setDeactivatePlanTarget(null)}
      />

      {/* CREATE / EDIT PLAN MODAL */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={() => !submitting && setIsModalOpen(false)} />

          <div className="relative z-10 bg-white border border-zinc-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-[#1e1f24] border-b border-zinc-100 pb-3">
              {editingPlan ? `Edit Subscription Tier '${editingPlan.name}'` : 'Create New Subscription Tier'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Billing Cycle</label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly (Annual)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Price (USD $)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.priceUSD}
                    onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Price (INR ₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.priceINR}
                    onChange={(e) => setFormData({ ...formData, priceINR: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Max Requests / Min</label>
                  <input
                    type="number"
                    required
                    value={formData.maxRequestsPerMinute}
                    onChange={(e) => setFormData({ ...formData, maxRequestsPerMinute: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Max Tokens / Month</label>
                  <input
                    type="number"
                    required
                    value={formData.maxTokensPerMonth}
                    onChange={(e) => setFormData({ ...formData, maxTokensPerMonth: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Supported Models (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.allowedModels}
                  onChange={(e) => setFormData({ ...formData, allowedModels: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-extrabold px-5 py-2 rounded-xl transition cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Plan Configuration'}
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
