import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Key, Copy, Check, Trash2, Terminal } from 'lucide-react';
import apiClient from '../../services/apiClient';

export default function ApiKeys({ newRawKey, setCreateKeyModalOpen }) {
  const { user, token, fetchUserProfile, showNotification } = useAuth();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const copyToClipboard = (text, type = 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!token) return;
    try {
      const data = await apiClient.delete(`/auth/api-keys/${keyId}`);
      if (data.success) {
        showNotification('success', 'Secret Key revoked.');
        fetchUserProfile();
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to revoke API key.');
    }
  };

  const sampleCurlSnippet = `curl http://localhost:5000/api/v1/chat/completions \\
  -H "Authorization: Bearer ${newRawKey || 'mp_live_YOUR_SECRET_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "mock-llm-v1",
    "messages": [{"role": "user", "content": "Hello MeterPrompt!"}]
  }'`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">API Secret Keys</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Authenticates proxy inference calls. Keys are hashed with SHA-256 in MongoDB.
          </p>
        </div>
        <button 
          onClick={() => setCreateKeyModalOpen(true)}
          className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition shadow-xs shadow-primary/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          + Create New Secret Key
        </button>
      </div>

      {newRawKey && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
            <span>Secret key generated! Copy it now (it will never be displayed again):</span>
            <button 
              onClick={() => copyToClipboard(newRawKey, 'key')}
              className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700 transition"
            >
              {copiedKey ? <Check size={14} /> : <Copy size={14} />}
              {copiedKey ? 'Copied' : 'Copy Key'}
            </button>
          </div>
          <p className="font-mono text-xs font-bold text-emerald-950 bg-white p-2.5 rounded-lg border border-emerald-300 break-all select-all">
            {newRawKey}
          </p>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary text-muted-foreground font-semibold border-b border-border uppercase text-[10px]">
            <tr>
              <th className="p-3.5">Name</th>
              <th className="p-3.5">Key Prefix</th>
              <th className="p-3.5">Created</th>
              <th className="p-3.5">Last Used</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {user?.apiKeys && user.apiKeys.length > 0 ? (
              user.apiKeys.map((k) => (
                <tr key={k._id} className="hover:bg-secondary/40 transition">
                  <td className="p-3.5 font-bold text-foreground">{k.name}</td>
                  <td className="p-3.5 font-mono text-foreground font-bold">{k.prefix}...</td>
                  <td className="p-3.5 text-muted-foreground">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="p-3.5 text-muted-foreground">{k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : 'Never'}</td>
                  <td className="p-3.5 text-right">
                    <button 
                      onClick={() => handleRevokeKey(k._id)}
                      className="text-rose-600 hover:text-rose-800 font-medium px-2 py-1 hover:bg-rose-50 rounded transition inline-flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 size={13} />
                      Revoke
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-muted-foreground">
                  No active API secret keys found. Click "+ Create New Secret Key".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* INTEGRATION QUICKSTART BOX */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Terminal size={18} className="text-primary" />
            Integration Quickstart
          </h3>
          <button 
            onClick={() => copyToClipboard(sampleCurlSnippet, 'snippet')}
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
          >
            {copiedSnippet ? <Check size={14} /> : <Copy size={14} />}
            {copiedSnippet ? 'Copied Snippet' : 'Copy cURL'}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Send OpenAI-compatible inference completions directly through the MeterPrompt proxy gateway:
        </p>

        <div className="bg-[#1e1e24] text-white p-4 rounded-xl font-mono text-xs overflow-x-auto border border-border">
          <pre>{sampleCurlSnippet}</pre>
        </div>
      </div>
    </div>
  );
}
