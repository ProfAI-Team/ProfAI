/**
 * Phase 4 credit economy — fixed rule-based earn/spend amounts.
 *
 * Kept as constants (not env) so the balance math is deterministic across
 * envs and audit-friendly. Phase 5 will move these into an admin-editable
 * config table. Amounts are spec-driven:
 *   phase-4-community.md §1 ("Sınav Borsası").
 */
export const CreditEarn = {
  ExamApproved: 10,
  PostExamReport: 5,
} as const;

export const CreditSpend = {
  MockExamGenerate: 5,
  StudyPackGenerate: 3,
} as const;

export const CREDITS_ENABLED =
  process.env.COMMUNITY_CREDITS_ENABLED !== "false";

export type CreditEarnReason = keyof typeof CreditEarn;
export type CreditSpendReason = keyof typeof CreditSpend;

export const CREDIT_REASONS = {
  earn: Object.keys(CreditEarn) as CreditEarnReason[],
  spend: Object.keys(CreditSpend) as CreditSpendReason[],
};
