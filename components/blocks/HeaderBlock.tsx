import { cn } from "@/lib/utils";
import type { HeaderContent } from "@/types/layout";

type HeaderBlockProps = {
  content: HeaderContent;
};

export function HeaderBlock({ content }: HeaderBlockProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full shrink-0 border-b border-[var(--text)]/10 bg-[var(--background)] text-[var(--text)]",
        content.sectionClassName,
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-3 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-0">
        <span
          className="truncate text-base font-semibold tracking-tight sm:max-w-[45%]"
          title={content.logoText}
        >
          {content.logoText}
        </span>
        <nav
          aria-label="Primary"
          className="flex shrink-0 items-center gap-4 overflow-x-auto text-sm whitespace-nowrap sm:justify-end"
        >
          {content.links.map((link) => (
            <a
              key={`${link.label}-${link.href}`}
              href={link.href}
              className="font-medium text-[var(--text)]/70 transition-colors hover:text-[var(--text)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
