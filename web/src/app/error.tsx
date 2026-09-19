"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LogIn } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure in the console so the demo can be debugged quickly.
    console.error("[HMS] Unhandled application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-lg space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-crimson-light border border-crimson/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-crimson" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
        <p className="text-sm text-slate-600">
          An unexpected error occurred while rendering this screen. You can retry the request or return to the sign-in page.
        </p>
        {error?.message && (
          <p className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 break-words">
            {error.message}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold hover:bg-primary-dark-teal transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            <LogIn className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}