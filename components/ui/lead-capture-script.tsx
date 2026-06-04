import Script from "next/script";

import { LEAD_CAPTURE_SCRIPT } from "@/lib/deploy/lead-capture-script";

/**
 * Loads the same vanilla lead script used in static publish HTML.
 * Uses next/script so it runs in the dashboard preview without relying on hydration.
 */
export function LeadCaptureScript() {
  return (
    <Script
      id="blinkfront-lead-capture"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: LEAD_CAPTURE_SCRIPT }}
    />
  );
}
