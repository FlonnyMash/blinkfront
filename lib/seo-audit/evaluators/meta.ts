import { metricCheck } from "@/lib/seo-audit/check";
import {
  fractionScore,
  lengthBandScore,
  passedAt,
  presenceScore,
} from "@/lib/seo-audit/scoring";
import type { DomSnapshot } from "@/lib/seo-audit/dom-snapshot";
import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";

const TITLE_MIN = 10;
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 160;
const PASS_THRESHOLD = 70;

export function evaluateMeta(snapshot: DomSnapshot): SeoAuditResult["meta"] {
  const { title, description, ogTitle, ogDescription, ogImage, canonical } =
    snapshot.meta;

  const titleLen = title?.length ?? 0;
  const titleScore = lengthBandScore(titleLen, TITLE_MIN, TITLE_MAX);

  const descLen = description?.length ?? 0;
  const descriptionScore = lengthBandScore(descLen, DESCRIPTION_MIN, DESCRIPTION_MAX);

  const ogFields = [
    Boolean(ogTitle || title),
    Boolean(ogDescription || description),
    Boolean(ogImage),
  ];
  const openGraphScore = fractionScore(
    ogFields.filter(Boolean).length,
    ogFields.length,
  );

  const canonicalScore = presenceScore(Boolean(canonical), 55);

  return {
    title: metricCheck(
      passedAt(titleScore, PASS_THRESHOLD),
      titleScore,
      title,
      titleScore >= PASS_THRESHOLD
        ? "Title length is within or near the recommended 10–60 character range."
        : `Tune the <title> toward ${TITLE_MIN}–${TITLE_MAX} characters (current: ${titleLen || "missing"}).`,
    ),
    description: metricCheck(
      passedAt(descriptionScore, PASS_THRESHOLD),
      descriptionScore,
      description,
      descriptionScore >= PASS_THRESHOLD
        ? "Meta description length is within or near the recommended 50–160 character range."
        : `Add or shorten the meta description toward ${DESCRIPTION_MIN}–${DESCRIPTION_MAX} characters.`,
    ),
    openGraph: metricCheck(
      passedAt(openGraphScore, PASS_THRESHOLD),
      openGraphScore,
      [ogTitle, ogDescription, ogImage].filter(Boolean).join(" | ") || null,
      openGraphScore >= PASS_THRESHOLD
        ? "Open Graph tags are sufficiently complete for social sharing."
        : "Add og:title, og:description, and og:image (or ensure fallbacks exist).",
    ),
    canonical: metricCheck(
      passedAt(canonicalScore, PASS_THRESHOLD),
      canonicalScore,
      canonical,
      canonical
        ? "Canonical URL is set."
        : 'Consider adding <link rel="canonical" href="..."> for clearer indexing.',
    ),
  };
}
