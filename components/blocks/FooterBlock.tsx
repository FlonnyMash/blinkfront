import { cn } from "@/lib/utils";
import type { FooterContent } from "@/types/layout";

type FooterBlockProps = {
  content: FooterContent;
};

export function FooterBlock({ content }: FooterBlockProps) {
  return (
    <footer className="mt-auto w-full bg-[var(--text)] text-[var(--background)]">
      <div
        className={cn(
          "mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row",
          content.sectionClassName,
        )}
      >
        <p className="text-sm opacity-80">{content.copyrightText}</p>
        <nav className="flex flex-wrap items-center justify-center gap-6">
          {content.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm opacity-80 transition-opacity hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
