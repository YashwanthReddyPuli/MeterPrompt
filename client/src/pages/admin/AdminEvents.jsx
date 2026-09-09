import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function AdminEventsView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState(null);

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
    if (type.includes('cancel')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (type.includes('created')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (type.includes('updated')) return 'bg-indigo-50 text-[#5865f2] border-indigo-200';
    return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  };

  const formatEventName = (type) => {
    return type
      .replace('customer.subscription.', '')
      .replace('invoice.', '')
      .replace(/_/g, ' ')
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">Audit & Billing Activity</h2>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">Chronological record of state transitions, plan switches, and settlement events</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="divide-y divide-zinc-200">
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-400 font-mono">Loading event stream...</div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 font-mono">No lifecycle events recorded yet.</div>
          ) : (
            events.map((evt) => {
              const isExpanded = expandedEventId === evt._id;
              const prev = evt.data?.previousAttributes || {};
              const current = evt.data?.object || {};
              const hasDiff = Boolean(evt.data?.previousAttributes);

              // Humanized title
              const headline = evt.summary || (hasDiff
                ? `Subscription changed from ${prev.plan || 'Current'} (${prev.billingCycle || 'N/A'}) to ${current.plan || 'New Plan'} (${current.billingCycle || 'N/A'})`
                : evt.type.includes('payment_succeeded')
                ? `Invoice settled for $${Number(current.amount || current.amountCharged || 0).toFixed(2)}`
                : `New subscription created for ${current.plan || 'Plan'} (${current.billingCycle || 'Monthly'})`);

              return (
                <div key={evt._id} className="hover:bg-zinc-50/70 transition-colors">
                  {/* Top Bar / Clickable Row */}
                  <div
                    onClick={() => setExpandedEventId(isExpanded ? null : evt._id)}
                    className="p-4 flex items-center justify-between cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold border tracking-wider ${getEventBadge(evt.type)}`}>
                        {formatEventName(evt.type)}
                      </span>
                      <div>
                        <div className="font-semibold text-zinc-900 text-xs">{headline}</div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          Customer: <span className="text-zinc-700 font-medium">{evt.customerId?.email || 'System'}</span>
                          <span className="mx-2 text-zinc-300">•</span>
                          ID: <span className="text-zinc-400">{evt.eventId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-zinc-400 text-[11px]">
                        {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                      >
                        {isExpanded ? '▲ Hide Details' : '▼ View Breakdown'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Breakdown Drawer */}
                  {isExpanded && (
                    <div className="p-5 bg-zinc-50/80 border-t border-zinc-200 space-y-4 animate-in fade-in duration-150">
                      {/* Meta Details Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-zinc-200">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Event ID</div>
                          <div className="font-mono text-xs text-zinc-900 font-medium mt-0.5 truncate">{evt.eventId}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Invoice / Ref ID</div>
                          <div className="font-mono text-xs text-zinc-900 font-medium mt-0.5 truncate">
                            {current.invoiceId || (current.id ? current.id.slice(-8).toUpperCase() : 'N/A')}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Amount Settled</div>
                          <div className="font-mono text-xs text-emerald-600 font-bold mt-0.5">
                            {current.amountCharged !== undefined 
                              ? `$${Number(current.amountCharged).toFixed(2)}` 
                              : (current.amount !== undefined ? `$${Number(current.amount).toFixed(2)}` : '$0.00 (Prorated)')}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Timestamp</div>
                          <div className="font-mono text-xs text-zinc-600 mt-0.5">
                            {new Date(evt.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                      </div>

                      {/* State Transition Diff Card */}
                      {hasDiff ? (
                        <div>
                          <div className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-2">
                            State Attributes Transition
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Previous State */}
                            <div className="bg-rose-50/40 border border-rose-200 rounded-xl p-3.5 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                Previous Attributes (Before Change)
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between py-1 border-b border-rose-100">
                                  <span className="text-zinc-500">Plan Tier:</span>
                                  <span className="font-semibold text-zinc-800 line-through">{prev.plan || 'None'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-rose-100">
                                  <span className="text-zinc-500">Billing Cycle:</span>
                                  <span className="font-semibold text-zinc-800 capitalize line-through">{prev.billingCycle || 'None'}</span>
                                </div>
                              </div>
                            </div>

                            {/* New State */}
                            <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Updated Attributes (Active Now)
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between py-1 border-b border-emerald-100">
                                  <span className="text-zinc-500">Plan Tier:</span>
                                  <span className="font-bold text-emerald-700">{current.plan || 'None'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-emerald-100">
                                  <span className="text-zinc-500">Billing Cycle:</span>
                                  <span className="font-bold text-emerald-700 capitalize">{current.billingCycle || 'None'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-zinc-200 rounded-xl p-4">
                          <div className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-2">Snapshot Details</div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-zinc-500">Current Plan:</span>{' '}
                              <strong className="text-zinc-900">{current.plan || 'Default'}</strong>
                            </div>
                            <div>
                              <span className="text-zinc-500">Cycle:</span>{' '}
                              <strong className="text-zinc-900 capitalize">{current.billingCycle || 'Monthly'}</strong>
                            </div>
                            <div>
                              <span className="text-zinc-500">Account Status:</span>{' '}
                              <strong className="text-emerald-600 uppercase">{current.status || 'Active'}</strong>
                            </div>
                            <div>
                              <span className="text-zinc-500">Access Period End:</span>{' '}
                              <strong className="font-mono text-zinc-700">
                                {current.currentPeriodEnd ? new Date(current.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}
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
