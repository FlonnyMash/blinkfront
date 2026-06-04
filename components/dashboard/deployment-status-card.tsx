"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DeploymentUiStatus } from "@/hooks/useDeploymentPolling";
import { cn } from "@/lib/utils";

type DeploymentStatusCardProps = {
  status: DeploymentUiStatus;
  liveUrl: string | null;
  error: string | null;
  onDismiss: () => void;
};

function PulsingIndicator({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-2.5 shrink-0", className)}>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-indigo-400 opacity-60" />
      <span className="relative inline-flex size-2.5 rounded-full bg-indigo-500" />
    </span>
  );
}

const cardSurface =
  "border-0 bg-white/90 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm";

export function DeploymentStatusCard({
  status,
  liveUrl,
  error,
  onDismiss,
}: DeploymentStatusCardProps) {
  const [progressValue, setProgressValue] = useState(12);

  useEffect(() => {
    if (status !== "BUILDING") {
      if (status === "SUCCESS") {
        setProgressValue(100);
      }
      return;
    }

    setProgressValue(18);
    const id = setInterval(() => {
      setProgressValue((current) => {
        if (current >= 88) {
          return 24;
        }
        return current + 6 + Math.random() * 10;
      });
    }, 700);

    return () => clearInterval(id);
  }, [status]);

  if (status === "IDLE") {
    return null;
  }

  if (status === "BUILDING") {
    return (
      <Card className={cn(cardSurface, "overflow-hidden")}>
        <CardHeader className="gap-3 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <PulsingIndicator />
                <CardTitle className="text-base font-semibold tracking-tight text-slate-900">
                  Publishing your site
                </CardTitle>
              </div>
              <CardDescription className="text-slate-600">
                Building static assets and pushing to the global CDN. This
                usually takes under a minute.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 border-indigo-200 bg-indigo-50 font-normal text-indigo-700"
            >
              Deploying
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressValue} className="h-1 bg-slate-100" />
          <p className="text-xs text-slate-500">
            Checking deployment status every few seconds…
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "ERROR") {
    return (
      <Card
        className={cn(
          cardSurface,
          "ring-rose-200/60 bg-rose-50/50",
        )}
      >
        <CardHeader className="gap-2 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle
                className="mt-0.5 size-4 shrink-0 text-rose-600"
                aria-hidden
              />
              <div className="space-y-1.5">
                <CardTitle className="text-base font-semibold tracking-tight text-rose-900">
                  Publish failed
                </CardTitle>
                <CardDescription className="text-rose-700/90">
                  {error ?? "Something went wrong while deploying your site."}
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onDismiss}
              aria-label="Dismiss error"
              className="text-rose-600 hover:bg-rose-100 hover:text-rose-700"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardFooter className="border-t border-rose-200/50 bg-transparent">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDismiss}
            className="border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            Dismiss
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const href = liveUrl?.startsWith("http")
    ? liveUrl
    : liveUrl
      ? `https://${liveUrl}`
      : null;

  return (
    <Card className={cn(cardSurface, "ring-emerald-200/60")}>
      <CardHeader className="gap-3 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <CheckCircle2
                className="size-5 text-emerald-600"
                aria-hidden
              />
              <CardTitle className="text-base font-semibold tracking-tight text-slate-900">
                Your site is live
              </CardTitle>
            </div>
            <CardDescription className="text-slate-600">
              Deployment finished. Share your link or open it in a new tab.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 border-emerald-200 bg-emerald-50 font-normal text-emerald-700"
          >
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 px-4 py-3 text-sm transition-colors hover:bg-slate-100/80"
          >
            <span className="truncate font-medium text-slate-900">
              {liveUrl}
            </span>
            <ExternalLink
              className="size-4 shrink-0 text-slate-400 transition-colors group-hover:text-emerald-600"
              aria-hidden
            />
          </a>
        ) : (
          <p className="text-sm text-slate-600">Deployment URL unavailable.</p>
        )}
      </CardContent>
      <CardFooter className="gap-2 border-t border-slate-200/60 bg-transparent">
        {href ? (
          <Button
            type="button"
            size="sm"
            asChild
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <a href={href} target="_blank" rel="noopener noreferrer">
              Open site
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDismiss}
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  );
}
