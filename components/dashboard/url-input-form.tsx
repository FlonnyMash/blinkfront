"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChatEditor } from "@/components/dashboard/chat-editor";
import { SeoPreview } from "@/components/dashboard/seo-preview";
import { LayoutRenderer } from "@/components/renderer/LayoutRenderer";
import type { SessionUser } from "@/lib/auth/session";
import { saveGuestDraft, updateGuestDraftWebsite } from "@/lib/guest-draft";
import type { ScrapeUrlResult } from "@/lib/scraper";
import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";
import { normalizeUrl } from "@/lib/utils";
import type { SeoAudit } from "@/lib/validations/seo";
import type { Website } from "@/types/layout";

type UrlInputFormProps = {
  websiteData: Website | null;
  onWebsiteDataChange: (data: Website | null) => void;
  siteId?: string | null;
  onSiteIdChange?: (siteId: string | null) => void;
  user?: SessionUser | null;
  onPrepareSignIn?: () => void;
};

type GenerateWebsiteApiResponse =
  | {
      success: true;
      data: Website;
      siteId?: string;
      guest?: boolean;
      guestId?: string;
    }
  | { success: false; error: string };

type SeoAuditApiResponse =
  | { success: true; data: SeoAuditResult }
  | { success: false; error: string };

const LAST_URL_STORAGE_KEY = "blinkfront:lastUrl";

const appCardClassName =
  "border-0 bg-white/90 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm";

function readStoredUrl(): string {
  try {
    return sessionStorage.getItem(LAST_URL_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function UrlInputForm({
  websiteData,
  onWebsiteDataChange,
  siteId,
  onSiteIdChange,
  user = null,
  onPrepareSignIn,
}: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = readStoredUrl();
    if (stored) {
      setUrl(stored);
    }
  }, []);

  useEffect(() => {
    try {
      if (url.trim()) {
        sessionStorage.setItem(LAST_URL_STORAGE_KEY, url);
      } else {
        sessionStorage.removeItem(LAST_URL_STORAGE_KEY);
      }
    } catch {
      // sessionStorage unavailable (private mode, quota, etc.)
    }
  }, [url]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SeoAudit | null>(null);
  const [seoData, setSeoData] = useState<SeoAuditResult | null>(null);

  function handleWebsiteUpdate(data: Website) {
    onWebsiteDataChange(data);
    if (!user) {
      updateGuestDraftWebsite(data);
    }
  }

  const isBusy = isLoading || isAuditing || isGenerating;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formUrl = e.currentTarget.elements.namedItem("url");
    const rawUrl =
      formUrl instanceof HTMLInputElement
        ? formUrl.value
        : String(new FormData(e.currentTarget).get("url") ?? url);
    const normalizedUrl = normalizeUrl(rawUrl);

    if (!normalizedUrl) {
      setError("Please enter a URL");
      return;
    }

    setUrl(normalizedUrl);
    setIsLoading(true);
    setIsAuditing(false);
    setIsGenerating(false);
    setError(null);
    setData(null);
    setSeoData(null);
    onWebsiteDataChange(null);
    onSiteIdChange?.(null);

    try {
      const scrapeResponse = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!scrapeResponse.ok) {
        setError(await readApiError(scrapeResponse, "Failed to scrape URL"));
        return;
      }

      const scrapedResult = (await scrapeResponse.json()) as ScrapeUrlResult;

      if (!scrapedResult.success) {
        setError(scrapedResult.error);
        return;
      }

      setData(scrapedResult.data);
      setIsLoading(false);
      setIsAuditing(true);

      const auditResponse = await fetch("/api/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapedResult.data.url }),
      });

      const auditResult = (await auditResponse.json()) as SeoAuditApiResponse;

      if (!auditResponse.ok || !auditResult.success) {
        setError(
          auditResult.success === false
            ? auditResult.error
            : await readApiError(auditResponse, "SEO audit failed"),
        );
        return;
      }

      setSeoData(auditResult.data);
      setIsAuditing(false);
      setIsGenerating(true);

      const generateResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scrapedContent: scrapedResult.data.rawContent,
          seoAudit: auditResult.data,
          siteTitle: scrapedResult.data.meta.title,
          sourceUrl: scrapedResult.data.url,
        }),
      });

      const aiResult = (await generateResponse.json()) as GenerateWebsiteApiResponse;

      if (!generateResponse.ok || !aiResult.success) {
        setError(
          aiResult.success === false
            ? aiResult.error
            : await readApiError(generateResponse, "Failed to generate website"),
        );
        return;
      }

      onWebsiteDataChange(aiResult.data);
      if (aiResult.siteId) {
        onSiteIdChange?.(aiResult.siteId);
      } else {
        onSiteIdChange?.(null);
      }

      if (aiResult.guest) {
        if (aiResult.siteId) {
          saveGuestDraft({
            siteId: aiResult.siteId,
            ...(aiResult.guestId ? { guestId: aiResult.guestId } : {}),
            website: aiResult.data,
            seoData: auditResult.data,
            sourceUrl: scrapedResult.data.url,
          });
        }
        toast.success(
          aiResult.siteId
            ? "Generated a preview! Sign up to save your progress."
            : "Generated a preview! Sign in to save your progress to the cloud.",
        );
      }
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Could not reach the server. Check that the app is running and try again."
          : requestError instanceof Error
            ? requestError.message
            : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
      setIsAuditing(false);
      setIsGenerating(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card className={appCardClassName}>
        <CardContent className="pt-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              name="url"
              inputMode="url"
              autoComplete="url"
              placeholder="example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              disabled={isBusy}
              required
              className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
            />
            <Button
              type="submit"
              disabled={isBusy}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isBusy ? (
                <>
                  <Loader2 className="animate-spin" />
                  {isGenerating
                    ? "Generating AI Layout..."
                    : isAuditing
                      ? "Analysing SEO..."
                      : "Scanning..."}
                </>
              ) : (
                "Scan URL"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      {data && (
        <div className="space-y-8">
          <SeoPreview
            seoData={seoData}
            isAuditing={isAuditing}
            isGenerating={isGenerating}
            user={user}
            onPrepareSignIn={onPrepareSignIn}
          />

          {websiteData ? (
            <div className="space-y-6">
              <ChatEditor
                currentWebsite={websiteData}
                siteId={siteId ?? undefined}
                seoInsights={seoData ? JSON.stringify(seoData) : undefined}
                onUpdate={handleWebsiteUpdate}
              />

              <Card className={appCardClassName}>
                <CardHeader>
                  <CardTitle className="font-semibold tracking-tight text-slate-900">
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-hidden p-0 pt-0">
                  <div className="max-h-[min(70vh,720px)] overflow-y-auto">
                    <LayoutRenderer
                      key={JSON.stringify(websiteData)}
                      data={websiteData}
                      siteId={siteId ?? undefined}
                    />
                  </div>
                </CardContent>
              </Card>

              <details className="group rounded-2xl bg-white/80 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900">
                  Debug: View JSON
                </summary>
                {seoData && (
                  <details className="border-t">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900">
                      Debug: SEO Audit
                    </summary>
                    <pre className="overflow-x-auto bg-slate-950 p-4 text-sm text-green-400">
                      {JSON.stringify(seoData, null, 2)}
                    </pre>
                  </details>
                )}
                <pre className="overflow-x-auto border-t bg-slate-950 p-4 text-sm text-green-400">
                  {JSON.stringify(websiteData, null, 2)}
                </pre>
              </details>
            </div>
          ) : null}

          <details className="group rounded-2xl bg-white/80 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900">
              Raw SEO audit data
            </summary>
            <pre className="overflow-x-auto border-t bg-muted p-4 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
