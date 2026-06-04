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

export type SiteWithLeadCount = Site & {
  _count: {
    leads: number;
  };
};

export async function listSites(): Promise<SiteWithLeadCount[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  return prisma.site.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { leads: true },
      },
    },
  });
}

export async function getSiteById(id: string): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return prisma.site.findUnique({ where: { id } });
}

export async function createDraftSite(): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  return prisma.site.create({
    data: {
      subdomain: `draft-${token}`,
      vercelDeploymentId: `draft:${token}`,
      status: "pending",
    },
  });
}

export async function promoteDraftSite(
  siteId: string,
  subdomain: string,
): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return prisma.site.update({
    where: { id: siteId },
    data: {
      subdomain,
      vercelDeploymentId: pendingDeploymentId(subdomain),
      status: "pending",
    },
  });
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

export function pendingDeploymentId(subdomain: string): string {
  return `pending:${subdomain}`;
}

export async function updateSiteDeployment(
  id: string,
  vercelDeploymentId: string,
  status?: SiteStatus,
): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return prisma.site.update({
    where: { id },
    data: {
      vercelDeploymentId,
      ...(status ? { status } : {}),
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
