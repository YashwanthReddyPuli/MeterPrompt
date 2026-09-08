import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Cpu, Activity, CreditCard, Layers, User, Key, ShieldCheck, Zap, Search, Copy, Check, ExternalLink } from 'lucide-react';

const gatewayModels = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    slug: 'openai/gpt-4o',
    provider: 'OpenAI',
    context: '128k ctx',
    promptCost: '$0.0020',
    promptCostNum: 0.002,
    completionCost: '$0.0040',
    latency: '142ms',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    slug: 'anthropic/claude-3.5-sonnet',
    provider: 'Anthropic',
    context: '200k ctx',
    promptCost: '$0.0030',
    promptCostNum: 0.003,
    completionCost: '$0.0060',
    latency: '185ms',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    slug: 'deepseek/deepseek-r1',
    provider: 'DeepSeek',
    context: '64k ctx',
    promptCost: '$0.0005',
    promptCostNum: 0.0005,
    completionCost: '$0.0010',
    latency: '95ms',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    slug: 'openai/gpt-4o-mini',
    provider: 'OpenAI',
    context: '128k ctx',
    promptCost: '$0.00015',
    promptCostNum: 0.00015,
    completionCost: '$0.0006',
    latency: '110ms',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
  }
];

export default function LandingPage({ setCurrentRoute, setAuthMode, navigateToDocs }) {
  const { currency } = useAuth();
  const [modelSearch, setModelSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [copiedSlug, setCopiedSlug] = useState('');

  const handleNavDocs = (tab) => {
    if (navigateToDocs) {
      navigateToDocs(tab);
    } else {
      setCurrentRoute('docs');
    }
  };

  const copySlug = (slug) => {
    navigator.clipboard.writeText(slug);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(''), 2000);
  };

  const filteredModels = gatewayModels.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(modelSearch.toLowerCase()) || m.slug.toLowerCase().includes(modelSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (providerFilter === 'All') return true;
    if (providerFilter === 'Low Cost') return m.promptCostNum < 0.001;
    return m.provider === providerFilter;
  });

  return (
    <div className="space-y-12 py-6">
      {/* HERO SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1e1f24] tracking-tight leading-tight">
          Unified AI API Gateway & Metered Billing Infrastructure
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Route LLM inference requests, track real-time token usage, enforce tiered rate limits, and automate prorated SaaS subscription billing.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <button 
            onClick={() => { setAuthMode('register'); setCurrentRoute('auth'); }}
            className="inline-flex items-center justify-center font-extrabold text-xs bg-[#5865f2] text-white px-6 py-3 rounded-[0.625rem] shadow-sm transition-all duration-200 ease-out hover:scale-[1.025] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#5865f2]/25 active:scale-95 cursor-pointer gap-2"
          >
            Start Free Trial
            <ArrowRight size={16} />
          </button>

          <button 
            onClick={() => setCurrentRoute('pricing')}
            className="inline-flex items-center justify-center font-bold text-xs bg-zinc-100 text-zinc-800 border border-zinc-300 px-6 py-3 rounded-[0.625rem] transition-all duration-200 ease-out hover:scale-[1.025] hover:-translate-y-0.5 hover:bg-zinc-200 hover:border-zinc-400 active:scale-95 cursor-pointer gap-1"
          >
            View Models & Pricing
          </button>
        </div>
      </div>

      {/* 4 REALISTIC INTERACTIVE FEATURE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CARD 1 */}
        <div 
          onClick={() => setCurrentRoute('pricing')}
          className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-md shadow-zinc-200/50 space-y-4 flex flex-col justify-between hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers size={22} />
            </div>
            <h3 className="font-bold text-sm text-[#1e1f24] group-hover:text-primary transition-colors">Text, Images, Videos, & Audio</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate anything through a single, unified interface. Access all major model capabilities in one place.
            </p>
          </div>
          <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1 pt-2">
            Browse Models &rarr;
          </span>
        </div>

        {/* CARD 2 */}
        <div 
          onClick={() => handleNavDocs('availability')}
          className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-md shadow-zinc-200/50 space-y-4 flex flex-col justify-between hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap size={22} />
            </div>
            <h3 className="font-bold text-sm text-[#1e1f24] group-hover:text-primary transition-colors">Higher Availability</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Reliable AI models via our distributed gateway infrastructure. Automatically fall back to other models when one provider goes down.
            </p>
          </div>
          <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1 pt-2">
            Learn More &rarr;
          </span>
        </div>

        {/* CARD 3 */}
        <div 
          onClick={() => handleNavDocs('performance')}
          className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-md shadow-zinc-200/50 space-y-4 flex flex-col justify-between hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity size={22} />
            </div>
            <h3 className="font-bold text-sm text-[#1e1f24] group-hover:text-primary transition-colors">Price and Performance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keep costs in check without sacrificing speed. MeterPrompt runs at sub-millisecond edge latency between your app and inference endpoints.
            </p>
          </div>
          <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1 pt-2">
            Performance Metrics &rarr;
          </span>
        </div>

        {/* CARD 4 */}
        <div 
          onClick={() => handleNavDocs('security')}
          className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-md shadow-zinc-200/50 space-y-4 flex flex-col justify-between hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-bold text-sm text-[#1e1f24] group-hover:text-primary transition-colors">Custom Data Policies</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Protect your organization with fine-grained data policies. Ensure prompts only go to the models and upstream providers you trust.
            </p>
          </div>
          <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1 pt-2">
            View Docs &rarr;
          </span>
        </div>
      </div>

      {/* OPENROUTER-STYLE INTERACTIVE MODEL REGISTRY TABLE */}
      <div className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-md shadow-zinc-200/50 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#1e1f24] flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              Available Gateway Models Catalog
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Production AI models routed via MeterPrompt edge infrastructure
            </p>
          </div>
          <button 
            onClick={() => setCurrentRoute('pricing')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            View Subscription Plans &rarr;
          </button>
        </div>

        {/* QUICK FILTER BAR & SEARCH INPUT */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-zinc-200">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Filter models..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="w-full bg-secondary/80 border border-zinc-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1e1f24] focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'OpenAI', 'Anthropic', 'DeepSeek', 'Low Cost'].map((tab) => (
              <button
                key={tab}
                onClick={() => setProviderFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  providerFilter === tab
                    ? 'bg-primary text-white shadow-2xs'
                    : 'bg-secondary text-zinc-600 hover:bg-zinc-200 hover:text-[#1e1f24]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="border border-zinc-300 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/90 text-zinc-700 font-bold uppercase text-[10px] border-b border-zinc-300 tracking-wider">
              <tr>
                <th className="p-3.5">Model & Identifier</th>
                <th className="p-3.5">Provider</th>
                <th className="p-3.5">Context</th>
                <th className="p-3.5">Prompt ($/1K)</th>
                <th className="p-3.5">Completion ($/1K)</th>
                <th className="p-3.5">Latency / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-sans text-xs bg-white">
              {filteredModels.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-muted-foreground text-xs">
                    No models matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredModels.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50/80 transition-colors">
                    {/* Model Name & Slug */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#1e1f24] text-sm">{m.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <code className="font-mono text-[11px] text-zinc-500">{m.slug}</code>
                      </div>
                    </td>

                    {/* Provider Tag */}
                    <td className="p-3.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs ${m.badgeClass}`}>
                        {m.provider}
                      </span>
                    </td>

                    {/* Context Window */}
                    <td className="p-3.5 font-mono">
                      <span className="bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        {m.context}
                      </span>
                    </td>

                    {/* Prompt Cost */}
                    <td className="p-3.5">
                      <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        {m.promptCost}
                      </span>
                    </td>

                    {/* Completion Cost */}
                    <td className="p-3.5">
                      <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        {m.completionCost}
                      </span>
                    </td>

                    {/* Latency & Status */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-mono font-semibold">~{m.latency}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-STEP INTERACTIVE HOW METERPROMPT WORKS WORKFLOW */}
      <div className="bg-card border border-zinc-300 p-8 rounded-2xl shadow-md shadow-zinc-200/50 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl font-bold text-[#1e1f24]">How MeterPrompt Works</h2>
          <p className="text-xs text-muted-foreground">Start routing AI requests in less than 2 minutes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div 
            onClick={() => { setAuthMode('register'); setCurrentRoute('auth'); }}
            className="bg-secondary/60 border border-zinc-300 p-6 rounded-xl space-y-3 relative flex flex-col justify-between hover:border-primary hover:bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  1
                </span>
                <h3 className="font-bold text-sm text-[#1e1f24] group-hover:text-primary transition-colors">1. Signup Account</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create a developer account to get started. You can set up team access anytime.
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2 font-mono text-[11px]">
                <User size={16} className="text-primary" />
                Auth Setup
              </span>
              <span className="text-primary font-bold text-[11px] group-hover:underline">Sign up &rarr;</span>
            </div>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => setCurrentRoute('pricing')}
            className="bg-secondary/60 border border-zinc-300 p-6 rounded-xl space-y-3 relative flex flex-col justify-between hover:border-primary hover:bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  2
                </span>
                <h3 className="font-bold text-sm text-[#1e1f24] group-hover:text-primary transition-colors">2. Buy credits or tier</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Credits can be used with any model or provider with automated USD ($) proration.
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2 font-mono text-[11px]">
                <CreditCard size={16} className="text-primary" />
                Prepaid Balances
              </span>
              <span className="text-primary font-bold text-[11px] group-hover:underline">View Plans &rarr;</span>
            </div>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => { setAuthMode('register'); setCurrentRoute('auth'); }}
            className="bg-secondary/60 border border-zinc-300 p-6 rounded-xl space-y-3 relative flex flex-col justify-between hover:border-primary hover:bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  3
                </span>
                <h3 className="font-bold text-sm text-[#1e1f24] group-hover:text-primary transition-colors">3. Get your API key</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create an API key and start making requests. <span className="font-semibold text-foreground underline">Fully OpenAI compatible</span>.
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2 font-mono text-[11px]">
                <Key size={16} className="text-primary" />
                Secret Keys
              </span>
              <span className="text-primary font-bold text-[11px] group-hover:underline">Get Key &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
