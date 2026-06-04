import { cn } from "@/lib/utils";
import type { FaqContent } from "@/types/layout";

type FaqBlockProps = {
  content: FaqContent;
};

export function FaqBlock({ content }: FaqBlockProps) {
  return (
    <section
      id="faq"
      className={cn(
        "bg-[var(--background)] text-[var(--text)]",
        content.sectionClassName ?? "mx-auto w-full max-w-2xl px-4 py-16",
      )}
    >
      <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
        {content.heading}
      </h2>
      <div className="flex w-full flex-col divide-y border-t border-[var(--text)]/10">
        {content.items.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="cursor-pointer list-none text-base font-medium text-[var(--text)] [&::-webkit-details-marker]:hidden">
              {item.question}
            </summary>
            <p className="pt-3 text-sm text-[var(--text)]/70">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
