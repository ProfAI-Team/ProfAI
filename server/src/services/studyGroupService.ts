import { Prisma } from "@prisma/client";

import prisma from "../lib/prisma";

export const GROUP_TRIGGER = 5;
export const EXAM_DATE_WINDOW_DAYS = 7;

export class StudyGroupError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const EXTERNAL_LINK_PATTERNS = [
  /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{10,}\/?$/,
  /^https:\/\/discord\.gg\/[A-Za-z0-9-]{2,}\/?$/,
  /^https:\/\/discord\.com\/invite\/[A-Za-z0-9-]{2,}\/?$/,
];

export function isAllowedExternalLink(url: string): boolean {
  return EXTERNAL_LINK_PATTERNS.some((re) => re.test(url));
}

function windowAround(date: Date | null | undefined): {
  gte?: Date;
  lte?: Date;
} {
  if (!date) return {};
  const gte = new Date(date);
  gte.setDate(gte.getDate() - EXAM_DATE_WINDOW_DAYS);
  const lte = new Date(date);
  lte.setDate(lte.getDate() + EXAM_DATE_WINDOW_DAYS);
  return { gte, lte };
}

/**
 * Match-making entry point. If an open group for (professor, course,
 * examDate ± 7d) already exists, joins the user. Otherwise counts how
 * many other users are currently seeking the same slot; once the total
 * hits GROUP_TRIGGER, spins up a new group with everyone as member.
 *
 * Track-record of seekers lives in the StudyGroup table itself as
 * status: SUGGESTED rows with a single member — we don't need a
 * separate matchmaking queue table for Phase 4.
 */
export async function joinMatchmaking(params: {
  userId: string;
  professorId: string;
  courseId?: string | null;
  examDate?: Date | null;
}): Promise<{
  group: {
    id: string;
    status: "SUGGESTED" | "ACTIVE" | "CLOSED";
    memberCount: number;
  };
  action: "joined_existing" | "created" | "promoted";
}> {
  // 1) Active group within the window? Join.
  const dateWindow = windowAround(params.examDate);
  const activeGroup = await prisma.studyGroup.findFirst({
    where: {
      professorId: params.professorId,
      courseId: params.courseId ?? undefined,
      status: { in: ["ACTIVE", "SUGGESTED"] },
      ...(params.examDate
        ? { examDate: { gte: dateWindow.gte, lte: dateWindow.lte } }
        : {}),
      members: {
        none: { id: params.userId },
      },
    },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (activeGroup) {
    const updated = await prisma.studyGroup.update({
      where: { id: activeGroup.id },
      data: {
        members: { connect: { id: params.userId } },
        status:
          activeGroup._count.members + 1 >= GROUP_TRIGGER
            ? "ACTIVE"
            : activeGroup.status,
      },
      include: { _count: { select: { members: true } } },
    });
    return {
      group: {
        id: updated.id,
        status: updated.status,
        memberCount: updated._count.members,
      },
      action:
        updated._count.members >= GROUP_TRIGGER &&
        activeGroup._count.members + 1 === GROUP_TRIGGER
          ? "promoted"
          : "joined_existing",
    };
  }

  // 2) No group yet — create a SUGGESTED one with this user as the first
  // member. Future joins land in branch 1 and promote to ACTIVE at K=5.
  const created = await prisma.studyGroup.create({
    data: {
      professorId: params.professorId,
      courseId: params.courseId ?? null,
      examDate: params.examDate ?? null,
      members: { connect: { id: params.userId } },
      status: "SUGGESTED",
    },
    include: { _count: { select: { members: true } } },
  });
  return {
    group: {
      id: created.id,
      status: created.status,
      memberCount: created._count.members,
    },
    action: "created",
  };
}

export async function submitExternalLink(params: {
  groupId: string;
  userId: string;
  url: string;
}): Promise<{ url: string }> {
  if (!isAllowedExternalLink(params.url)) {
    throw new StudyGroupError(
      "LINK_NOT_ALLOWED",
      "Only WhatsApp or Discord invite links are allowed."
    );
  }
  const group = await prisma.studyGroup.findUnique({
    where: { id: params.groupId },
    include: { members: { select: { id: true } } },
  });
  if (!group) {
    throw new StudyGroupError("NOT_FOUND", "Study group not found.");
  }
  const isMember = group.members.some((m) => m.id === params.userId);
  if (!isMember) {
    throw new StudyGroupError(
      "NOT_MEMBER",
      "Only members can attach an external link."
    );
  }
  if (group.status === "CLOSED") {
    throw new StudyGroupError("CLOSED", "Group is closed.");
  }
  const updated = await prisma.studyGroup.update({
    where: { id: params.groupId },
    data: { externalLink: params.url },
  });
  return { url: updated.externalLink as string };
}

export async function listForUser(userId: string): Promise<
  Array<{
    id: string;
    professorId: string;
    courseId: string | null;
    examDate: Date | null;
    externalLink: string | null;
    status: "SUGGESTED" | "ACTIVE" | "CLOSED";
    memberCount: number;
  }>
> {
  const rows = await prisma.studyGroup.findMany({
    where: { members: { some: { id: userId } } },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((g) => ({
    id: g.id,
    professorId: g.professorId,
    courseId: g.courseId,
    examDate: g.examDate,
    externalLink: g.externalLink,
    status: g.status,
    memberCount: g._count.members,
  }));
}

/** Suggested groups for the given professor the user hasn't joined yet. */
export async function listSuggestionsForProfessor(params: {
  professorId: string;
  userId: string;
}): Promise<
  Array<{
    id: string;
    courseId: string | null;
    examDate: Date | null;
    memberCount: number;
    status: "SUGGESTED" | "ACTIVE" | "CLOSED";
  }>
> {
  const rows = await prisma.studyGroup.findMany({
    where: {
      professorId: params.professorId,
      status: { in: ["SUGGESTED", "ACTIVE"] },
      members: { none: { id: params.userId } },
    },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((g) => ({
    id: g.id,
    courseId: g.courseId,
    examDate: g.examDate,
    memberCount: g._count.members,
    status: g.status,
  }));
}

/**
 * Daily maintenance — closes groups whose exam date has passed by more
 * than 30 days. node-cron will call this; manual callers (tests, admin)
 * can also invoke it directly.
 */
export async function closeStaleGroups(opts: {
  now?: Date;
  graceDays?: number;
} = {}): Promise<{ closed: number }> {
  const now = opts.now ?? new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - (opts.graceDays ?? 30));
  const result = await prisma.studyGroup.updateMany({
    where: {
      status: { in: ["SUGGESTED", "ACTIVE"] },
      examDate: { not: null, lt: cutoff },
    },
    data: { status: "CLOSED" },
  });
  return { closed: result.count };
}

export type { Prisma };
