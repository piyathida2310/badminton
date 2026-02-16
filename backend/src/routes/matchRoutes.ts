
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { getGroupDetails, updateGroupMatchScore, updateBracketMatchScore } from "../controllers/matchController";

const router = Router();

// Group Match routes
router.get("/matches/:tournamentId", authMiddleware, getGroupDetails);
router.put("/group-matches/:matchId", authMiddleware, updateGroupMatchScore);

// Bracket Match routes
router.put("/bracket-matches/:matchId", authMiddleware, updateBracketMatchScore);

export default router;
