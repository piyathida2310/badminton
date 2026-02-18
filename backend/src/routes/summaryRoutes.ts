
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { getTournamentSummary, refreshTournamentSummaryEndpoint } from "../controllers/summaryController";

const router = Router();

// GET summary for a specific tournament
router.get("/summary/:tournamentId", authMiddleware, getTournamentSummary);

// POST manual refresh of the summary (Admin only ideally, but using authMiddleware for now)
router.post("/summary/:tournamentId/refresh", authMiddleware, refreshTournamentSummaryEndpoint);

export default router;
