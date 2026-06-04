import { getLeadApiUrl } from "@/lib/lead-api-url";
import { cn } from "@/lib/utils";

export type LeadFormLayout =
  | "hero"
  | "cta-default"
  | "cta-split"
  | "cta-minimal";

export type LeadFormMarkupProps = {
  siteId: string;
  buttonText: string;
  layout?: LeadFormLayout;
  className?: string;
};

const formLayoutClasses: Record<LeadFormLayout, string> = {
  hero: "flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center",
  "cta-default":
    "flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:justify-center",
  "cta-split": "flex w-full flex-col gap-3 sm:flex-row sm:items-center",
  "cta-minimal":
    "flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:justify-center",
};

const inputClassName =
  "lead-capture-input h-10 w-full min-w-0 flex-1 rounded-lg border border-[var(--text)]/20 px-3 text-base outline-none focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 disabled:opacity-50";

const inputLayoutClasses: Record<LeadFormLayout, string> = {
  hero: "bg-[var(--background)] text-[var(--text)]",
  "cta-default": "bg-[var(--background)] text-[var(--primary)]",
  "cta-split": "bg-[var(--background)] text-[var(--primary)]",
  "cta-minimal": "bg-[var(--background)] text-[var(--text)]",
};

const submitBaseClassName =
  "lead-capture-submit inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent px-8 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 disabled:pointer-events-none disabled:opacity-50";

const buttonLayoutClasses: Record<LeadFormLayout, string> = {
  hero: "h-9 bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary)]/90",
  "cta-default":
    "h-9 bg-[var(--background)] text-[var(--primary)] hover:bg-[var(--background)]/90",
  "cta-split":
    "h-9 w-full bg-[var(--background)] text-lg text-[var(--primary)] hover:bg-[var(--background)]/90 md:w-auto",
  "cta-minimal":
    "h-9 border-2 border-[var(--primary)] bg-transparent text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]",
};

const THANKS_MESSAGE = "Thank you! We'll be in touch soon.";

/**
 * Plain HTML form for static publish (renderToStaticMarkup) and preview.
 * No Radix/client components — works without React hydration.
 */
export function LeadFormMarkup({
  siteId,
  buttonText,
  layout = "hero",
  className,
}: LeadFormMarkupProps) {
  const apiUrl = getLeadApiUrl();

  return (
    <form
      className={cn("lead-capture-form", formLayoutClasses[layout], className)}
      data-site-id={siteId}
      data-api-url={apiUrl}
      data-button-text={buttonText}
      data-thanks-message={THANKS_MESSAGE}
      action="#"
      noValidate
    >
      <input
        type="email"
        name="email"
        className={cn(inputClassName, inputLayoutClasses[layout])}
        placeholder="you@company.com"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        required
        aria-label="Email address"
      />
      <button
        type="submit"
        className={cn(submitBaseClassName, buttonLayoutClasses[layout])}
      >
        {buttonText}
      </button>
      <p
        className="lead-capture-error w-full text-sm text-red-600"
        role="alert"
        aria-live="polite"
        hidden
      />
    </form>
  );
}
