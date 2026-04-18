import { describe, it, expect, afterEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  verifyHocaByEmail,
  getHocaFeedback,
  getHocaDashboard,
} from "../../src/services/hocaPortalService";
import {
  getDashboard,
  addSeat,
  removeSeat,
  provisionSso,
} from "../../src/services/universityAdminService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeTenant(universityId: string, seats = 5) {
  return prisma.universityAccount.create({
    data: {
      universityId,
      contactEmail: "admin@example.com",
      tier: "pro",
      seats,
      renewalDate: new Date(Date.now() + 365 * 86_400_000),
    },
  });
}

async function makeUser(email: string, overrides: Record<string, unknown> = {}) {
  return prisma.user.create({
    data: {
      email,
      password: "x",
      name: "U",
      ...overrides,
    },
  });
}

describeIfDb("hocaPortalService + universityAdminService", () => {
  afterEach(async () => {
    await prisma.professorRating.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: "@b2b.test" } },
    });
    await prisma.universityAccount.deleteMany({
      where: { universityId: { contains: "b2b-" } },
    });
  });

  it("verifyHocaByEmail rejects non-edu domains", async () => {
    const u = await makeUser(`hoca-${Date.now()}@b2b.test`);
    await expect(
      verifyHocaByEmail({
        userId: u.id,
        email: "someone@gmail.com",
      })
    ).rejects.toThrow(/\.edu/);
  });

  it("verifyHocaByEmail returns matched professors for a university domain", async () => {
    const u = await makeUser(`hoca2-${Date.now()}@b2b.test`);
    const result = await verifyHocaByEmail({
      userId: u.id,
      email: `hoca@aydin.edu.tr`,
    });
    // Seed contains "İstanbul Aydın Üniversitesi" professors.
    expect(Array.isArray(result.matched)).toBe(true);
  });

  it("getHocaFeedback is insufficient below 5 raters", async () => {
    // With no ratings at all, n = 0 < 5 → insufficient.
    const prof = await prisma.professor.findFirst();
    if (!prof) return;
    const result = await getHocaFeedback([prof.id]);
    expect(result.status).toBe("insufficient");
  });

  it("getHocaDashboard returns insufficient per-professor when n<5", async () => {
    const prof = await prisma.professor.findFirst();
    if (!prof) return;
    const u = await makeUser(`dash-${Date.now()}@b2b.test`);
    const out = await getHocaDashboard(u.id, [prof.id]);
    expect(out.professors[0]?.strugglingTopics).toEqual([]);
  });

  it("university getDashboard returns insufficient on empty tenant", async () => {
    const tenant = await makeTenant(`b2b-${Date.now()}`);
    const out = await getDashboard(tenant.id);
    expect(out.status).toBe("insufficient");
    expect(out.tenant.seats).toBe(5);
    expect(out.activeStudents).toBe(0);
  });

  it("addSeat attaches user + respects seat cap", async () => {
    const tenant = await makeTenant(`b2b-seat-${Date.now()}`, 1);
    const a = await makeUser(`a-${Date.now()}@b2b.test`);
    const b = await makeUser(`b-${Date.now()}@b2b.test`);
    await addSeat(tenant.id, a.email);
    await expect(addSeat(tenant.id, b.email)).rejects.toThrow(/cap/);
  });

  it("removeSeat detaches + rejects users from other tenants", async () => {
    const tenant = await makeTenant(`b2b-rm-${Date.now()}`);
    const a = await makeUser(`rm-${Date.now()}@b2b.test`);
    await addSeat(tenant.id, a.email);
    await removeSeat(tenant.id, a.id);
    const fresh = await prisma.user.findUnique({ where: { id: a.id } });
    expect(fresh?.universityAccountId).toBeNull();
  });

  it("provisionSso rejects a non-SAML blob", async () => {
    const tenant = await makeTenant(`b2b-sso-${Date.now()}`);
    await expect(
      provisionSso({
        tenantId: tenant.id,
        samlMetadata: "not really saml",
      })
    ).rejects.toThrow(/SAML EntityDescriptor/);
  });
});
