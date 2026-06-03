import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Website, WebsiteTheme } from "@/lib/validations/website";

type FeaturesProps = {
  features: Website["features"];
  theme: WebsiteTheme;
};

export function Features({ features, theme }: FeaturesProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle style={{ color: theme.textColor }}>
                {feature.title}
              </CardTitle>
              <CardDescription style={{ color: theme.mutedTextColor }}>
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
