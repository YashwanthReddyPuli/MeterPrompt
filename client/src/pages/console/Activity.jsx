import React from 'react';

export default function Activity() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Activity & Spend Trends</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Request volume, token breakdown, and model distribution analytics</p>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-6">
        <h3 className="font-bold text-sm text-foreground">Token Consumption Breakdown</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Prompt Tokens (Input)</span>
              <span className="font-mono">85,200 tokens (59.8%)</span>
            </div>
            <div className="w-full bg-secondary h-3 rounded-full overflow-hidden border border-border">
              <div className="bg-primary h-full rounded-full" style={{ width: '59.8%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Completion Tokens (Output)</span>
              <span className="font-mono">57,300 tokens (40.2%)</span>
            </div>
            <div className="w-full bg-secondary h-3 rounded-full overflow-hidden border border-border">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '40.2%' }}></div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-secondary/50 rounded-xl border border-border">
            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Top Model Used</span>
            <span className="font-bold text-foreground text-sm font-mono mt-0.5 block">mock-llm-v1</span>
            <span className="text-[11px] text-muted-foreground">84% of total inference requests</span>
          </div>

          <div className="p-4 bg-secondary/50 rounded-xl border border-border">
            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Avg Proxy Latency</span>
            <span className="font-bold text-foreground text-sm font-mono mt-0.5 block">142 ms</span>
            <span className="text-[11px] text-emerald-600 font-medium">Sub-millisecond routing efficiency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
