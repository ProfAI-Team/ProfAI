import { describe, expect, it, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  joinMatchmaking,
  submitExternalLink,
  listForUser,
  listSuggestionsForProfessor,
  closeStaleGroups,
  isAllowedExternalLink,
  StudyGroupError,
  GROUP_TRIGGER,
} from "../../src/services/studyGroupService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeUser(suffix: string) {
  return prisma.user.create({
    data: {
      email: `group-${suffix}-${Date.now()}-${Math.random()}@test.local`,
      password: "x",
      name: "Group Tester",
    },
  });
}

async function makeProfessor(suffix: string) {
  return prisma.professor.create({
    data: {
      name: `Prof Group ${suffix} ${Date.now()}`,
      department: "CS",
      university: "Test U",
    },
  });
}

describe("isAllowedExternalLink", () => {
  it("accepts whatsapp + discord invite URLs", () => {
    expect(
      isAllowedExternalLink("https://chat.whatsapp.com/AbCdEfGhIjKlMnOp")
    ).toBe(true);
    expect(isAllowedExternalLink("https://discord.gg/abc123")).toBe(true);
    expect(isAllowedExternalLink("https://discord.com/invite/abc123")).toBe(true);
  });
  it("rejects anything else", () => {
    expect(isAllowedExternalLink("https://random.com/x")).toBe(false);
    expect(isAllowedExternalLink("http://chat.whatsapp.com/Abc")).toBe(false);
    expect(isAllowedExternalLink("javascript:alert(1)")).toBe(false);
  });
});

describeIfDb("studyGroupService", () => {
  beforeEach(async () => {
    // Clean slate for our test-scoped fixtures.
    const groups = await prisma.studyGroup.findMany({
      where: {
        members: { some: { email: { contains: "group-" } } },
      },
      select: { id: true },
    });
    if (groups.length > 0) {
      await prisma.studyGroup.deleteMany({
        where: { id: { in: groups.map((g) => g.id) } },
      });
    }
    await prisma.user.deleteMany({
      where: { email: { contains: "group-" } },
    });
    await prisma.professor.deleteMany({
      where: { name: { contains: "Prof Group" } },
    });
  });

  it("creates a SUGGESTED group for the first seeker and joins later ones", async () => {
    const prof = await makeProfessor("flow");
    const first = await makeUser("flow-1");
    const r1 = await joinMatchmaking({
      userId: first.id,
      professorId: prof.id,
      examDate: new Date("2026-06-15"),
    });
    expect(r1.action).toBe("created");
    expect(r1.group.status).toBe("SUGGESTED");
    expect(r1.group.memberCount).toBe(1);

    const second = await makeUser("flow-2");
    const r2 = await joinMatchmaking({
      userId: second.id,
      professorId: prof.id,
      examDate: new Date("2026-06-14"),
    });
    expect(r2.action).toBe("joined_existing");
    expect(r2.group.memberCount).toBe(2);
    expect(r2.group.id).toBe(r1.group.id);
  });

  it("promotes the group to ACTIVE when member count reaches GROUP_TRIGGER", async () => {
    const prof = await makeProfessor("promote");
    let groupId: string | null = null;
    for (let i = 0; i < GROUP_TRIGGER; i++) {
      const u = await makeUser(`promote-${i}`);
      const res = await joinMatchmaking({
        userId: u.id,
        professorId: prof.id,
        examDate: new Date("2026-06-15"),
      });
      groupId = res.group.id;
      if (i === GROUP_TRIGGER - 1) {
        expect(res.action).toBe("promoted");
        expect(res.group.status).toBe("ACTIVE");
        expect(res.group.memberCount).toBe(GROUP_TRIGGER);
      } else {
        expect(res.group.status).toBe("SUGGESTED");
      }
    }
    expect(groupId).toBeTruthy();
  });

  it("rejects external links outside the whitelist", async () => {
    const prof = await makeProfessor("link");
    const user = await makeUser("link");
    const res = await joinMatchmaking({
      userId: user.id,
      professorId: prof.id,
    });
    await expect(
      submitExternalLink({
        groupId: res.group.id,
        userId: user.id,
        url: "https://random.com/x",
      })
    ).rejects.toBeInstanceOf(StudyGroupError);
  });

  it("non-members cannot attach links", async () => {
    const prof = await makeProfessor("outsider");
    const member = await makeUser("outsider-member");
    const outsider = await makeUser("outsider-outsider");
    const { group } = await joinMatchmaking({
      userId: member.id,
      professorId: prof.id,
    });
    await expect(
      submitExternalLink({
        groupId: group.id,
        userId: outsider.id,
        url: "https://discord.gg/valid1",
      })
    ).rejects.toBeInstanceOf(StudyGroupError);
  });

  it("closeStaleGroups closes groups whose exam is long past", async () => {
    const prof = await makeProfessor("stale");
    const user = await makeUser("stale");
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 60);
    await joinMatchmaking({
      userId: user.id,
      professorId: prof.id,
      examDate: oldDate,
    });
    const res = await closeStaleGroups();
    expect(res.closed).toBeGreaterThanOrEqual(1);
    const mine = await listForUser(user.id);
    const theirs = mine.find((g) => g.professorId === prof.id);
    expect(theirs?.status).toBe("CLOSED");
  });

  it("listSuggestionsForProfessor excludes groups I already joined", async () => {
    const prof = await makeProfessor("suggest");
    const a = await makeUser("sug-a");
    const b = await makeUser("sug-b");
    await joinMatchmaking({ userId: a.id, professorId: prof.id });
    const suggestionsForA = await listSuggestionsForProfessor({
      professorId: prof.id,
      userId: a.id,
    });
    expect(suggestionsForA.length).toBe(0);

    const suggestionsForB = await listSuggestionsForProfessor({
      professorId: prof.id,
      userId: b.id,
    });
    expect(suggestionsForB.length).toBe(1);
  });
});
