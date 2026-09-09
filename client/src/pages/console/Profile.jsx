import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, CreditCard, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function Profile({ setCurrentRoute }) {
  const { user, subscription, currency } = useAuth();

  const hasSub = Boolean(subscription && subscription.planId);
  const planName = hasSub ? (subscription.planId.name || 'Starter Plan') : 'No Active Plan';
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[#1e1f24] tracking-tight">Account & Subscription Details</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage user role credentials and active subscription status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details Card */}
        <div className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#1e1f24] flex items-center gap-2">
            <User size={18} className="text-[#5865f2]" />
            Account Credentials
          </h3>
          <div className="space-y-3.5 text-xs">
            <div className="pb-2 border-b border-zinc-200">
              <span className="text-zinc-500 block text-[10px] uppercase font-extrabold tracking-wider">Full Name</span>
              <span className="font-bold text-[#1e1f24] text-sm mt-0.5 block">{user?.name || 'Developer User'}</span>
            </div>
            <div className="pb-2 border-b border-zinc-200">
              <span className="text-zinc-500 block text-[10px] uppercase font-extrabold tracking-wider">Email Address</span>
              <span className="font-mono font-bold text-[#1e1f24] text-xs mt-0.5 block">{user?.email || 'user@company.com'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-extrabold tracking-wider mb-1">Account Role</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${user?.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'}`}>
                <Shield size={12} className="mr-1 inline" />
                {user?.role === 'admin' ? 'Admin' : 'Developer'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Subscription Tier Details Card */}
        <div className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#1e1f24] flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-[#5865f2]" />
              Subscription Status
            </h3>

            {hasSub ? (
              <div className="space-y-3.5 text-xs">
                <div className="pb-2 border-b border-zinc-200 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-[#1e1f24] text-base">{planName}</span>
                    <span className="text-xs font-mono text-emerald-700 font-bold block">${planPrice} / month</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[10px] rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Active
                  </span>
                </div>

                <div className="pb-2 border-b border-zinc-200 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-extrabold">Next Renewal Date</span>
                    <span className="font-mono text-[#1e1f24] font-bold mt-0.5 block">{nextBillingFormatted}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-extrabold">Token Quota</span>
                    <span className="font-mono text-[#1e1f24] font-bold mt-0.5 block">{formatQuotaText(tokenQuota)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-extrabold">Proration Balance</span>
                  <span className="font-mono text-emerald-700 font-bold text-sm mt-0.5 block">
                    ${subscription?.prorationBalanceUSD || '0.00'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <span className="px-3 py-1 bg-zinc-100 text-zinc-600 border border-zinc-200 font-bold text-xs rounded-full inline-block">
                  ● Unsubscribed
                </span>
                <p className="text-xs text-muted-foreground">No active gateway subscription plan.</p>
                <button 
                  onClick={() => setCurrentRoute('pricing')}
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-md shadow-[#5865f2]/20 cursor-pointer inline-flex items-center gap-1.5"
                >
                  Choose a Plan <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
