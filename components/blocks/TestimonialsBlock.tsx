import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { stripWrappingQuotes, type TestimonialsContent } from "@/types/layout";

type TestimonialsBlockProps = {
  content: TestimonialsContent;
};

export function TestimonialsBlock({ content }: TestimonialsBlockProps) {
  return (
    <section
      id="testimonials"
      className={cn(
        "bg-[var(--secondary)]/10 text-[var(--text)]",
        content.sectionClassName ?? "w-full py-16",
      )}
    >
      <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
        {content.heading}
      </h2>
      <div
        className={cn(
          "mx-auto grid max-w-5xl gap-6 px-4 lg:grid-cols-3",
          content.gridClassName,
        )}
      >
        {content.items.map((testimonial) => (
          <Card
            key={testimonial.author}
            className="border-[var(--text)]/10 bg-[var(--background)]"
          >
            <CardContent className="pt-6">
              <p className="italic text-[var(--text)]/70">
                &ldquo;{stripWrappingQuotes(testimonial.quote)}&rdquo;
              </p>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-0.5">
              <p className="font-medium text-[var(--text)]">
                {testimonial.author}
              </p>
              <p className="text-sm text-[var(--text)]/60">{testimonial.role}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
