import Link from "next/link";

import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-slate-900"
        >
          Blinkfront
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Link href="/login?returnTo=%2Fbuilder">Login</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Link href="/builder">Get Started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
