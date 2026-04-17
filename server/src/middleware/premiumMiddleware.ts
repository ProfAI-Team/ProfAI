import type { Request, RequestHandler } from "express";

import { AppError, forbidden, paymentRequired, unauthorized } from "../lib/AppError";
import prisma from "../lib/prisma";
import {
  type PremiumFeatureKey,
  isFeatureEnabled,
} from "../config/premiumFeatures";

/**
 * Factory for an Express middleware that ensures the request belongs
 * to a premium subscriber and that the named feature flag is on.
 *
 *   Free user        → 402 PREMIUM_REQUIRED
 *   Premium + flag off → 403 FEATURE_DISABLED
 *   Unauthenticated  → 401 UNAUTHORIZED
 *
 * Assumes the route is already behind `authMiddleware` so
 * `req.user.userId` is populated. Looks the user up once per request
 * to read the current `subscriptionTier` — trading a DB hit for a
 * fresh answer (JWT payload is stale once we start selling premium
 * and we don't want to force a logout on upgrade).
 */
export function requirePremium(feature: PremiumFeatureKey): RequestHandler {
  return async (req: Request & { user?: { id: string } }, _res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw unauthorized();
      }

      if (!isFeatureEnabled(feature)) {
        throw new AppError(
          "FEATURE_DISABLED",
          `Feature "${feature}" is temporarily disabled.`,
          403
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true },
      });

      if (!user) {
        throw unauthorized();
      }

      if ((user.subscriptionTier ?? "free") !== "premium") {
        throw paymentRequired(
          "This feature requires a premium subscription."
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// Re-export so route files can compose their own 403 flow if needed.
export { forbidden };
