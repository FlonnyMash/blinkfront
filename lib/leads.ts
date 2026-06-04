import { Prisma } from "@prisma/client";

import { isDatabaseConfigured, prisma } from "@/lib/db";
import { getSiteById } from "@/lib/sites";

export type CreateLeadResult =
  | { success: true; duplicate?: boolean }
  | { success: false; error: "database_not_configured" | "site_not_found" };

export async function createLead(input: {
  email: string;
  siteId: string;
}): Promise<CreateLeadResult> {
  if (!isDatabaseConfigured()) {
    return { success: false, error: "database_not_configured" };
  }

  const site = await getSiteById(input.siteId);
  if (!site) {
    return { success: false, error: "site_not_found" };
  }

  const email = input.email.trim().toLowerCase();

  try {
    await prisma.lead.create({
      data: {
        email,
        siteId: input.siteId,
      },
    });
    return { success: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: true, duplicate: true };
    }
    throw error;
  }
}
