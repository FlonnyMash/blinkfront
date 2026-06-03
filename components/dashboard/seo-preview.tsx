"use client";

import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SeoAuditInsights } from "@/lib/validations/seo-audit";

const KEYWORD_BADGE_VARIANTS = [
  "blue",
  "violet",
  "emerald",
  "amber",
  "rose",
  "secondary",
] as const;

type SeoPreviewProps = {
  seoData: SeoAuditInsights | null;
  isAuditing?: boolean;
  isGenerating?: boolean;
};

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Needs work";
  return "Critical";
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function scoreRingColor(score: number): string {
  if (score >= 80) return "stroke-emerald-500";
  if (score >= 60) return "stroke-amber-500";
  if (score >= 40) return "stroke-orange-500";
  return "stroke-red-500";
}

function parseAdviceItems(advice: string): string[] {
  return advice
    .split(/\n+|(?:^|\n)\s*[-•*]\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function SeoScoreRing({ score }: { score: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative flex size-28 shrink-0 items-center justify-center">
      <svg className="-rotate-90 size-28" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className={cn("transition-all duration-700", scoreRingColor(score))}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold tabular-nums", scoreColor(score))}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">SEO Score</span>
      </div>
    </div>
  );
}

export function SeoPreview({
  seoData,
  isAuditing = false,
  isGenerating = false,
}: SeoPreviewProps) {
  const adviceItems = seoData ? parseAdviceItems(seoData.seoAdvice) : [];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>SEO Audit Report</CardTitle>
            <CardDescription className="mt-1">
              {isAuditing
                ? "Analysing content for keyword opportunities and gaps..."
                : isGenerating
                  ? "Audit complete — generating an optimized layout from these insights."
                  : "Strategic recommendations extracted from your page content."}
            </CardDescription>
          </div>
          {seoData && <SeoScoreRing score={seoData.score} />}
          {isAuditing && !seoData && (
            <Skeleton className="size-28 shrink-0 rounded-full" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {isAuditing && !seoData ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-20 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : seoData ? (
          <>
            <section>
              <h3 className="mb-2 text-sm font-medium">Primary Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {seoData.primaryKeywords.map((keyword, index) => (
                  <Badge
                    key={keyword}
                    variant={KEYWORD_BADGE_VARIANTS[index % KEYWORD_BADGE_VARIANTS.length]}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-medium">Target Audience</h3>
              <p className="leading-relaxed text-muted-foreground">
                {seoData.targetAudience}
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-medium">Content Gap</h3>
              <p className="leading-relaxed text-muted-foreground">
                {seoData.contentGap}
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-medium">SEO Advice</h3>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                {adviceItems.map((item, index) => (
                  <li key={index} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {seoData && (
              <p className="text-xs text-muted-foreground">
                Score rating:{" "}
                <span className={cn("font-medium", scoreColor(seoData.score))}>
                  {scoreLabel(seoData.score)}
                </span>
              </p>
            )}
          </>
        ) : null}
      </CardContent>

      {isGenerating && seoData && (
        <CardFooter className="border-t bg-primary/5">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="size-4 animate-spin" />
            <span>
              Applying audit insights to generate your AI-optimized website layout...
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
