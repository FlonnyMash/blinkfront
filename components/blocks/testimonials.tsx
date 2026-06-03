import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { Website, WebsiteTheme } from "@/lib/validations/website";

type TestimonialsProps = {
  testimonials: Website["testimonials"];
  theme: WebsiteTheme;
};

export function Testimonials({ testimonials, theme }: TestimonialsProps) {
  return (
    <section
      className="w-full py-16"
      style={{ backgroundColor: `${theme.mutedTextColor}15` }}
    >
      <div className="mx-auto max-w-5xl px-4">
        <h2
          className="mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: theme.textColor }}
        >
          What our customers say
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.author}>
              <CardContent className="pt-6">
                <p className="italic" style={{ color: theme.mutedTextColor }}>
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-0.5">
                <p className="font-medium" style={{ color: theme.textColor }}>
                  {testimonial.author}
                </p>
                <p className="text-sm" style={{ color: theme.mutedTextColor }}>
                  {testimonial.role}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
