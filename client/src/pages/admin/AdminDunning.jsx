import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, AlertTriangle, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export default function AdminDunning() {
  const { showNotification } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchFailedInvoices = async () => {
    try {
      const res = await apiClient.get('/admin/invoices/failed');
      if (res.success && res.data) {
        setInvoices(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch failed invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFailedInvoices();
  }, []);

  const triggerDunningSweep = async () => {
    setRetrying(true);
    try {
      const res = await apiClient.post('/billing/retry-failed', {});
      if (res.success) {
        const count = res.processedInvoices || 0;
        showNotification('success', `Sweep complete: ${count} invoice(s) retried/processed.`);
        await fetchFailedInvoices();
      }
    } catch (err) {
      showNotification('error', err.message || 'Dunning sweep failed.');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & DUNNING SWEEP BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1e1f24] tracking-tight">Dunning & Payment Recovery Center</h2>
          <p className="text-xs text-zinc-500 mt-1">Track payment failure retries, execution dates & automated subscription suspensions</p>
        </div>

        <button
          onClick={triggerDunningSweep}
          disabled={retrying}
          className="bg-zinc-900 hover:bg-black text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={15} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Running Dunning Sweep...' : 'Trigger Dunning Retry Sweep'}
        </button>
      </div>

      {/* RECOVERY SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-zinc-200 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">Pending Failed Invoices</span>
          <h3 className="text-3xl font-black text-rose-600 font-mono">{invoices.filter(i => i.status !== 'past_due').length}</h3>
          <p className="text-[11px] text-zinc-500">Invoices under active 48h retry schedule</p>
        </div>

        <div className="bg-card border border-zinc-200 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">Past-Due / Suspended</span>
          <h3 className="text-3xl font-black text-amber-600 font-mono">{invoices.filter(i => i.status === 'past_due').length}</h3>
          <p className="text-[11px] text-zinc-500">Max retries reached (3/3 threshold)</p>
        </div>

        <div className="bg-card border border-zinc-200 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">Retry Interval</span>
          <h3 className="text-3xl font-black text-[#1e1f24] font-mono">48 Hours</h3>
          <p className="text-[11px] text-zinc-500">Automated dunning cadence</p>
        </div>
      </div>

      {/* FAILED INVOICES MONITOR TABLE */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5">Invoice Ref ID</th>
                <th className="py-3.5 px-5">Customer Email</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Retry Attempt</th>
                <th className="py-3.5 px-5">Last Error Reason</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Next Retry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">Loading failed invoice logs...</td>
                </tr>
              ) : invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-zinc-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-5 font-mono text-zinc-600">
                      {inv.customerId?.email || 'Customer Account'}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-zinc-900">${Number(inv.amount).toFixed(2)}</td>
                    <td className="py-3.5 px-5 font-mono font-extrabold text-amber-700">
                      {inv.paymentRetries || 0} / 3
                    </td>
                    <td className="py-3.5 px-5 text-rose-600 font-mono text-[11px]">
                      {inv.lastFailureReason || 'Card declined / insufficient funds'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${inv.status === 'past_due' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                        {inv.status === 'past_due' ? '● Past Due (Suspended)' : '● Failed (Retrying)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-zinc-500">
                      {inv.nextRetryDate ? new Date(inv.nextRetryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Max threshold reached'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-emerald-600 font-semibold">
                    🎉 All invoices are healthy. No failed payments under dunning recovery.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
