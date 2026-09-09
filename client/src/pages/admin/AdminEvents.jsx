import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { Activity, Copy, Check } from 'lucide-react';

export default function AdminEventsView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/admin/events');
        setEvents(res.data || res.events || []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getEventBadge = (type) => {
    if (type.includes('failed')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (type.includes('created')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (type.includes('updated')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  };

  const handleCopyJson = (evt) => {
    navigator.clipboard.writeText(JSON.stringify(evt.data, null, 2));
    setCopiedId(evt._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
          <Activity size={20} className="text-[#5865f2]" /> Billing Events & Webhook Stream
        </h2>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">Immutable record of dot-notated lifecycle events and state transitions</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="divide-y divide-zinc-200">
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-400 font-mono">Streaming billing events...</div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 font-mono">No events recorded yet. Perform a subscription or top-up action to generate events.</div>
          ) : (
            events.map((evt) => {
              const isExpanded = expandedEventId === evt._id;
              return (
                <div key={evt._id} className="hover:bg-zinc-50/70 transition-colors">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Event Badge */}
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                        evt.type.includes('failed') ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                        evt.type.includes('cancel') ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-indigo-50 text-[#5865f2] border border-indigo-100'
                      }`}>
                        {evt.type.replace('customer.subscription.', '').replace('invoice.', '').replace('_', ' ')}
                      </span>

                      {/* Human-Readable Message */}
                      <div>
                        <p className="text-xs font-semibold text-zinc-900">
                          {evt.summary || (
                            evt.data?.previousAttributes
                              ? `Switched from ${evt.data.previousAttributes.plan} (${evt.data.previousAttributes.billingCycle}) to ${evt.data.object.plan} (${evt.data.object.billingCycle})`
                              : `Subscribed to ${evt.data?.object?.plan || 'Plan'}`
                          )}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          Customer: <span className="text-zinc-700 font-medium">{evt.customerId?.email || 'N/A'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {new Date(evt.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedEventId(isExpanded ? null : evt._id)}
                        className="text-xs font-semibold text-[#5865f2] hover:underline cursor-pointer"
                      >
                        {isExpanded ? 'Hide Details' : 'View Payload'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-zinc-950 border-t border-zinc-200 text-zinc-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Raw Event Payload Data</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyJson(evt);
                          }}
                          className="text-[10px] font-mono text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer bg-zinc-800 px-2 py-1 rounded"
                        >
                          {copiedId === evt._id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          {copiedId === evt._id ? 'Copied JSON!' : 'Copy JSON'}
                        </button>
                      </div>
                      <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 text-emerald-400">
                        {JSON.stringify(evt.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
