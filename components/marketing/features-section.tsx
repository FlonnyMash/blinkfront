import { Link2, Rocket, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Link2,
    title: "Enter URL",
    description:
      "Drop in your existing site or a competitor link. We scrape the essentials and understand your brand context.",
  },
  {
    icon: Sparkles,
    title: "AI Generates",
    description:
      "Our engine produces a conversion-focused layout with tailored copy, theme, and sections ready to edit.",
  },
  {
    icon: Rocket,
    title: "Deploy instantly",
    description:
      "Publish to a live URL in one click. Track deployments and manage all your sites from the dashboard.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section className="border-t border-border bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Three steps to a live site
          </h2>
          <p className="mt-4 text-muted-foreground">
            The core loop is simple: input, generate, ship.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={feature.title} className="bg-card">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" aria-hidden />
                </div>
                <CardTitle>
                  <span className="mr-2 text-muted-foreground">
                    {index + 1}.
                  </span>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
