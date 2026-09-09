import React, { useState, useEffect } from 'react';
import { Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DocsPage({ docsTab = 'introduction', setDocsTab }) {
  const [activeSection, setActiveSection] = useState('introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Sync state with props & URL search params/hash
  useEffect(() => {
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
      'introduction': 'introduction',
      'overview': 'introduction',
      'auth': 'auth',
      'authentication': 'auth',
      'keys': 'auth',
      'first-request': 'first-request',
      'quickstart': 'first-request',
      'usage-quotas': 'usage-quotas',
      'metering': 'usage-quotas',
      'plans-proration': 'plans-proration',
      'subscriptions': 'plans-proration',
      'proration': 'plans-proration',
      'coupons': 'coupons',
      'dunning': 'dunning',
      'errors': 'errors',
      'api-reference': 'api-reference',
      'reference': 'api-reference'
    };
    return sectionMap[key] || 'introduction';
  };

  const handleSelectSection = (sectionId) => {
    const normalized = normalizeTabKey(sectionId);
    setActiveSection(normalized);
    if (setDocsTab) setDocsTab(normalized);
    const newUrl = `${window.location.pathname}?tab=${normalized}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Nav Structure Outline
  const pages = [
    { id: 'introduction', title: 'Introduction', group: 'GETTING STARTED' },
    { id: 'auth', title: 'Authentication', group: 'GETTING STARTED' },
    { id: 'first-request', title: 'Making your first request', group: 'GETTING STARTED' },
    { id: 'usage-quotas', title: 'Understanding usage & quotas', group: 'CORE CONCEPTS' },
    { id: 'plans-proration', title: 'Plans & proration', group: 'CORE CONCEPTS' },
    { id: 'coupons', title: 'Coupons & promotional discounts', group: 'CORE CONCEPTS' },
    { id: 'dunning', title: 'Handling failed payments (dunning)', group: 'CORE CONCEPTS' },
    { id: 'errors', title: 'Errors & status codes', group: 'DIAGNOSTICS' },
    { id: 'api-reference', title: 'API reference', group: 'REFERENCE' }
  ];

  // Group pages for sidebar rendering
  const navigationGroups = [
    {
      title: 'Getting Started',
      items: pages.filter(p => p.group === 'GETTING STARTED')
    },
    {
      title: 'Core Concepts',
      items: pages.filter(p => p.group === 'CORE CONCEPTS')
    },
    {
      title: 'Diagnostics',
      items: pages.filter(p => p.group === 'DIAGNOSTICS')
    },
    {
      title: 'Reference',
      items: pages.filter(p => p.group === 'REFERENCE')
    }
  ];

  // Filter items by search query
  const filteredGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  // Compute Prev / Next Pager
  const currentIndex = pages.findIndex(p => p.id === activeSection);
  const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const nextPage = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;

  // Inline Scoped Code Block Component
  const CodeBlock = ({ id, snippets }) => {
    const [selectedLang, setSelectedLang] = useState('curl');
    const snippetText = snippets[selectedLang] || snippets.curl || '';

    return (
      <div className="my-6 rounded-lg bg-[#121215] border border-zinc-800 font-mono text-xs overflow-hidden">
        {/* Top Minimal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#18181c] border-b border-zinc-800 text-zinc-400">
          <div className="flex items-center gap-1">
            {Object.keys(snippets).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLang(lang)}
                className={`px-2.5 py-1 rounded text-[11px] font-sans font-medium transition cursor-pointer ${
                  selectedLang === lang ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'hover:text-zinc-200'
                }`}
              >
                {lang === 'openai' ? 'OpenAI SDK' : lang}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(snippetText, `${id}-${selectedLang}`)}
            className="flex items-center gap-1.5 text-[11px] font-sans text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            {copiedId === `${id}-${selectedLang}` ? (
              <>
                <Check size={13} className="text-zinc-200" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto text-zinc-200 leading-relaxed text-[12px]">
          <pre>{snippetText}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] font-sans antialiased">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">

        {/* LEFT: PERSISTENT SIDEBAR NAV */}
        <aside className="w-full md:w-64 shrink-0 border-r border-zinc-200 p-6 md:min-h-screen bg-[#FAFAFA]">
          {/* Top Search Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded focus:outline-none focus:border-zinc-900 transition-colors text-zinc-900 placeholder-zinc-400"
            />
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-6">
            {filteredGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-2">
                <h3 className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                  {group.title}
                </h3>
                <ul className="space-y-1">
                  {group.items.map(item => {
                    const isActive = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectSection(item.id)}
                          className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer border-l-2 ${
                            isActive
                              ? 'border-zinc-900 text-zinc-900 font-bold bg-transparent'
                              : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                          }`}
                        >
                          {item.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* RIGHT: SINGLE CONTENT COLUMN (MAX-WIDTH 720PX) */}
        <main className="flex-1 p-6 md:p-12 max-w-3xl min-w-0">
          
          {/* 1. INTRODUCTION */}
          {activeSection === 'introduction' && (
            <article className="space-y-6 text-zinc-800 leading-relaxed text-sm">
              <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Introduction</h1>
              
              <p className="text-base text-zinc-700 leading-relaxed">
                MeterPrompt is a developer platform designed to sit between your client software and third-party artificial intelligence inference APIs. It handles two separate but interdependent responsibilities: proxying inference requests to upstream language model providers, and executing real-time metered billing and quota management for your users.
              </p>

              <p>
                Building applications backed by Large Language Models presents unique infrastructure challenges. LLM inference cost varies widely depending on prompt length, model selection, and completion depth. Flat-rate monthly subscriptions frequently fail to align software revenue with real infrastructure expenses. MeterPrompt solves this by decoupling API access credentials from billing logic, giving you granular control over prompt/completion token quotas, credit top-ups, and automated tier switching.
              </p>

              <p>
                The platform consists of two integrated components:
              </p>

              <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                <li>
                  <strong>The AI Proxy Gateway:</strong> An OpenAI-compatible reverse proxy hosted at <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">/api/v1/chat/completions</code>. It accepts standard inference requests, verifies developer authorization, forwards requests to models such as GPT-4o, Claude 3.5 Sonnet, or DeepSeek R1, and captures token consumption telemetry before returning the response.
                </li>
                <li>
                  <strong>The Billing & Quota Engine:</strong> A backend service that tracks monthly token consumption per subscription, evaluates credit balances, applies mid-cycle proration credit during plan changes, and automates retry sweeps for failed recurring payments.
                </li>
              </ul>

              <p>
                Whether you are building an enterprise SaaS application, an internal AI developer portal, or a multi-tenant gateway, MeterPrompt ensures your inference pipeline remains cost-effective and predictable.
              </p>

              <div className="pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => handleSelectSection('first-request')}
                  className="text-zinc-900 font-bold hover:underline inline-flex items-center gap-1 text-xs cursor-pointer"
                >
                  Ready to start? Follow the step-by-step guide in Making your first request &rarr;
                </button>
              </div>
            </article>
          )}

          {/* 2. AUTHENTICATION */}
          {activeSection === 'auth' && (
            <article className="space-y-6 text-zinc-800 leading-relaxed text-sm">
              <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Authentication</h1>

              <p className="text-base text-zinc-700 leading-relaxed">
                MeterPrompt uses two distinct authentication mechanisms designed for different operating contexts. Understanding why these mechanisms are separated ensures you configure your applications securely.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Why Two Auth Mechanisms?</h2>

              <p>
                Interactive web applications used by human developers (such as the MeterPrompt dashboard) rely on short-lived <strong>JSON Web Tokens (JWT)</strong>. JWTs are issued upon username and password verification, stored in session state, and passed via standard HTTP Bearer headers. They expire periodically to minimize security risk if a user's browser session is compromised.
              </p>

              <p>
                In contrast, backend services, microservices, and client applications performing machine-to-machine inference calls cannot interactively log in to refresh short-lived web sessions. For these automated systems, MeterPrompt issues persistent <strong>API Secret Keys</strong> prefixed with <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">mp_live_</code>.
              </p>

              <CodeBlock
                id="auth-snippets"
                snippets={{
                  curl: `curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "developer@meterprompt.io",
    "password": "YourPassword123"
  }'`,
                  js: `const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'developer@meterprompt.io',
    password: 'YourPassword123'
  })
});

const data = await response.json();
console.log('JWT Session Token:', data.token);`,
                  python: `import requests

res = requests.post("http://localhost:5000/api/auth/login", json={
    "email": "developer@meterprompt.io",
    "password": "YourPassword123"
})
print("Session Token:", res.json()["token"])`
                }}
              />

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Cryptographic Key Hashing</h2>

              <p>
                To prevent credential leaks in database backups or internal logs, MeterPrompt never stores raw API secret keys. When a secret key is generated, the unhashed secret is displayed to the developer <strong>exactly once</strong>.
              </p>

              <p>
                Immediately after display, MeterPrompt computes a cryptographic SHA-256 hash (<code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">crypto.createHash('sha256')</code>) of the secret string and persists only the hash alongside a non-sensitive prefix (e.g. <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">mp_live_8f93...</code>). When an incoming request reaches the proxy gateway, the gateway hashes the inbound token and performs a constant-time lookup against the stored hash index.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Key Rotation & Revocation</h2>

              <p>
                If an API key is accidentally exposed in client-side code or public version control, revoke it immediately from the Developer Portal or via the <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">DELETE /api/keys/:keyId</code> endpoint. Revocation takes effect instantly across all edge gateway instances.
              </p>
            </article>
          )}

          {/* 3. MAKING YOUR FIRST REQUEST */}
          {activeSection === 'first-request' && (
            <article className="space-y-6 text-zinc-800 leading-relaxed text-sm">
              <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Making your first request</h1>

              <p className="text-base text-zinc-700 leading-relaxed">
                This step-by-step walkthrough guides you from creating your developer account to sending an OpenAI-compatible inference request through the MeterPrompt gateway.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Step 1: Register and Authenticate</h2>
              <p>
                Begin by creating a developer account. Registration returns a JWT session token that authorizes you to manage subscriptions and generate API keys.
              </p>

              <CodeBlock
                id="step1-register"
                snippets={{
                  curl: `curl -X POST http://localhost:5000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Developer",
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }'`,
                  js: `const res = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Jane Developer",
    email: "jane@example.com",
    password: "SecurePassword123!"
  })
});
const { token } = await res.json();`,
                  python: `import requests

res = requests.post("http://localhost:5000/api/auth/register", json={
    "name": "Jane Developer",
    "email": "jane@example.com",
    "password": "SecurePassword123!"
})
token = res.json()["token"]`
                }}
              />

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Step 2: Generate a Secret API Key</h2>
              <p>
                Using your session token, request a cryptographic API key. Store the returned secret string in your application's environment configuration.
              </p>

              <CodeBlock
                id="step2-key"
                snippets={{
                  curl: `curl -X POST http://localhost:5000/api/keys \\
  -H "Authorization: Bearer <your_jwt_token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Production Service Key" }'`,
                  js: `const keyRes = await fetch('http://localhost:5000/api/keys', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Production Service Key' })
});
const { key } = await keyRes.json();
console.log('Secret Key:', key); // mp_live_...`,
                  python: `import requests

res = requests.post(
    "http://localhost:5000/api/keys",
    headers={"Authorization": f"Bearer {token}"},
    json={"name": "Production Service Key"}
)
api_key = res.json()["key"]`
                }}
              />

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Step 3: Call the AI Proxy Gateway</h2>
              <p>
                Send a chat completion request to <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">/api/v1/chat/completions</code>. Pass your API key in the <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">Authorization: Bearer mp_live_...</code> header or <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">x-api-key</code> header.
              </p>

              <CodeBlock
                id="step3-proxy"
                snippets={{
                  curl: `curl -X POST http://localhost:5000/api/v1/chat/completions \\
  -H "Authorization: Bearer mp_live_your_secret_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Explain metered SaaS billing." }
    ]
  }'`,
                  js: `const completion = await fetch('http://localhost:5000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer mp_live_your_secret_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Explain metered SaaS billing.' }
    ]
  })
});
const data = await completion.json();
console.log(data.choices[0].message.content);`,
                  python: `import requests

res = requests.post(
    "http://localhost:5000/api/v1/chat/completions",
    headers={"Authorization": "Bearer mp_live_your_secret_key_here"},
    json={
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "Explain metered SaaS billing."}]
    }
)
print(res.json()["choices"][0]["message"]["content"])`,
                  openai: `import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://localhost:5000/api/v1',
  apiKey: 'mp_live_your_secret_key_here'
});

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Explain metered SaaS billing.' }]
});

console.log(response.choices[0].message.content);`
                }}
              />

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Step 4: Inspect Usage Telemetry</h2>
              <p>
                Every successful completion returns an OpenAI-standard <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">usage</code> block containing prompt, completion, and total token counts. MeterPrompt automatically records this consumption to your active subscription's usage ledger.
              </p>
            </article>
          )}

          {/* 4. UNDERSTANDING USAGE & QUOTAS */}
          {activeSection === 'usage-quotas' && (
            <article className="space-y-6 text-zinc-800 leading-relaxed text-sm">
              <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Understanding usage & quotas</h1>

              <p className="text-base text-zinc-700 leading-relaxed">
                MeterPrompt uses a token-based metering model to evaluate resource consumption. Every inference request processed by the gateway is converted into prompt and completion token counts before being checked against your subscription's monthly allowance.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">How Tokens Are Counted</h2>
              <p>
                When an HTTP payload hits <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">/api/v1/chat/completions</code>, the gateway extracts all text from the <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">messages</code> array to compute prompt token length. After the model returns an answer, the generated text length is measured for completion tokens. The sum (<code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">prompt_tokens + completion_tokens</code>) forms the <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">total_tokens</code> value.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Billing Cycle Resets</h2>
              <p>
                Each subscription defines a billing cycle bounded by <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">currentPeriodStart</code> and <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">currentPeriodEnd</code> dates. Usage queries sum tokens recorded in <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">UsageRecord</code> documents strictly within this timestamp window. When a cycle renews, the timestamp window advances, automatically resetting accumulated usage back to zero.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Quota Boundary & 429 Responses</h2>
              <p>
                Before executing an inference call, the gateway calculates current cumulative usage. If the incoming request causes total period tokens to exceed <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">plan.featureLimits.maxTokensPerMonth</code>, the gateway immediately aborts execution and returns an HTTP 429 payload:
              </p>

              <CodeBlock
                id="quota-429-snippet"
                snippets={{
                  curl: `{
  "success": false,
  "message": "Monthly token quota exhausted (100,042 / 100,000 tokens used). Please upgrade your plan tier or top up your balance.",
  "errorCode": "QUOTA_EXHAUSTED"
}`
                }}
              />

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Checking Quota Programmatically</h2>
              <p>
                To monitor real-time usage in your frontend dashboards or backend background jobs, query the <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">GET /api/subscriptions/me/usage</code> endpoint.
              </p>

              <CodeBlock
                id="usage-endpoint"
                snippets={{
                  curl: `curl -X GET http://localhost:5000/api/subscriptions/me/usage \\
  -H "Authorization: Bearer <your_jwt_token>"`,
                  js: `const res = await fetch('http://localhost:5000/api/subscriptions/me/usage', {
  headers: { 'Authorization': \`Bearer \${jwtToken}\` }
});
const { data } = await res.json();
console.log(\`\${data.totalTokensUsed} / \${data.maxTokensPerMonth} tokens (\${data.usagePercentage}%)\`);`,
                  python: `import requests

res = requests.get(
    "http://localhost:5000/api/subscriptions/me/usage",
    headers={"Authorization": f"Bearer {token}"}
)
data = res.json()["data"]
print(f"Usage: {data['usagePercentage']}% ({data['totalTokensUsed']}/{data['maxTokensPerMonth']})")`
                }}
              />
            </article>
          )}

          {/* 5. PLANS & PRORATION */}
          {activeSection === 'plans-proration' && (
            <article className="space-y-6 text-zinc-800 leading-relaxed text-sm">
              <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Plans & proration</h1>

              <p className="text-base text-zinc-700 leading-relaxed">
                Subscriptions in MeterPrompt are governed by dynamic plan tiers. When a customer switches tiers in the middle of a billing period, MeterPrompt calculates proration credits to ensure developers are charged only for the exact days each tier was active.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Proration Accounting Walkthrough</h2>

              <p>
                Consider a customer subscribed to the <strong>Starter Plan ($19.99/month)</strong> on a 30-day billing cycle. 
              </p>

              <div className="p-4 bg-white border border-zinc-200 rounded-lg space-y-3 font-mono text-xs text-zinc-800">
                <div><strong>Day 0:</strong> Customer subscribes to Starter ($19.99). Paid in full for 30 days.</div>
                <div><strong>Day 15:</strong> Customer upgrades to Pro ($49.99/month). 15 days remain in the cycle.</div>
                <div className="pt-2 border-t border-zinc-200 text-zinc-900">
                  <div>Unused Starter Credit: $19.99 &times; (15 / 30) = <strong>$10.00 Credit</strong></div>
                  <div>New Pro Charge (Remaining 15 Days): $49.99 &times; (15 / 30) = <strong>$25.00 Charge</strong></div>
                  <div className="pt-1 text-zinc-900 font-bold">Net Adjustment Invoice: $25.00 - $10.00 = <strong>$15.00 Due Immediately</strong></div>
                </div>
              </div>

              <p>
                The net adjustment ($15.00) is invoiced immediately, and the remaining $10.00 credit balance is stored under <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">prorationBalanceUSD</code> on the subscription document.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Annual Billing Discount Math</h2>
              <p>
                Selecting an <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">annual</code> billing cycle applies a 20% discount on the base price for the entire 12-month tenure:
              </p>
              
              <div className="p-3 bg-zinc-100 border border-zinc-200 rounded font-mono text-xs text-zinc-900">
                Annual Billed Total = (basePrice &times; 0.80) &times; 12
              </div>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Executing a Tier Switch via API</h2>

              <CodeBlock
                id="change-plan-api"
                snippets={{
                  curl: `curl -X PUT http://localhost:5000/api/subscriptions/66e3b52a1c.../change-plan \\
  -H "Authorization: Bearer <your_jwt_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "newPlanId": "66e3a41b2c890123456789ac",
    "billingCycle": "yearly"
  }'`,
                  js: `const response = await fetch('http://localhost:5000/api/subscriptions/66e3b52a1c.../change-plan', {
  method: 'PUT',
  headers: {
    'Authorization': \`Bearer \${jwtToken}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    newPlanId: '66e3a41b2c890123456789ac',
    billingCycle: 'yearly'
  })
});
const result = await response.json();
console.log(result);`,
                  python: `import requests

res = requests.put(
    "http://localhost:5000/api/subscriptions/66e3b52a1c.../change-plan",
    headers={"Authorization": f"Bearer {token}"},
    json={"newPlanId": "66e3a41b2c890123456789ac", "billingCycle": "yearly"}
)
print(res.json())`
                }}
              />
            </article>
          )}

          {/* 6. COUPONS */}
          {activeSection === 'coupons' && (
            <article className="space-y-6 text-zinc-800 leading-relaxed text-sm">
              <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Coupons & promotional discounts</h1>

              <p className="text-base text-zinc-700 leading-relaxed">
                MeterPrompt includes a promotional discount engine allowing admins to mint coupon codes that reduce subscription invoice amounts.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">The Coupon Lifecycle</h2>
              <p>
                Coupons are created with a percentage discount rate, a mandatory expiration date (<code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">validTill</code>), and a maximum redemption limit (<code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">maxRedemptions</code>). 
              </p>

              <p>
                When a developer submits a coupon code during checkout or plan switching, MeterPrompt converts the code to uppercase, verifies that the code is active, confirms that <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">timesRedeemed &lt; maxRedemptions</code>, and validates that current time has not passed <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">validTill</code>. Upon validation, the percentage discount is applied to the checkout invoice.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Applying a Coupon Code</h2>

              <CodeBlock
                id="apply-coupon-api"
                snippets={{
                  curl: `curl -X POST http://localhost:5000/api/coupons/apply \\
  -H "Authorization: Bearer <your_jwt_token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "code": "BUILDWITHAI20" }'`,
                  js: `const res = await fetch('http://localhost:5000/api/coupons/apply', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${jwtToken}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ code: 'BUILDWITHAI20' })
});
const data = await res.json();
console.log('Discount Applied:', data.discountPercent);`,
                  python: `import requests

res = requests.post(
    "http://localhost:5000/api/coupons/apply",
    headers={"Authorization": f"Bearer {token}"},
    json={"code": "BUILDWITHAI20"}
)
print(res.json())`
                }}
              />
            </article>
          )}

          {/* 7. HANDLING FAILED PAYMENTS (DUNNING) */}
          {activeSection === 'dunning' && (
            <article className="space-y-6 text-zinc-800 leading-relaxed text-sm">
              <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Handling failed payments (dunning)</h1>

              <p className="text-base text-zinc-700 leading-relaxed">
                When a recurring subscription renewal payment fails (due to insufficient funds, expired cards, or bank declines), MeterPrompt executes an automated 3-strike dunning lifecycle to recover revenue without abruptly terminating developer access.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">The 3-Attempt Dunning Timeline</h2>

              <div className="space-y-4 pt-2">
                <div className="p-4 bg-white border border-zinc-200 rounded-lg space-y-1">
                  <h4 className="font-bold text-zinc-900 text-xs">Attempt 1 (Immediate Failure)</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    The initial payment fails. The invoice status updates to <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1 py-0.5 rounded">failed</code>, <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1 py-0.5 rounded">paymentAttempts</code> increments to 1, and the subscription status transitions to <code className="font-mono text-xs bg-amber-50 border border-amber-200 text-amber-800 px-1 py-0.5 rounded">grace_period</code>. The developer maintains full AI gateway proxy access.
                  </p>
                </div>

                <div className="p-4 bg-white border border-zinc-200 rounded-lg space-y-1">
                  <h4 className="font-bold text-zinc-900 text-xs">Attempt 2 (+48 Hours)</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    An automated background sweep retries settlement. If it fails again, <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1 py-0.5 rounded">paymentAttempts</code> increments to 2, and an urgent payment notification banner appears on the developer dashboard.
                  </p>
                </div>

                <div className="p-4 bg-white border border-zinc-200 rounded-lg space-y-1">
                  <h4 className="font-bold text-zinc-900 text-xs">Attempt 3 (+96 Hours)</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    The final retry attempt occurs. Upon 3rd consecutive failure, the subscription status is marked <code className="font-mono text-xs bg-rose-50 border border-rose-200 text-rose-800 px-1 py-0.5 rounded">past_due</code> or <code className="font-mono text-xs bg-rose-50 border border-rose-200 text-rose-800 px-1 py-0.5 rounded">canceled</code>. API keys associated with the account are restricted from completing further gateway requests.
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Triggering Admin Dunning Sweeps</h2>

              <p>
                Billing administrators can manually trigger a platform-wide dunning retry sweep using the <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">POST /api/billing/retry-failed</code> endpoint.
              </p>

              <CodeBlock
                id="dunning-api"
                snippets={{
                  curl: `curl -X POST http://localhost:5000/api/billing/retry-failed \\
  -H "Authorization: Bearer <admin_jwt_token>"`,
                  js: `const res = await fetch('http://localhost:5000/api/billing/retry-failed', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${adminJwtToken}\` }
});
const summary = await res.json();
console.log('Dunning Sweep Summary:', summary);`,
                  python: `import requests

res = requests.post(
    "http://localhost:5000/api/billing/retry-failed",
    headers={"Authorization": f"Bearer {admin_jwt}"}
)
print("Sweep Summary:", res.json())`
                }}
              />
            </article>
          )}

          {/* 8. ERRORS */}
          {activeSection === 'errors' && (
            <article className="space-y-6 text-zinc-800 leading-relaxed text-sm">
              <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Errors & status codes</h1>

              <p className="text-base text-zinc-700 leading-relaxed">
                MeterPrompt uses standard HTTP response codes and a centralized JSON error envelope to communicate failure conditions. Every error response includes a human-readable <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">message</code> and a machine-readable <code className="font-mono text-xs bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">errorCode</code>.
              </p>

              <CodeBlock
                id="error-envelope"
                snippets={{
                  curl: `{
  "success": false,
  "message": "Human-readable error description",
  "errorCode": "STANDARD_SNAKE_CASE_CODE"
}`
                }}
              />

              <h2 className="text-xl font-bold text-zinc-900 pt-2">Error Reference Guide</h2>

              <div className="space-y-4 pt-2">
                <div className="p-4 bg-white border border-zinc-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-zinc-900">INPUT_VALIDATION_FAILED</span>
                    <span className="font-mono text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">HTTP 400</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Fired when request body parameters fail validation checks (e.g., missing required fields, invalid email format, or passwords shorter than 6 characters).
                    <br />
                    <em>Guidance: Inspect the returned error message array and correct client payload formatting before retrying.</em>
                  </p>
                </div>

                <div className="p-4 bg-white border border-zinc-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-zinc-900">INVALID_TOKEN / INVALID_API_KEY</span>
                    <span className="font-mono text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">HTTP 401</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Fired when an HTTP request lacks an Authorization header, contains an expired JWT token, or passes a revoked API key string.
                    <br />
                    <em>Guidance: Verify that your <code className="font-mono">Authorization: Bearer ...</code> header is correctly formatted or generate a new secret API key in the portal.</em>
                  </p>
                </div>

                <div className="p-4 bg-white border border-zinc-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-zinc-900">FORBIDDEN_ROLE_ACCESS</span>
                    <span className="font-mono text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">HTTP 403</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Fired when a user authenticated with role <code className="font-mono">customer</code> attempts to call administrative routes (such as creating plans or minting coupons).
                    <br />
                    <em>Guidance: Authenticate with an administrative account or request elevated role permissions.</em>
                  </p>
                </div>

                <div className="p-4 bg-white border border-zinc-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-zinc-900">ENDPOINT_NOT_FOUND</span>
                    <span className="font-mono text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">HTTP 404</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Fired when an inbound request hits an unmapped URI path on the server gateway.
                    <br />
                    <em>Guidance: Check the endpoint path against the API Reference section.</em>
                  </p>
                </div>

                <div className="p-4 bg-white border border-zinc-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-zinc-900">QUOTA_EXHAUSTED</span>
                    <span className="font-mono text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">HTTP 429</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Fired when the subscription's accumulated monthly token usage reaches its plan limit.
                    <br />
                    <em>Guidance: Upgrade your subscription tier or wait for the monthly billing cycle reset.</em>
                  </p>
                </div>

                <div className="p-4 bg-white border border-zinc-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-zinc-900">INTERNAL_SERVER_ERROR</span>
                    <span className="font-mono text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">HTTP 500</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Fired when an unhandled server exception or database connectivity issue occurs.
                    <br />
                    <em>Guidance: Retry the request with exponential backoff. If issues persist, check server logs.</em>
                  </p>
                </div>
              </div>
            </article>
          )}

          {/* 9. API REFERENCE */}
          {activeSection === 'api-reference' && (
            <article className="space-y-6 text-zinc-800 leading-relaxed text-sm">
              <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">API reference</h1>

              <p className="text-base text-zinc-700 leading-relaxed">
                Complete technical specification for all REST API endpoints exposed by the MeterPrompt platform.
              </p>

              <div className="space-y-6 border-t border-zinc-200 pt-4">
                
                {/* Auth Endpoints */}
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-zinc-900">Authentication Endpoints</h2>
                  <div className="border border-zinc-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Method</th>
                          <th className="p-2.5">Endpoint Path</th>
                          <th className="p-2.5">Guard</th>
                          <th className="p-2.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-[11px] font-mono">
                        <tr>
                          <td className="p-2.5 font-bold text-emerald-700">POST</td>
                          <td className="p-2.5 font-bold text-zinc-900">/api/auth/register</td>
                          <td className="p-2.5 text-zinc-500 font-sans">Public</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Register new customer or admin account.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-emerald-700">POST</td>
                          <td className="p-2.5 font-bold text-zinc-900">/api/auth/login</td>
                          <td className="p-2.5 text-zinc-500 font-sans">Public</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Authenticate credentials and receive JWT.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-blue-700">GET</td>
                          <td className="p-2.5 font-bold text-zinc-900">/api/auth/me</td>
                          <td className="p-2.5 text-zinc-500 font-sans">Bearer JWT</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Retrieve profile details and credit balance.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* API Key Management */}
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-zinc-900">API Key Management</h2>
                  <div className="border border-zinc-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Method</th>
                          <th className="p-2.5">Endpoint Path</th>
                          <th className="p-2.5">Guard</th>
                          <th className="p-2.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-[11px] font-mono">
                        <tr>
                          <td className="p-2.5 font-bold text-emerald-700">POST</td>
                          <td className="p-2.5 font-bold text-zinc-900">/api/keys</td>
                          <td className="p-2.5 text-zinc-500 font-sans">Bearer JWT</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Generate secret API key (`mp_live_...`).</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-rose-700">DELETE</td>
                          <td className="p-2.5 font-bold text-zinc-900">/api/keys/:keyId</td>
                          <td className="p-2.5 text-zinc-500 font-sans">Bearer JWT</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Revoke an existing API secret key.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Gateway Proxy */}
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-zinc-900">AI Gateway Proxy</h2>
                  <div className="border border-zinc-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Method</th>
                          <th className="p-2.5">Endpoint Path</th>
                          <th className="p-2.5">Guard</th>
                          <th className="p-2.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-[11px] font-mono">
                        <tr>
                          <td className="p-2.5 font-bold text-emerald-700">POST</td>
                          <td className="p-2.5 font-bold text-zinc-900">/api/v1/chat/completions</td>
                          <td className="p-2.5 text-zinc-500 font-sans">API Key</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Metered AI inference proxy endpoint.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Subscription & Billing Endpoints */}
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-zinc-900">Subscriptions & Billing</h2>
                  <div className="border border-zinc-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Method</th>
                          <th className="p-2.5">Endpoint Path</th>
                          <th className="p-2.5">Guard</th>
                          <th className="p-2.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-[11px] font-mono">
                        <tr>
                          <td className="p-2.5 font-bold text-emerald-700">POST</td>
                          <td className="p-2.5 font-bold text-zinc-900">/api/subscriptions</td>
                          <td className="p-2.5 text-zinc-500 font-sans">Customer</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Subscribe customer to a plan tier.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-blue-700">GET</td>
                          <td className="p-2.5 font-bold text-zinc-900">/api/subscriptions/me</td>
                          <td className="p-2.5 text-zinc-500 font-sans">Customer</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Fetch active subscription details.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-blue-700">GET</td>
                          <td className="p-2.5 font-bold text-zinc-900">/api/subscriptions/me/usage</td>
                          <td className="p-2.5 text-zinc-500 font-sans">Customer</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Fetch current period token usage & quota.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-amber-700">PUT</td>
                          <td className="p-2.5 font-bold text-zinc-900">/api/subscriptions/:id/change-plan</td>
                          <td className="p-2.5 text-zinc-500 font-sans">Customer</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Upgrade/downgrade plan with proration.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-amber-700">PUT</td>
                          <td className="p-2.5 font-bold text-zinc-900">/api/subscriptions/:id/cancel</td>
                          <td className="p-2.5 text-zinc-500 font-sans">Customer</td>
                          <td className="p-2.5 text-zinc-700 font-sans">Schedule cancellation at period end.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </article>
          )}

          {/* BOTTOM SIMPLE PREV / NEXT PAGER */}
          <div className="mt-12 pt-6 border-t border-zinc-200 flex items-center justify-between text-xs">
            {prevPage ? (
              <button
                type="button"
                onClick={() => handleSelectSection(prevPage.id)}
                className="text-zinc-600 hover:text-zinc-900 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>{prevPage.title}</span>
              </button>
            ) : <div />}

            {nextPage ? (
              <button
                type="button"
                onClick={() => handleSelectSection(nextPage.id)}
                className="text-zinc-600 hover:text-zinc-900 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{nextPage.title}</span>
                <ChevronRight size={14} />
              </button>
            ) : <div />}
          </div>

        </main>
      </div>
    </div>
  );
}
