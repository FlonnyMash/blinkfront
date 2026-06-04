import { metricCheck } from "@/lib/seo-audit/check";
import { truncateText } from "@/lib/seo-audit/format";
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
  const {
    titleTag,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    canonical,
    primaryHeading,
  } = snapshot.meta;

  const titleLen = titleTag?.length ?? 0;
  const titleScore = lengthBandScore(titleLen, TITLE_MIN, TITLE_MAX);

  const descLen = description?.length ?? 0;
  const descriptionScore = lengthBandScore(descLen, DESCRIPTION_MIN, DESCRIPTION_MAX);

  const ogFields = [
    Boolean(ogTitle),
    Boolean(ogDescription),
    Boolean(ogImage),
  ];
  const openGraphScore = fractionScore(
    ogFields.filter(Boolean).length,
    ogFields.length,
  );

  const canonicalScore = presenceScore(Boolean(canonical), 55);

  const titleValue = titleTag
    ? truncateText(titleTag, 80)
    : primaryHeading
      ? `Empty <title> · H1: ${truncateText(primaryHeading, 56)}`
      : "Empty <title> tag in HTML";

  const titleRemediation =
    titleScore >= PASS_THRESHOLD
      ? "Title length is within or near the recommended 10–60 character range."
      : primaryHeading
        ? `Set a <title> of ${TITLE_MIN}–${TITLE_MAX} characters in your CMS/SEO settings. Suggested from your main H1: "${truncateText(primaryHeading, 55)}".`
        : `Add a <title> between ${TITLE_MIN} and ${TITLE_MAX} characters (currently missing in the page HTML).`;

  const descriptionValue =
    description?.trim() ||
    (primaryHeading
      ? "Not set · add meta description in CMS"
      : "Not set in HTML");

  return {
    title: metricCheck(
      passedAt(titleScore, PASS_THRESHOLD),
      titleScore,
      titleValue,
      titleRemediation,
    ),
    description: metricCheck(
      passedAt(descriptionScore, PASS_THRESHOLD),
      descriptionScore,
      descriptionValue,
      descriptionScore >= PASS_THRESHOLD
        ? "Meta description length is within or near the recommended 50–160 character range."
        : `Add a meta description (${DESCRIPTION_MIN}–${DESCRIPTION_MAX} chars) in WordPress SEO or theme settings.`,
    ),
    openGraph: metricCheck(
      passedAt(openGraphScore, PASS_THRESHOLD),
      openGraphScore,
      ogFields.every(Boolean)
        ? [ogTitle, ogDescription, ogImage].filter(Boolean).join(" | ")
        : `Missing ${3 - ogFields.filter(Boolean).length} of 3 tags`,
      openGraphScore >= PASS_THRESHOLD
        ? "Open Graph tags are sufficiently complete for social sharing."
        : "Add og:title, og:description, and og:image in your SEO plugin or theme.",
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
