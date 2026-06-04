import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MarketingCtaButtonProps = {
  href?: string;
  children: ReactNode;
  className?: string;
};

export function MarketingCtaButton({
  href = "/builder",
  children,
  className,
}: MarketingCtaButtonProps) {
  return (
    <div
      className={cn(
        "group relative inline-flex rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 p-px shadow-sm shadow-indigo-500/20",
        className,
      )}
    >
      <Button
        size="lg"
        asChild
        className="relative h-11 rounded-[calc(var(--radius-xl)-1px)] border-0 bg-indigo-600 px-6 text-base font-medium text-white shadow-none transition-transform duration-150 hover:scale-[1.02] hover:bg-indigo-600 active:scale-[0.98] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
      >
        <Link href={href}>{children}</Link>
      </Button>
    </div>
  );
}
