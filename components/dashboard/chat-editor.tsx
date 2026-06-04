"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { EditWebsiteResult } from "@/lib/ai/edit-site";
import type { SeoAuditInsights } from "@/lib/validations/seo-audit";
import type { Website } from "@/types/layout";

type ChatEditorProps = {
  currentData: Website;
  seoInsights: SeoAuditInsights;
  onUpdate: (data: Website) => void;
};

export function ChatEditor({
  currentData,
  seoInsights,
  onUpdate,
}: ChatEditorProps) {
  const [prompt, setPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsEditing(true);
    setError(null);

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentData,
          userPrompt: prompt,
          seoInsights,
        }),
      });

      const result = (await response.json()) as EditWebsiteResult;

      if (!response.ok || !result.success) {
        setError(result.success === false ? result.error : "Failed to edit website");
        return;
      }

      onUpdate(result.data);
      setPrompt("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to edit website",
      );
    } finally {
      setIsEditing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Editor</CardTitle>
        <CardDescription>
          Describe changes in natural language to update your website layout.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="e.g. Make the hero headline more urgent"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isEditing}
            required
          />
          <Button type="submit" disabled={isEditing}>
            Submit
          </Button>
        </form>
        {error && (
          <p className="mt-3 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="border-t bg-primary/5">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="size-4 animate-spin" />
            <span>AI is optimizing your design...</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
