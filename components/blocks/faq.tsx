import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Website, WebsiteTheme } from "@/lib/validations/website";

type FaqProps = {
  faq: Website["faq"];
  theme: WebsiteTheme;
};

export function Faq({ faq, theme }: FaqProps) {
  return (
    <section className="mx-auto w-full max-w-2xl px-4">
      <h2
        className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: theme.textColor }}
      >
        Frequently asked questions
      </h2>
      <Accordion type="single" collapsible>
        {faq.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`}>
            <AccordionTrigger style={{ color: theme.textColor }}>
              {item.question}
            </AccordionTrigger>
            <AccordionContent style={{ color: theme.mutedTextColor }}>
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
