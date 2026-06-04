import { binaryCheck, metricCheck, ratioScore } from "@/lib/seo-audit/check";
import { isDescriptiveLinkText, type DomSnapshot } from "@/lib/seo-audit/dom-snapshot";
import { passedAt } from "@/lib/seo-audit/scoring";
import type { LinkVerificationSummary } from "@/lib/seo-audit/verify-links";
import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";

const DESCRIPTIVE_PASS_THRESHOLD = 65;
const BROKEN_PASS_THRESHOLD = 70;

export function evaluateLinks(
  snapshot: DomSnapshot,
  verification: LinkVerificationSummary,
): SeoAuditResult["links"] {
  const { total, entries } = snapshot.links;
  const { brokenCount, verifiedCount, skippedExternalCount } = verification;

  const descriptiveCount = entries.filter((entry) =>
    isDescriptiveLinkText(entry.text),
  ).length;
  const descriptiveScore = ratioScore(descriptiveCount, total);

  const brokenScore =
    verifiedCount > 0
      ? ratioScore(verifiedCount - brokenCount, verifiedCount)
      : 100;

  const brokenValue =
    verifiedCount > 0
      ? `${brokenCount} broken of ${verifiedCount} same-origin checked`
      : skippedExternalCount > 0
        ? `0 checked (${skippedExternalCount} external skipped)`
        : "0";

  return {
    totalLinks: binaryCheck(
      true,
      String(total),
      total > 0
        ? `${total} link(s) found.`
        : "No outbound or internal links detected.",
    ),
    descriptiveTextCount: metricCheck(
      passedAt(descriptiveScore, DESCRIPTIVE_PASS_THRESHOLD),
      descriptiveScore,
      String(descriptiveCount),
      descriptiveScore >= DESCRIPTIVE_PASS_THRESHOLD
        ? "Most links use descriptive anchor text."
        : "Replace generic anchors (e.g. “click here”) with text that describes the destination.",
    ),
    brokenLinksCount: metricCheck(
      passedAt(brokenScore, BROKEN_PASS_THRESHOLD),
      brokenScore,
      brokenValue,
      brokenCount === 0
        ? verifiedCount > 0
          ? "No broken same-origin links in the checked set."
          : "Broken-link check skipped for external URLs (avoids false positives)."
        : `Fix ${brokenCount} broken same-origin link(s) returning 404/410.`,
    ),
  };
}
