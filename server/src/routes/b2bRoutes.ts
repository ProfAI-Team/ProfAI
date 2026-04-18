import { Router } from "express";

import { authenticate, optionalAuthenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/rbacMiddleware";
import { asyncHandler } from "../lib/asyncHandler";
import {
  apply as tutorApply,
  getById as tutorGetById,
  getMe as tutorGetMe,
  match as tutorMatch,
  bookSession,
  getSession,
  completeSession,
  mySessions,
} from "../controllers/tutorController";
import {
  createMarketplaceItem,
  listItems,
  getItem,
  purchase,
} from "../controllers/marketplaceController";
import {
  init as paymentInit,
  iyzicoWebhook,
  myPayments,
  refund,
} from "../controllers/paymentController";
import {
  dashboard as uniDashboard,
  addSeatController,
  removeSeatController,
  ssoController,
} from "../controllers/universityController";
import {
  verify as hocaVerifyCtrl,
  dashboard as hocaDashboard,
  feedback as hocaFeedback,
  profile as hocaProfile,
} from "../controllers/hocaController";

const router = Router();

// --- Tutor marketplace ---------------------------------------------------
router.post("/tutors", authenticate, asyncHandler(tutorApply));
router.get("/tutors/me", authenticate, asyncHandler(tutorGetMe));
router.get("/tutors/:id", asyncHandler(tutorGetById));
// Public preview: anonymous visitors can browse tutors with subject +
// rating + price filters. Signed-in students get the 20% DNA-embedding
// contribution on top of the classical rubric.
router.post("/tutors/match", optionalAuthenticate, asyncHandler(tutorMatch));

// --- Tutoring sessions ---------------------------------------------------
router.post(
  "/tutoring/sessions",
  authenticate,
  asyncHandler(bookSession)
);
router.get(
  "/tutoring/sessions/me",
  authenticate,
  asyncHandler(mySessions)
);
router.get(
  "/tutoring/sessions/:id",
  authenticate,
  asyncHandler(getSession)
);
router.post(
  "/tutoring/sessions/:id/complete",
  authenticate,
  asyncHandler(completeSession)
);

// --- Marketplace ---------------------------------------------------------
router.post(
  "/marketplace/items",
  authenticate,
  asyncHandler(createMarketplaceItem)
);
router.get("/marketplace/items", asyncHandler(listItems));
router.get("/marketplace/items/:id", asyncHandler(getItem));
router.post(
  "/marketplace/items/:id/purchase",
  authenticate,
  asyncHandler(purchase)
);

// --- Payments ------------------------------------------------------------
router.post("/payments/init", authenticate, asyncHandler(paymentInit));
// Webhook: public endpoint, HMAC-verified in the controller.
router.post("/payments/webhook/iyzico", asyncHandler(iyzicoWebhook));
router.get("/payments/me", authenticate, asyncHandler(myPayments));
router.post(
  "/payments/:id/refund",
  authenticate,
  requireRole(["SUPER_ADMIN"]),
  asyncHandler(refund)
);

// --- University admin ----------------------------------------------------
router.get(
  "/university/dashboard",
  authenticate,
  requireRole(["UNIVERSITY_ADMIN"]),
  asyncHandler(uniDashboard)
);
router.post(
  "/university/seats",
  authenticate,
  requireRole(["UNIVERSITY_ADMIN"]),
  asyncHandler(addSeatController)
);
router.delete(
  "/university/seats/:userId",
  authenticate,
  requireRole(["UNIVERSITY_ADMIN"]),
  asyncHandler(removeSeatController)
);
router.post(
  "/university/sso",
  authenticate,
  requireRole(["UNIVERSITY_ADMIN"]),
  asyncHandler(ssoController)
);

// --- Hoca portal ---------------------------------------------------------
router.post("/hoca/verify", authenticate, asyncHandler(hocaVerifyCtrl));
router.get(
  "/hoca/dashboard",
  authenticate,
  requireRole(["HOCA"]),
  asyncHandler(hocaDashboard)
);
router.get(
  "/hoca/feedback",
  authenticate,
  requireRole(["HOCA"]),
  asyncHandler(hocaFeedback)
);
router.get(
  "/hoca/profile",
  authenticate,
  requireRole(["HOCA"]),
  asyncHandler(hocaProfile)
);

export default router;
