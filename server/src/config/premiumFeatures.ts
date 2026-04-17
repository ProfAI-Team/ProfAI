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
  | "DNA_NARRATIVE_GEMINI";

interface FeatureConfig {
  key: PremiumFeatureKey;
  description: string;
  enabled: boolean;
}

export const PREMIUM_FEATURES: Record<PremiumFeatureKey, FeatureConfig> = {
  COURSE_ADVISOR: {
    key: "COURSE_ADVISOR",
    description: "Course compatibility scoring on /me/course-advisor",
    enabled: true,
  },
  EXAM_RECONSTRUCT: {
    key: "EXAM_RECONSTRUCT",
    description: "Gemini reconstruction of post-exam aggregates",
    enabled: true,
  },
  DNA_NARRATIVE_GEMINI: {
    key: "DNA_NARRATIVE_GEMINI",
    description: "AI narrative layer on the DNA profile page",
    enabled: false, // Phase 6 ships the narrative prompt; off by default.
  },
};

export function isFeatureEnabled(key: PremiumFeatureKey): boolean {
  return PREMIUM_FEATURES[key]?.enabled ?? false;
}
