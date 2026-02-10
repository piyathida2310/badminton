import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";
import { createTournament, getTournaments, getTournament, getPoster, getQr, updateTournament, managegroup, getPaymentQr, cancelTournamentRank } from "../controllers/tournamentController"

const router = Router();

router.get("/tournament", authMiddleware, getTournaments);
router.get("/tournament/:id", authMiddleware, getTournament);
router.get("/tournament/poster/:id", authMiddleware, getPoster);
router.get("/tournament/qr/:id", authMiddleware, getQr);
router.get("/payment/qr/:id", authMiddleware, getPaymentQr);
router.post(
  "/tournament",
  authMiddleware,
  upload.fields([
    { name: "posterImg" },
    { name: "qrCodeImg" },
  ]), createTournament
);
router.put("/tournament/:id", authMiddleware, updateTournament);
router.put("/tournament/cancel-rank/:id", authMiddleware, cancelTournamentRank);
router.post("/tournament/managegroup/:id", authMiddleware, managegroup);


export default router;
