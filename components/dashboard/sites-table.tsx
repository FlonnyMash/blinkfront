import Link from "next/link";
import { ExternalLink, RefreshCw } from "lucide-react";

import { syncVercelStatusAction } from "@/actions/sync-vercel-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildDeploymentUrl } from "@/lib/deploy/vercel";
import { isDatabaseConfigured } from "@/lib/db";
import { listSites, type SiteStatus } from "@/lib/sites";

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

export async function SitesTable() {
  const deploymentDomain = getDeploymentDomain();

  if (!isDatabaseConfigured()) {
    return (
      <Card className="w-full text-left">
        <CardHeader>
          <CardTitle>Sites Management</CardTitle>
          <CardDescription>
            Set DATABASE_URL (and DIRECT_URL for migrations) in your environment
            to track published deployments.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sites = await listSites();

  return (
    <Card className="w-full text-left">
      <CardHeader>
        <CardTitle>Sites Management</CardTitle>
        <CardDescription>
          Monitor your published sites and refresh deployment status from Vercel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sites.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sites yet. Publish a site from the builder to see it here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium">Site Name</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">View Live</th>
                  <th className="px-4 py-3 font-medium text-right">Sync</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => {
                  const liveUrl = buildDeploymentUrl(
                    site.subdomain,
                    deploymentDomain,
                  );

                  return (
                    <tr key={site.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium">
                        {site.subdomain}
                        <span className="block text-xs font-normal text-muted-foreground">
                          .{deploymentDomain}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANTS[site.status]}>
                          {STATUS_LABELS[site.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                        >
                          View Live
                          <ExternalLink className="size-3.5" aria-hidden />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={syncVercelStatusAction}>
                          <input type="hidden" name="siteId" value={site.id} />
                          <Button type="submit" variant="outline" size="sm">
                            <RefreshCw className="size-3.5" aria-hidden />
                            Sync
                          </Button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
