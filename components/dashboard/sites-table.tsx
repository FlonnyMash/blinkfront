import Link from "next/link";
import { ExternalLink, Inbox, RefreshCw } from "lucide-react";

import { syncVercelStatusAction } from "@/actions/sync-vercel-status";
import { LeadsDrawer } from "@/components/dashboard/leads-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildDeploymentUrl } from "@/lib/deploy/vercel";
import { getSession } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/db";
import { listSites, type SiteStatus } from "@/lib/sites";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<SiteStatus, string> = {
  pending: "Pending",
  deployed: "Deployed",
  failed: "Failed",
};

const STATUS_VARIANTS: Record<
  SiteStatus,
  "amber" | "emerald" | "rose"
> = {
  pending: "amber",
  deployed: "emerald",
  failed: "rose",
};

function getDeploymentDomain(): string {
  return (
    process.env.DEPLOYMENT_DOMAIN ??
    process.env.NEXT_PUBLIC_DEPLOYMENT_DOMAIN ??
    "yourdomain.com"
  );
}

function EmptyStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white/80 p-8 shadow-sm backdrop-blur-sm">
      <h2 className="text-base font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}

export async function SitesTable() {
  const deploymentDomain = getDeploymentDomain();
  const user = await getSession();

  if (!isDatabaseConfigured()) {
    return (
      <EmptyStateCard
        title="Database not configured"
        description="Set DATABASE_URL in `.env` (for Prisma) and your app env to track published deployments."
      />
    );
  }

  const sites = await listSites(user?.id);

  return (
    <div className="overflow-hidden rounded-2xl bg-white/80 shadow-sm backdrop-blur-sm">
      {sites.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">No sites yet</p>
          <p className="mt-1 text-sm text-slate-600">
            Publish a site from the builder to see it here.
          </p>
          <Button
            asChild
            size="sm"
            className="mt-6 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Link href="/builder">Go to builder</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-6 py-4 text-xs font-medium tracking-wider text-slate-500 uppercase">
                  Site Name
                </th>
                <th className="px-6 py-4 text-xs font-medium tracking-wider text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-medium tracking-wider text-slate-500 uppercase">
                  View Live
                </th>
                <th className="px-6 py-4 text-xs font-medium tracking-wider text-slate-500 uppercase">
                  Leads
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => {
                const liveUrl = buildDeploymentUrl(
                  site.subdomain,
                  deploymentDomain,
                );
                const leadCount = site._count.leads;
                const leadLabel =
                  leadCount === 1 ? "1 Lead" : `${leadCount} Leads`;

                return (
                  <tr
                    key={site.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">
                        {site.subdomain}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        .{deploymentDomain}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={STATUS_VARIANTS[site.status]}
                        className="font-normal"
                      >
                        {STATUS_LABELS[site.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 underline-offset-4 transition-colors hover:text-indigo-700 hover:underline"
                      >
                        View Live
                        <ExternalLink className="size-3.5" aria-hidden />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={leadCount > 0 ? "emerald" : "outline"}
                        className={cn(
                          leadCount === 0 &&
                            "border-slate-200 bg-transparent text-slate-600",
                        )}
                      >
                        {leadLabel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <LeadsDrawer
                          siteId={site.id}
                          siteLabel={site.subdomain}
                          user={user}
                          trigger={
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-label={`View leads for ${site.subdomain}`}
                              className="border-slate-200 text-slate-700 hover:bg-slate-50"
                            >
                              <Inbox className="size-3.5" aria-hidden />
                              Leads
                            </Button>
                          }
                        />
                        <form action={syncVercelStatusAction}>
                          <input
                            type="hidden"
                            name="siteId"
                            value={site.id}
                          />
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            <RefreshCw className="size-3.5" aria-hidden />
                            Sync
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
