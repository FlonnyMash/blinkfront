"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ResumeSessionDialogProps = {
  open: boolean;
  onResume: () => void;
  onStartNew: () => void;
};

export function ResumeSessionDialog({
  open,
  onResume,
  onStartNew,
}: ResumeSessionDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="gap-6 border-slate-200 bg-white shadow-xl ring-slate-200/80 sm:max-w-md dark:border-slate-800 dark:bg-slate-950 dark:ring-slate-800"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AlertDialogHeader className="space-y-2 text-center sm:text-center">
          <AlertDialogTitle className="text-center text-lg font-semibold text-slate-900 dark:text-slate-50">
            Resume Session?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-balance text-center text-slate-600 dark:text-slate-400">
            You have an uncommitted generation in progress. Would you like to resume
            it, or start a new scan?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:justify-center">
          <AlertDialogAction
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={onResume}
          >
            Resume
          </AlertDialogAction>
          <AlertDialogCancel
            className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            onClick={onStartNew}
          >
            Start New
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
