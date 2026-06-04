import Link from "next/link";

import { SitesTable } from "@/components/dashboard/sites-table";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-8 px-4 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Sites Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Track deployment status and open live sites without leaving the app.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">Back to builder</Link>
        </Button>
      </div>
      <SitesTable />
    </main>
  );
}
