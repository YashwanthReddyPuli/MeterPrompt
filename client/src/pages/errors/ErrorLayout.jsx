import React from 'react';

export default function ErrorLayout({ code, title, description, actionText = "Return to Dashboard", onAction, icon: Icon }) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 select-none">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-zinc-200/80 shadow-xs">
        {Icon && (
          <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center text-zinc-700">
            <Icon className="w-8 h-8"/>
          </div>
        )}
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5865f2] bg-indigo-50 px-2.5 py-1 rounded-md">
            Error {code}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 mt-2">{title}</h1>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">{description}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onAction ? onAction() : (window.location.href = '/console')}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {actionText}
          </button>
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
