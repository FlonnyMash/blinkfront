import Link from "next/link";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {year} Blinkfront. All rights reserved.
        </p>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/builder" className="hover:text-foreground">
            Builder
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
