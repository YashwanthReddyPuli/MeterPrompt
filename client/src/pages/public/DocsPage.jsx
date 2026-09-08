import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Terminal, ShieldCheck, Zap, Layers, CreditCard, AlertTriangle, 
  HelpCircle, Copy, Check, ChevronRight, Server, Lock, Cpu, ArrowRight, Code, FileText, Database, Key, CheckCircle2, ArrowUpRight
} from 'lucide-react';

export default function DocsPage({ docsTab = 'overview', setDocsTab }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [codeLang, setCodeLang] = useState('curl'); // 'curl' | 'js' | 'openai' | 'python'
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Sync state with props and URL query parameters / hash on mount & change
  useEffect(() => {
    // 1. Check URL search params or hash
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') || window.location.hash.replace('#', '');
    
    if (tabParam) {
      setActiveSection(normalizeTabKey(tabParam));
    } else if (docsTab) {
      setActiveSection(normalizeTabKey(docsTab));
    }
  }, [docsTab]);

  const normalizeTabKey = (key) => {
    const sectionMap = {
      'overview': 'overview',
      'architecture': 'overview',
      'quickstart': 'quickstart',
      'sdk': 'quickstart',
      'auth': 'auth',
      'auth-keys': 'auth',
      'keys': 'auth',
      'proxy-api': 'completions',
      'completions': 'completions',
      'models': 'models',
      'metering': 'metering',
      'tokens': 'metering',
      'proration': 'proration',
      'status-codes': 'errors',
      'errors': 'errors',
      'faq': 'faq'
    };
    return sectionMap[key] || 'overview';
  };

  const handleSelectSection = (sectionId) => {
    const normalized = normalizeTabKey(sectionId);
    setActiveSection(normalized);
    if (setDocsTab) setDocsTab(normalized);
    
    // Sync URL without page refresh
    const newUrl = `${window.location.pathname}?tab=${normalized}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Code Snippets for Completions Endpoint
  const snippets = {
    curl: `curl http://localhost:5000/api/proxy/v1/chat/completions \\
  -H "Authorization: Bearer mp_live_8f93a17b20e44129" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "You are a helpful AI assistant."},
      {"role": "user", "content": "Explain metered API billing in one sentence."}
    ],
    "temperature": 0.7
  }'`,
    openai: `import OpenAI from 'openai';

// Drop-in replacement for OpenAI SDK
const client = new OpenAI({
  baseURL: 'http://localhost:5000/api/proxy/v1',
  apiKey: 'mp_live_8f93a17b20e44129' // Secret key from MeterPrompt dashboard
});

const response = await client.chat.completions.create({
  model: 'gpt-4o', // or 'claude-3-5-sonnet', 'deepseek-r1', 'mock-gpt-4o'
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain metered API billing in one sentence.' }
  ],
  temperature: 0.7
});

console.log(response.choices[0].message.content);
console.log('Usage Telemetry:', response.usage);`,
    js: `const response = await fetch('http://localhost:5000/api/proxy/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer mp_live_8f93a17b20e44129',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Explain metered API billing in one sentence.' }
    ],
    temperature: 0.7
  })
});

const data = await response.json();
console.log('Assistant output:', data.choices[0].message.content);
console.log('Tokens used:', data.usage.total_tokens);`,
    python: `import requests

url = "http://localhost:5000/api/proxy/v1/chat/completions"
headers = {
    "Authorization": "Bearer mp_live_8f93a17b20e44129",
    "Content-Type": "application/json"
}
payload = {
    "model": "gpt-4o",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain metered API billing in one sentence."}
    ],
    "temperature": 0.7
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print("Response:", data["choices"][0]["message"]["content"])
print("Token Usage:", data["usage"])`
  };

  const responseJsonPayload = `{
  "id": "chatcmpl-mp_9a82f3c1d4e",
  "object": "chat.completion",
  "created": 1725830400,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Metered API billing calculates charges dynamically based on exact prompt and completion token counts consumed during execution."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 22,
    "total_tokens": 40
  },
  "metering": {
    "currency": "USD",
    "prompt_cost": 0.000045,
    "completion_cost": 0.000110,
    "total_cost": 0.000155,
    "latency_ms": 142
  }
}`;

  const errorJsonPayload = `{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_KEY",
    "message": "Invalid API Key format or key has been revoked. Ensure header is Authorization: Bearer mp_live_...",
    "status": 401
  }
}`;

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-6">
      {/* DOCS TOP BAR */}
      <div className="bg-card border border-zinc-300 p-6 rounded-2xl shadow-md shadow-zinc-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
              Developer Docs Portal
            </span>
            <span className="text-xs text-muted-foreground">• Production AI API Gateway & Metering Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1e1f24] mt-1 tracking-tight">
            MeterPrompt Technical Documentation
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-700 bg-secondary px-3.5 py-2 rounded-xl border border-zinc-300">
          <Server size={14} className="text-primary" />
          <span>Proxy Endpoint:</span>
          <strong className="text-[#1e1f24]">http://localhost:5000/api/proxy/v1</strong>
        </div>
      </div>

      {/* TWO COLUMN DOCS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* LEFT STICKY SIDEBAR */}
        <div className="lg:col-span-1 bg-[#f3f3f4]/80 border border-zinc-300 rounded-2xl p-4 shadow-sm sticky top-20 space-y-6">
          {/* QUICKSTART & ARCHITECTURE */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1.5">
              <BookOpen size={12} className="text-primary" />
              Getting Started
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelectSection('overview')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeSection === 'overview'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-200 hover:text-[#1e1f24]'
                }`}
              >
                Overview & Architecture
                {activeSection === 'overview' && <ChevronRight size={14} />}
              </button>
              <button
                onClick={() => handleSelectSection('quickstart')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeSection === 'quickstart'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-200 hover:text-[#1e1f24]'
                }`}
              >
                SDK Integration Guide
                {activeSection === 'quickstart' && <ChevronRight size={14} />}
              </button>
              <button
                onClick={() => handleSelectSection('auth')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeSection === 'auth'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-200 hover:text-[#1e1f24]'
                }`}
              >
                Authentication & Keys
                {activeSection === 'auth' && <ChevronRight size={14} />}
              </button>
            </div>
          </div>

          {/* AI PROXY API */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1.5">
              <Terminal size={12} className="text-primary" />
              AI Gateway Endpoints
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelectSection('completions')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeSection === 'completions'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-200 hover:text-[#1e1f24]'
                }`}
              >
                Completions (/v1/chat)
                {activeSection === 'completions' && <ChevronRight size={14} />}
              </button>
              <button
                onClick={() => handleSelectSection('models')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeSection === 'models'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-200 hover:text-[#1e1f24]'
                }`}
              >
                Models & Routing Modes
                {activeSection === 'models' && <ChevronRight size={14} />}
              </button>
            </div>
          </div>

          {/* BILLING & METERING */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1.5">
              <CreditCard size={12} className="text-primary" />
              Billing & Metering
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelectSection('metering')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeSection === 'metering'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-200 hover:text-[#1e1f24]'
                }`}
              >
                Token Counting & Costs
                {activeSection === 'metering' && <ChevronRight size={14} />}
              </button>
              <button
                onClick={() => handleSelectSection('proration')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeSection === 'proration'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-200 hover:text-[#1e1f24]'
                }`}
              >
                Mid-Cycle Proration
                {activeSection === 'proration' && <ChevronRight size={14} />}
              </button>
            </div>
          </div>

          {/* ERROR HANDLING */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-primary" />
              Errors & Diagnostics
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelectSection('errors')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeSection === 'errors'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-200 hover:text-[#1e1f24]'
                }`}
              >
                HTTP Status Matrix
                {activeSection === 'errors' && <ChevronRight size={14} />}
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1.5">
              <HelpCircle size={12} className="text-primary" />
              Support
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelectSection('faq')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeSection === 'faq'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-200 hover:text-[#1e1f24]'
                }`}
              >
                Developer FAQ
                {activeSection === 'faq' && <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* MAIN READING CANVAS */}
        <div className="lg:col-span-3 bg-card border border-zinc-300 rounded-2xl p-8 shadow-md shadow-zinc-200/50 space-y-8 min-h-[650px]">
          
          {/* SECTION 1: OVERVIEW & ARCHITECTURE */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div>
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                  Core Architecture
                </span>
                <h2 className="text-3xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                  What is MeterPrompt Gateway?
                </h2>
                <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                  <strong>MeterPrompt</strong> is a high-performance reverse proxy gateway and SaaS metered billing platform designed for AI engineering teams. It acts as an intelligent intermediary between your client applications, frontend SDKs, or backend services and upstream LLM providers (OpenAI, Anthropic, DeepSeek, and offline mock engines).
                </p>
              </div>

              {/* ASCII / VISUAL ARCHITECTURE FLOW DIAGRAM */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1e1f24] flex items-center gap-2">
                  <Layers size={16} className="text-primary" />
                  System Architecture & Request Execution Pipeline
                </h3>
                <div className="bg-[#18181b] text-emerald-400 p-6 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-700 leading-relaxed shadow-inner">
                  <pre>{`Client App / SDK ──> [ MeterPrompt Reverse Proxy (:5000) ] ──> [ Target Provider Engine ]
                                  │                                    (OpenAI / Anthropic / Mock)
                      ├── 1. Validate API Key secret (\`mp_live_...\`)
                      ├── 2. Check Tier Rate Limit (requests/min)
                      ├── 3. Forward Payload & Measure Edge Latency
                      ├── 4. Calculate Tokens (Prompt + Completion)
                      └── 5. Record Usage Telemetry & Compute USD Overages`}</pre>
                </div>
              </div>

              {/* CORE CONCEPTS MATRIX */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1e1f24]">Key Platform Concepts</h3>
                <div className="border border-zinc-300 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-secondary text-zinc-700 font-bold uppercase text-[10px] border-b border-zinc-300">
                      <tr>
                        <th className="p-3">Concept</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Implementation Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-xs">
                      <tr>
                        <td className="p-3 font-bold text-[#1e1f24] font-mono">API Keys</td>
                        <td className="p-3 text-zinc-700">Cryptographic bearer tokens with <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">mp_live_</code> prefix.</td>
                        <td className="p-3 text-zinc-600 font-mono text-[11px]">Stored as one-way SHA-256 hashes in MongoDB.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#1e1f24] font-mono">Usage Records</td>
                        <td className="p-3 text-zinc-700">Per-request telemetry capturing prompt/completion tokens & cost.</td>
                        <td className="p-3 text-zinc-600 font-mono text-[11px]">Committed to <code className="font-mono text-primary font-bold">UsageRecord</code> collection.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#1e1f24] font-mono">Plan Tiers</td>
                        <td className="p-3 text-zinc-700">Starter ($19.99/mo), Pro ($49.99/mo), and Max ($199.99/mo) plans.</td>
                        <td className="p-3 text-zinc-600 font-mono text-[11px]">Includes allocated monthly token quotas & overage rates.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#1e1f24] font-mono">Proration Engine</td>
                        <td className="p-3 text-zinc-700">Calculates exact day-by-day credit balances on mid-cycle plan changes.</td>
                        <td className="p-3 text-zinc-600 font-mono text-[11px]">Tracked under <code className="font-mono text-primary font-bold">prorationBalanceUSD</code>.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QUICK ACTION CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleSelectSection('completions')}
                  className="p-5 bg-secondary/60 hover:bg-secondary border border-zinc-300 rounded-xl text-left space-y-2 group transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1e1f24] group-hover:text-primary transition flex items-center gap-2">
                      <Terminal size={16} className="text-primary" />
                      Make Your First Request
                    </span>
                    <ArrowRight size={16} className="text-zinc-400 group-hover:translate-x-1 transition" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Explore the drop-in <code className="font-mono text-primary font-bold">/v1/chat/completions</code> endpoint spec and code samples.
                  </p>
                </button>

                <button
                  onClick={() => handleSelectSection('auth')}
                  className="p-5 bg-secondary/60 hover:bg-secondary border border-zinc-300 rounded-xl text-left space-y-2 group transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1e1f24] group-hover:text-primary transition flex items-center gap-2">
                      <Key size={16} className="text-primary" />
                      Manage API Secrets
                    </span>
                    <ArrowRight size={16} className="text-zinc-400 group-hover:translate-x-1 transition" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Learn about SHA-256 key hashing security, bearer headers, and key revocation logic.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: AUTHENTICATION & KEYS */}
          {activeSection === 'auth' && (
            <div className="space-y-8">
              <div>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                  Security & Authentication
                </span>
                <h2 className="text-3xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                  Authentication & API Keys
                </h2>
                <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                  MeterPrompt utilizes secure Bearer Token authentication. Every request sent through the Gateway proxy must include a valid secret API key issued from your developer dashboard.
                </p>
              </div>

              {/* KEY FORMAT SPEC */}
              <div className="p-5 bg-secondary/70 border border-zinc-300 rounded-xl space-y-3">
                <h3 className="font-bold text-sm text-[#1e1f24] flex items-center gap-2">
                  <Key size={16} className="text-primary" />
                  Secret Key Format Standard
                </h3>
                <div className="p-3 bg-[#18181b] text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto">
                  <code>mp_live_8f93a17b20e44129c95d3a0e12f</code>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Keys always begin with the <code className="font-mono text-[#1e1f24] font-bold">mp_live_</code> prefix followed by a cryptographically generated high-entropy hex string. Secrets are <strong>only displayed once</strong> upon initial creation.
                </p>
              </div>

              {/* HEADER STRUCTURE */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1e1f24]">Required HTTP Authorization Header</h3>
                <div className="bg-[#18181b] text-gray-100 p-4 rounded-xl font-mono text-xs border border-zinc-700">
                  <span className="text-amber-400">Authorization:</span> Bearer mp_live_xxxxxxxxxxxxxxxxxxxxxxxx
                </div>
              </div>

              {/* SECURITY ARCHITECTURE */}
              <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-3 text-blue-950">
                <h4 className="font-bold text-sm flex items-center gap-2 text-blue-950">
                  <ShieldCheck size={18} className="text-blue-700" />
                  Zero Plain-Text Storage Security Standard
                </h4>
                <p className="leading-relaxed text-blue-900">
                  MeterPrompt enforces zero plain-text key storage. When an API key is created, only its one-way <strong>SHA-256 cryptographic hash</strong> (<code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-950">crypto.createHash('sha256').update(key).digest('hex')</code>) is persisted in the database.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-blue-900">
                  <td>Even in the event of a database dump, raw secret keys cannot be extracted.</td>
                  <td>The gateway hashes the incoming header token on each request and matches it against the stored SHA-256 digest in sub-millisecond lookup time.</td>
                </ul>
              </div>

              {/* KEY LIFECYCLE */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1e1f24]">API Key Lifecycle Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 bg-secondary/50 border border-zinc-300 rounded-xl space-y-1">
                    <span className="font-bold text-[#1e1f24] block">1. Generation</span>
                    <p className="text-muted-foreground text-[11px]">Generate keys in Dashboard &gt; API Keys. Copy and securely store your secret immediately.</p>
                  </div>
                  <div className="p-4 bg-secondary/50 border border-zinc-300 rounded-xl space-y-1">
                    <span className="font-bold text-[#1e1f24] block">2. Invalidation</span>
                    <p className="text-muted-foreground text-[11px]">Keys can be instantly revoked from the dashboard, invalidating all subsequent proxy calls with a <code className="font-mono">401 Auth Error</code>.</p>
                  </div>
                  <div className="p-4 bg-secondary/50 border border-zinc-300 rounded-xl space-y-1">
                    <span className="font-bold text-[#1e1f24] block">3. Rotation</span>
                    <p className="text-muted-foreground text-[11px]">Issue zero-downtime secondary keys before revoking legacy secrets during scheduled key rotations.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: QUICKSTART / SDK */}
          {activeSection === 'quickstart' && (
            <div className="space-y-8">
              <div>
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                  SDK Integration
                </span>
                <h2 className="text-3xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                  SDK & Integration Guide
                </h2>
                <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                  MeterPrompt endpoints strictly conform to the official OpenAI REST API specification. You can use standard client SDKs without changing your existing code structures.
                </p>
              </div>

              {/* CODE TABS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-300 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCodeLang('curl')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        codeLang === 'curl'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-secondary text-zinc-600 hover:text-[#1e1f24]'
                      }`}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setCodeLang('openai')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        codeLang === 'openai'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-secondary text-zinc-600 hover:text-[#1e1f24]'
                      }`}
                    >
                      Node.js (OpenAI SDK)
                    </button>
                    <button
                      onClick={() => setCodeLang('js')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        codeLang === 'js'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-secondary text-zinc-600 hover:text-[#1e1f24]'
                      }`}
                    >
                      JavaScript (fetch)
                    </button>
                    <button
                      onClick={() => setCodeLang('python')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        codeLang === 'python'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-secondary text-zinc-600 hover:text-[#1e1f24]'
                      }`}
                    >
                      Python (requests)
                    </button>
                  </div>

                  <button
                    onClick={() => copyToClipboard(snippets[codeLang])}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-secondary px-3 py-1 rounded-lg border border-zinc-300"
                  >
                    {copiedSnippet ? <Check size={14} /> : <Copy size={14} />}
                    {copiedSnippet ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>

                <div className="bg-[#18181b] text-gray-100 p-5 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-700 leading-relaxed shadow-inner">
                  <pre>{snippets[codeLang]}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: AI PROXY API / COMPLETIONS */}
          {activeSection === 'completions' && (
            <div className="space-y-8">
              <div>
                <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                  API Reference
                </span>
                <h2 className="text-3xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                  Chat Completions API Endpoint
                </h2>
                <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                  The <code className="font-mono font-bold text-[#1e1f24]">/api/proxy/v1/chat/completions</code> endpoint is a drop-in replacement for <code className="font-mono text-muted-foreground">api.openai.com/v1/chat/completions</code>.
                </p>
              </div>

              {/* HTTP SPEC BOX */}
              <div className="p-4 bg-secondary/80 border border-zinc-300 rounded-xl flex items-center gap-3 font-mono text-xs">
                <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-md font-bold text-[11px]">POST</span>
                <span className="text-[#1e1f24] font-bold">/api/proxy/v1/chat/completions</span>
              </div>

              {/* HEADERS TABLE */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1e1f24]">Request Headers</h3>
                <div className="border border-zinc-300 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-secondary text-zinc-700 font-bold uppercase text-[10px] border-b border-zinc-300">
                      <tr>
                        <th className="p-3">Header</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Required</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                      <tr>
                        <td className="p-3 font-bold text-[#1e1f24]">Authorization</td>
                        <td className="p-3 text-zinc-500">string</td>
                        <td className="p-3 text-emerald-600 font-bold">Yes</td>
                        <td className="p-3 text-zinc-700 font-sans">Bearer token format: <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">Bearer mp_live_...</code></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#1e1f24]">Content-Type</td>
                        <td className="p-3 text-zinc-500">string</td>
                        <td className="p-3 text-emerald-600 font-bold">Yes</td>
                        <td className="p-3 text-zinc-700 font-sans">Must be <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">application/json</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REQUEST BODY TABLE */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1e1f24]">Request Payload Parameters</h3>
                <div className="border border-zinc-300 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-secondary text-zinc-700 font-bold uppercase text-[10px] border-b border-zinc-300">
                      <tr>
                        <th className="p-3">Parameter</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Required</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                      <tr>
                        <td className="p-3 font-bold text-[#1e1f24]">model</td>
                        <td className="p-3 text-zinc-500">string</td>
                        <td className="p-3 text-emerald-600 font-bold">Yes</td>
                        <td className="p-3 text-zinc-700 font-sans">Target model identifier (e.g. <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">gpt-4o</code>, <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">claude-3-5-sonnet</code>, <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">deepseek-r1</code>).</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#1e1f24]">messages</td>
                        <td className="p-3 text-zinc-500">array</td>
                        <td className="p-3 text-emerald-600 font-bold">Yes</td>
                        <td className="p-3 text-zinc-700 font-sans">Array of chat objects containing <code className="font-mono">{`{ role: "system"|"user"|"assistant", content: "..." }`}</code>.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#1e1f24]">temperature</td>
                        <td className="p-3 text-zinc-500">number</td>
                        <td className="p-3 text-zinc-500 font-bold">No</td>
                        <td className="p-3 text-zinc-700 font-sans">Sampling temperature between <code className="font-mono">0.0</code> and <code className="font-mono">2.0</code> (Default: <code className="font-mono">0.7</code>).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RESPONSE JSON SPEC */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-[#1e1f24]">Response Payload Schema</h3>
                <div className="bg-[#18181b] text-emerald-400 p-5 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-700 leading-relaxed shadow-inner">
                  <pre>{responseJsonPayload}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: MODELS CATALOG & ROUTING MODES */}
          {activeSection === 'models' && (
            <div className="space-y-8">
              <div>
                <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                  Registry & Routing
                </span>
                <h2 className="text-3xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                  Models & Operational Routing Modes
                </h2>
                <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                  MeterPrompt provides unified routing across multiple LLM providers and supports an offline deterministic mock mode for local testing and CI/CD pipelines.
                </p>
              </div>

              {/* MODEL ALIASES TABLE */}
              <div className="border border-zinc-300 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-secondary text-zinc-700 font-bold uppercase text-[10px] border-b border-zinc-300">
                    <tr>
                      <th className="p-3">Model Alias</th>
                      <th className="p-3">Context Window</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Prompt Rate</th>
                      <th className="p-3">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                    <tr>
                      <td className="p-3 font-bold text-[#1e1f24]">gpt-4o</td>
                      <td className="p-3">128,000 tokens</td>
                      <td className="p-3 font-sans"><span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold text-[10px]">OpenAI</span></td>
                      <td className="p-3 text-emerald-700 font-bold">$0.0025 / 1K</td>
                      <td className="p-3 text-emerald-700 font-bold">$0.0100 / 1K</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#1e1f24]">claude-3-5-sonnet</td>
                      <td className="p-3">200,000 tokens</td>
                      <td className="p-3 font-sans"><span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-bold text-[10px]">Anthropic</span></td>
                      <td className="p-3 text-emerald-700 font-bold">$0.0030 / 1K</td>
                      <td className="p-3 text-emerald-700 font-bold">$0.0150 / 1K</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#1e1f24]">deepseek-r1</td>
                      <td className="p-3">64,000 tokens</td>
                      <td className="p-3 font-sans"><span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold text-[10px]">DeepSeek</span></td>
                      <td className="p-3 text-emerald-700 font-bold">$0.00055 / 1K</td>
                      <td className="p-3 text-emerald-700 font-bold">$0.00219 / 1K</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#1e1f24]">gpt-4o-mini</td>
                      <td className="p-3">128,000 tokens</td>
                      <td className="p-3 font-sans"><span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold text-[10px]">OpenAI</span></td>
                      <td className="p-3 text-emerald-700 font-bold">$0.00015 / 1K</td>
                      <td className="p-3 text-emerald-700 font-bold">$0.00060 / 1K</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* OPERATIONAL MODES */}
              <div className="space-y-3 pt-2 text-xs">
                <h3 className="font-bold text-sm text-[#1e1f24]">Gateway Execution Modes</h3>
                <div className="p-4 bg-secondary/70 border border-zinc-300 rounded-xl space-y-2">
                  <div className="font-mono text-primary font-bold">AI_PROXY_MODE=mock</div>
                  <p className="text-zinc-700 leading-relaxed">
                    Offline deterministic simulation with zero external API fees. Generates realistic completion choices and calculates token telemetry locally for testing.
                  </p>
                </div>
                <div className="p-4 bg-secondary/70 border border-zinc-300 rounded-xl space-y-2">
                  <div className="font-mono text-emerald-700 font-bold">AI_PROXY_MODE=openai</div>
                  <p className="text-zinc-700 leading-relaxed">
                    Live upstream dispatch forwarding payloads directly to external provider APIs using configured provider secrets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: TOKEN COUNTING & COSTS */}
          {activeSection === 'metering' && (
            <div className="space-y-8">
              <div>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                  Telemetry Engine
                </span>
                <h2 className="text-3xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                  Token Counting & Overages
                </h2>
                <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                  MeterPrompt monitors token usage in real-time, recording telemetry data into MongoDB and evaluating overage fees when monthly quotas are exceeded.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-5 bg-secondary/70 border border-zinc-300 rounded-xl space-y-2">
                  <h4 className="font-bold text-sm text-[#1e1f24]">1. Usage Collection Schema</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    For every completion request, the gateway records a <code className="font-mono text-primary font-bold">UsageRecord</code> capturing prompt tokens, completion tokens, response latency, and USD cost computed against model pricing rules.
                  </p>
                </div>

                <div className="p-5 bg-secondary/80 border border-zinc-300 rounded-xl space-y-3 font-mono">
                  <h4 className="font-bold text-sm text-[#1e1f24] font-sans">2. Overage Cost Computation Formula</h4>
                  <div className="p-4 bg-[#18181b] text-emerald-400 rounded-lg overflow-x-auto text-[11px] border border-zinc-700">
                    <code>Overage Charge ($) = MAX(0, (Tokens Consumed - Included Quota) / 1,000) × Overage Rate</code>
                  </div>
                  <p className="text-muted-foreground font-sans text-[11px] leading-relaxed">
                    Example: On the <strong>Starter Plan</strong> ($19.99/mo, 100,000 included tokens, $0.002 overage rate per 1K tokens), consuming 150,000 tokens results in:
                    <br />
                    <code className="font-bold text-[#1e1f24]">(150,000 - 100,000) / 1,000 × $0.002 = $0.10 Overage Charge</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: PRORATION */}
          {activeSection === 'proration' && (
            <div className="space-y-8">
              <div>
                <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                  Billing Calculations
                </span>
                <h2 className="text-3xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                  Mid-Cycle Proration Engine
                </h2>
                <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                  When switching subscription tiers (Starter &harr; Pro &harr; Max), MeterPrompt calculates day-by-day unused plan credit and applies it immediately to the new plan tier.
                </p>
              </div>

              <div className="p-6 bg-secondary/80 border border-zinc-300 rounded-xl space-y-4 text-xs">
                <h4 className="font-bold text-sm text-[#1e1f24]">Proration Calculation Formula</h4>
                <div className="p-4 bg-[#18181b] text-white font-mono rounded-lg overflow-x-auto text-[11px] leading-relaxed border border-zinc-700">
                  <code>Unused Credit ($) = Current Plan Price × (Remaining Cycle Days / Total Days)</code>
                  <br />
                  <code>New Plan Charge ($) = New Plan Price × (Remaining Cycle Days / Total Days)</code>
                  <br />
                  <code>Proration Net Adjustment = New Plan Charge - Unused Credit</code>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Net credits are updated directly on the <code className="font-mono text-primary font-bold">Subscription</code> document under <code className="font-mono">prorationBalanceUSD</code>.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 8: STANDARDIZED ERROR MATRIX */}
          {activeSection === 'errors' && (
            <div className="space-y-8">
              <div>
                <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                  Error Diagnostics
                </span>
                <h2 className="text-3xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                  Standardized HTTP Error Matrix
                </h2>
                <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                  All error responses return predictable JSON error payloads accompanied by standard HTTP status codes.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1e1f24]">JSON Error Response Schema</h3>
                <div className="bg-[#18181b] text-rose-400 p-5 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-700 leading-relaxed shadow-inner">
                  <pre>{errorJsonPayload}</pre>
                </div>
              </div>

              <div className="border border-zinc-300 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-secondary text-zinc-700 font-bold uppercase text-[10px] border-b border-zinc-300">
                    <tr>
                      <th className="p-3">Status Code</th>
                      <th className="p-3">Error Code</th>
                      <th className="p-3">Trigger Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                    <tr>
                      <td className="p-3 font-bold text-amber-600">400 Bad Request</td>
                      <td className="p-3 font-bold text-[#1e1f24]">BAD_REQUEST</td>
                      <td className="p-3 text-zinc-800 font-sans">Payload validation failures (missing required <code className="font-mono">model</code> or <code className="font-mono">messages</code> parameters).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-rose-600">401 Unauthorized</td>
                      <td className="p-3 font-bold text-[#1e1f24]">AUTH_REQUIRED</td>
                      <td className="p-3 text-zinc-800 font-sans">Missing Bearer token or invalid secret API key.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-rose-600">403 Forbidden</td>
                      <td className="p-3 font-bold text-[#1e1f24]">FORBIDDEN</td>
                      <td className="p-3 text-zinc-800 font-sans">Insufficient RBAC permissions for requested operation.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-amber-600">404 Not Found</td>
                      <td className="p-3 font-bold text-[#1e1f24]">NOT_FOUND</td>
                      <td className="p-3 text-zinc-800 font-sans">Target resource (Model alias, Plan, or Key ID) not found.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-amber-600">429 Rate Limited</td>
                      <td className="p-3 font-bold text-[#1e1f24]">RATE_LIMIT_EXCEEDED</td>
                      <td className="p-3 text-zinc-800 font-sans">Active subscription requests-per-minute threshold breached.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-rose-600">500 Internal Error</td>
                      <td className="p-3 font-bold text-[#1e1f24]">INTERNAL_ERROR</td>
                      <td className="p-3 text-zinc-800 font-sans">Centralized error middleware handler for unexpected errors.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 9: COMPLETE FAQ SUITE */}
          {activeSection === 'faq' && (
            <div className="space-y-8">
              <div>
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                  FAQ & Support
                </span>
                <h2 className="text-3xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                  Answers to common technical questions about MeterPrompt gateway operation, security, and billing.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-5 bg-secondary/60 border border-zinc-300 rounded-xl space-y-2">
                  <h4 className="font-bold text-sm text-[#1e1f24]">How are API keys stored and secured?</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    API secret keys are generated with an <code className="font-mono text-primary font-bold">mp_live_</code> prefix. Only cryptographic SHA-256 hashes are persisted in MongoDB (<code className="font-mono">crypto.createHash('sha256')</code>); raw secret keys are never logged or stored in plain text.
                  </p>
                </div>

                <div className="p-5 bg-secondary/60 border border-zinc-300 rounded-xl space-y-2">
                  <h4 className="font-bold text-sm text-[#1e1f24]">Can I upgrade or downgrade mid-cycle?</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Yes! Tier changes take effect immediately. MeterPrompt calculates day-by-day unused credits from your previous plan and applies them as a proration balance to your account.
                  </p>
                </div>

                <div className="p-5 bg-secondary/60 border border-zinc-300 rounded-xl space-y-2">
                  <h4 className="font-bold text-sm text-[#1e1f24]">What happens when my monthly token quota is exceeded?</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Inference requests continue seamlessly without interruption. Overages are billed at your plan's configured per-1,000 token overage rate.
                  </p>
                </div>

                <div className="p-5 bg-secondary/60 border border-zinc-300 rounded-xl space-y-2">
                  <h4 className="font-bold text-sm text-[#1e1f24]">How does mock mode work for offline testing?</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    When <code className="font-mono font-bold text-foreground">AI_PROXY_MODE=mock</code> is configured, the gateway returns deterministic completion choices and calculates token telemetry locally without making calls to third-party API providers.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
