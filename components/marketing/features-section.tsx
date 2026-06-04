import { Link2, Rocket, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const features = [
  {
    icon: Link2,
    title: "Enter URL",
    description:
      "Drop in your existing site or a competitor link. We scrape the essentials and understand your brand context.",
    iconClassName: "bg-indigo-100 text-indigo-600",
    className: "md:row-span-2 lg:col-span-1 lg:row-span-1",
  },
  {
    icon: Sparkles,
    title: "AI Generates",
    description:
      "Our engine produces a conversion-focused layout with tailored copy, theme, and sections ready to edit.",
    iconClassName: "bg-purple-100 text-purple-600",
    className: "md:col-span-1",
  },
  {
    icon: Rocket,
    title: "Deploy instantly",
    description:
      "Publish to a live URL in one click. Track deployments and manage all your sites from the dashboard.",
    iconClassName: "bg-blue-100 text-blue-600",
    className: "md:col-span-1",
  },
] as const;

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Three steps to a live site
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            The core loop is simple: input, generate, ship.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3 lg:grid-rows-1">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={cn(
                "group flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50 p-6 shadow-sm shadow-slate-200/50",
                "transition-[border-color,box-shadow] duration-150 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5",
                feature.className,
              )}
            >
              <div
                className={cn(
                  "mb-5 flex size-12 items-center justify-center rounded-xl",
                  feature.iconClassName,
                )}
              >
                <feature.icon className="size-6" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                <span className="mr-2 text-slate-400">{index + 1}.</span>
                {feature.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
