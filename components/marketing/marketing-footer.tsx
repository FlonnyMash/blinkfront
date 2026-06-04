import Link from "next/link";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
      <p className="text-sm text-slate-400">
        &copy; {year} Blinkfront AI. All rights reserved.
      </p>
      <nav
        className="flex items-center gap-6 text-sm text-slate-500"
        aria-label="Site"
      >
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
  );
}
