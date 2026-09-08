import React, { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export function AnimatedTicket({
  ticketId = "INV-928374",
  date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  cardHolder = "API Customer",
  last4Digits = "4242",
  amount = 10.0,
  barcodeValue = "8492049283",
  onDismiss,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fire festive celebration confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#5865f2", "#10b981", "#3b82f6", "#f59e0b"],
      });
    } catch (e) {
      console.log("Confetti burst trigger");
    }
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto transition-all duration-500 transform hover:scale-[1.02]">
      {/* TICKET CONTAINER WITH CUTOUT NOTCHES */}
      <div className="relative bg-white text-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200">
        
        {/* HEADER BRANDING */}
        <div className="bg-[#5865f2] text-white p-6 text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-xl mb-1 shadow-inner">
            MP
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">MeterPrompt Gateway</h2>
          <p className="text-[11px] font-medium text-white/80 uppercase tracking-widest">
            Payment & Activation Receipt
          </p>
        </div>

        {/* METRICS & STATUS BADGE */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-extrabold text-emerald-950 block">Payment Verified</span>
                <span className="text-[10px] text-emerald-700 font-medium">Processed via MeterPrompt Ledger</span>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>

          {/* AMOUNT DISPLAY */}
          <div className="text-center py-2 border-b border-dashed border-zinc-200">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Total Charged</span>
            <div className="text-4xl font-black text-zinc-900 font-mono mt-0.5">
              ${Number(amount).toFixed(2)}
            </div>
            <span className="text-[11px] text-zinc-500 font-semibold">USD ($) • Instant Settlement</span>
          </div>

          {/* RECEIPT METADATA GRID */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase block">Invoice Ref</span>
              <span className="font-mono font-bold text-zinc-900 truncate block mt-0.5">{ticketId}</span>
            </div>
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase block">Issue Date</span>
              <span className="font-sans font-bold text-zinc-900 truncate block mt-0.5">{date}</span>
            </div>
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase block">Customer</span>
              <span className="font-sans font-bold text-zinc-900 truncate block mt-0.5">{cardHolder}</span>
            </div>
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase block">Method</span>
              <span className="font-mono font-bold text-zinc-900 truncate block mt-0.5">Card •••• {last4Digits}</span>
            </div>
          </div>
        </div>

        {/* BARCODE STUB & FOOTER */}
        <div className="bg-zinc-50 px-6 py-4 border-t border-dashed border-zinc-200 flex flex-col items-center gap-2">
          {/* SIMULATED BARCODE */}
          <div className="flex items-center gap-1.5 h-8 opacity-80">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className={`bg-zinc-800 rounded-xs h-full ${
                  i % 3 === 0 ? "w-1" : i % 2 === 0 ? "w-0.5" : "w-1.5"
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] font-bold text-zinc-400 tracking-widest uppercase">
            {barcodeValue}
          </span>
        </div>
      </div>
    </div>
  );
}
