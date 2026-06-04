import Link from "next/link";

import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          Blinkfront
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/builder">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/builder">Get Started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
