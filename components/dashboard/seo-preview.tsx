"use client";

import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

type AuditCategoryKey = keyof Pick<
  SeoAuditResult,
  "meta" | "structure" | "images" | "links"
>;

const CATEGORY_KEYS: AuditCategoryKey[] = [
  "meta",
  "structure",
  "images",
  "links",
];

const CATEGORY_LABELS: Record<AuditCategoryKey, string> = {
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

type CategoryViewModel = {
  key: AuditCategoryKey;
  label: string;
  checks: { key: string; check: SeoAuditCheck }[];
  failureCount: number;
};

function scoreRingStroke(score: number): string {
  if (score >= 80) return "stroke-emerald-500/80";
  if (score >= 60) return "stroke-amber-500";
  return "stroke-amber-500/70";
}

function scoreTextColor(score: number): string {
  if (score >= 80) return "text-foreground";
  if (score >= 60) return "text-amber-600 dark:text-amber-500";
  return "text-amber-600 dark:text-amber-500";
}

function buildSummary(overallScore: number, issueCount: number): string {
  if (issueCount === 0) {
    return "All checks passed — on-page fundamentals look solid.";
  }
  if (overallScore >= 70) {
    return `${issueCount} optimization ${issueCount === 1 ? "opportunity" : "opportunities"} to polish before publish.`;
  }
  return `${issueCount} ${issueCount === 1 ? "opportunity" : "opportunities"} — expand sections below for AI suggestions.`;
}

function buildCategories(seoData: SeoAuditResult): CategoryViewModel[] {
  return CATEGORY_KEYS.map((key) => {
    const checks = Object.entries(seoData[key]).map(([checkKey, check]) => ({
      key: checkKey,
      check: check as SeoAuditCheck,
    }));
    const failureCount = checks.filter(({ check }) => !check.passed).length;
    return {
      key,
      label: CATEGORY_LABELS[key],
      checks,
      failureCount,
    };
  });
}

function SeoScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div
      className="relative flex size-20 shrink-0 items-center justify-center"
      aria-label={`SEO score ${score} out of 100`}
    >
      <svg className="-rotate-90 size-20" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className="stroke-muted/60"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className={cn(
            "transition-[stroke-dashoffset] duration-500 ease-out",
            scoreRingStroke(score),
          )}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "text-2xl font-semibold tracking-tight tabular-nums",
            scoreTextColor(score),
          )}
        >
          {score}
        </span>
      </div>
    </div>
  );
}

function StatusIcon({ passed }: { passed: boolean }) {
  if (passed) {
    return (
      <CheckCircle2
        className="size-4 shrink-0 text-emerald-500/80"
        aria-hidden
      />
    );
  }
  return (
    <AlertCircle
      className="size-4 shrink-0 text-amber-500"
      aria-hidden
    />
  );
}

/** Avoid duplicate rows when missing-alt already covers the same failure. */
function filterCategoryChecks(
  categoryKey: AuditCategoryKey,
  checks: { key: string; check: SeoAuditCheck }[],
): { key: string; check: SeoAuditCheck }[] {
  if (categoryKey !== "images") {
    return checks;
  }
  const missingFailed = checks.some(
    ({ key, check }) => key === "missingAltCount" && !check.passed,
  );
  if (!missingFailed) {
    return checks;
  }
  return checks.filter(({ key }) => key !== "imagesWithAlt");
}

function AuditCheckRow({ label, check }: { label: string; check: SeoAuditCheck }) {
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-2.5">
          <StatusIcon passed={check.passed} />
          <span className="text-sm font-medium leading-snug">{label}</span>
        </div>
        <span
          className="max-w-[50%] shrink-0 truncate text-right text-xs text-muted-foreground"
          title={check.value ?? undefined}
        >
          {check.value ?? (check.passed ? "OK" : "Not detected")}
        </span>
      </div>
      {!check.passed && (
        <div className="ml-[28px] mt-1 flex gap-2 border-l-2 border-amber-400/50 pl-3">
          <Sparkles
            className="mt-0.5 size-3.5 shrink-0 text-amber-500/70"
            aria-hidden
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {check.remediation}
          </p>
        </div>
      )}
    </li>
  );
}

export function SeoPreview({
  seoData,
  isAuditing = false,
  isGenerating = false,
}: SeoPreviewProps) {
  const categories = seoData ? buildCategories(seoData) : [];
  const totalIssues = categories.reduce((sum, cat) => {
    const checks = filterCategoryChecks(
      cat.key,
      cat.checks,
    );
    return sum + checks.filter(({ check }) => !check.passed).length;
  }, 0);
  const openCategories = categories
    .filter((cat) => {
      const checks = filterCategoryChecks(cat.key, cat.checks);
      return checks.some(({ check }) => !check.passed);
    })
    .map((cat) => cat.key);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-6 pb-2">
        <div className="min-w-0 space-y-1">
          <CardTitle>SEO audit</CardTitle>
          <CardDescription>
            {isAuditing
              ? "Analyzing page HTML for meta, structure, images, and links…"
              : isGenerating
                ? "Audit complete — applying fixes to your generated layout."
                : seoData
                  ? buildSummary(seoData.overallScore, totalIssues)
                  : "Deterministic on-page SEO analysis."}
          </CardDescription>
        </div>
        {seoData && <SeoScoreRing score={seoData.overallScore} />}
        {isAuditing && !seoData && (
          <Skeleton className="size-20 shrink-0 rounded-full" />
        )}
      </CardHeader>

      <CardContent className="pt-2">
        {isAuditing && !seoData ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : seoData ? (
          <Accordion
            type="multiple"
            defaultValue={openCategories}
            className="w-full"
          >
            {categories.map((category) => {
              const visibleChecks = filterCategoryChecks(
                category.key,
                category.checks,
              );
              const visibleFailures = visibleChecks.filter(
                ({ check }) => !check.passed,
              ).length;

              return (
              <AccordionItem
                key={category.key}
                value={category.key}
                className="border-border/60"
              >
                <AccordionTrigger className="py-3 hover:no-underline">
                  <span className="flex flex-1 items-center gap-2 pr-2">
                    <span>{category.label}</span>
                    {visibleFailures > 0 ? (
                      <Badge
                        variant="secondary"
                        className="border-0 bg-muted font-normal text-muted-foreground shadow-none"
                      >
                        {visibleFailures}{" "}
                        {visibleFailures === 1 ? "suggestion" : "suggestions"}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="border-0 bg-muted/60 font-normal text-muted-foreground shadow-none"
                      >
                        Passed
                      </Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <ul className="divide-y divide-border">
                    {visibleChecks.map(({ key, check }) => (
                      <AuditCheckRow
                        key={key}
                        label={CHECK_LABELS[key] ?? key}
                        check={check}
                      />
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
            })}
          </Accordion>
        ) : null}

        {seoData && (
          <p className="mt-4 text-xs text-muted-foreground">
            Audited {new Date(seoData.auditedAt).toLocaleString()}
          </p>
        )}
      </CardContent>

      {isGenerating && seoData && (
        <CardFooter className="gap-2 border-t border-border/60 bg-muted/30 py-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          <span>Generating layout from audit insights…</span>
        </CardFooter>
      )}
    </Card>
  );
}
