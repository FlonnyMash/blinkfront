import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        blue: "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
        violet: "border-transparent bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
        emerald: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
        amber: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
        rose: "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
