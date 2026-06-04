import type { Prisma, Site, SiteStatus } from "@prisma/client";

import type { DeploymentStatusResult } from "@/lib/deploy/vercel";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import type { Website } from "@/types/layout";

export type { Site, SiteStatus };

export type SiteLayoutAccess = {
  userId?: string | null;
  guestId?: string | null;
};

export function resolveSiteLayoutAccess(input: {
  userId?: string | null;
  guestId?: string | null;
}): SiteLayoutAccess | null {
  if (input.userId) {
    return { userId: input.userId };
  }
  if (input.guestId) {
    return { guestId: input.guestId };
  }
  return null;
}

function siteLayoutWhere(
  siteId: string,
  access: SiteLayoutAccess,
): Prisma.SiteWhereInput | null {
  if (access.userId) {
    return { id: siteId, userId: access.userId };
  }

  if (access.guestId) {
    return { id: siteId, guestId: access.guestId, userId: null };
  }

  return null;
}

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

export async function listSites(userId?: string | null): Promise<SiteWithLeadCount[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  return prisma.site.findMany({
    where: userId ? { userId } : undefined,
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

export async function createDraftSite(input?: {
  userId?: string | null;
  guestId?: string | null;
}): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  return prisma.site.create({
    data: {
      subdomain: `draft-${token}`,
      vercelDeploymentId: `draft:${token}`,
      status: "pending",
      userId: input?.userId ?? null,
      guestId: input?.guestId ?? null,
    },
  });
}

export async function claimGuestSite(input: {
  siteId: string;
  guestId: string;
  userId: string;
}): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const site = await prisma.site.findFirst({
    where: {
      id: input.siteId,
      guestId: input.guestId,
      userId: null,
    },
  });

  if (!site) {
    return null;
  }

  return prisma.site.update({
    where: { id: site.id },
    data: {
      userId: input.userId,
      guestId: null,
    },
  });
}

export async function getSiteLayout(
  siteId: string,
  access: SiteLayoutAccess,
): Promise<Website | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const where = siteLayoutWhere(siteId, access);
  if (!where) {
    return null;
  }

  const site = await prisma.site.findFirst({
    where,
    select: { layoutData: true },
  });

  if (!site?.layoutData) {
    return null;
  }

  return site.layoutData as Website;
}

export async function updateSiteLayout(
  siteId: string,
  layoutData: Website,
  access: SiteLayoutAccess,
): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const where = siteLayoutWhere(siteId, access);
  if (!where) {
    return null;
  }

  const site = await prisma.site.findFirst({ where, select: { id: true } });
  if (!site) {
    return null;
  }

  return prisma.site.update({
    where: { id: site.id },
    data: { layoutData: layoutData as Prisma.InputJsonValue },
  });
}

export async function getGuestSite(input: {
  siteId: string;
  guestId: string;
}): Promise<Site | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return prisma.site.findFirst({
    where: {
      id: input.siteId,
      guestId: input.guestId,
      userId: null,
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
