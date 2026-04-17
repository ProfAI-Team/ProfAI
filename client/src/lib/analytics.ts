/**
 * Lightweight Plausible wrapper. Opt-in via VITE_PLAUSIBLE_DOMAIN; if unset,
 * every call becomes a no-op so local dev and CI stay silent.
 *
 * PII stance: never send userId, email, or raw note content. Hashed or
 * anonymised IDs (e.g., professor UUIDs that are already non-PII) are fine.
 */

type PlausibleProps = Record<string, string | number | boolean>;

type PlausibleFn = (event: string, options?: { props?: PlausibleProps }) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn & { q?: unknown[] };
  }
}

const DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
const SCRIPT_SRC =
  (import.meta.env.VITE_PLAUSIBLE_SCRIPT as string | undefined) ??
  "https://plausible.io/js/script.js";

let initialised = false;

export function initAnalytics(): void {
  if (initialised || typeof document === "undefined") return;
  initialised = true;

  if (!DOMAIN) return;

  window.plausible =
    window.plausible ||
    (function (...args: unknown[]) {
      (window.plausible!.q = window.plausible!.q || []).push(args);
    } as PlausibleFn);

  const script = document.createElement("script");
  script.defer = true;
  script.src = SCRIPT_SRC;
  script.setAttribute("data-domain", DOMAIN);
  document.head.appendChild(script);
}

export function track(event: string, props?: PlausibleProps): void {
  if (!DOMAIN || typeof window === "undefined") return;
  const fn = window.plausible;
  if (typeof fn !== "function") return;
  fn(event, props ? { props } : undefined);
}

export const AnalyticsEvents = {
  NotesUploaded: "notes_uploaded",
  StudyPackGenerated: "study_pack_generated",
  StudyPackViewed: "study_pack_viewed",
  MockExamGenerated: "mock_exam_generated",
  MockExamStarted: "mock_exam_started",
  MockExamSubmitted: "mock_exam_submitted",
  MockExamAutoSubmitted: "mock_exam_auto_submitted",
  PanicModeUsed: "panic_mode_used",
  RateLimited: "rate_limited",
} as const;
