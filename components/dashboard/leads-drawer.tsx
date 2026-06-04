"use client";

import * as React from "react";
import { Download, Inbox, Mail } from "lucide-react";

import { getLeads, type LeadRecord } from "@/actions/get-leads";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/lib/auth/session";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type LeadsDrawerProps = {
  siteId: string;
  siteLabel: string;
  trigger: React.ReactElement;
  user?: SessionUser | null;
};

function formatCollectedAt(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportLeadsToCsv(leads: LeadRecord[], filename: string): void {
  const header = "Email,Collected At";
  const rows = leads.map(
    (lead) =>
      `${escapeCsvField(lead.email)},${escapeCsvField(lead.createdAt)}`,
  );
  const csv = [header, ...rows].join("\n");
  const encoded = encodeURIComponent(csv);
  const link = document.createElement("a");
  link.href = `data:text/csv;charset=utf-8,${encoded}`;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function LeadsDrawer({
  siteId,
  siteLabel,
  trigger,
  user,
}: LeadsDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [leads, setLeads] = React.useState<LeadRecord[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const requiresAuth = user === null;

  const loadLeads = React.useCallback(async () => {
    if (requiresAuth) {
      setLeads([]);
      setError("Sign in to view captured leads for your sites.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await getLeads(siteId);

    setIsLoading(false);

    if (!result.success) {
      setLeads([]);
      setError(result.error);
      return;
    }

    setLeads(result.leads);
  }, [requiresAuth, siteId]);

  React.useEffect(() => {
    if (open) {
      void loadLeads();
    }
  }, [open, loadLeads]);

  const csvFilename = `${siteLabel.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "site"}-leads.csv`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Inbox className="size-4 text-primary" aria-hidden />
            Leads
          </SheetTitle>
          <SheetDescription>
            Captured emails for{" "}
            <span className="font-medium text-foreground">{siteLabel}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-4 pb-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading leads…"
                : `${leads.length} ${leads.length === 1 ? "lead" : "leads"}`}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || leads.length === 0}
              onClick={() => exportLeadsToCsv(leads, csvFilename)}
            >
              <Download className="size-3.5" aria-hidden />
              Export CSV
            </Button>
          </div>

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-10 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : leads.length === 0 && !error ? (
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center",
                )}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="size-5" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {requiresAuth ? "Sign in required" : "No leads yet"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {requiresAuth
                      ? "Leads are available after you publish and sign in."
                      : "Share your site to start collecting!"}
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="max-w-[12rem] truncate font-medium">
                        {lead.email}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCollectedAt(lead.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
