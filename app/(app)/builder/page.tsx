import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSession } from "@/lib/auth/session";

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string }>;
}) {
  const user = await getSession();
  const { siteId } = await searchParams;

  return <DashboardShell user={user} initialSiteId={siteId ?? null} />;
}
