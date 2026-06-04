"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDeploymentStatus } from "@/lib/deploy/vercel";
import { isDatabaseConfigured } from "@/lib/db";
import {
  getSiteById,
  mapVercelStatusToSiteStatus,
  updateSiteStatus,
} from "@/lib/sites";

const SyncInputSchema = z.object({
  siteId: z.string().min(1),
});

export type SyncVercelStatusResult =
  | { success: true; status: "pending" | "deployed" | "failed" }
  | { success: false; error: string };

export async function syncVercelStatus(
  formData: FormData,
): Promise<SyncVercelStatusResult> {
  const parsed = SyncInputSchema.safeParse({
    siteId: formData.get("siteId"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid site id",
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      success: false,
      error: "DATABASE_URL is not configured",
    };
  }

  const site = await getSiteById(parsed.data.siteId);

  if (!site) {
    return { success: false, error: "Site not found" };
  }

  const deploymentStatus = await getDeploymentStatus(site.vercelDeploymentId);
  const nextStatus = mapVercelStatusToSiteStatus(deploymentStatus);

  await updateSiteStatus(site.id, nextStatus);
  revalidatePath("/dashboard");

  return { success: true, status: nextStatus };
}

export async function syncVercelStatusAction(formData: FormData): Promise<void> {
  await syncVercelStatus(formData);
}
