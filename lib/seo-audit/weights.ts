/** Leaf check paths and weights (must sum to 1). */
export const SEO_AUDIT_CHECK_WEIGHTS: Record<string, number> = {
  "meta.title": 0.1,
  "meta.description": 0.1,
  "meta.openGraph": 0.08,
  "meta.canonical": 0.07,
  "structure.h1Count": 0.1,
  "structure.headingOrderValid": 0.08,
  "structure.semanticTagsUsed": 0.07,
  "images.totalImages": 0.03,
  "images.missingAltCount": 0.1,
  "images.imagesWithAlt": 0.1,
  "links.totalLinks": 0.03,
  "links.descriptiveTextCount": 0.07,
  "links.brokenLinksCount": 0.07,
};

const WEIGHT_SUM = Object.values(SEO_AUDIT_CHECK_WEIGHTS).reduce((a, b) => a + b, 0);

if (Math.abs(WEIGHT_SUM - 1) > 0.001) {
  throw new Error(`SEO audit weights must sum to 1 (got ${WEIGHT_SUM})`);
}
