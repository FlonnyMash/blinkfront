"use client";

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
import { SeoOptimizeCta } from "@/components/dashboard/seo-optimize-cta";
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

type SeoPreviewVariant = "default" | "compact";

type SeoPreviewProps = {
  seoData: SeoAuditResult | null;
  isAuditing?: boolean;
  isScraping?: boolean;
  isGenerating?: boolean;
  pulseGrid?: boolean;
  variant?: SeoPreviewVariant;
  user?: SessionUser | null;
  onPrepareSignIn?: () => void;
  showOptimizeCta?: boolean;
  onOptimizeWithAI?: () => void;
  className?: string;
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

type StatusTone = "success" | "warning" | "error" | "neutral";

type StatusDisplay = {
  label: string;
  tone: StatusTone;
};

const STATUS_TONE_CLASSES: Record<StatusTone, string> = {
  success:
    "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-500",
  warning:
    "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-500",
  error:
    "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-500",
  neutral:
    "border-slate-200/80 bg-slate-100/50 text-slate-500 dark:border-slate-800/50 dark:bg-slate-800/50 dark:text-slate-400",
};

const CATEGORY_CARD_SURFACE_CLASS =
  "rounded-2xl border border-slate-200/50 bg-white/60 shadow-sm backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-950/60";

const AI_FIX_EXPLANATIONS: Record<string, string> = {
  title:
    "We generate a clear, keyword-aware page title from your main headline so search results show a compelling link.",
  description:
    "We write a concise meta description tailored to your page so search snippets accurately preview your offer.",
  openGraph:
    "We add Open Graph tags (title, description, image) so shared links render rich previews on social platforms.",
  canonical:
    "We set a canonical URL in the generated layout to help search engines index the preferred page version.",
  h1Count:
    "We structure the layout with one primary headline so visitors and search engines know what the page is about.",
  headingOrderValid:
    "We organize headings in a logical hierarchy (H1 → H2 → H3) for readability and assistive technology.",
  semanticTagsUsed:
    "We use semantic landmarks like header, main, and footer so the page structure is clear to browsers and crawlers.",
  missingAltCount:
    "We add descriptive alt text to every image in the generated layout for accessibility and image search.",
  imagesWithAlt:
    "We ensure all images in the generated layout include meaningful alt text.",
  totalImages: "Images are included with proper alt attributes where visuals support your message.",
  totalLinks: "Links are wired with descriptive anchor text in the generated layout.",
  descriptiveTextCount:
    "We replace generic anchors like \"click here\" with link text that describes the destination.",
  brokenLinksCount:
    "We validate internal links in the generated site and route users to working destinations.",
};

function getScoreGaugeColor(score: number): string {
  if (score >= 90) {
    return "#22c55e";
  }
  if (score >= 50) {
    return "#f97316";
  }
  return "#ef4444";
}

function parseNumericValue(value: string | null | undefined): number | null {
  if (!value?.trim()) {
    return null;
  }
  const match = value.trim().match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

function isMissingMetaValue(value: string | null | undefined): boolean {
  if (!value?.trim()) {
    return true;
  }
  const normalized = value.toLowerCase();
  return (
    normalized.includes("empty") ||
    normalized.includes("not set") ||
    normalized.includes("missing")
  );
}

function getStatusDisplay(checkKey: string, check: SeoAuditCheck): StatusDisplay {
  const value = check.value?.trim() ?? "";
  const numeric = parseNumericValue(value);

  if (check.passed) {
    switch (checkKey) {
      case "title":
      case "description":
      case "canonical":
        return { label: "Configured", tone: "success" };
      case "openGraph":
        return { label: "Complete", tone: "success" };
      case "h1Count":
        return { label: numeric === 1 ? "1 found" : "OK", tone: "success" };
      case "headingOrderValid":
        return { label: "Valid", tone: "success" };
      case "semanticTagsUsed":
        return { label: "In use", tone: "success" };
      case "missingAltCount":
        return { label: numeric === 0 ? "None missing" : "OK", tone: "success" };
      case "imagesWithAlt":
        return { label: "All covered", tone: "success" };
      case "totalImages":
      case "totalLinks":
      case "descriptiveTextCount":
        return {
          label: numeric === 1 ? "1 found" : numeric !== null ? `${numeric} found` : "OK",
          tone: "success",
        };
      case "brokenLinksCount":
        return { label: "None found", tone: "success" };
      default:
        return { label: "OK", tone: "success" };
    }
  }

  switch (checkKey) {
    case "title":
      return isMissingMetaValue(value)
        ? { label: "Missing", tone: "error" }
        : { label: "Needs work", tone: "warning" };
    case "description":
      return isMissingMetaValue(value)
        ? { label: "Not configured", tone: "warning" }
        : { label: "Needs work", tone: "warning" };
    case "openGraph":
      return { label: "Missing tags", tone: "error" };
    case "canonical":
      return { label: "Missing", tone: "warning" };
    case "h1Count":
      if (numeric === 0) {
        return { label: "Missing", tone: "error" };
      }
      if (numeric !== null && numeric > 1) {
        return { label: `${numeric} found`, tone: "warning" };
      }
      return { label: "Needs work", tone: "warning" };
    case "headingOrderValid":
      return { label: "Out of order", tone: "warning" };
    case "semanticTagsUsed":
      return { label: "Incomplete", tone: "warning" };
    case "missingAltCount":
      return {
        label: numeric === 1 ? "1 missing" : `${numeric ?? 0} missing`,
        tone: "error",
      };
    case "imagesWithAlt":
      return { label: "Incomplete", tone: "warning" };
    case "descriptiveTextCount":
      return { label: "Needs improvement", tone: "warning" };
    case "brokenLinksCount": {
      const broken = parseNumericValue(value.split(" ")[0] ?? value);
      return {
        label: broken === 1 ? "1 broken" : `${broken ?? 0} broken`,
        tone: "error",
      };
    }
    default:
      return { label: "Needs attention", tone: "warning" };
  }
}

function getFoundDescription(checkKey: string, check: SeoAuditCheck): string {
  const value = check.value?.trim() ?? "";

  switch (checkKey) {
    case "title":
      if (value.includes("Empty")) {
        return value.includes("H1:")
          ? "No page title was set, but we detected a main heading on the scraped page."
          : "No page title was found — search engines rely on this for result headlines.";
      }
      return "The page title is outside the recommended length for search results.";
    case "description":
      return isMissingMetaValue(value)
        ? "No meta description was found — search snippets may pull random page text instead."
        : "The meta description is too short or too long for optimal search snippets.";
    case "openGraph":
      return "Social sharing tags are incomplete, so link previews may look broken or generic.";
    case "canonical":
      return "No canonical URL was set, which can confuse search engines when duplicate URLs exist.";
    case "h1Count": {
      const count = parseNumericValue(value) ?? 0;
      if (count === 0) {
        return "No primary headline (H1) was found on the page.";
      }
      return `Multiple primary headlines (${count}) were found — one clear H1 works best.`;
    }
    case "headingOrderValid":
      return "Heading levels skip steps (for example, jumping from H2 to H4), which hurts readability.";
    case "semanticTagsUsed":
      return "The page is missing semantic HTML landmarks that help structure content for crawlers.";
    case "missingAltCount": {
      const missing = parseNumericValue(value) ?? 0;
      return `${missing} image${missing === 1 ? "" : "s"} on the scraped page lack descriptive alt text.`;
    }
    case "imagesWithAlt":
      return "Some images on the scraped page are missing alt text.";
    case "descriptiveTextCount":
      return "Several links use generic anchor text instead of describing where they lead.";
    case "brokenLinksCount":
      return value.includes("broken")
        ? "Some same-origin links on the scraped page return errors."
        : "Link health could not be fully verified on the scraped page.";
    default:
      return check.remediation;
  }
}

function getAiAutoFixExplanation(checkKey: string): string {
  return (
    AI_FIX_EXPLANATIONS[checkKey] ??
    "We apply SEO best practices automatically while generating your new layout."
  );
}

function formatTechnicalDetails(check: SeoAuditCheck): string | null {
  const value = check.value?.trim();
  if (!value) {
    return null;
  }
  return value;
}

function StatusBadge({ label, tone }: StatusDisplay) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 whitespace-nowrap px-1.5 py-0 text-[10px] font-medium shadow-none",
        STATUS_TONE_CLASSES[tone],
      )}
    >
      {label}
    </Badge>
  );
}

function AuditRowLabel({
  passed,
  label,
}: {
  passed: boolean;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <StatusIcon passed={passed} />
      <span className="min-w-0 break-words text-xs font-semibold sm:truncate">
        {label}
      </span>
    </div>
  );
}

function AuditRowStatusCluster({
  status,
  showAiFixing = false,
  alignEnd = true,
}: {
  status: StatusDisplay;
  showAiFixing?: boolean;
  /** When false, status sits beside the trailing chevron (accordion rows). */
  alignEnd?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-3",
        alignEnd && "ml-auto",
      )}
    >
      {showAiFixing ? <AiFixingBadge /> : null}
      <StatusBadge {...status} />
    </div>
  );
}

/** Matches accordion chevron width so passed rows align with failed rows. */
const CHEVRON_SLOT_CLASS = "size-3 shrink-0";

function SeoScoreGauge({
  score,
  size = "default",
}: {
  score: number;
  size?: SeoPreviewVariant;
}) {
  const isCompact = size === "compact";
  const strokeColor = getScoreGaugeColor(score);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const gaugeSize = isCompact ? "size-20" : "size-28";
  const scoreText = isCompact ? "text-2xl" : "text-3xl";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        gaugeSize,
      )}
      aria-label={`SEO score ${score} out of 100`}
    >
      <svg className={cn("-rotate-90", gaugeSize)} viewBox="0 0 100 100" aria-hidden>
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
          stroke={strokeColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-[stroke-dashoffset,stroke] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-semibold tracking-tight tabular-nums",
            scoreText,
          )}
          style={{ color: strokeColor }}
        >
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
      className="shrink-0 animate-pulse whitespace-nowrap border-purple-200 bg-purple-50 px-1.5 py-0 text-[10px] font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
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
  checkKey,
  check,
}: {
  label: string;
  checkKey: string;
  check: SeoAuditCheck;
}) {
  const status = getStatusDisplay(checkKey, check);

  return (
    <div className="flex w-full min-w-0 min-h-8 flex-col gap-2 py-0.5 sm:flex-row sm:items-center sm:gap-3">
      <AuditRowLabel passed label={label} />
      <div className="flex shrink-0 items-center gap-3 sm:ml-auto">
        <AuditRowStatusCluster status={status} alignEnd={false} />
        <span className={CHEVRON_SLOT_CLASS} aria-hidden="true" />
      </div>
    </div>
  );
}

function FailedCheckRow({
  rowId,
  label,
  checkKey,
  check,
  showAiFixing,
}: {
  rowId: string;
  label: string;
  checkKey: string;
  check: SeoAuditCheck;
  showAiFixing: boolean;
}) {
  const status = getStatusDisplay(checkKey, check);
  const technicalDetails = formatTechnicalDetails(check);

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={rowId} className="border-0">
        <AccordionTrigger className="flex w-full min-w-0 min-h-8 flex-col items-stretch justify-start gap-2 py-0.5 hover:no-underline sm:flex-row sm:items-center sm:gap-3 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-3 **:data-[slot=accordion-trigger-icon]:shrink-0 **:data-[slot=accordion-trigger-icon]:text-muted-foreground/60">
          <AuditRowLabel passed={false} label={label} />
          <AuditRowStatusCluster
            status={status}
            showAiFixing={showAiFixing}
            alignEnd={false}
          />
        </AccordionTrigger>
        <AccordionContent className="space-y-2 pb-1 pl-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">What we found:</p>
            <p className="break-words text-xs leading-relaxed text-muted-foreground">
              {getFoundDescription(checkKey, check)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">
              ✨ AI Auto-Fix applied:
            </p>
            <p className="break-words text-xs leading-relaxed text-muted-foreground">
              {getAiAutoFixExplanation(checkKey)}
            </p>
          </div>
          {technicalDetails ? (
            <div className="space-y-1 border-t border-border/40 pt-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
                Technical details
              </p>
              <p className="break-words text-[11px] leading-relaxed text-muted-foreground/90">
                {technicalDetails}
              </p>
            </div>
          ) : null}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function CategoryBentoCard({
  category,
  showAiFixing,
  pulseGrid = false,
  compact = false,
}: {
  category: CategoryViewModel;
  showAiFixing: boolean;
  pulseGrid?: boolean;
  compact?: boolean;
}) {
  const visibleChecks = filterCategoryChecks(category.key, category.checks);
  const visibleFailures = visibleChecks.filter(
    ({ check }) => !check.passed,
  ).length;

  return (
    <div
      className={cn(
        CATEGORY_CARD_SURFACE_CLASS,
        "min-w-0 overflow-hidden",
        compact ? "p-3.5" : "p-4 md:p-5",
        pulseGrid && "animate-pulse",
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/50">
        <h3
          className={cn(
            "min-w-0 shrink font-semibold tracking-tight",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {category.label}
        </h3>
        {visibleFailures > 0 ? (
          <span className="shrink-0 rounded-full bg-slate-100/50 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            {visibleFailures}{" "}
            {visibleFailures === 1 ? "issue" : "issues"}
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-500">
            Passed
          </span>
        )}
      </div>
      <div className="divide-y divide-slate-100/80 pt-3 dark:divide-slate-800/50">
        {visibleChecks.map(({ key, check }) =>
          check.passed ? (
            <PassedCheckRow
              key={key}
              label={CHECK_LABELS[key] ?? key}
              checkKey={key}
              check={check}
            />
          ) : (
            <FailedCheckRow
              key={key}
              rowId={`${category.key}-${key}`}
              label={CHECK_LABELS[key] ?? key}
              checkKey={key}
              check={check}
              showAiFixing={showAiFixing}
            />
          ),
        )}
      </div>
    </div>
  );
}

function BentoGridSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1",
        compact ? "gap-2" : "gap-3 md:grid-cols-2",
      )}
    >
      {CATEGORY_KEYS.map((key) => (
        <Skeleton
          key={key}
          className={cn("rounded-2xl", compact ? "h-28" : "h-36")}
        />
      ))}
    </div>
  );
}

export function SeoPreview({
  seoData,
  isAuditing = false,
  isScraping = false,
  isGenerating = false,
  pulseGrid = false,
  variant = "default",
  user = null,
  onPrepareSignIn,
  showOptimizeCta = false,
  onOptimizeWithAI,
  className,
}: SeoPreviewProps) {
  const router = useRouter();
  const isCompact = variant === "compact";
  const isGuest = user === null;
  const categories = seoData ? buildCategories(seoData) : [];
  const totalIssues = categories.reduce((sum, cat) => {
    const checks = filterCategoryChecks(cat.key, cat.checks);
    return sum + checks.filter(({ check }) => !check.passed).length;
  }, 0);

  const showGuestPreviewBar =
    !isCompact && isGuest && seoData && !isGenerating && !isAuditing;
  const showAiFixing = isAuditing || isGenerating;
  const showGeneratingFooter = !isCompact && isGenerating && seoData;
  const showOptimizeButton =
    !isCompact &&
    Boolean(onOptimizeWithAI) &&
    seoData !== null &&
    !isAuditing;

  return (
    <Card
      className={cn(
        "relative w-full max-w-full gap-0 overflow-hidden rounded-2xl border border-slate-200/50 bg-white/80 py-0 shadow-sm ring-0 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/80",
        className,
      )}
    >
      {showGuestPreviewBar ? (
        <div
          className="relative z-10 flex items-center gap-2 border-b border-slate-200/50 bg-white/50 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm md:px-5 dark:border-slate-800/50 dark:bg-slate-900/40"
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

      <CardContent
        className={cn(
          "relative z-10 w-full max-w-full space-y-4 overflow-hidden",
          isCompact ? "px-3.5 pt-3.5 pb-3.5" : "p-4 md:p-5",
        )}
      >
        <div
          className={cn(
            "flex w-full min-w-0 flex-col items-center overflow-hidden",
            isCompact ? "gap-3 sm:flex-row sm:items-center" : "gap-4 sm:flex-row sm:items-start",
          )}
        >
          <div
            className={cn(
              "flex w-fit max-w-full shrink-0 flex-col items-center gap-3",
              isCompact ? "min-w-20" : "min-w-28",
            )}
          >
            {seoData ? (
              <SeoScoreGauge score={seoData.overallScore} size={variant} />
            ) : isAuditing ? (
              <Skeleton
                className={cn(
                  "rounded-full",
                  isCompact ? "size-20" : "size-28",
                )}
              />
            ) : null}

            {showOptimizeButton ? (
              <SeoOptimizeCta
                showAuditCta={showOptimizeCta}
                onOptimizeWithAI={onOptimizeWithAI!}
                className="w-auto self-center"
              />
            ) : null}
          </div>

          <div className="min-w-0 w-full flex-1 space-y-1 text-center sm:text-left">
            <h2
              className={cn(
                "font-semibold tracking-tight",
                isCompact ? "text-base" : "text-lg",
              )}
            >
              SEO Core Vitals Audit
            </h2>
            {seoData ? (
              <p
                className="text-xs text-muted-foreground"
                suppressHydrationWarning
              >
                Audited{" "}
                {new Date(seoData.auditedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            ) : null}
            <p className="break-words text-sm text-muted-foreground">
              {isScraping && !isAuditing
                ? "Fetching page content and preparing your SEO audit…"
                : isAuditing
                  ? "Analyzing page HTML for meta, structure, images, and links…"
                  : isGenerating
                    ? "Audit complete — applying fixes to your generated layout."
                    : seoData
                      ? buildSummary(seoData.overallScore, totalIssues)
                      : "Deterministic on-page SEO analysis."}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "grid w-full max-w-full grid-cols-1 overflow-hidden",
            isCompact ? "gap-2" : "gap-3 md:grid-cols-2",
            !seoData && isAuditing && "animate-pulse",
          )}
          aria-busy={isAuditing && !seoData}
        >
          {seoData ? (
            categories.map((category) => (
              <CategoryBentoCard
                key={category.key}
                category={category}
                showAiFixing={showAiFixing}
                pulseGrid={pulseGrid}
                compact={isCompact}
              />
            ))
          ) : (
            <BentoGridSkeleton compact={isCompact} />
          )}
        </div>
      </CardContent>

      {showGeneratingFooter ? (
        <CardFooter className="relative z-10 gap-2 border-t border-slate-100 bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground md:px-5 dark:border-slate-800/50">
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          <span className="break-words">Generating layout from audit insights…</span>
        </CardFooter>
      ) : null}
    </Card>
  );
}
