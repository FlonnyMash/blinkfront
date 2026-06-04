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
  seoInsights?: string;
  onUpdate: (data: Website) => void;
};

export function ChatEditor({
  currentWebsite,
  seoInsights,
  onUpdate,
}: ChatEditorProps) {
  const { prompt, setPrompt, isEditing, error, submit } = useChatEditor({
    currentWebsite,
    seoInsights,
    onUpdate,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Editor</CardTitle>
        <CardDescription>
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
