"use client";

import { useState } from "react";
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
import { generateWebsiteData } from "@/lib/ai/generate-site";
import { performSeoAudit } from "@/lib/ai/seo-audit";
import type { SeoAuditInsights } from "@/lib/validations/seo-audit";
import { scrapeUrl } from "@/lib/scraper";
import { normalizeUrl } from "@/lib/utils";
import type { SeoAudit } from "@/lib/validations/seo";
import type { Website } from "@/lib/validations/website";

type UrlInputFormProps = {
  websiteData: Website | null;
  onWebsiteDataChange: (data: Website | null) => void;
};

export function UrlInputForm({
  websiteData,
  onWebsiteDataChange,
}: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SeoAudit | null>(null);
  const [seoData, setSeoData] = useState<SeoAuditInsights | null>(null);

  function handleWebsiteUpdate(data: Website) {
    onWebsiteDataChange(data);
  }

  const isBusy = isLoading || isAuditing || isGenerating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedUrl = normalizeUrl(url);
    setUrl(normalizedUrl);
    setIsLoading(true);
    setIsAuditing(false);
    setIsGenerating(false);
    setError(null);
    setData(null);
    setSeoData(null);
    onWebsiteDataChange(null);

    try {
      const scrapedResult = await scrapeUrl(normalizedUrl);

      if (!scrapedResult.success) {
        setError(scrapedResult.error);
        return;
      }

      setData(scrapedResult.data);
      setIsLoading(false);
      setIsAuditing(true);

      let auditResult: SeoAuditInsights;
      try {
        auditResult = await performSeoAudit(scrapedResult.data.rawContent);
        setSeoData(auditResult);
      } catch (auditError) {
        setError(
          auditError instanceof Error
            ? auditError.message
            : "SEO audit failed",
        );
        return;
      }

      setIsAuditing(false);
      setIsGenerating(true);

      const aiResult = await generateWebsiteData(
        scrapedResult.data.rawContent,
        auditResult,
      );

      if (!aiResult.success) {
        setError(aiResult.error);
      } else {
        onWebsiteDataChange(aiResult.data);
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
    <div className="w-full space-y-4">
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              inputMode="url"
              placeholder="example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
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
