import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware";
import {
  approvalDailyLimiter,
  voteDailyLimiter,
  reportDailyLimiter,
  groupJoinDailyLimiter,
} from "../middleware/rateLimitMiddleware";

import * as creditCtrl from "../controllers/creditController";
import * as approvalCtrl from "../controllers/examApprovalController";
import * as voteCtrl from "../controllers/questionVoteController";
import * as reportCtrl from "../controllers/postExamReportController";
import * as groupCtrl from "../controllers/studyGroupController";

const router = Router();

// ===== Credits =====
router.get("/credits/balance", authenticate, creditCtrl.getBalanceController);
router.get("/credits/history", authenticate, creditCtrl.getHistoryController);

// ===== Exam approvals =====
router.get(
  "/exams/pending-approval",
  authenticate,
  approvalCtrl.listPendingController
);
router.post(
  "/exams/:id/approve",
  authenticate,
  approvalDailyLimiter,
  approvalCtrl.castApprovalController
);
router.get(
  "/exams/:id/approval-stats",
  authenticate,
  approvalCtrl.getApprovalStatsController
);

// ===== Question votes =====
router.get("/questions/verified", voteCtrl.verifiedPoolController);
router.get("/questions/:id/stats", authenticate, voteCtrl.getStatsController);
router.post(
  "/questions/:id/vote",
  authenticate,
  voteDailyLimiter,
  voteCtrl.castVoteController
);
router.post(
  "/questions/:id/came-on-exam",
  authenticate,
  voteDailyLimiter,
  voteCtrl.markCameOnExamController
);

// ===== Post-exam reports =====
router.post(
  "/post-exam-reports",
  authenticate,
  reportDailyLimiter,
  reportCtrl.submitReportController
);
router.get(
  "/post-exam-reports/professor/:professorId",
  reportCtrl.getAggregatedController
);
router.get(
  "/professors/:professorId/high-performer-strategy",
  reportCtrl.getHighPerformerController
);

// ===== Study groups =====
router.get("/study-groups/mine", authenticate, groupCtrl.listMineController);
router.get(
  "/study-groups/suggestions/:professorId",
  authenticate,
  groupCtrl.listSuggestionsController
);
router.post(
  "/study-groups/matchmake",
  authenticate,
  groupJoinDailyLimiter,
  groupCtrl.joinMatchmakingController
);
router.post(
  "/study-groups/:id/link",
  authenticate,
  groupJoinDailyLimiter,
  groupCtrl.submitLinkController
);

export default router;
