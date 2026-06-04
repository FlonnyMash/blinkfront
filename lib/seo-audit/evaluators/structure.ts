import { metricCheck } from "@/lib/seo-audit/check";
import type { DomSnapshot } from "@/lib/seo-audit/dom-snapshot";
import {
  h1CountScore,
  headingOrderScore,
  passedAt,
  semanticTagsScore,
} from "@/lib/seo-audit/scoring";
import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";

const PASS_THRESHOLD = 70;
const SEMANTIC_TARGET = 3;

export function evaluateStructure(
  snapshot: DomSnapshot,
): SeoAuditResult["structure"] {
  const { h1Count, headingLevels, semanticTagsPresent } = snapshot.structure;
  const h1Score = h1CountScore(h1Count);
  const orderScore = headingOrderScore(headingLevels);
  const semanticScore = semanticTagsScore(semanticTagsPresent.length, SEMANTIC_TARGET);

  return {
    h1Count: metricCheck(
      passedAt(h1Score, PASS_THRESHOLD),
      h1Score,
      String(h1Count),
      h1Count === 1
        ? "Exactly one H1 is present."
        : h1Count === 0
          ? "Add a single H1 that states the page's primary topic."
          : `Prefer one primary H1; found ${h1Count}.`,
    ),
    headingOrderValid: metricCheck(
      passedAt(orderScore, PASS_THRESHOLD),
      orderScore,
      headingLevels.length ? headingLevels.map((l) => `h${l}`).join(" → ") : null,
      orderScore >= PASS_THRESHOLD
        ? "Heading levels are mostly logical."
        : "Reduce skipped heading levels (e.g. avoid jumping from H2 to H4).",
    ),
    semanticTagsUsed: metricCheck(
      passedAt(semanticScore, PASS_THRESHOLD),
      semanticScore,
      semanticTagsPresent.join(", ") || null,
      semanticScore >= PASS_THRESHOLD
        ? `Semantic HTML landmarks in use (${semanticTagsPresent.join(", ")}).`
        : `Add semantic elements (main, header, nav, article, section, footer) — ${semanticTagsPresent.length}/${SEMANTIC_TARGET} found.`,
    ),
  };
}
