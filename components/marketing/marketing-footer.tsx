import Link from "next/link";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <p className="text-sm text-slate-500">
          &copy; {year} Blinkfront AI. All rights reserved.
        </p>
        <nav className="flex items-center gap-4 text-sm text-slate-500">
          <Link href="/builder" className="transition-colors hover:text-slate-900">
            Builder
          </Link>
          <Link
            href="/dashboard"
            className="transition-colors hover:text-slate-900"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
