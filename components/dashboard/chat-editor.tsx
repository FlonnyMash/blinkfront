"use client";

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
import { useChatEditor } from "@/hooks/useChatEditor";
import type { Website } from "@/types/layout";

type ChatEditorProps = {
  currentWebsite: Website;
  siteId?: string;
  seoInsights?: string;
  onUpdate: (data: Website) => void;
};

export function ChatEditor({
  currentWebsite,
  siteId,
  seoInsights,
  onUpdate,
}: ChatEditorProps) {
  const { prompt, setPrompt, isEditing, error, submit } = useChatEditor({
    currentWebsite,
    siteId,
    seoInsights,
    onUpdate,
  });

  return (
    <Card className="border-0 bg-white/90 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-semibold tracking-tight text-slate-900">
          Chat Editor
        </CardTitle>
        <CardDescription className="text-slate-600">
          Describe changes in natural language to update your website layout.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="e.g. Make the hero headline more urgent"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isEditing}
            required
            className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
          />
          <Button
            type="submit"
            disabled={isEditing}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
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
        <CardFooter className="border-t border-indigo-100 bg-indigo-50/50">
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
            <Loader2 className="size-4 animate-spin" />
            <span>AI is optimizing your design...</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
