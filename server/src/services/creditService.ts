import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

import prisma from "../lib/prisma";
import { featureLogger } from "../lib/logger";

const log = featureLogger("credit");
import {
  CREDITS_ENABLED,
  CreditEarn,
  CreditSpend,
  type CreditEarnReason,
  type CreditSpendReason,
} from "../config/creditRules";

type HistoryEntry = {
  type: "earn" | "spend";
  amount: number;
  reason: string;
  refId?: string;
  at: string;
};

export class InsufficientCreditError extends Error {
  readonly code = "INSUFFICIENT_CREDIT";
  readonly required: number;
  readonly balance: number;
  constructor(required: number, balance: number) {
    super(`Insufficient credit: need ${required}, have ${balance}`);
    this.required = required;
    this.balance = balance;
  }
}

/**
 * Awards credits for a triggering event (approval, report, …). Entire
 * operation runs inside a transaction so balance and history stay in lock
 * step even under parallel requests.
 */
export async function earn(params: {
  userId: string;
  reason: CreditEarnReason;
  refId?: string;
  tx?: Prisma.TransactionClient;
}): Promise<{ balance: number }> {
  const amount = CreditEarn[params.reason];
  return applyDelta({
    userId: params.userId,
    amount,
    type: "earn",
    reason: params.reason,
    refId: params.refId,
    tx: params.tx,
  });
}

/**
 * Deducts credits for a paid action (mock exam, study pack). Throws
 * InsufficientCreditError if the user cannot cover it; callers translate
 * this to HTTP 402.
 */
export async function spend(params: {
  userId: string;
  reason: CreditSpendReason;
  refId?: string;
  tx?: Prisma.TransactionClient;
}): Promise<{ balance: number }> {
  const amount = CreditSpend[params.reason];
  return applyDelta({
    userId: params.userId,
    amount: -amount,
    type: "spend",
    reason: params.reason,
    refId: params.refId,
    tx: params.tx,
  });
}

// Postgres raises `P2034` (serialization_failure, SQLSTATE 40001) when a
// Serializable transaction's read set is invalidated by a concurrent
// writer. Our parallel-spend path hits this: three simultaneous debits
// on the same row-level lock are exactly the pattern SSI watches for.
// Retrying the whole transaction — a fresh snapshot, fresh `FOR UPDATE` —
// is the documented recovery path and matches the "retry on deadlock"
// pattern Prisma's own docs recommend.
function isSerializationFailure(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2034"
  );
}

const APPLY_DELTA_MAX_ATTEMPTS = 3;

async function applyDelta(params: {
  userId: string;
  amount: number; // positive for earn, negative for spend
  type: "earn" | "spend";
  reason: string;
  refId?: string;
  tx?: Prisma.TransactionClient;
}): Promise<{ balance: number }> {
  const run = async (client: Prisma.TransactionClient) => {
    // Row-level lock (SELECT … FOR UPDATE) so concurrent spends serialize
    // through Postgres rather than racing on a read-then-write pattern.
    // Upserts the row at balance 0 on first touch to keep subsequent
    // reads / updates simple.
    const locked = await client.$queryRaw<Array<{ balance: number }>>`
      SELECT balance FROM user_credits
      WHERE "userId" = ${params.userId}
      FOR UPDATE
    `;

    let currentBalance: number;
    if (locked.length === 0) {
      await client.userCredit.create({
        data: { userId: params.userId, balance: 0, history: [] },
      });
      currentBalance = 0;
    } else {
      currentBalance = locked[0].balance;
    }

    const nextBalance = currentBalance + params.amount;

    if (nextBalance < 0) {
      throw new InsufficientCreditError(-params.amount, currentBalance);
    }

    const entry: HistoryEntry = {
      type: params.type,
      amount: Math.abs(params.amount),
      reason: params.reason,
      ...(params.refId ? { refId: params.refId } : {}),
      at: new Date().toISOString(),
    };

    await client.userCredit.update({
      where: { userId: params.userId },
      data: {
        balance: nextBalance,
        history: { push: entry as unknown as Prisma.InputJsonValue },
      },
    });

    return { balance: nextBalance };
  };

  if (params.tx) return run(params.tx);

  let lastErr: unknown;
  for (let attempt = 1; attempt <= APPLY_DELTA_MAX_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(run, {
        isolationLevel: "Serializable",
      });
    } catch (err) {
      lastErr = err;
      if (
        isSerializationFailure(err) &&
        attempt < APPLY_DELTA_MAX_ATTEMPTS
      ) {
        // 20ms, 40ms — keeps hot-path latency bounded while giving the
        // conflicting writer enough breathing room to commit.
        await new Promise((r) => setTimeout(r, 20 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastErr ?? new Error("credit applyDelta exhausted retries");
}

export async function getBalance(userId: string): Promise<{
  balance: number;
  updatedAt: Date;
}> {
  const row = await prisma.userCredit.findUnique({ where: { userId } });
  if (!row) {
    return { balance: 0, updatedAt: new Date() };
  }
  return { balance: row.balance, updatedAt: row.updatedAt };
}

export async function getHistory(
  userId: string,
  opts: { limit?: number; offset?: number } = {}
): Promise<{ total: number; entries: HistoryEntry[] }> {
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100);
  const offset = Math.max(opts.offset ?? 0, 0);

  const row = await prisma.userCredit.findUnique({ where: { userId } });
  const allEntries = (row?.history ?? []) as unknown as HistoryEntry[];
  const sorted = [...allEntries].sort((a, b) => b.at.localeCompare(a.at));
  return {
    total: sorted.length,
    entries: sorted.slice(offset, offset + limit),
  };
}

/**
 * Express middleware factory — charges the user the fixed cost for the
 * given spend reason before the handler runs. Attaches `req.creditCharged`
 * so the handler knows it succeeded. Responds 402 on insufficient balance
 * and 401 on missing auth.
 *
 * Kept opt-in per endpoint so existing mock-exam / study-pack routes can
 * be wired when the product team decides to flip the switch; the global
 * `CREDITS_ENABLED` flag also lets us disable the whole economy in dev.
 */
export function requireCredits(reason: CreditSpendReason) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!CREDITS_ENABLED) {
      next();
      return;
    }
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
      return;
    }
    try {
      const { balance } = await spend({ userId: req.user.id, reason });
      (req as Request & { creditBalance: number }).creditBalance = balance;
      next();
    } catch (err) {
      if (err instanceof InsufficientCreditError) {
        res.status(402).json({
          error: {
            code: err.code,
            message: "Yetersiz kredi. Sınav yükleyerek veya rapor yazarak kazanabilirsin.",
            required: err.required,
            balance: err.balance,
          },
        });
        return;
      }
      log.error({ err }, "requireCredits middleware failed");
      res.status(500).json({ error: { code: "INTERNAL", message: "Credit check failed." } });
    }
  };
}
