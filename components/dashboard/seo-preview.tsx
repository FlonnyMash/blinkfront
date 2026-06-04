"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

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
import type { SeoAuditCheck, SeoAuditResult } from "@/lib/validations/seo-audit-result";

type SeoPreviewProps = {
  seoData: SeoAuditResult | null;
  isAuditing?: boolean;
  isGenerating?: boolean;
};

const CATEGORY_LABELS: Record<keyof Pick<SeoAuditResult, "meta" | "structure" | "images" | "links">, string> = {
  meta: "Meta",
  structure: "Structure",
  images: "Images",
  links: "Links",
};

const CHECK_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  openGraph: "Open Graph",
  canonical: "Canonical",
  h1Count: "H1 count",
  headingOrderValid: "Heading order",
  semanticTagsUsed: "Semantic HTML",
  totalImages: "Total images",
  missingAltCount: "Missing alt",
  imagesWithAlt: "Images with alt",
  totalLinks: "Total links",
  descriptiveTextCount: "Descriptive links",
  brokenLinksCount: "Broken links",
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

function AuditCheckRow({ label, check }: { label: string; check: SeoAuditCheck }) {
  return (
    <li className="flex gap-3 rounded-lg border bg-card/50 px-3 py-2 text-sm">
      {check.passed ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{label}</span>
          <Badge variant={check.passed ? "secondary" : "rose"}>
            {check.score}/100
          </Badge>
          {check.value && (
            <span className="truncate text-xs text-muted-foreground" title={check.value}>
              {check.value}
            </span>
          )}
        </div>
        {!check.passed && (
          <p className="text-xs leading-relaxed text-muted-foreground">{check.remediation}</p>
        )}
      </div>
    </li>
  );
}

function CategorySection({
  title,
  checks,
}: {
  title: string;
  checks: { key: string; check: SeoAuditCheck }[];
}) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <ul className="space-y-2">
        {checks.map(({ key, check }) => (
          <AuditCheckRow key={key} label={CHECK_LABELS[key] ?? key} check={check} />
        ))}
      </ul>
    </section>
  );
}

export function SeoPreview({
  seoData,
  isAuditing = false,
  isGenerating = false,
}: SeoPreviewProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>SEO Audit Report</CardTitle>
            <CardDescription className="mt-1">
              {isAuditing
                ? "Running deterministic on-page checks from the page HTML..."
                : isGenerating
                  ? "Audit complete — generating an optimized layout from these results."
                  : "Deterministic meta, structure, image, and link analysis."}
            </CardDescription>
          </div>
          {seoData && <SeoScoreRing score={seoData.overallScore} />}
          {isAuditing && !seoData && (
            <Skeleton className="size-28 shrink-0 rounded-full" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {isAuditing && !seoData ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : seoData ? (
          <>
            {(Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]).map(
              (categoryKey) => {
                const category = seoData[categoryKey];
                const checks = Object.entries(category).map(([key, check]) => ({
                  key,
                  check: check as SeoAuditCheck,
                }));
                return (
                  <CategorySection
                    key={categoryKey}
                    title={CATEGORY_LABELS[categoryKey]}
                    checks={checks}
                  />
                );
              },
            )}

            <p className="text-xs text-muted-foreground">
              Score rating:{" "}
              <span className={cn("font-medium", scoreColor(seoData.overallScore))}>
                {scoreLabel(seoData.overallScore)}
              </span>
              {" · "}
              Audited {new Date(seoData.auditedAt).toLocaleString()}
            </p>
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
