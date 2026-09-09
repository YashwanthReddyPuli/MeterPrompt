import React, { useState, useEffect } from 'react';
import { 
  Search, Terminal, ShieldCheck, Zap, Layers, CreditCard, AlertTriangle, 
  Copy, Check, ChevronRight, Server, Lock, Cpu, Code2, RefreshCw, Sparkles,
  Database, Key, CheckCircle2, ArrowRight, CornerDownRight, Activity, BookOpen, Clock, Tag
} from 'lucide-react';

export default function DocsPage({ docsTab = 'quickstart', setDocsTab }) {
  const [activeSection, setActiveSection] = useState('quickstart');
  const [searchQuery, setSearchQuery] = useState('');
  const [requestLang, setRequestLang] = useState('curl'); // 'curl' | 'js' | 'python' | 'openai'
  const [responseTab, setResponseTab] = useState('200'); // '200' | '400' | '401'
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [mobileTab, setMobileTab] = useState('content'); // 'content' | 'console'

  // Synchronize state with props and URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') || window.location.hash.replace('#', '');
    if (tabParam) {
      setActiveSection(normalizeTabKey(tabParam));
    } else if (docsTab) {
      setActiveSection(normalizeTabKey(docsTab));
    }
  }, [docsTab]);

  // Global Keyboard Shortcut (Cmd/Ctrl + K) for Search Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('docs-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const normalizeTabKey = (key) => {
    const sectionMap = {
      'overview': 'quickstart',
      'quickstart': 'quickstart',
      'auth': 'auth',
      'keys': 'auth',
      'completions': 'completions',
      'proxy': 'completions',
      'subscriptions': 'subscriptions',
      'proration': 'subscriptions',
      'coupons': 'coupons',
      'dunning': 'dunning',
      'errors': 'errors',
      'status-codes': 'errors'
    };
    return sectionMap[key] || 'quickstart';
  };

  const handleSelectSection = (sectionId) => {
    const normalized = normalizeTabKey(sectionId);
    setActiveSection(normalized);
    if (setDocsTab) setDocsTab(normalized);
    const newUrl = `${window.location.pathname}?tab=${normalized}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Section Specifications & Data Mapping
  const docSections = [
    {
      group: 'Getting Started',
      items: [
        { id: 'quickstart', label: 'Quickstart & Base URLs', status: 'Core' },
        { id: 'auth', label: 'Authentication & API Keys', status: 'JWT / SHA-256' }
      ]
    },
    {
      group: 'API Reference',
      items: [
        { id: 'completions', label: 'POST /v1/chat/completions', method: 'POST', isProxy: true },
        { id: 'subscriptions', label: 'PUT /subscriptions/change-plan', method: 'PUT' },
        { id: 'coupons', label: 'POST /coupons/apply', method: 'POST' },
        { id: 'dunning', label: 'POST /billing/retry-failed', method: 'POST', badge: 'Admin' }
      ]
    },
    {
      group: 'Platform Diagnostics',
      items: [
        { id: 'errors', label: 'Standard Error Envelopes', status: 'AppError' }
      ]
    }
  ];

  // Request Code Snippets Mapping
  const codeSnippets = {
    quickstart: {
      curl: `curl -X GET http://localhost:5000/api/plans \\
  -H "Accept: application/json"`,
      js: `const response = await fetch('http://localhost:5000/api/plans');
const catalog = await response.json();
console.log(catalog);`,
      python: `import requests

response = requests.get("http://localhost:5000/api/plans")
print(response.json())`,
      openai: `// Fetch Gateway Tiers
const catalog = await fetch('http://localhost:5000/api/plans').then(r => r.json());
console.log('Available tiers:', catalog.data);`
    },
    auth: {
      curl: `curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "developer@meterprompt.io",
    "password": "SecurePassword123!"
  }'`,
      js: `const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'developer@meterprompt.io',
    password: 'SecurePassword123!'
  })
});

const data = await response.json();
console.log('JWT Bearer Token:', data.token);`,
      python: `import requests

url = "http://localhost:5000/api/auth/login"
payload = {
    "email": "developer@meterprompt.io",
    "password": "SecurePassword123!"
}

response = requests.post(url, json=payload)
token = response.json()["token"]
print("JWT Token:", token)`,
      openai: `// Create Cryptographic Key Signature
const res = await fetch('http://localhost:5000/api/keys', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${jwtToken}\` }
});
const { key } = await res.json();
console.log('API Key:', key); // mp_live_...`
    },
    completions: {
      curl: `curl -X POST http://localhost:5000/api/v1/chat/completions \\
  -H "Authorization: Bearer mp_live_9a82f3c1d4e5f6a7" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "system", "content": "You are a metered AI assistant." },
      { "role": "user", "content": "Explain token billing." }
    ],
    "temperature": 0.7
  }'`,
      js: `const response = await fetch('http://localhost:5000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer mp_live_9a82f3c1d4e5f6a7',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a metered AI assistant.' },
      { role: 'user', content: 'Explain token billing.' }
    ],
    temperature: 0.7
  })
});

const completion = await response.json();
console.log(completion.choices[0].message.content);`,
      python: `import requests

url = "http://localhost:5000/api/v1/chat/completions"
headers = {
    "Authorization": "Bearer mp_live_9a82f3c1d4e5f6a7",
    "Content-Type": "application/json"
}
payload = {
    "model": "gpt-4o",
    "messages": [
        {"role": "system", "content": "You are a metered AI assistant."},
        {"role": "user", "content": "Explain token billing."}
    ],
    "temperature": 0.7
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()["choices"][0]["message"]["content"])`,
      openai: `import OpenAI from 'openai';

// Drop-in Replacement for OpenAI SDK
const openai = new OpenAI({
  baseURL: 'http://localhost:5000/api/v1',
  apiKey: 'mp_live_9a82f3c1d4e5f6a7'
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4o', // or 'claude-3-5-sonnet', 'deepseek-r1', 'mock-gpt-4o'
  messages: [{ role: 'user', content: 'Explain token billing.' }]
});

console.log(completion.choices[0].message.content);`
    },
    subscriptions: {
      curl: `curl -X PUT http://localhost:5000/api/subscriptions/66e3b.../change-plan \\
  -H "Authorization: Bearer <jwt_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "newPlanId": "66e3a41b2c...",
    "billingCycle": "yearly"
  }'`,
      js: `const response = await fetch('http://localhost:5000/api/subscriptions/66e3b.../change-plan', {
  method: 'PUT',
  headers: {
    'Authorization': \`Bearer \${jwtToken}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    newPlanId: '66e3a41b2c...',
    billingCycle: 'yearly' // 20% annual discount applied: (price * 0.8) * 12
  })
});

const result = await response.json();
console.log('Proration Credit Applied:', result.prorationBalance);`,
      python: `import requests

url = "http://localhost:5000/api/subscriptions/66e3b.../change-plan"
headers = {
    "Authorization": f"Bearer {jwt_token}",
    "Content-Type": "application/json"
}
payload = {
    "newPlanId": "66e3a41b2c...",
    "billingCycle": "yearly"
}

res = requests.put(url, headers=headers, json=payload)
print("Proration Invoice:", res.json())`,
      openai: `// Dynamic Plan Upgrade with Proration Accounting
const res = await fetch('/api/subscriptions/current/change-plan', {
  method: 'PUT',
  body: JSON.stringify({ newPlanId: 'plan_pro_yearly', billingCycle: 'yearly' })
});
console.log('Updated Subscription:', await res.json());`
    },
    coupons: {
      curl: `curl -X POST http://localhost:5000/api/coupons/apply \\
  -H "Authorization: Bearer <jwt_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "BUILDWITHAI20"
  }'`,
      js: `const response = await fetch('http://localhost:5000/api/coupons/apply', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${jwtToken}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ code: 'BUILDWITHAI20' })
});

const coupon = await response.json();
console.log(\`Applied \${coupon.discountPercent}% OFF\`);`,
      python: `import requests

url = "http://localhost:5000/api/coupons/apply"
headers = {"Authorization": f"Bearer {jwt_token}"}
payload = {"code": "BUILDWITHAI20"}

res = requests.post(url, headers=headers, json=payload)
print(res.json())`,
      openai: `// Apply Promotional Coupon Code
const coupon = await fetch('/api/coupons/apply', {
  method: 'POST',
  body: JSON.stringify({ code: 'BUILDWITHAI20' })
}).then(r => r.json());
console.log('Discount applied:', coupon);`
    },
    dunning: {
      curl: `curl -X POST http://localhost:5000/api/billing/retry-failed \\
  -H "Authorization: Bearer <admin_jwt_token>" \\
  -H "Content-Type: application/json"`,
      js: `const response = await fetch('http://localhost:5000/api/billing/retry-failed', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${adminJwtToken}\` }
});

const dunningReport = await response.json();
console.log('Dunning Sweep Summary:', dunningReport);`,
      python: `import requests

url = "http://localhost:5000/api/billing/retry-failed"
headers = {"Authorization": f"Bearer {admin_jwt_token}"}

res = requests.post(url, headers=headers)
print("Dunning Sweep Results:", res.json())`,
      openai: `// Trigger Admin Dunning Retry Sweep
const report = await fetch('/api/billing/retry-failed', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${adminJwt}\` }
}).then(r => r.json());
console.log('Sweep results:', report);`
    },
    errors: {
      curl: `curl -X POST http://localhost:5000/api/v1/chat/completions \\
  -H "Authorization: Bearer invalid_key_123" \\
  -H "Content-Type: application/json"`,
      js: `try {
  const res = await fetch('/api/protected-route');
  if (!res.ok) {
    const errorEnvelope = await res.json();
    console.error(\`[\${errorEnvelope.errorCode}]: \${errorEnvelope.message}\`);
  }
} catch (err) {
  console.error('Network Error:', err);
}`,
      python: `import requests

res = requests.get("http://localhost:5000/api/protected-route")
if not res.ok:
    err = res.json()
    print(f"Error ({err['errorCode']}): {err['message']}")`,
      openai: `// Standard AppError Catch Block
try {
  await openai.chat.completions.create({ ... });
} catch (error) {
  console.log('Status Code:', error.status); // 401, 403, 429
  console.log('Error Code:', error.error.errorCode);
}`
    }
  };

  // Response Inspection Mapping
  const responsePayloads = {
    quickstart: {
      '200': `{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "66e3a41b2c890123456789ab",
      "name": "Starter",
      "priceUSD": 19.99,
      "priceINR": 1599,
      "billingCycle": "monthly",
      "featureLimits": {
        "maxRequestsPerMinute": 60,
        "maxTokensPerMonth": 100000,
        "allowedModels": ["gpt-4o", "gpt-4o-mini"]
      }
    },
    {
      "_id": "66e3a41b2c890123456789ac",
      "name": "Pro",
      "priceUSD": 49.99,
      "priceINR": 3999,
      "billingCycle": "monthly",
      "featureLimits": {
        "maxRequestsPerMinute": 180,
        "maxTokensPerMonth": 500000,
        "allowedModels": ["gpt-4o", "claude-3-5-sonnet", "deepseek-r1", "gpt-4o-mini"]
      }
    }
  ]
}`,
      '400': `{
  "success": false,
  "message": "Invalid request parameter: 'billingCycle' must be 'monthly' or 'yearly'",
  "errorCode": "INPUT_VALIDATION_FAILED"
}`,
      '401': `{
  "success": false,
  "message": "Authentication token expired or invalid",
  "errorCode": "INVALID_TOKEN"
}`
    },
    auth: {
      '200': `{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66e3b52a1c...",
    "name": "Developer User",
    "email": "developer@meterprompt.io",
    "role": "customer",
    "creditsBalanceUSD": 25.00
  }
}`,
      '400': `{
  "success": false,
  "message": "Valid email address is required; Password must be at least 6 characters",
  "errorCode": "INPUT_VALIDATION_FAILED"
}`,
      '401': `{
  "success": false,
  "message": "Invalid credentials provided",
  "errorCode": "INVALID_CREDENTIALS"
}`
    },
    completions: {
      '200': `{
  "id": "chatcmpl-mp_9a82f3c1d4e5f6a7",
  "object": "chat.completion",
  "created": 1725830400,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Metered SaaS billing charges dynamically based on exact prompt and completion token counts consumed during execution."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 24,
    "total_tokens": 42
  }
}`,
      '400': `{
  "success": false,
  "message": "Field 'messages' is required and must be a non-empty array",
  "errorCode": "INPUT_VALIDATION_FAILED"
}`,
      '401': `{
  "success": false,
  "message": "Invalid API Key format or key has been revoked. Ensure header is x-api-key: mp_live_...",
  "errorCode": "INVALID_TOKEN"
}`
    },
    subscriptions: {
      '200': `{
  "success": true,
  "message": "Subscription updated to Pro (yearly) with proration credit",
  "data": {
    "subscriptionId": "66e3b91a...",
    "status": "active",
    "plan": "Pro",
    "billingCycle": "yearly",
    "prorationCreditUSD": 14.50,
    "chargedLumpSumUSD": 479.88,
    "currentPeriodEnd": "2027-09-09T23:00:00.000Z"
  }
}`,
      '400': `{
  "success": false,
  "message": "Target plan '66e3a...' is already active on this subscription",
  "errorCode": "DUPLICATE_PLAN_CHANGE"
}`,
      '401': `{
  "success": false,
  "message": "Unauthorized access to subscription resource",
  "errorCode": "FORBIDDEN_ROLE_ACCESS"
}`
    },
    coupons: {
      '200': `{
  "success": true,
  "message": "Promotional coupon BUILDWITHAI20 applied successfully",
  "code": "BUILDWITHAI20",
  "discountPercent": 20,
  "originalPriceUSD": 49.99,
  "discountedPriceUSD": 39.99
}`,
      '400': `{
  "success": false,
  "message": "Promotional coupon 'EXPIRED2025' has reached its maximum redemption cap",
  "errorCode": "COUPON_CAP_EXCEEDED"
}`,
      '401': `{
  "success": false,
  "message": "Authentication required to redeem coupons",
  "errorCode": "INVALID_TOKEN"
}`
    },
    dunning: {
      '200': `{
  "success": true,
  "message": "Dunning auto-retry sweep executed across past_due accounts",
  "summary": {
    "totalEvaluated": 12,
    "successfulSettlements": 8,
    "retriesIncremented": 3,
    "suspendedAccounts": 1
  }
}`,
      '400': `{
  "success": false,
  "message": "Invalid dunning parameters",
  "errorCode": "INVALID_SWEEP_REQUEST"
}`,
      '401': `{
  "success": false,
  "message": "Access denied. Requires 'admin' billing ops role.",
  "errorCode": "FORBIDDEN_ROLE_ACCESS"
}`
    },
    errors: {
      '200': `{
  "success": true,
  "status": "healthy",
  "environment": "production",
  "timestamp": "2026-09-09T23:00:00.000Z"
}`,
      '400': `{
  "success": false,
  "message": "Detailed human-readable error description",
  "errorCode": "STANDARD_SNAKE_CASE_CODE"
}`,
      '401': `{
  "success": false,
  "message": "Access denied. Requires 'admin' role.",
  "errorCode": "FORBIDDEN_ROLE_ACCESS"
}`
    }
  };

  const filteredDocSections = docSections.map(sec => ({
    ...sec,
    items: sec.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.group.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(sec => sec.items.length > 0);

  return (
    <div className="max-w-7xl mx-auto py-2 space-y-6">
      {/* 1. PORTAL HEADER BAR */}
      <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} /> Developer Portal
            </span>
            <span className="text-xs text-zinc-500">• Production API Gateway & Metering Specs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1e1f24] mt-1 tracking-tight flex items-center gap-2">
            MeterPrompt Technical Documentation
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Mobile View Toggle */}
          <div className="flex lg:hidden bg-zinc-100 p-1 rounded-xl border border-zinc-200 w-full md:w-auto text-xs font-bold">
            <button
              onClick={() => setMobileTab('content')}
              className={`flex-1 px-3 py-1.5 rounded-lg transition ${mobileTab === 'content' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'}`}
            >
              Docs Content
            </button>
            <button
              onClick={() => setMobileTab('console')}
              className={`flex-1 px-3 py-1.5 rounded-lg transition ${mobileTab === 'console' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'}`}
            >
              Code Console
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-700 bg-zinc-50 px-3.5 py-2 rounded-xl border border-zinc-200">
            <Server size={14} className="text-[#5865f2]" />
            <span className="text-zinc-500">Gateway Root:</span>
            <strong className="text-zinc-900">http://localhost:5000/api</strong>
          </div>
        </div>
      </div>

      {/* 2. THREE-COLUMN RESPONSIVE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1: STICKY NAVIGATION INDEX (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm sticky top-20 space-y-4">
          {/* Search Bar with Keyboard Tooltip */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-zinc-400" />
            <input
              id="docs-search-input"
              type="text"
              placeholder="Search docs & APIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-14 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5865f2] transition-all font-medium"
            />
            <span className="absolute right-2.5 top-2.5 text-[10px] font-mono text-zinc-400 bg-zinc-200/60 px-1.5 py-0.5 rounded border border-zinc-300">
              ⌘K
            </span>
          </div>

          {/* Nav Categories */}
          <div className="space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
            {filteredDocSections.map((sec, i) => (
              <div key={i} className="space-y-1">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 px-2 py-1">
                  {sec.group}
                </h4>
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const isSelected = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSection(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#5865f2] text-white shadow-xs'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {item.method && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-black ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : item.method === 'POST' ? 'bg-emerald-100 text-emerald-700'
                                : item.method === 'PUT' ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {item.method}
                            </span>
                          )}
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.status && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            {item.status}
                          </span>
                        )}
                        {item.badge && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: MIDDLE CONTENT & PARAMETER DEFINITIONS (5 cols) */}
        <div className={`lg:col-span-5 space-y-6 ${mobileTab === 'console' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6 min-h-[600px]">
            
            {/* QUICKSTART SECTION */}
            {activeSection === 'quickstart' && (
              <div className="space-y-6 text-xs text-zinc-600">
                <div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                    Core Overview
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                    Quickstart & Base URLs
                  </h2>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed font-medium">
                    MeterPrompt operates as a dual-layer platform: a high-throughput <strong>OpenAI-compatible AI Proxy Gateway</strong> (`/api/v1/chat/completions`) paired with a <strong>Stripe-style SaaS Billing Engine</strong>.
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                  <h4 className="font-extrabold text-zinc-900 text-xs flex items-center gap-1.5">
                    <Server size={14} className="text-[#5865f2]" /> Base Environment Endpoints
                  </h4>
                  <ul className="space-y-1.5 font-mono text-[11px]">
                    <li className="flex justify-between border-b border-zinc-200/60 pb-1">
                      <span className="text-zinc-500">API Gateway Proxy:</span>
                      <strong className="text-zinc-900">http://localhost:5000/api/v1</strong>
                    </li>
                    <li className="flex justify-between border-b border-zinc-200/60 pb-1">
                      <span className="text-zinc-500">Billing & Auth Engine:</span>
                      <strong className="text-zinc-900">http://localhost:5000/api</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-zinc-500">Vite Developer Console:</span>
                      <strong className="text-zinc-900">http://localhost:3000</strong>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-sm text-zinc-900">Platform Features Matrix</h3>
                  <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-[10px] border-b border-zinc-200">
                        <tr>
                          <th className="p-3">Feature Component</th>
                          <th className="p-3">Syllabus Module</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-xs">
                        <tr>
                          <td className="p-3 font-bold text-zinc-900">JWT & SHA-256 Auth</td>
                          <td className="p-3 text-zinc-600">Module 1 & RBAC</td>
                          <td className="p-3 text-right font-bold text-emerald-600">Ready</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-zinc-900">Token Proxy Gateway</td>
                          <td className="p-3 text-zinc-600">Module 5 Usage Metering</td>
                          <td className="p-3 text-right font-bold text-emerald-600">Ready</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-zinc-900">Mid-Cycle Proration</td>
                          <td className="p-3 text-zinc-600">Module 4 Plan Switch</td>
                          <td className="p-3 text-right font-bold text-emerald-600">Ready</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-zinc-900">Dunning 3-Sweep Engine</td>
                          <td className="p-3 text-zinc-600">Module 11 Failure Recovery</td>
                          <td className="p-3 text-right font-bold text-emerald-600">Ready</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* AUTHENTICATION & KEYS SECTION */}
            {activeSection === 'auth' && (
              <div className="space-y-6 text-xs text-zinc-600">
                <div>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                    Security Layer
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                    Authentication & Cryptographic Keys
                  </h2>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed font-medium">
                    MeterPrompt uses two distinct authentication mechanisms depending on the route guard:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
                    <div className="font-extrabold text-zinc-900 text-xs flex items-center gap-1.5">
                      <Lock size={14} className="text-[#5865f2]" /> 1. User Dashboard Sessions (JWT)
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      All standard portal endpoints (`/api/subscriptions`, `/api/billing`, `/api/plans`) require a valid JWT Bearer header:
                    </p>
                    <div className="bg-zinc-900 text-zinc-200 p-2.5 rounded-lg font-mono text-[11px] mt-2">
                      <code>Authorization: Bearer &lt;jwt_access_token&gt;</code>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
                    <div className="font-extrabold text-zinc-900 text-xs flex items-center gap-1.5">
                      <Key size={14} className="text-emerald-600" /> 2. AI Proxy Inferences (API Secret Keys)
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Inference completion requests (`/api/v1/chat/completions`) accept secret keys with `mp_live_` prefix via either Header or Bearer token:
                    </p>
                    <div className="bg-zinc-900 text-zinc-200 p-2.5 rounded-lg font-mono text-[11px] mt-2 space-y-1">
                      <div><code>Authorization: Bearer mp_live_8f93a17b20e44129</code></div>
                      <div><code>x-api-key: mp_live_8f93a17b20e44129</code></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
                  <h4 className="font-extrabold flex items-center gap-1">
                    <ShieldCheck size={14} className="text-amber-700" /> Cryptographic Key Security Notice
                  </h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Raw API secret keys are displayed <strong>only once</strong> upon creation. Only cryptographic SHA-256 hashes (`crypto.createHash('sha256')`) are stored in MongoDB.
                  </p>
                </div>
              </div>
            )}

            {/* AI PROXY CHAT COMPLETIONS SECTION */}
            {activeSection === 'completions' && (
              <div className="space-y-6 text-xs text-zinc-600">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded">
                      POST
                    </span>
                    <span className="font-mono text-xs font-extrabold text-zinc-900">
                      /api/v1/chat/completions
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                    Token-Metered AI Inference Proxy
                  </h2>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-medium">
                    OpenAI-compatible chat completion proxy routing requests to `gpt-4o`, `claude-3-5-sonnet`, `deepseek-r1`, or local `mock-gpt-4o`.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-xs text-zinc-900">Request Body Parameters</h3>
                  <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-[10px] border-b border-zinc-200">
                        <tr>
                          <th className="p-2.5">Parameter</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Required</th>
                          <th className="p-2.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-[11px]">
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-zinc-900">model</td>
                          <td className="p-2.5 font-mono text-zinc-500">string</td>
                          <td className="p-2.5 text-rose-600 font-bold">Required</td>
                          <td className="p-2.5 text-zinc-700">Target LLM (`gpt-4o`, `claude-3-5-sonnet`, `deepseek-r1`, `mock-gpt-4o`).</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-zinc-900">messages</td>
                          <td className="p-2.5 font-mono text-zinc-500">array</td>
                          <td className="p-2.5 text-rose-600 font-bold">Required</td>
                          <td className="p-2.5 text-zinc-700">Array of message objects (e.g. role and content parameters).</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-zinc-900">temperature</td>
                          <td className="p-2.5 font-mono text-zinc-500">number</td>
                          <td className="p-2.5 text-zinc-400">Optional</td>
                          <td className="p-2.5 text-zinc-700">Sampling temperature (0.0 to 1.0). Defaults to 0.7.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                  <h4 className="font-extrabold text-zinc-900 text-xs flex items-center gap-1.5">
                    <Activity size={14} className="text-emerald-600" /> Gateway Response Headers
                  </h4>
                  <ul className="space-y-1 font-mono text-[11px] text-zinc-700">
                    <li><code className="text-primary font-bold">x-meterprompt-tokens-used</code>: Total tokens consumed by prompt & completion.</li>
                    <li><code className="text-primary font-bold">x-meterprompt-remaining-credits</code>: Remaining account credit balance ($).</li>
                    <li><code className="text-primary font-bold">x-meterprompt-latency-ms</code>: Edge proxy execution turnaround time (ms).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* SUBSCRIPTIONS & PRORATION SECTION */}
            {activeSection === 'subscriptions' && (
              <div className="space-y-6 text-xs text-zinc-600">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded">
                      PUT
                    </span>
                    <span className="font-mono text-xs font-extrabold text-zinc-900">
                      /api/subscriptions/:id/change-plan
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                    Subscription & Proration Engine
                  </h2>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-medium">
                    Upgrades or downgrades an active subscription tier, computing day-by-day unused time credits and applying annual discount math.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-xs text-zinc-900">Request Parameters</h3>
                  <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-[10px] border-b border-zinc-200">
                        <tr>
                          <th className="p-2.5">Parameter</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Required</th>
                          <th className="p-2.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-[11px]">
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-zinc-900">newPlanId</td>
                          <td className="p-2.5 font-mono text-zinc-500">string</td>
                          <td className="p-2.5 text-rose-600 font-bold">Required</td>
                          <td className="p-2.5 text-zinc-700">Target MongoDB ObjectId string of target plan tier.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-bold text-zinc-900">billingCycle</td>
                          <td className="p-2.5 font-mono text-zinc-500">string</td>
                          <td className="p-2.5 text-rose-600 font-bold">Required</td>
                          <td className="p-2.5 text-zinc-700">`monthly` or `yearly` / `annual` tenure.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900 text-zinc-100 rounded-xl space-y-2 font-mono text-[11px]">
                  <h4 className="font-bold text-xs text-white font-sans flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" /> Business Math Engine
                  </h4>
                  <p className="text-zinc-300 font-sans leading-relaxed">
                    <strong>1. Annual Lump-Sum Discount:</strong> Selecting `yearly` applies a 20% discount on base price for the 12-month lump sum:
                    <br />
                    <code className="text-emerald-400 font-mono">Billed Total = (basePrice × 0.80) × 12</code>
                  </p>
                  <p className="text-zinc-300 font-sans leading-relaxed">
                    <strong>2. Mid-Cycle Proration Accounting:</strong> Unused days on the previous plan are credited directly to the new invoice:
                    <br />
                    <code className="text-amber-400 font-mono">Credit = OldPrice × (RemainingDays / TotalCycleDays)</code>
                  </p>
                </div>
              </div>
            )}

            {/* COUPONS SECTION */}
            {activeSection === 'coupons' && (
              <div className="space-y-6 text-xs text-zinc-600">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded">
                      POST
                    </span>
                    <span className="font-mono text-xs font-extrabold text-zinc-900">
                      /api/coupons/apply
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                    Promotional Coupon Validation
                  </h2>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-medium">
                    Validates promotional discount codes, enforcing expiration dates (`validTill`) and maximum redemption caps.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-xs text-zinc-900">Request Schema</h3>
                  <div className="bg-zinc-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px]">
                    <pre>{`{
  "code": "BUILDWITHAI20"
}`}</pre>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                  <h4 className="font-extrabold text-zinc-900 text-xs flex items-center gap-1.5">
                    <Tag size={14} className="text-[#5865f2]" /> Validation Business Rules
                  </h4>
                  <ul className="space-y-1 text-zinc-700 text-[11px]">
                    <li>• Code lookup is case-insensitive (automatically uppercase normalized).</li>
                    <li>• Checks <code className="font-mono text-zinc-800 font-bold">timesRedeemed &lt; maxRedemptions</code> to prevent cap exhaustion.</li>
                    <li>• Verifies <code className="font-mono text-zinc-800 font-bold">new Date() &lt; validTill</code> before applying percentage discount.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* DUNNING SECTION */}
            {activeSection === 'dunning' && (
              <div className="space-y-6 text-xs text-zinc-600">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-600 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded">
                      POST
                    </span>
                    <span className="font-mono text-xs font-extrabold text-zinc-900">
                      /api/billing/retry-failed
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">Admin Only</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                    Dunning & Payment Recovery Sweep
                  </h2>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-medium">
                    Automated 3-strike retry engine sweeping failed invoices every 48 hours before marking subscriptions `past_due` or `suspended`.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900 text-zinc-100 rounded-xl space-y-3 font-mono text-[11px]">
                  <h4 className="font-bold text-xs text-white font-sans flex items-center gap-1.5">
                    <RefreshCw size={14} className="text-amber-400" /> 3-Strike Escalation Lifecycle
                  </h4>
                  <div className="space-y-2 font-sans text-xs">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-amber-400 font-bold">Attempt 1 (Immediate)</span>
                      <span className="text-zinc-400">Invoice marked `failed`, initial retry scheduled in 48h.</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-amber-400 font-bold">Attempt 2 (+48 Hours)</span>
                      <span className="text-zinc-400">Second payment attempt; sends email notification.</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-bold">Attempt 3 (+96 Hours)</span>
                      <span className="text-zinc-400">Final failure; sets status `past_due` / `suspended`.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STANDARDIZED ERROR MATRIX SECTION */}
            {activeSection === 'errors' && (
              <div className="space-y-6 text-xs text-zinc-600">
                <div>
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                    Centralized AppError
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#1e1f24] mt-2 tracking-tight">
                    Central Error Envelope
                  </h2>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-medium">
                    All failure responses return a uniform JSON error envelope generated by `errorHandler.js`.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-xs text-zinc-900">HTTP Status Code Specifications</h3>
                  <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-[10px] border-b border-zinc-200">
                        <tr>
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">Error Code</th>
                          <th className="p-2.5">Trigger Condition</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                        <tr>
                          <td className="p-2.5 font-bold text-amber-600">400</td>
                          <td className="p-2.5 font-bold text-zinc-900">INPUT_VALIDATION_FAILED</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Payload body validation errors.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-rose-600">401</td>
                          <td className="p-2.5 font-bold text-zinc-900">INVALID_TOKEN</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Missing or invalid JWT / API secret key.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-rose-600">403</td>
                          <td className="p-2.5 font-bold text-zinc-900">FORBIDDEN_ROLE_ACCESS</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Requires `admin` privileges.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-amber-600">404</td>
                          <td className="p-2.5 font-bold text-zinc-900">ENDPOINT_NOT_FOUND</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Invalid endpoint URL requested.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-rose-600">500</td>
                          <td className="p-2.5 font-bold text-zinc-900">INTERNAL_SERVER_ERROR</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Unhandled exception caught by error middleware.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: RIGHT STICKY INTERACTIVE CODE CONSOLE (4 cols) */}
        <div className={`lg:col-span-4 space-y-4 sticky top-20 ${mobileTab === 'content' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4 shadow-xl text-white space-y-4">
            
            {/* Request Language Tabs */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px] font-bold">
                {['curl', 'js', 'python', 'openai'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setRequestLang(lang)}
                    className={`px-2.5 py-1 rounded-lg uppercase tracking-wider transition cursor-pointer ${
                      requestLang === lang
                        ? 'bg-[#5865f2] text-white font-extrabold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lang === 'openai' ? 'SDK' : lang}
                  </button>
                ))}
              </div>

              <button
                onClick={() => copyToClipboard(codeSnippets[activeSection]?.[requestLang] || '')}
                className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800"
              >
                {copiedSnippet ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedSnippet ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Request Snippet Body */}
            <div className="font-mono text-[11px] leading-relaxed text-emerald-400 bg-zinc-950 p-4 rounded-xl overflow-x-auto border border-zinc-900 max-h-[300px]">
              <pre>{codeSnippets[activeSection]?.[requestLang] || '// Code snippet not available'}</pre>
            </div>

            {/* Response Inspector Header & Status Switcher */}
            <div className="pt-2 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Terminal size={13} className="text-[#5865f2]" /> Response Inspector
                </span>
                <div className="flex gap-1">
                  {['200', '400', '401'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setResponseTab(status)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition ${
                        responseTab === status
                          ? status === '200' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : status === '400' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Inspector Payload Output */}
              <div className="font-mono text-[11px] leading-relaxed bg-zinc-950 p-4 rounded-xl overflow-x-auto border border-zinc-900 max-h-[280px]">
                <pre className={
                  responseTab === '200' ? 'text-zinc-200' : responseTab === '400' ? 'text-amber-300' : 'text-rose-400'
                }>
                  {responsePayloads[activeSection]?.[responseTab] || '{}'}
                </pre>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
