"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-lg space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary-light-teal border border-primary-teal/30 flex items-center justify-center">
          <span className="text-2xl font-black text-primary-teal">404</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Page not found</h1>
        <p className="text-sm text-slate-600">
          The page you are looking for does not exist or may have been moved. Use the button below to return to your workspace.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Go Back
          </button>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold hover:bg-primary-dark-teal transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}