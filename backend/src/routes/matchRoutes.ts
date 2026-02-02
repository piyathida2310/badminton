
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { getGroupDetails, updateMatchScore } from "../controllers/matchController";

const router = Router();

router.get("/matches/:tournamentId", authMiddleware, getGroupDetails);
router.put("/matches/:matchId", authMiddleware, updateMatchScore);

export default router;
