"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
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

type DeploymentStatusCardProps = {
  status: DeploymentUiStatus;
  liveUrl: string | null;
  error: string | null;
  onDismiss: () => void;
};

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
      <Card className="border-primary/20 bg-linear-to-br from-background to-muted/30 shadow-sm">
        <CardHeader className="gap-3 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
                <CardTitle className="text-base">Publishing your site</CardTitle>
              </div>
              <CardDescription>
                Building static assets and pushing to the global CDN. This usually
                takes under a minute.
              </CardDescription>
            </div>
            <Badge variant="blue">Deploying</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={progressValue} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            Checking deployment status every few seconds…
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "ERROR") {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="gap-2 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
              <div className="space-y-1">
                <CardTitle className="text-base text-destructive">
                  Publish failed
                </CardTitle>
                <CardDescription className="text-destructive/90">
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
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardFooter className="border-t border-destructive/15">
          <Button type="button" variant="outline" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const href = liveUrl?.startsWith("http") ? liveUrl : liveUrl ? `https://${liveUrl}` : null;

  return (
    <Card className="border-emerald-500/25 bg-linear-to-br from-emerald-500/5 via-background to-background shadow-sm">
      <CardHeader className="gap-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              <CardTitle className="text-base">Your site is live</CardTitle>
            </div>
            <CardDescription>
              Deployment finished. Share your link or open it in a new tab.
            </CardDescription>
          </div>
          <Badge variant="emerald">Live</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-3 rounded-lg border bg-background/80 px-3 py-2.5 text-sm transition-colors hover:border-emerald-500/40 hover:bg-muted/50"
          >
            <span className="truncate font-medium text-foreground">{liveUrl}</span>
            <ExternalLink
              className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
              aria-hidden
            />
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">Deployment URL unavailable.</p>
        )}
      </CardContent>
      <CardFooter className="gap-2 border-t border-emerald-500/15">
        {href ? (
          <Button type="button" size="sm" asChild>
            <a href={href} target="_blank" rel="noopener noreferrer">
              Open site
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        ) : null}
        <Button type="button" variant="outline" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  );
}
