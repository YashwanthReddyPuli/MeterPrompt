import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Check, CheckCircle2, Zap } from 'lucide-react';
import apiClient from '../../services/apiClient';
import InvoiceReceiptModal from '../../components/ui/InvoiceReceiptModal';
import ConfirmModal from '../../components/ui/ConfirmModal';

const fallbackPlans = [
  {
    _id: 'fallback-starter',
    name: 'Starter',
    description: 'For small apps & AI prototyping',
    priceUSD: 19.99,
    billingCycle: 'monthly',
    featureLimits: { 
      maxRequestsPerMinute: 60, 
      maxTokensPerMonth: 100000, 
      allowedModels: ['gpt-4o', 'gpt-4o-mini'], 
      overageRatePer1kTokensUSD: 0.002
    }
  },
  {
    _id: 'fallback-pro',
    name: 'Pro',
    description: 'High-throughput Gateway for growing SaaS platforms',
    priceUSD: 49.99,
    billingCycle: 'monthly',
    featureLimits: { 
      maxRequestsPerMinute: 300, 
      maxTokensPerMonth: 500000, 
      allowedModels: ['gpt-4o', 'claude-3-5-sonnet', 'gpt-4o-mini'], 
      overageRatePer1kTokensUSD: 0.0015
    }
  },
  {
    _id: 'fallback-enterprise',
    name: 'Max',
    description: 'Dedicated rate limits & high-volume token quotas',
    priceUSD: 199.99,
    billingCycle: 'monthly',
    featureLimits: { 
      maxRequestsPerMinute: 1200, 
      maxTokensPerMonth: 2500000, 
      allowedModels: ['gpt-4o', 'claude-3-5-sonnet', 'deepseek-r1'], 
      overageRatePer1kTokensUSD: 0.001
    }
  }
];

export default function ModelsCatalog({ setCurrentRoute, setAuthMode }) {
  const { user, plans, plansLoading, subscription, setSubscription, token, showNotification, fetchUserProfile } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  
  // Confirmation Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [targetPlanForModal, setTargetPlanForModal] = useState(null);
  const [modalActionType, setModalActionType] = useState('subscribe'); // 'subscribe' | 'switch'
  const [modalLoading, setModalLoading] = useState(false);

  // Animated Ticket Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState(null);

  const displayPlans = (plans && plans.length > 0 ? plans : fallbackPlans).map(p => {
    let cleanName = p.name;
    if (p.name.toLowerCase().includes('starter')) cleanName = 'Starter';
    else if (p.name.toLowerCase().includes('pro')) cleanName = 'Pro';
    else if (p.name.toLowerCase().includes('enterprise') || p.name.toLowerCase().includes('ultra') || p.name.toLowerCase().includes('max')) cleanName = 'Max';
    return { ...p, name: cleanName };
  });

  const formatQuota = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}M tokens / mo`;
    if (num >= 1000) return `${Math.round(num / 1000)}K tokens / mo`;
    return `${num} tokens / mo`;
  };

  const initiatePlanAction = (targetPlan) => {
    if (!user && !token) {
      setAuthMode('register');
      setCurrentRoute('auth');
      showNotification('info', 'Please sign in or create an account to subscribe.');
      return;
    }

    const currentPlanName = (user?.subscription?.tierName || user?.subscription?.plan?.name || subscription?.planId?.name || '').toLowerCase();
    const currentCycle = subscription?.billingCycle || user?.subscription?.billingCycle || 'monthly';
    
    const isCurrentPlan = currentPlanName.includes(targetPlan.name.toLowerCase()) && currentCycle === billingCycle;
    if (isCurrentPlan) return;

    const action = subscription ? 'switch' : 'subscribe';
    setTargetPlanForModal(targetPlan);
    setModalActionType(action);
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = async (appliedCoupon) => {
    if (!targetPlanForModal) return;
    setModalLoading(true);
    try {
      const planId = targetPlanForModal._id || targetPlanForModal.id;
      const existingSubId = subscription?._id || subscription?.id;
      let data;

      if (modalActionType === 'subscribe' || !existingSubId) {
        data = await apiClient.post('/subscriptions', { 
          planId: planId, 
          currency: 'USD',
          billingCycle 
        });
      } else {
        data = await apiClient.put(`/subscriptions/${existingSubId}/change-plan`, { 
          newPlanId: planId,
          billingCycle 
        });
      }

      if (data && data.success) {
        setSubscription(data.data);
        if (fetchUserProfile) await fetchUserProfile();

        const rawPrice = targetPlanForModal.priceUSD || 19.99;
        let chargedAmount = billingCycle === 'yearly' ? Number((rawPrice * 12 * 0.8).toFixed(2)) : rawPrice;

        if (appliedCoupon && appliedCoupon.discountPercent) {
          chargedAmount = Number((chargedAmount * (1 - appliedCoupon.discountPercent / 100)).toFixed(2));
        }

        // Open Animated Ticket Receipt Card Modal with Confetti Burst
        setReceiptDetails({
          invoiceId: data.data?.invoice?.invoiceNumber || `SUB-${Date.now().toString().slice(-6)}`,
          amount: chargedAmount,
          customerName: user?.name || user?.email || "API Customer",
          last4: "4242",
          barcode: `849204${String(planId).slice(-6)}`,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        });
        setConfirmModalOpen(false);
        setReceiptModalOpen(true);
        showNotification('success', `Plan updated to '${targetPlanForModal.name}'!`);
      }
    } catch (err) {
      console.error("Subscription update error:", err);
      showNotification('error', err.message || 'Failed to process subscription update.');
    } finally {
      setModalLoading(false);
    }
  };


  return (
    <div className="space-y-10 py-4 max-w-6xl mx-auto">
      {/* UNBOXED HERO SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e1f24]">
          Scalable Pricing for AI Infrastructure
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Predictable monthly tiers with zero-margin overages. Upgrade, downgrade, or cancel anytime with mid-cycle proration.
        </p>

        {/* BILLING CYCLE TOGGLE */}
        <div className="inline-flex items-center bg-secondary p-1 rounded-xl border border-zinc-300 gap-1 pt-1 mt-2 shadow-xs">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-card text-[#1e1f24] shadow-xs'
                : 'text-muted-foreground hover:text-[#1e1f24]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
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

      {/* 3-COLUMN PRICING GRID */}
      {plansLoading ? (
        <div className="text-center py-12 text-muted-foreground text-xs">Loading subscription plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {displayPlans.map((plan) => {
            const currentTierName = (user?.subscription?.tierName || user?.subscription?.plan?.name || subscription?.planId?.name || '').toLowerCase();
            const currentCycle = subscription?.billingCycle || user?.subscription?.billingCycle || 'monthly';
            const sameTier = Boolean(currentTierName && currentTierName.includes(plan.name.toLowerCase()));
            const isCurrent = Boolean(subscription && sameTier && currentCycle === billingCycle);
            const isPopular = plan.name === 'Pro';
            
            // Calculate 20% discount if yearly billing
            const rawPrice = plan.priceUSD;
            const finalPrice = billingCycle === 'yearly' ? (rawPrice * 0.8).toFixed(2) : rawPrice;
            const overage = `$${plan.featureLimits?.overageRatePer1kTokensUSD || 0.002} / 1K tokens`;

            let buttonLabel = 'Current Active Plan';
            if (!isCurrent) {
              if (!token) {
                buttonLabel = 'Sign In to Subscribe →';
              } else if (sameTier) {
                buttonLabel = billingCycle === 'yearly' ? 'Switch to Yearly (Save 20%)' : 'Switch to Monthly';
              } else if (subscription) {
                buttonLabel = `Switch to ${plan.name} →`;
              } else {
                buttonLabel = `Subscribe to ${plan.name} →`;
              }
            }

            return (
              <div 
                key={plan._id}
                onClick={() => !isCurrent && initiatePlanAction(plan)}
                className={`bg-card rounded-2xl p-7 flex flex-col justify-between relative transition-all duration-300 cursor-pointer group hover:-translate-y-2 ${
                  isPopular
                    ? 'border-2 border-[#5865f2] shadow-xl shadow-[#5865f2]/10 hover:shadow-2xl hover:shadow-[#5865f2]/20'
                    : 'border border-zinc-300 shadow-sm hover:border-zinc-400 hover:shadow-md'
                } ${isCurrent ? 'ring-2 ring-primary/20 bg-primary/[0.02]' : ''}`}
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

                <div className="space-y-6">
                  {/* CARD HEADER */}
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1e1f24] group-hover:text-primary transition-colors flex items-center gap-2">
                      {plan.name}
                      {isPopular && <Zap size={16} className="text-[#5865f2]" />}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* PRICE DISPLAY */}
                  <div className="py-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black tracking-tight text-[#1e1f24]">${finalPrice}</span>
                      <span className="text-xs text-muted-foreground font-semibold">/ mo</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <span className="text-[11px] text-emerald-600 font-bold block mt-1">
                        Billed annually (${(finalPrice * 12).toFixed(2)}/yr)
                      </span>
                    )}
                  </div>

                  <div className="border-t border-zinc-200 my-4"></div>

                  {/* FEATURE CHECKLIST */}
                  <div className="space-y-3.5 text-xs">
                    {/* Rate Limit */}
                    <div className="flex items-center gap-2.5 text-zinc-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                      <span className="font-medium">
                        Rate Limit: <strong className="text-[#1e1f24] font-mono">{plan.featureLimits?.maxRequestsPerMinute} req / min</strong>
                      </span>
                    </div>

                    {/* Token Quota */}
                    <div className="flex items-center gap-2.5 text-zinc-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                      <span className="font-medium">
                        Token Quota: <strong className="text-[#1e1f24] font-mono">{formatQuota(plan.featureLimits?.maxTokensPerMonth || 100000)}</strong>
                      </span>
                    </div>

                    {/* Overage Rate */}
                    <div className="flex items-center gap-2.5 text-zinc-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">Overage Rate:</span>
                        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                          {overage}
                        </span>
                      </div>
                    </div>

                    {/* Supported Models */}
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center gap-2 text-zinc-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <Check size={11} className="stroke-[3]" />
                        </div>
                        <span className="font-medium">Supported Models:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-6">
                        {plan.featureLimits?.allowedModels?.map((m, i) => (
                          <span key={i} className="px-2 py-0.5 bg-secondary text-[#1e1f24] text-[10px] font-mono font-bold rounded-md border border-zinc-300 group-hover:border-primary/40 transition-colors">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    initiatePlanAction(plan);
                  }}
                  disabled={isCurrent}
                  className={`w-full mt-8 py-3 px-4 rounded-[0.625rem] text-xs font-bold transition-all duration-200 ease-out flex items-center justify-center gap-2 cursor-pointer ${
                    isCurrent 
                      ? 'bg-secondary text-muted-foreground cursor-not-allowed border border-zinc-300'
                      : isPopular
                      ? 'bg-[#5865f2] text-white hover:bg-[#4752c4] shadow-sm hover:scale-[1.025] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#5865f2]/25 active:scale-95'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:scale-[1.025] hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/25 active:scale-95'
                  }`}
                >
                  {buttonLabel}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {/* CONFIRMATION MODAL */}
      <ConfirmModal 
        isOpen={confirmModalOpen}
        title={modalActionType === 'subscribe' ? `Subscribe to ${targetPlanForModal?.name || 'Plan'}` : `Switch to ${targetPlanForModal?.name || 'Plan'}`}
        message={`Are you sure you want to ${modalActionType === 'subscribe' ? 'subscribe to' : 'switch your tier to'} ${targetPlanForModal?.name || 'this plan'} (${billingCycle === 'yearly' ? 'billed annually with 20% discount' : 'billed monthly'})?`}
        confirmText={modalActionType === 'subscribe' ? 'Confirm Subscription' : 'Confirm Tier Switch'}
        showCouponInput={true}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModalOpen(false)}
        isLoading={modalLoading}
      />


      {/* ANIMATED RECEIPT MODAL */}
      <InvoiceReceiptModal 
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        details={receiptDetails}
      />
    </div>
  );
}
