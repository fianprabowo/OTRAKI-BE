import type { ReactNode } from "react";
import "./globals.css";
import Tagger from "./Tagger";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Tagger />
        <div className="min-h-screen">
          <header className="sticky top-0 z-10 border-b border-brand-200/60 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-extrabold tracking-tight text-brand-900">Hotel Booking Demo</div>
                <div className="text-xs font-medium text-slate-600">SRP → PDP → Payment (mock) + Sentry logs</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
                  FE
                </span>
                <span className="inline-flex items-center rounded-full border border-sun-200 bg-sun-50 px-2.5 py-1 text-xs font-semibold text-sun-900">
                  BE mock
                </span>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
