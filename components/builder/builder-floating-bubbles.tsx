"use client";

import { cn } from "@/lib/utils";

type BuilderFloatingBubblesProps = {
  className?: string;
};

export function BuilderFloatingBubbles({ className }: BuilderFloatingBubblesProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute top-[-5%] left-[-5%] -z-50 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[130px] will-change-transform animate-orb-one" />
      <div className="absolute right-[-5%] bottom-[5%] -z-50 h-[700px] w-[700px] rounded-full bg-purple-500/10 blur-[150px] will-change-transform animate-orb-two" />
    </div>
  );
}
