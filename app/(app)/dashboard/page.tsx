import Link from "next/link";

import { SitesTable } from "@/components/dashboard/sites-table";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-8 px-4 py-10 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="inline-flex items-center rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-xs font-medium tracking-wide text-indigo-700">
            Your sites
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Sites Management
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
            Track deployment status and open live sites without leaving the app.
          </p>
        </div>
        <Button
          variant="outline"
          asChild
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <Link href="/builder">Back to builder</Link>
        </Button>
      </div>
      <SitesTable />
    </main>
  );
}
