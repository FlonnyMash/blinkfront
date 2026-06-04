import { binaryCheck, metricCheck, ratioScore } from "@/lib/seo-audit/check";
import { passedAt } from "@/lib/seo-audit/scoring";
import type { DomSnapshot } from "@/lib/seo-audit/dom-snapshot";
import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";

const PASS_THRESHOLD = 70;

export function evaluateImages(snapshot: DomSnapshot): SeoAuditResult["images"] {
  const { total, missingAlt, withAlt } = snapshot.images;
  const hasImages = total > 0;
  const altCoverageScore = hasImages ? ratioScore(withAlt, total) : 100;

  return {
    totalImages: binaryCheck(
      true,
      String(total),
      hasImages
        ? `${total} image(s) found on the page.`
        : "No images detected; add visuals only when they support content and include alt text.",
    ),
    missingAltCount: metricCheck(
      !hasImages || passedAt(altCoverageScore, PASS_THRESHOLD),
      altCoverageScore,
      String(missingAlt),
      !hasImages || missingAlt === 0
        ? "All images include alt text."
        : `Add descriptive alt text to ${missingAlt} image(s) missing alt attributes.`,
    ),
    imagesWithAlt: metricCheck(
      !hasImages || missingAlt === 0,
      altCoverageScore,
      String(withAlt),
      !hasImages
        ? "No images to evaluate."
        : missingAlt === 0
          ? "Every image has non-empty alt text."
          : `Ensure all ${total} image(s) have meaningful alt text (${withAlt}/${total} currently do).`,
    ),
  };
}
