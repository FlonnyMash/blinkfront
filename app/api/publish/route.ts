import { z } from "zod";

import {
  deployWebsite,
  getDeploymentStatus,
  normalizeSubdomain,
} from "@/lib/deploy/vercel";
import {
  mapVercelStatusToSiteStatus,
  updateSiteStatusByDeploymentId,
  upsertSiteRecord,
} from "@/lib/sites";
import { WebsiteSchema } from "@/lib/validations/website";

export const maxDuration = 60;

const PublishRequestSchema = z
  .object({
    website: WebsiteSchema,
    subdomain: z.string().min(1),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PublishRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 },
      );
    }

    const deploymentDomain = process.env.DEPLOYMENT_DOMAIN;
    if (!deploymentDomain) {
      return Response.json(
        { success: false, error: "DEPLOYMENT_DOMAIN is not configured" },
        { status: 500 },
      );
    }

    const slug = normalizeSubdomain(parsed.data.subdomain, deploymentDomain);
    if (!slug) {
      return Response.json(
        {
          success: false,
          error:
            "Invalid subdomain. Use lowercase letters, numbers, and hyphens (2–63 characters).",
        },
        { status: 400 },
      );
    }

    const result = await deployWebsite(parsed.data.website, slug);

    if (result.success) {
      await upsertSiteRecord({
        subdomain: slug,
        vercelDeploymentId: result.deploymentId,
        status: "pending",
      });
    }

    return Response.json(result, { status: 200 });
  } catch {
    return Response.json(
      { success: false, error: "Failed to process publish request" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const deploymentId = new URL(request.url).searchParams.get("deploymentId");

  if (!deploymentId) {
    return Response.json(
      { success: false, error: "deploymentId query parameter is required" },
      { status: 400 },
    );
  }

  const result = await getDeploymentStatus(deploymentId);

  await updateSiteStatusByDeploymentId(
    deploymentId,
    mapVercelStatusToSiteStatus(result),
  );

  return Response.json(result, { status: 200 });
}
