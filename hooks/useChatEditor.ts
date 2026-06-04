"use client";

import { useCallback, useState } from "react";

import type { EditWebsiteResult } from "@/lib/ai/edit-site";
import type { Website } from "@/types/layout";

type UseChatEditorOptions = {
  currentWebsite: Website;
  siteId?: string;
  seoInsights?: string;
  onUpdate: (data: Website) => void;
};

export function useChatEditor({
  currentWebsite,
  siteId,
  seoInsights,
  onUpdate,
}: UseChatEditorOptions) {
  const [prompt, setPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setIsEditing(true);
      setError(null);

      try {
        const response = await fetch("/api/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentWebsite,
            userPrompt: prompt,
            seoInsights,
            ...(siteId ? { siteId } : {}),
          }),
        });

        const result = (await response.json()) as EditWebsiteResult;

        if (!response.ok || !result.success) {
          setError(
            result.success === false ? result.error : "Failed to edit website",
          );
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
    },
    [currentWebsite, onUpdate, prompt, seoInsights, siteId],
  );

  return {
    prompt,
    setPrompt,
    isEditing,
    error,
    submit,
  };
}
