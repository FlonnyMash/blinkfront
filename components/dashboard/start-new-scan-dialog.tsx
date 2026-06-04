"use client";

import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type StartNewScanDialogProps = {
  onConfirm: () => void;
  trigger: ReactNode;
};

export function StartNewScanDialog({
  onConfirm,
  trigger,
}: StartNewScanDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start a new scan?</AlertDialogTitle>
          <AlertDialogDescription>
            Your current generated layout and chat history will be permanently
            deleted. Make sure to Publish your site to save it to your dashboard
            first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-50">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Start new scan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
