"use client";

import { StartNewScanDialog } from "@/components/dashboard/start-new-scan-dialog";
import { Input } from "@/components/ui/input";
import { LayoutRenderer } from "@/components/renderer/LayoutRenderer";
import { cn } from "@/lib/utils";
import type { Website } from "@/types/layout";

const DEFAULT_PREVIEW_URL = "https://mashedgames.dev";

type LivePreviewFrameProps = {
  websiteData: Website;
  siteId?: string;
  sourceUrl?: string;
  className?: string;
  onConfirmReset: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
};

export function formatPreviewUrl(sourceUrl?: string): string {
  const trimmed = sourceUrl?.trim();
  if (!trimmed) {
    return DEFAULT_PREVIEW_URL;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const trafficLightBaseClass =
  "size-3 shrink-0 cursor-pointer rounded-full border-0 p-0 opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1";

export function LivePreviewFrame({
  websiteData,
  siteId,
  sourceUrl,
  className,
  onConfirmReset,
  onToggleSidebar,
  isSidebarCollapsed,
}: LivePreviewFrameProps) {
  const currentPreviewUrl = formatPreviewUrl(sourceUrl);

  function handleOpenPreviewInNewTab() {
    window.open(currentPreviewUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border shadow-sm",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-4 rounded-t-xl border-b border-border bg-slate-100 p-3 dark:bg-slate-900">
        <div className="flex shrink-0 items-center gap-1.5">
          <StartNewScanDialog
            onConfirm={onConfirmReset}
            trigger={
              <button
                type="button"
                className={cn(trafficLightBaseClass, "bg-red-500")}
                aria-label="Reset project and return to URL scan"
                title="Reset and scan another URL"
              />
            }
          />

          <button
            type="button"
            onClick={onToggleSidebar}
            className={cn(
              trafficLightBaseClass,
              "bg-amber-500",
              isSidebarCollapsed &&
                "ring-2 ring-amber-400/60 ring-offset-1 ring-offset-slate-100 dark:ring-offset-slate-900",
            )}
            aria-label={
              isSidebarCollapsed
                ? "Show editor sidebar"
                : "Expand preview to full workspace width"
            }
            aria-pressed={isSidebarCollapsed}
            title={
              isSidebarCollapsed
                ? "Show editor sidebar"
                : "Expand preview workspace"
            }
          />

          <button
            type="button"
            onClick={handleOpenPreviewInNewTab}
            className={cn(trafficLightBaseClass, "bg-emerald-500")}
            aria-label="Open site in a new browser tab"
            title="Open site in new tab"
          />
        </div>
        <Input
          readOnly
          disabled
          value={currentPreviewUrl}
          className="h-8 flex-1 border-slate-200/80 bg-white text-center text-xs text-slate-600 shadow-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          aria-label="Preview URL"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-b-xl border-x border-b border-border bg-white">
        <LayoutRenderer
          data={websiteData}
          siteId={siteId}
          className="min-h-0"
        />
      </div>
    </div>
  );
}
