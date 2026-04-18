/**
 * Premium feature registry.
 *
 * Each key is a stable identifier used in `requirePremium` middleware
 * calls + analytics. The `enabled` flag is an emergency kill switch —
 * set to false to disable the feature for every tier (e.g. during an
 * incident with a misbehaving Gemini prompt).
 *
 * Add new features at the bottom — don't reuse old keys, those can
 * show up in older AICallLog rows and analytics dashboards.
 */

export type PremiumFeatureKey =
  | "COURSE_ADVISOR"
  | "EXAM_RECONSTRUCT"
  | "DNA_NARRATIVE_GEMINI"
  // Phase 6 task 6.9 — multimodal + voice.
  | "VOICE_TUTOR"
  | "OCR_PRO"
  | "LECTURE_TRANSCRIBE"
  | "MULTIMODAL_SEARCH"
  // Phase 7 task 7.12 — B2B + marketplace + payments.
  | "TUTOR_MATCHING"
  | "MARKETPLACE_PRO"
  | "UNIVERSITY_ADMIN"
  | "HOCA_PORTAL"
  | "PAYMENT_SANDBOX";

interface FeatureConfig {
  key: PremiumFeatureKey;
  description: string;
  enabled: boolean;
  /**
   * Default daily cap for the feature. Consumed by the rate-limit
   * middleware (6.15) + per-feature quota services (e.g. VoiceUsage).
   * `null` = unlimited at the middleware layer; a feature-specific
   * service may still enforce a tighter cap.
   */
  dailyCap: number | null;
}

export const PREMIUM_FEATURES: Record<PremiumFeatureKey, FeatureConfig> = {
  COURSE_ADVISOR: {
    key: "COURSE_ADVISOR",
    description: "Course compatibility scoring on /me/course-advisor",
    enabled: true,
    dailyCap: 20,
  },
  EXAM_RECONSTRUCT: {
    key: "EXAM_RECONSTRUCT",
    description: "Gemini reconstruction of post-exam aggregates",
    enabled: true,
    dailyCap: 5,
  },
  DNA_NARRATIVE_GEMINI: {
    key: "DNA_NARRATIVE_GEMINI",
    description: "AI narrative layer on the DNA profile page",
    enabled: false, // Phase 6 ships the narrative prompt; off by default.
    dailyCap: 3,
  },
  VOICE_TUTOR: {
    key: "VOICE_TUTOR",
    description: "Real-time voice tutor chat with Gemini Live (30min/day)",
    enabled: true,
    // Minute budget lives in VoiceUsage; this is the session-start cap.
    dailyCap: 20,
  },
  OCR_PRO: {
    key: "OCR_PRO",
    description: "Gemini multimodal OCR with LaTeX extraction",
    enabled: true,
    dailyCap: 20,
  },
  LECTURE_TRANSCRIBE: {
    key: "LECTURE_TRANSCRIBE",
    description: "60min lecture audio → transcript + key topics + exam hints",
    enabled: true,
    dailyCap: 2,
  },
  MULTIMODAL_SEARCH: {
    key: "MULTIMODAL_SEARCH",
    description: "Formula photograph → similar exam questions",
    enabled: true,
    dailyCap: 10,
  },
  // Phase 7 task 7.12 ---------------------------------------------------
  TUTOR_MATCHING: {
    key: "TUTOR_MATCHING",
    description:
      "DNA + pgvector matching engine on /tutors — ranks tutors by style+subject+rating compatibility",
    enabled: true,
    dailyCap: 60, // search calls; booking itself is a separate flow
  },
  MARKETPLACE_PRO: {
    key: "MARKETPLACE_PRO",
    description:
      "Seller-side marketplace features (listing items, managing approvals). Browsing stays free.",
    enabled: true,
    dailyCap: null,
  },
  UNIVERSITY_ADMIN: {
    key: "UNIVERSITY_ADMIN",
    description:
      "B2B tenant admin dashboard, seat management, aggregate insights (k-anonymity ≥5)",
    enabled: true,
    dailyCap: 100,
  },
  HOCA_PORTAL: {
    key: "HOCA_PORTAL",
    description:
      "Verified hoca dashboard, anonymised student feedback, struggling-topics insight",
    enabled: true,
    dailyCap: null,
  },
  PAYMENT_SANDBOX: {
    key: "PAYMENT_SANDBOX",
    description:
      "Toggle iyzico sandbox mode. When true, paymentService routes through stubbed provider responses.",
    // Default off — production safety; dev envs flip to true via env override
    // (`PREMIUM_FEATURES_OVERRIDE_PAYMENT_SANDBOX=true`) once iyzico creds
    // are loaded.
    enabled: false,
    dailyCap: null,
  },
};

export function isFeatureEnabled(key: PremiumFeatureKey): boolean {
  return PREMIUM_FEATURES[key]?.enabled ?? false;
}

export function getDailyCap(key: PremiumFeatureKey): number | null {
  return PREMIUM_FEATURES[key]?.dailyCap ?? null;
}
