import React from 'react';

export default function Logs() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Inference Generations Log</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Granular audit trail of requests metered by the gateway</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary text-muted-foreground font-semibold border-b border-border uppercase text-[10px]">
            <tr>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Model</th>
              <th className="p-3.5">Input Tokens</th>
              <th className="p-3.5">Output Tokens</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono text-[11px]">
            {[
              { time: '2026-09-09 00:22:10', model: 'mock-llm-v1', in: 42, out: 88, status: '200 OK', latency: '124 ms' },
              { time: '2026-09-09 00:18:45', model: 'gpt-4o-mini', in: 120, out: 240, status: '200 OK', latency: '198 ms' },
              { time: '2026-09-09 00:10:02', model: 'mock-llm-v1', in: 15, out: 30, status: '200 OK', latency: '94 ms' }
            ].map((log, i) => (
              <tr key={i} className="hover:bg-secondary/40 transition">
                <td className="p-3.5 text-muted-foreground">{log.time}</td>
                <td className="p-3.5 font-bold text-foreground">{log.model}</td>
                <td className="p-3.5">{log.in}</td>
                <td className="p-3.5">{log.out}</td>
                <td className="p-3.5 font-sans"><span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold rounded">{log.status}</span></td>
                <td className="p-3.5 text-muted-foreground">{log.latency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
