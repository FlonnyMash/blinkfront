"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

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
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import type { SeoAuditCheck, SeoAuditResult } from "@/lib/validations/seo-audit-result";

type SeoPreviewProps = {
  seoData: SeoAuditResult | null;
  isAuditing?: boolean;
  isGenerating?: boolean;
  user?: SessionUser | null;
  onPrepareSignIn?: () => void;
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

function buildSummary(overallScore: number, issueCount: number): string {
  if (issueCount === 0) {
    return "All checks passed — on-page fundamentals look solid.";
  }
  if (overallScore >= 70) {
    return `${issueCount} optimization ${issueCount === 1 ? "opportunity" : "opportunities"} to polish before publish.`;
  }
  return `${issueCount} ${issueCount === 1 ? "opportunity" : "opportunities"} — expand rows below for AI suggestions.`;
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

function compactCheckValue(check: SeoAuditCheck): string {
  if (check.value?.trim()) {
    const value = check.value.trim();
    if (/^\d+$/.test(value)) {
      const count = Number(value);
      return count === 1 ? "1 found" : `${count} found`;
    }
    if (value.length > 28) {
      return `${value.slice(0, 25)}…`;
    }
    return value;
  }
  return check.passed ? "OK" : "Not detected";
}

function SeoScoreGauge({ score }: { score: number }) {
  const gradientId = useId();
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div
      className="relative flex size-28 shrink-0 items-center justify-center"
      aria-label={`SEO score ${score} out of 100`}
    >
      <svg className="-rotate-90 size-28" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className="stroke-muted/50"
          strokeWidth="7"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
          {score}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          / 100
        </span>
      </div>
    </div>
  );
}

function AiFixingBadge() {
  return (
    <Badge
      variant="outline"
      className="animate-pulse border-purple-200 bg-purple-50 px-1.5 py-0 text-[10px] font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
    >
      ✨ AI Fixing…
    </Badge>
  );
}

function StatusIcon({ passed }: { passed: boolean }) {
  if (passed) {
    return (
      <CheckCircle
        className="size-3.5 shrink-0 text-emerald-500/90"
        aria-hidden
      />
    );
  }
  return (
    <AlertCircle
      className="size-3.5 shrink-0 text-amber-500"
      aria-hidden
    />
  );
}

function PassedCheckRow({
  label,
  check,
}: {
  label: string;
  check: SeoAuditCheck;
}) {
  return (
    <div className="flex min-h-8 items-center gap-2 py-0.5">
      <StatusIcon passed />
      <span className="min-w-0 flex-1 truncate text-xs font-semibold">
        {label}
      </span>
      <Badge
        variant="outline"
        className="max-w-[45%] shrink-0 truncate px-1.5 py-0 text-[10px] font-normal"
        title={check.value ?? undefined}
      >
        {compactCheckValue(check)}
      </Badge>
    </div>
  );
}

function FailedCheckRow({
  rowId,
  label,
  check,
  showAiFixing,
}: {
  rowId: string;
  label: string;
  check: SeoAuditCheck;
  showAiFixing: boolean;
}) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={rowId} className="border-0">
        <AccordionTrigger className="flex min-h-8 items-center gap-2 py-0.5 hover:no-underline **:data-[slot=accordion-trigger-icon]:size-3 **:data-[slot=accordion-trigger-icon]:text-muted-foreground/60">
          <StatusIcon passed={false} />
          <span className="min-w-0 flex-1 truncate text-left text-xs font-semibold">
            {label}
          </span>
          <Badge
            variant="outline"
            className="max-w-[40%] shrink-0 truncate px-1.5 py-0 text-[10px] font-normal"
            title={check.value ?? undefined}
          >
            {compactCheckValue(check)}
          </Badge>
          {showAiFixing ? <AiFixingBadge /> : null}
        </AccordionTrigger>
        <AccordionContent className="pb-1 pl-5">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {check.remediation}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function CategoryBentoCard({
  category,
  showAiFixing,
}: {
  category: CategoryViewModel;
  showAiFixing: boolean;
}) {
  const visibleChecks = filterCategoryChecks(category.key, category.checks);
  const visibleFailures = visibleChecks.filter(
    ({ check }) => !check.passed,
  ).length;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">
          {category.label}
        </h3>
        {visibleFailures > 0 ? (
          <Badge
            variant="secondary"
            className="border-0 bg-muted px-1.5 py-0 text-[10px] font-normal text-muted-foreground shadow-none"
          >
            {visibleFailures}{" "}
            {visibleFailures === 1 ? "issue" : "issues"}
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="border-0 bg-emerald-500/10 px-1.5 py-0 text-[10px] font-normal text-emerald-700 shadow-none dark:text-emerald-400"
          >
            Passed
          </Badge>
        )}
      </div>
      <div className="divide-y divide-border/40">
        {visibleChecks.map(({ key, check }) =>
          check.passed ? (
            <PassedCheckRow
              key={key}
              label={CHECK_LABELS[key] ?? key}
              check={check}
            />
          ) : (
            <FailedCheckRow
              key={key}
              rowId={`${category.key}-${key}`}
              label={CHECK_LABELS[key] ?? key}
              check={check}
              showAiFixing={showAiFixing}
            />
          ),
        )}
      </div>
    </div>
  );
}

function BentoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {CATEGORY_KEYS.map((key) => (
        <Skeleton key={key} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}

export function SeoPreview({
  seoData,
  isAuditing = false,
  isGenerating = false,
  user = null,
  onPrepareSignIn,
}: SeoPreviewProps) {
  const router = useRouter();
  const isGuest = user === null;
  const categories = seoData ? buildCategories(seoData) : [];
  const totalIssues = categories.reduce((sum, cat) => {
    const checks = filterCategoryChecks(cat.key, cat.checks);
    return sum + checks.filter(({ check }) => !check.passed).length;
  }, 0);

  const showGuestPreviewBar =
    isGuest && seoData && !isGenerating && !isAuditing;
  const showAiFixing = isAuditing || isGenerating;

  return (
    <Card className="overflow-hidden shadow-sm">
      {showGuestPreviewBar ? (
        <div
          className="flex items-center gap-2 border-b border-border/50 bg-slate-50 px-4 py-2 text-xs text-muted-foreground dark:bg-slate-900/40"
          role="status"
        >
          <Sparkles className="size-3.5 shrink-0 opacity-60" aria-hidden />
          <span>
            Preview mode.{" "}
            <button
              type="button"
              onClick={() => {
                onPrepareSignIn?.();
                router.push("/login?returnTo=%2Fbuilder");
              }}
              className="text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
            >
              Sign in
            </button>{" "}
            to save your site.
          </span>
        </div>
      ) : null}

      <CardContent className="space-y-4 pt-4">
        <div className="flex items-start gap-5">
          {seoData ? (
            <SeoScoreGauge score={seoData.overallScore} />
          ) : isAuditing ? (
            <Skeleton className="size-28 shrink-0 rounded-full" />
          ) : null}

          <div className="min-w-0 flex-1 space-y-1 pt-1">
            <h2 className="text-lg font-semibold tracking-tight">
              SEO Core Vitals Audit
            </h2>
            {seoData ? (
              <p className="text-xs text-muted-foreground">
                Audited{" "}
                {new Date(seoData.auditedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground">
              {isAuditing
                ? "Analyzing page HTML for meta, structure, images, and links…"
                : isGenerating
                  ? "Audit complete — applying fixes to your generated layout."
                  : seoData
                    ? buildSummary(seoData.overallScore, totalIssues)
                    : "Deterministic on-page SEO analysis."}
            </p>
          </div>
        </div>

        {isAuditing && !seoData ? (
          <BentoGridSkeleton />
        ) : seoData ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <CategoryBentoCard
                key={category.key}
                category={category}
                showAiFixing={showAiFixing}
              />
            ))}
          </div>
        ) : null}
      </CardContent>

      {isGenerating && seoData ? (
        <CardFooter className="gap-2 border-t border-border/60 bg-muted/30 py-2.5 text-sm text-muted-foreground">
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          <span>Generating layout from audit insights…</span>
        </CardFooter>
      ) : null}
    </Card>
  );
}
