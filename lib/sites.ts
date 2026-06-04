import type { Site, SiteStatus } from "@prisma/client";

import type { DeploymentStatusResult } from "@/lib/deploy/vercel";
import { isDatabaseConfigured, prisma } from "@/lib/db";

export type { Site, SiteStatus };

export function mapVercelStatusToSiteStatus(
  result: DeploymentStatusResult,
): SiteStatus {
  if (!result.success) {
    return "failed";
  }

  if (result.status === "READY") {
    return "deployed";
  }

  return "pending";
}

export async function listSites(): Promise<Site[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  return prisma.site.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getSiteById(id: string): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return prisma.site.findUnique({ where: { id } });
}

export async function upsertSiteRecord(input: {
  subdomain: string;
  vercelDeploymentId: string;
  status?: SiteStatus;
}): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return prisma.site.upsert({
    where: { subdomain: input.subdomain },
    create: {
      subdomain: input.subdomain,
      vercelDeploymentId: input.vercelDeploymentId,
      status: input.status ?? "pending",
    },
    update: {
      vercelDeploymentId: input.vercelDeploymentId,
      status: input.status ?? "pending",
    },
  });
}

export async function updateSiteStatus(
  id: string,
  status: SiteStatus,
): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return prisma.site.update({
    where: { id },
    data: { status },
  });
}

export async function updateSiteStatusByDeploymentId(
  vercelDeploymentId: string,
  status: SiteStatus,
): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const site = await prisma.site.findFirst({
    where: { vercelDeploymentId },
  });

  if (!site) {
    return null;
  }

  return prisma.site.update({
    where: { id: site.id },
    data: { status },
  });
}
