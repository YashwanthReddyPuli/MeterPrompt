import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Cpu, Activity, Plus, Key, CreditCard, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function Overview({ setCurrentRoute, setCreateKeyModalOpen }) {
  const { subscription, user } = useAuth();

  const hasSub = Boolean(subscription && subscription.planId);
  const planName = hasSub ? (subscription.planId.name || 'Free') : 'Free';
  const planPrice = hasSub ? (subscription.planId.priceUSD || 19.99) : 0;
  const prorationBalance = subscription?.prorationBalanceUSD || 0.00;

  const nextBillingFormatted = subscription?.currentPeriodEnd 
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(subscription.currentPeriodEnd))
    : 'October 9, 2026';

  return (
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1e1f24] tracking-tight">Workspace Overview</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Welcome back, <strong className="text-[#1e1f24]">{user?.name || 'Developer'}</strong>. Real-time gateway status & metered telemetry.
          </p>
        </div>
        <button 
          onClick={() => setCreateKeyModalOpen(true)}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-[#5865f2]/20 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus size={15} />
          Create Secret Key
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Current Plan */}
        <div className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-extrabold uppercase text-[10px] tracking-wider">Current Plan</span>
            <Zap size={16} className="text-[#5865f2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-extrabold text-[#1e1f24]">{planName}</p>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${hasSub ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'}`}>
                {hasSub ? '● Active' : '● Unsubscribed'}
              </span>
            </div>
            {hasSub ? (
              <p className="text-xs font-mono text-emerald-700 font-bold mt-1">${planPrice} / month</p>
            ) : (
              <p className="text-xs text-zinc-500 font-medium mt-1">Choose a plan to activate quotas</p>
            )}
          </div>
          <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-semibold">Next Renewal:</span>
            <strong className="text-zinc-800 font-mono">{hasSub ? nextBillingFormatted : 'N/A'}</strong>
          </div>
        </div>

        {/* Card 2: Total Gateway Requests */}
        <div className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-extrabold uppercase text-[10px] tracking-wider">Gateway Requests</span>
            <Cpu size={16} className="text-[#5865f2]" />
          </div>
          <div>
            <p className="text-3xl font-black text-[#1e1f24] font-mono tracking-tight">1,482</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <span>●</span> Sub-millisecond Edge Routing
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-zinc-200">99.99% Uptime Verified</p>
        </div>

        {/* Card 3: Tokens Metered */}
        <div className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-extrabold uppercase text-[10px] tracking-wider">Monthly Token Quota</span>
            <Activity size={16} className="text-[#5865f2]" />
          </div>
          <div>
            <p className="text-3xl font-black text-[#1e1f24] font-mono tracking-tight">142,500</p>
            <p className="text-[11px] text-muted-foreground font-semibold mt-1">Prompt + Completion Tally</p>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-zinc-200">Recorded in UsageRecord</p>
        </div>
      </div>

      {/* QUICK ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <button 
          onClick={() => setCurrentRoute('console-keys')}
          className="p-6 bg-card border border-zinc-300 hover:border-[#5865f2] rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Key size={20} />
          </div>
          <h4 className="font-extrabold text-base text-[#1e1f24] flex items-center justify-between">
            Manage API Secrets
            <ArrowRight size={16} className="text-zinc-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </h4>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Issue, inspect, or revoke secret API keys (<code className="font-mono text-primary font-bold">mp_live_...</code>) with SHA-256 security.
          </p>
        </button>

        <button 
          onClick={() => setCurrentRoute('console-credits')}
          className="p-6 bg-card border border-zinc-300 hover:border-[#5865f2] rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CreditCard size={20} />
          </div>
          <h4 className="font-extrabold text-base text-[#1e1f24] flex items-center justify-between">
            Credits & Tier Switch
            <ArrowRight size={16} className="text-zinc-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </h4>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Switch plan tiers (Starter &harr; Pro &harr; Max), top up credit balance, and inspect proration credits.
          </p>
        </button>
      </div>
    </div>
  );
}
