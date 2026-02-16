
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { getGroupDetails, updateGroupMatchScore, updateBracketMatchScore, getBracketMatches } from "../controllers/matchController";

const router = Router();

// Group Match routes
router.get("/matches/:tournamentId", authMiddleware, getGroupDetails);
router.put("/group-matches/:matchId", authMiddleware, updateGroupMatchScore);

// Bracket Match routes
router.get("/bracket-matches/:tournamentId", authMiddleware, getBracketMatches);
router.put("/bracket-matches/:matchId", authMiddleware, updateBracketMatchScore);

export default router;
