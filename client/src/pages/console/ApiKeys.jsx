import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { Key, Copy, Check, Trash2, Terminal, AlertTriangle, ShieldCheck } from 'lucide-react';
import apiClient from '../../services/apiClient';

export default function ApiKeys() {
  const { user, token, fetchUserProfile, showNotification } = useAuth();

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState(null); // One-time raw secret key
  const [keyName, setKeyName] = useState('');
  const [expiresIn, setExpiresIn] = useState('never');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Single-flight submission handler preventing duplicate key generation
  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const data = await apiClient.post('/auth/api-keys', {
        name: keyName.trim() || 'Default Live Key',
        expiresIn: expiresIn // 'never' | '30d' | '60d' | '90d'
      });

      if (data && data.success) {
        const rawKey = data.data?.key || data.data?.apiKey;
        setCreatedKeyData(rawKey);
        setShowCreateModal(false);
        setKeyName('');
        setExpiresIn('never');
        if (fetchUserProfile) await fetchUserProfile();
        showNotification('success', 'Secret Key generated!');
      }
    } catch (err) {
      console.error('Failed to create key:', err);
      showNotification('error', err.message || 'Failed to create key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKey = (text) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleCopySnippet = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleRevokeKey = async (keyId) => {
    if (!token) return;
    try {
      const data = await apiClient.delete(`/auth/api-keys/${keyId}`);
      if (data.success) {
        showNotification('success', 'Secret Key revoked.');
        if (fetchUserProfile) await fetchUserProfile();
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to revoke API key.');
    }
  };

  const sampleCurlSnippet = `curl http://localhost:5000/api/v1/chat/completions \\
  -H "Authorization: Bearer ${createdKeyData || 'mp_live_YOUR_SECRET_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello MeterPrompt!"}]
  }'`;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1e1f24] tracking-tight">API Secret Keys</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Authenticates proxy inference calls. Keys are hashed with SHA-256 in MongoDB.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-[#5865f2]/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95"
        >
          + Create New Secret Key
        </button>
      </div>

      {/* KEYS TABLE CONTAINER */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-[#5865f2]" />
            <h3 className="text-sm font-bold text-zinc-900">Active Secret Keys</h3>
          </div>
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
            {(user?.apiKeys && user.apiKeys.length) || 0} Keys Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Key Prefix</th>
                <th className="py-3 px-5">Created</th>
                <th className="py-3 px-5">Expires</th>
                <th className="py-3 px-5">Last Used</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-700 font-medium">
              {user?.apiKeys && user.apiKeys.length > 0 ? (
                user.apiKeys.map((k) => (
                  <tr key={k._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-zinc-900">{k.name}</td>
                    <td className="py-3.5 px-5 font-mono text-zinc-800 font-bold">{k.prefix}...</td>
                    <td className="py-3.5 px-5 text-zinc-500">{new Date(k.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="py-3.5 px-5 text-zinc-500">
                      {k.expiresAt ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          {new Date(k.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-zinc-500">Never</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-zinc-500">{k.lastUsed ? new Date(k.lastUsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button 
                        onClick={() => handleRevokeKey(k._id)}
                        className="text-rose-600 hover:text-rose-800 font-semibold px-2.5 py-1 hover:bg-rose-50 rounded-lg transition inline-flex items-center gap-1 text-xs cursor-pointer"
                      >
                        <Trash2 size={13} />
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-zinc-400">
                    No active API secret keys found. Click "+ Create New Secret Key" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTEGRATION QUICKSTART BOX */}
      <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
            <Terminal size={18} className="text-[#5865f2]" />
            Integration Quickstart
          </h3>
          <button 
            onClick={() => handleCopySnippet(sampleCurlSnippet)}
            className="text-xs font-bold text-[#5865f2] hover:underline flex items-center gap-1 cursor-pointer"
          >
            {copiedSnippet ? <Check size={14} /> : <Copy size={14} />}
            {copiedSnippet ? 'Copied Snippet' : 'Copy cURL'}
          </button>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          Send OpenAI-compatible inference completions directly through the MeterPrompt proxy gateway:
        </p>

        <div className="bg-[#1e1e24] text-zinc-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-800">
          <pre>{sampleCurlSnippet}</pre>
        </div>
      </div>

      {/* MODAL 1: Create Key Configuration Modal */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Explicit Single Backdrop Layer */}
          <div 
            className="fixed inset-0 bg-zinc-950/20 transition-opacity" 
            onClick={() => !isSubmitting && setShowCreateModal(false)} 
          />

          {/* Modal Card Surface */}
          <div className="relative z-10 w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-150 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">Create new secret key</h3>
              <p className="text-xs text-zinc-500 mt-1">This key will allow API requests to be metered under your account.</p>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Key Name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Staging Backend, Local Dev"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Expiration</label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 cursor-pointer font-medium"
                >
                  <option value="never">No Expiration</option>
                  <option value="30d">30 Days</option>
                  <option value="60d">60 Days</option>
                  <option value="90d">90 Days</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 mt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#5865f2] hover:bg-[#4752c4] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Creating...</span>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      <span>Create Secret Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: One-Time Reveal Modal */}
      {createdKeyData && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Explicit Single Backdrop Layer */}
          <div className="fixed inset-0 bg-zinc-950/20 transition-opacity" />

          {/* Modal Card Surface */}
          <div className="relative z-10 w-full max-w-lg bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-150 space-y-4">
            <h3 className="text-base font-extrabold text-zinc-900">Save your secret key</h3>

            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs leading-relaxed flex items-start gap-2.5 font-medium">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <span>Please save this secret key somewhere safe and accessible. For security reasons, <strong>you won't be able to view it again</strong> through your account.</span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl p-2.5">
              <input
                readOnly
                type="text"
                value={createdKeyData}
                className="w-full font-mono text-xs font-bold text-zinc-800 bg-transparent outline-none select-all px-1"
              />
              <button
                type="button"
                onClick={() => handleCopyKey(createdKeyData)}
                className="shrink-0 px-3.5 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {hasCopied ? <Check size={14} /> : <Copy size={14} />}
                {hasCopied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setCreatedKeyData(null)}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
