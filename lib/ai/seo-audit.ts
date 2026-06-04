import { runDeterministicSeoAudit } from "@/lib/seo-audit";
import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";

export async function performSeoAudit(url: string): Promise<SeoAuditResult> {
  const result = await runDeterministicSeoAudit(url);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}
