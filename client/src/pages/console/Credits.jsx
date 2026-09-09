import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import apiClient from '../../services/apiClient';
import AddCreditsModal from '../../components/common/AddCreditsModal';
import InvoiceReceiptModal from '../../components/ui/InvoiceReceiptModal';
import { downloadInvoicePdf } from '../../utils/generateInvoicePdf';
import { CheckCircle2, Zap, CreditCard } from 'lucide-react';

const fallbackPlans = [
  {
    _id: 'fallback-starter',
    name: 'Starter',
    description: 'For small apps & AI prototyping',
    priceUSD: 19.99,
    featureLimits: { maxTokensPerMonth: 100000 }
  },
  {
    _id: 'fallback-pro',
    name: 'Pro',
    description: 'High-throughput Gateway for growing SaaS platforms',
    priceUSD: 49.99,
    featureLimits: { maxTokensPerMonth: 500000 }
  },
  {
    _id: 'fallback-enterprise',
    name: 'Max',
    description: 'Dedicated rate limits & high-volume token quotas',
    priceUSD: 199.99,
    featureLimits: { maxTokensPerMonth: 2500000 }
  }
];

export default function Credits() {
  const { user, plans, subscription, setSubscription, showNotification, fetchUserProfile } = useAuth();
  
  // Tenure & Billing Cycle State
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  // Modal & Top Up States
  const [addCreditsModalOpen, setAddCreditsModalOpen] = useState(false);
  const [topUpProcessing, setTopUpProcessing] = useState(false);
  const [selectedPlanForSwitch, setSelectedPlanForSwitch] = useState(null);
  const [switchLoading, setSwitchLoading] = useState(false);

  // Cancel Subscription Modal & Action State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Invoices & Payment History State
  const [invoices, setInvoices] = useState([]);

  // Animated Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState(null);

  const displayPlans = plans && plans.length > 0 ? plans : fallbackPlans;

  const hasSub = Boolean(subscription && subscription.planId);
  const isCanceling = Boolean(subscription?.cancelAtPeriodEnd);
  const planName = hasSub ? (subscription.planId.name || 'Starter') : 'No Active Plan';
  const planPrice = hasSub ? (subscription.planId.priceUSD || 19.99) : 0;
  const tokenQuota = hasSub ? (subscription.planId.featureLimits?.maxTokensPerMonth || 100000) : 0;

  const nextBillingFormatted = subscription?.currentPeriodEnd 
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(subscription.currentPeriodEnd))
    : 'October 9, 2026';

  const formatQuotaText = (num) => {
    if (!num) return '0 tokens / month';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}M tokens / month`;
    if (num >= 1000) return `${Math.round(num / 1000)}K tokens / month`;
    return `${num} tokens / month`;
  };

  const fetchInvoices = async () => {
    try {
      const res = await apiClient.get('/billing/history');
      if (res.success && res.data) {
        setInvoices(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch invoice history:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCancelSubscription = async () => {
    if (!subscription?._id) return;
    setCancelLoading(true);
    try {
      const res = await apiClient.put(`/subscriptions/${subscription._id}/cancel`);
      if (res.success) {
        setSubscription(res.data);
        if (fetchUserProfile) await fetchUserProfile();
        showNotification('success', `Subscription scheduled for cancellation on ${nextBillingFormatted}.`);
        setCancelModalOpen(false);
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to cancel subscription.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle Top-Up Flow with $10 Minimum and Animated Receipt Card
  const handleTopUpCredits = async (amountInput) => {
    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount < 10.00) {
      showNotification('error', "Minimum balance top-up is $10.00.");
      return;
    }

    setTopUpProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const data = await apiClient.post('/billing/top-up', { amount: parsedAmount });
      if (data.success) {
        if (fetchUserProfile) await fetchUserProfile();
        await fetchInvoices();
        
        setReceiptDetails({
          invoiceId: data.data.invoiceId || `INV-${Date.now().toString().slice(-6)}`,
          amount: parsedAmount,
          customerName: user?.name || user?.email || "API Customer",
          last4: data.data.last4 || "4242",
          barcode: data.data.barcode || `849204${Date.now().toString().slice(-4)}`
        });
        setAddCreditsModalOpen(false);
        setReceiptModalOpen(true);
        showNotification('success', `Top-up of $${parsedAmount.toFixed(2)} confirmed!`);
      }
    } catch (err) {
      showNotification('error', err.message || 'Top-up failed.');
    } finally {
      setTopUpProcessing(false);
    }
  };

  // Handle Tier Switch Confirmation & API Call
  const confirmTierSwitch = async () => {
    if (!selectedPlanForSwitch) return;
    setSwitchLoading(true);
    try {
      const planId = selectedPlanForSwitch._id || selectedPlanForSwitch.id;
      const existingSubId = subscription?._id || subscription?.id || user?.subscription?._id || user?.subscription?.id;
      let data;

      if (existingSubId) {
        data = await apiClient.put(`/subscriptions/${existingSubId}/change-plan`, { 
          newPlanId: planId,
          billingCycle
        });
      } else {
        data = await apiClient.post('/subscriptions', { 
          planId: planId, 
          currency: 'USD',
          billingCycle
        });
      }

      if (data && data.success) {
        setSubscription(data.data);
        if (fetchUserProfile) await fetchUserProfile();
        await fetchInvoices();

        const rawPrice = selectedPlanForSwitch.priceUSD || selectedPlanForSwitch.price || 19.99;
        const chargedAmount = billingCycle === 'yearly' ? Number((rawPrice * 0.8).toFixed(2)) : rawPrice;

        setReceiptDetails({
          invoiceId: data.data?.invoice?.invoiceNumber || `SUB-${Date.now().toString().slice(-6)}`,
          amount: chargedAmount,
          customerName: user?.name || user?.email || "API Customer",
          last4: "4242",
          barcode: `849204${String(planId).slice(-6)}`,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        });
        setSelectedPlanForSwitch(null);
        setReceiptModalOpen(true);
        showNotification('success', `Switched plan to '${selectedPlanForSwitch.name}' (${billingCycle})!`);
      }
    } catch (err) {
      console.error("Tier switch error:", err);
      showNotification('error', err.message || 'Failed to confirm tier switch. Check server logs.');
    } finally {
      setSwitchLoading(false);
    }
  };

  const handleViewReceipt = (inv) => {
    setReceiptDetails({
      invoiceId: inv.invoiceNumber || (inv._id ? `INV-${inv._id.slice(-8)}` : `INV-${Date.now().toString().slice(-6)}`),
      date: new Date(inv.createdAt || inv.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      customerName: user?.name || user?.email || "API Customer",
      last4: "4242",
      amount: Number(inv.amount || 0),
      barcode: `849204${(inv._id || Date.now()).toString().slice(-4)}`
    });
    setReceiptModalOpen(true);
  };

  // Cycle-Aware Plan Equivalence & Button Text Helpers
  const checkIsCurrentPlan = (tier) => {
    const currentTierName = (user?.subscription?.tierName || user?.subscription?.plan?.name || subscription?.planId?.name || '').toLowerCase();
    const currentCycle = subscription?.billingCycle || user?.subscription?.billingCycle || 'monthly';
    
    const sameTier = currentTierName && currentTierName.includes(tier.name.toLowerCase());
    return sameTier && currentCycle === billingCycle;
  };

  const getButtonText = (tier, isCurrent) => {
    if (isCurrent) return "Current Active Plan";

    const currentTierName = (user?.subscription?.tierName || user?.subscription?.plan?.name || subscription?.planId?.name || '').toLowerCase();
    const sameTier = currentTierName && currentTierName.includes(tier.name.toLowerCase());

    if (sameTier) {
      return billingCycle === 'yearly' || billingCycle === 'annual' ? "Switch to Yearly (Save 20%)" : "Switch to Monthly";
    }
    return `Switch to ${tier.name} →`;
  };

  return (
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1e1f24] tracking-tight">API Usage & Billing</h2>
          <p className="text-xs text-muted-foreground mt-1">Available balance, active plan tier, and subscription renewal dates</p>
        </div>
        <button 
          onClick={() => setAddCreditsModalOpen(true)}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-[#5865f2]/20 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <CreditCard size={15} />
          + Top Up Balance
        </button>
      </div>

      {/* BALANCE & CURRENT SUBSCRIPTION CARD METADATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider block">
              Available Account Balance
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-4xl font-black text-[#1e1f24] font-mono tracking-tight">
                {formatCurrency(Number(user?.creditsBalance || 0), 'USD')}
              </h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Active Balance
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Used automatically to cover usage overages and mid-cycle tier proration adjustments.
            </p>
          </div>
          <button 
            onClick={() => setAddCreditsModalOpen(true)}
            className="w-full bg-secondary hover:bg-zinc-200 text-zinc-900 font-bold text-xs py-2.5 rounded-xl border border-zinc-300 transition text-center cursor-pointer"
          >
            Top Up Balance
          </button>
        </div>

        {/* Current Plan & Metadata Summary Card */}
        <div className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                Current Plan
              </span>
              {hasSub && isCanceling ? (
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200">
                  Cancels on {nextBillingFormatted}
                </span>
              ) : (
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${hasSub ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'}`}>
                  <CheckCircle2 size={12} />
                  {hasSub ? 'Active' : 'Unsubscribed'}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-[#1e1f24]">{planName}</h3>
                {hasSub && (
                  <span className="text-xs font-mono text-emerald-700 font-bold block mt-0.5">${planPrice} / month</span>
                )}
              </div>
              <span className="text-xs text-zinc-600 font-mono font-semibold bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
                {formatQuotaText(tokenQuota)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Next Renewal Date
              </span>
              <span className="text-xs font-semibold text-zinc-800 font-mono mt-0.5 block">
                {hasSub ? nextBillingFormatted : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Proration Balance
                </span>
                <span className="text-xs font-bold text-emerald-700 font-mono mt-0.5 block">
                  ${subscription?.prorationBalanceUSD || '0.00'}
                </span>
              </div>
              {hasSub && !isCanceling && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Cancel Plan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TIER MANAGEMENT GRID - ALWAYS SHOW ALL TIERS SIDE-BY-SIDE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-[#1e1f24]">Change Subscription Tier</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Switch between tiers anytime with automatic mid-cycle proration credit adjustment</p>
          </div>

          {/* BILLING CYCLE TENURE TOGGLE */}
          <div className="inline-flex items-center bg-secondary p-1 rounded-xl border border-zinc-300 gap-1 self-start sm:self-center shadow-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-card text-[#1e1f24] shadow-xs'
                  : 'text-muted-foreground hover:text-[#1e1f24]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-card text-[#1e1f24] shadow-xs'
                  : 'text-muted-foreground hover:text-[#1e1f24]'
              }`}
            >
              <span>Yearly</span>
              <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/20">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayPlans.map((tier) => {
            const isCurrent = checkIsCurrentPlan(tier);
            const buttonText = getButtonText(tier, isCurrent);

            const rawPrice = tier.priceUSD || tier.price || 19.99;
            const finalPrice = billingCycle === 'yearly' ? (rawPrice * 0.8).toFixed(2) : rawPrice.toFixed(2);

            const isPopular = tier.name.toLowerCase() === 'pro';

            return (
              <div 
                key={tier._id || tier.id} 
                className={`bg-card rounded-2xl p-6 flex flex-col justify-between space-y-5 relative transition-all duration-200 ${
                  isCurrent 
                    ? 'border-2 border-[#5865f2] shadow-md shadow-[#5865f2]/10 bg-[#5865f2]/[0.02]' 
                    : 'border border-zinc-300 shadow-sm hover:border-zinc-400'
                }`}
              >
                {/* CLEAN NON-COLLIDING BADGE HEADER */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 whitespace-nowrap">
                  {isCurrent && (
                    <span className="bg-[#5865f2] text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <CheckCircle2 size={11} /> Active Plan
                    </span>
                  )}
                  {isPopular && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Zap size={11} className="fill-white" /> Most Popular
                    </span>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-base text-[#1e1f24]">{tier.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground min-h-[32px] leading-relaxed">{tier.description}</p>
                  <div className="flex items-baseline gap-1 py-1">
                    <span className="text-3xl font-black text-[#1e1f24] font-mono">${finalPrice}</span>
                    <span className="text-xs text-muted-foreground font-semibold">/ mo</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <span className="text-[11px] text-emerald-600 font-bold block">
                      Billed annually (${(finalPrice * 12).toFixed(2)}/yr)
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-zinc-100 border border-zinc-200 text-zinc-400 text-xs font-semibold rounded-xl cursor-not-allowed text-center"
                    >
                      {buttonText}
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedPlanForSwitch(tier)}
                      className="w-full py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-center"
                    >
                      {buttonText}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BILLING & PAYMENT HISTORY TABLE */}
      <div className="mt-10 bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Billing & Payment History</h3>
            <p className="text-xs text-zinc-500">Receipts for tier renewals, proration changes, and balance top-ups</p>
          </div>
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
            {(invoices && invoices.length) || 0} Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-5">Invoice / Ref ID</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Description</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-700 font-medium">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv._id || inv.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-zinc-900 font-semibold">{inv.invoiceNumber || (inv._id ? inv._id.slice(-8) : `INV-${Date.now().toString().slice(-6)}`)}</td>
                    <td className="py-3.5 px-5 text-zinc-500">
                      {new Date(inv.createdAt || inv.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-5">{inv.description || (inv.type === 'topup' ? 'Balance Top-Up' : 'Plan Subscription')}</td>
                    <td className="py-3.5 px-5 font-mono font-bold text-zinc-900">${Number(inv.amount).toFixed(2)}</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                        {inv.status || 'Paid'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-3">
                      <button
                        type="button"
                        onClick={() => handleViewReceipt(inv)}
                        className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                      >
                        View Receipt
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadInvoicePdf(inv, user)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#5865f2] hover:underline cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3" />
                        </svg>
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD CREDITS MODAL ($10 MINIMUM) */}
      <AddCreditsModal 
        isOpen={addCreditsModalOpen}
        onClose={() => setAddCreditsModalOpen(false)}
        onAddCredits={handleTopUpCredits}
        isProcessing={topUpProcessing}
      />

      {/* MODAL 2: CONFIRMATION DIALOG MODAL FOR TIER SWITCH */}
      {selectedPlanForSwitch && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Clean Light Scrim Backdrop Without Blur */}
          <div 
            className="fixed inset-0 bg-black/20 transition-opacity" 
            onClick={() => !switchLoading && setSelectedPlanForSwitch(null)} 
          />

          {/* Modal Surface Container */}
          <div className="relative z-10 bg-white border border-zinc-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#5865f2]/10 text-[#5865f2] flex items-center justify-center font-bold">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1e1f24]">Confirm Subscription Tier Switch</h3>
                <p className="text-xs text-zinc-500">Prorated adjustment applied to account credit</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">New Target Plan:</span>
                <strong className="text-[#1e1f24] font-extrabold">{selectedPlanForSwitch.name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Billing Tenure:</span>
                <strong className="text-[#1e1f24] capitalize font-bold">{billingCycle}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Monthly Billing Rate:</span>
                <strong className="text-[#1e1f24] font-mono">${(billingCycle === 'yearly' ? (selectedPlanForSwitch.priceUSD || 19.99) * 0.8 : (selectedPlanForSwitch.priceUSD || 19.99)).toFixed(2)} / mo</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlanForSwitch(null)}
                disabled={switchLoading}
                className="px-4 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTierSwitch}
                disabled={switchLoading}
                className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-md shadow-[#5865f2]/25 cursor-pointer flex items-center gap-2"
              >
                {switchLoading ? 'Processing Switch...' : 'Confirm Tier Switch'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: ANIMATED TICKET CONFIRMATION RECEIPT MODAL */}
      <InvoiceReceiptModal 
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        details={receiptDetails}
      />

      {/* MODAL 4: CANCEL SUBSCRIPTION CONFIRMATION DIALOG */}
      {cancelModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/20 transition-opacity" 
            onClick={() => !cancelLoading && setCancelModalOpen(null)} 
          />

          <div className="relative z-10 bg-white border border-zinc-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">Cancel Gateway Subscription</h3>
                <p className="text-xs text-zinc-500">Access remains active until period end</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to cancel your <strong className="text-zinc-900">{planName}</strong> plan? Your gateway rate limits and access will remain fully functional until <strong className="text-zinc-900">{nextBillingFormatted}</strong>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelLoading}
                className="px-4 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-md shadow-rose-500/25 cursor-pointer flex items-center gap-2"
              >
                {cancelLoading ? 'Canceling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
