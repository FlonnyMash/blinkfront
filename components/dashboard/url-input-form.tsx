"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
import { WebsiteRenderer } from "@/components/render-engine/website-renderer";
import type { ScrapeUrlResult } from "@/lib/scraper";
import type { SeoAuditInsights } from "@/lib/validations/seo-audit";
import { normalizeUrl } from "@/lib/utils";
import type { SeoAudit } from "@/lib/validations/seo";
import type { Website } from "@/lib/validations/website";
import type { GenerateWebsiteResult } from "@/lib/ai/generate-site";

type UrlInputFormProps = {
  websiteData: Website | null;
  onWebsiteDataChange: (data: Website | null) => void;
};

type SeoAuditApiResponse =
  | { success: true; data: SeoAuditInsights }
  | { success: false; error: string };

const LAST_URL_STORAGE_KEY = "blinkfront:lastUrl";

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
  const [seoData, setSeoData] = useState<SeoAuditInsights | null>(null);

  function handleWebsiteUpdate(data: Website) {
    onWebsiteDataChange(data);
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
        body: JSON.stringify({ rawContent: scrapedResult.data.rawContent }),
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
        }),
      });

      const aiResult = (await generateResponse.json()) as GenerateWebsiteResult;

      if (!generateResponse.ok || !aiResult.success) {
        setError(
          aiResult.success === false
            ? aiResult.error
            : await readApiError(generateResponse, "Failed to generate website"),
        );
        return;
      }

      onWebsiteDataChange(aiResult.data);
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
    <div className="w-full space-y-4">
      <Card>
        <CardContent>
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
            />
            <Button type="submit" disabled={isBusy}>
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
        <SeoPreview
          seoData={seoData}
          isAuditing={isAuditing}
          isGenerating={isGenerating}
        />
      )}

      {websiteData && seoData && (
        <ChatEditor
          currentData={websiteData}
          seoInsights={seoData}
          onUpdate={handleWebsiteUpdate}
        />
      )}

      {websiteData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <WebsiteRenderer
                key={JSON.stringify(websiteData)}
                data={websiteData}
              />
            </CardContent>
          </Card>

          <details className="group rounded-xl ring-1 ring-foreground/10">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
              Debug: View JSON
            </summary>
            {seoData && (
              <details className="border-t">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
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
        </>
      )}

      {data && (
        <details className="group rounded-xl ring-1 ring-foreground/10">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
            Raw SEO audit data
          </summary>
          <pre className="overflow-x-auto border-t bg-muted p-4 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
