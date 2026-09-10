import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { downloadInvoicePdf } from '../../utils/generateInvoicePdf';
import { Search, Eye, ShieldAlert, CheckCircle, CreditCard, Key, FileText, X } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function AdminUsers() {
  const { showNotification } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Individual User Drilldown Drawer State
  const [selectedUser, setSelectedUser] = useState(null);
  const [drilldownData, setDrilldownData] = useState(null);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  // Suspension Confirmation Modal State
  const [userToSuspend, setUserToSuspend] = useState(null);
  const [suspendLoading, setSuspendLoading] = useState(false);

  // Credit balance adjustment modal state inside drilldown
  const [newCreditAmount, setNewCreditAmount] = useState('');
  const [adjustingCredits, setAdjustingCredits] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/admin/users');
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch user directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openDrilldown = async (u) => {
    setSelectedUser(u);
    setDrilldownLoading(true);
    setNewCreditAmount(u.creditsBalance || 0);
    try {
      const res = await apiClient.get(`/admin/users/${u._id}`);
      if (res.success && res.data) {
        setDrilldownData(res.data);
      }
    } catch (err) {
      showNotification('error', 'Failed to load user drilldown profile.');
    } finally {
      setDrilldownLoading(false);
    }
  };

  const handleAdjustCredits = async () => {
    if (!selectedUser) return;
    setAdjustingCredits(true);
    try {
      const res = await apiClient.put(`/admin/users/${selectedUser._id}/action`, {
        action: 'adjust_credits',
        creditsBalance: parseFloat(newCreditAmount) || 0
      });

      if (res.success) {
        showNotification('success', `Updated credit balance to $${parseFloat(newCreditAmount).toFixed(2)}.`);
        await fetchUsers();
        openDrilldown(selectedUser);
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to adjust credits.');
    } finally {
      setAdjustingCredits(false);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!userToSuspend) return;
    setSuspendLoading(true);
    try {
      const res = await apiClient.put(`/admin/users/${userToSuspend._id}/action`, {
        action: 'toggle_suspend',
        isSuspended: true
      });

      if (res.success) {
        showNotification('success', `User account ${userToSuspend.name} has been suspended. Status set to Inactive.`);
        setUserToSuspend(null);
        await fetchUsers();
        if (selectedUser && selectedUser._id === userToSuspend._id) {
          setSelectedUser(prev => ({ ...prev, isSuspended: true }));
          openDrilldown({ ...selectedUser, isSuspended: true });
        }
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to suspend user account.');
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleUnsuspend = async (targetUser) => {
    try {
      const res = await apiClient.put(`/admin/users/${targetUser._id}/action`, {
        action: 'toggle_suspend',
        isSuspended: false
      });

      if (res.success) {
        showNotification('success', `User account ${targetUser.name} reactivated. Status set to Active.`);
        await fetchUsers();
        if (selectedUser && selectedUser._id === targetUser._id) {
          setSelectedUser(prev => ({ ...prev, isSuspended: false }));
          openDrilldown({ ...selectedUser, isSuspended: false });
        }
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to reactivate user account.');
    }
  };

  const filteredUsers = users
    .filter(u => u.role !== 'admin')
    .filter(u => {
      const email = (u.email || '').toLowerCase();
      return !email.includes('@example.com') && !email.includes('@meterprompt.io') && !email.startsWith('dev_') && !email.startsWith('admin_');
    })
    .filter(u => 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1e1f24] tracking-tight">User Directory & Inspection</h2>
          <p className="text-xs text-zinc-500 mt-1">Manage customer accounts, inspect active API keys, credit ledger & quota meters</p>
        </div>

        {/* Real-time Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865f2] shadow-xs"
          />
        </div>
      </div>

      {/* GLOBAL USER TABLE */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5">Customer Name & Email</th>
                <th className="py-3.5 px-5">Current Plan Tier</th>
                <th className="py-3.5 px-5">Credit Balance</th>
                <th className="py-3.5 px-5">Active Keys</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">Loading user directory...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-zinc-900">{u.name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-zinc-800">
                      {u.currentPlanName && u.currentPlanName !== 'Free' && u.currentPlanName !== 'No Active Plan' 
                        ? `${u.currentPlanName} (${u.billingCycle || 'monthly'})` 
                        : (u.subscription?.planId?.name ? `${u.subscription.planId.name} (${u.subscription.planId.billingCycle || 'monthly'})` : 'Free')}
                    </td>

                    <td className="py-3.5 px-5 font-mono font-bold text-emerald-700">
                      ${Number(u.creditsBalance).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-zinc-700">{u.keyCount} keys</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.isSuspended ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {u.isSuspended ? '● Inactive' : '● Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => openDrilldown(u)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                      >
                        <Eye size={13} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">No users match query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INDIVIDUAL USER DRILLDOWN DRAWER MODAL */}
      {selectedUser && createPortal(
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={() => setSelectedUser(null)} />

          <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-[#1e1f24]">{selectedUser.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${selectedUser.isSuspended ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {selectedUser.isSuspended ? '● Inactive' : '● Active'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-mono">{selectedUser.email} • ID: {selectedUser._id}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="p-2 text-zinc-400 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {drilldownLoading ? (
              <div className="py-12 text-center text-xs text-zinc-400">Loading user profile telemetry...</div>
            ) : drilldownData ? (
              <div className="space-y-6">
                {/* TOKEN QUOTA METER */}
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-700">Billing Cycle Token Quota Meter</span>
                    <span className="font-mono text-zinc-900">
                      {drilldownData.tokenQuota.tokensUsed.toLocaleString()} / {drilldownData.tokenQuota.tokenLimit.toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${drilldownData.tokenQuota.usagePercentage}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${drilldownData.tokenQuota.usagePercentage > 85 ? 'bg-rose-500' : 'bg-[#5865f2]'}`}
                    />
                  </div>
                </div>

                {/* ADMIN ACTIONS CONTROL BAR */}
                <div className="bg-card border border-zinc-200 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Administrative Overrides</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Credit Balance Adjuster */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700 block">Adjust Account Credit Balance ($)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={newCreditAmount}
                          onChange={(e) => setNewCreditAmount(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                        />
                        <button
                          onClick={handleAdjustCredits}
                          disabled={adjustingCredits}
                          className="px-3 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    {/* Suspend / Unsuspend */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700 block">Account Status Control</label>
                      <button
                        onClick={() => {
                          if (selectedUser.isSuspended) {
                            handleUnsuspend(selectedUser);
                          } else {
                            setUserToSuspend(selectedUser);
                          }
                        }}
                        className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${selectedUser.isSuspended ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
                      >
                        <ShieldAlert size={14} />
                        {selectedUser.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUBSCRIPTION HISTORY */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                    <CreditCard size={14} /> Subscription & Audit Trail
                  </h4>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs space-y-2">
                    <div>
                      <span className="text-zinc-500">Plan Tier:</span>{' '}
                      <strong className="text-zinc-900">{drilldownData.subscription?.planId?.name || 'Free'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Billing Cycle:</span>{' '}
                      <strong className="text-zinc-900 capitalize">{drilldownData.subscription?.planId?.billingCycle || 'N/A'}</strong>
                    </div>
                    {drilldownData.subscription?.auditTrail?.length > 0 && (
                      <div className="pt-2 border-t border-zinc-200 space-y-1">
                        <span className="text-zinc-500 block font-semibold">Audit Logs:</span>
                        {drilldownData.subscription.auditTrail.map((log, idx) => (
                          <div key={idx} className="text-[11px] text-zinc-600 font-mono">
                            • [{new Date(log.timestamp).toLocaleDateString()}] {log.action}: {log.note}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* API KEYS TABLE */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                    <Key size={14} /> Active API Keys ({drilldownData.apiKeys?.length || 0})
                  </h4>
                  <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden text-xs">
                    {drilldownData.apiKeys?.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Prefix</th>
                            <th className="py-2.5 px-3">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {drilldownData.apiKeys.map((k) => (
                            <tr key={k._id}>
                              <td className="py-2.5 px-3 font-semibold">{k.name}</td>
                              <td className="py-2.5 px-3 font-mono text-zinc-500">{k.keyPrefix}...</td>
                              <td className="py-2.5 px-3 text-zinc-500">{new Date(k.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center text-zinc-400">No secret keys generated.</div>
                    )}
                  </div>
                </div>

                {/* INVOICES LEDGER */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                    <FileText size={14} /> Invoices & Ledger
                  </h4>
                  <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden text-xs">
                    {drilldownData.invoices?.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Ref ID</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {drilldownData.invoices.map((inv) => (
                            <tr key={inv._id}>
                              <td className="py-2.5 px-3 font-mono">{inv.invoiceNumber}</td>
                              <td className="py-2.5 px-3 font-mono font-bold">${Number(inv.amount).toFixed(2)}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                  {inv.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => downloadInvoicePdf(inv, selectedUser)}
                                  className="text-[#5865f2] font-semibold hover:underline cursor-pointer"
                                >
                                  PDF
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center text-zinc-400">No invoices recorded.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>,
        document.body
      )}

      {/* DESTRUCTIVE ACCOUNT SUSPENSION CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={Boolean(userToSuspend)}
        title="Suspend Developer Account"
        message={`Are you sure you want to suspend ${userToSuspend?.name} (${userToSuspend?.email})? This action is destructive: the account status will be set to Inactive, and active API gateway inference requests will be halted.`}
        confirmText="Suspend Account"
        cancelText="Cancel"
        variant="destructive"
        isLoading={suspendLoading}
        onConfirm={handleConfirmSuspend}
        onCancel={() => setUserToSuspend(null)}
      />
    </div>
  );
}
