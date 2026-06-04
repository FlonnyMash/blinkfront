"use server";

import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { getSiteById } from "@/lib/sites";

const GetLeadsInputSchema = z.object({
  siteId: z.string().min(1),
});

export type LeadRecord = {
  id: string;
  email: string;
  createdAt: string;
};

export type GetLeadsResult =
  | { success: true; leads: LeadRecord[] }
  | { success: false; error: string };

export async function getLeads(siteId: string): Promise<GetLeadsResult> {
  const parsed = GetLeadsInputSchema.safeParse({ siteId });

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

  const session = await getSession();

  if (!session) {
    return { success: false, error: "Sign in to view leads" };
  }

  const site = await getSiteById(parsed.data.siteId);

  if (!site) {
    return { success: false, error: "Site not found" };
  }

  if (site.userId !== session.id) {
    return { success: false, error: "You do not have access to this site" };
  }

  const leads = await prisma.lead.findMany({
    where: { siteId: parsed.data.siteId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    leads: leads.map((lead) => ({
      id: lead.id,
      email: lead.email,
      createdAt: lead.createdAt.toISOString(),
    })),
  };
}
