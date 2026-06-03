import type { Website, WebsiteTheme } from "@/lib/validations/website";

type FaqStaticProps = {
  faq: Website["faq"];
  theme: WebsiteTheme;
};

export function FaqStatic({ faq, theme }: FaqStaticProps) {
  return (
    <section className="mx-auto w-full max-w-2xl px-4">
      <h2
        className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: theme.textColor }}
      >
        Frequently asked questions
      </h2>
      <div className="flex w-full flex-col divide-y border-t">
        {faq.map((item) => (
          <details key={item.question} className="group py-4">
            <summary
              className="cursor-pointer list-none text-base font-medium [&::-webkit-details-marker]:hidden"
              style={{ color: theme.textColor }}
            >
              {item.question}
            </summary>
            <p className="pt-3 text-sm" style={{ color: theme.mutedTextColor }}>
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
