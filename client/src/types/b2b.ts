/**
 * Phase 7 types (task 7.20) — mirror the server `Prisma` rows and the
 * Zod schemas in `server/src/schemas/b2b.ts`. The client never imports
 * Prisma directly so these live here, hand-maintained.
 */

export type UserRole =
  | 'STUDENT'
  | 'HOCA'
  | 'TUTOR'
  | 'UNIVERSITY_ADMIN'
  | 'SUPER_ADMIN';

export interface Specialization {
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
}

export interface Tutor {
  id: string;
  userId: string;
  bio: string;
  hourlyRate: number;
  specializations: Specialization[];
  availability: AvailabilitySlot[];
  rating: number | null;
  totalSessions: number;
  verifiedAt: string | null;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
}

export interface TutorMatchResult {
  tutor: Tutor;
  score: number;
  reasons: string[];
}

export interface TutoringSession {
  id: string;
  tutorId: string;
  studentId: string;
  scheduledAt: string;
  durationMin: number;
  status:
    | 'scheduled'
    | 'completed'
    | 'cancelled'
    | 'disputed'
    | 'no_show';
  rating: number | null;
  feedback: string | null;
  price: number;
  meetingUrl: string | null;
  paymentId: string | null;
  createdAt: string;
  completedAt: string | null;
}

export type MarketplaceItemType = 'notes' | 'study_guide';

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  type: MarketplaceItemType;
  title: string;
  description: string;
  price: number;
  fileUrl: string;
  previewText: string | null;
  tags: string[];
  rating: number | null;
  totalSales: number;
  approved: boolean;
  approvedById: string | null;
  createdAt: string;
}

export interface CommissionBreakdown {
  gross: number;
  commissionPct: number;
  commission: number;
  sellerPayout: number;
}

export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'disputed';

export interface Payment {
  id: string;
  userId: string;
  type: 'subscription' | 'marketplace' | 'tutoring';
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: 'iyzico' | 'stripe';
  externalId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  completedAt: string | null;
}

export interface PaymentInitResult {
  payment: Payment;
  checkoutUrl: string;
  externalId: string;
  commission?: CommissionBreakdown;
}

export interface UniversityAccount {
  id: string;
  universityId: string;
  contactEmail: string;
  tier: 'basic' | 'pro' | 'enterprise';
  seats: number;
  renewalDate: string;
}

export interface UniversityDashboard {
  status: 'ready' | 'insufficient';
  tenant: {
    id: string;
    universityId: string;
    tier: string;
    seats: number;
    seatsUsed: number;
    renewalDate: string;
  };
  activeStudents: number;
  mockExamSessions: {
    completed: number;
    avgScore: number | null;
  };
  topStruggling: Array<{
    topic: string;
    avgScore: number;
    sampleSize: number;
  }>;
  hocaRatingTopN: Array<{
    professorId: string;
    name: string;
    avgFairness: number;
    avgDifficulty: number;
    sampleSize: number;
  }>;
}

export interface HocaDashboard {
  status: 'ready' | 'insufficient';
  professors: Array<{
    professorId: string;
    name: string;
    strugglingTopics: Array<{
      topic: string;
      avgScore: number;
      sampleSize: number;
    }>;
    studentCount: number;
  }>;
}

export interface HocaFeedback {
  status: 'ready' | 'insufficient';
  items: Array<{
    anonymizedHash: string;
    difficulty: number;
    fairness: number;
    commentExcerpt: string | null;
    createdAt: string;
  }>;
}
