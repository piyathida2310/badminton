import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";
import { createTournament, getTournaments, getTournament, getPoster, getQr, updateTournament, managegroup, updateManualGroups, getPaymentQr, cancelTournamentRank } from "../controllers/tournamentController"

const router = Router();

router.get("/", authMiddleware, getTournaments);
router.get("/:id", authMiddleware, getTournament);
router.get("/poster/:id", authMiddleware, getPoster);
router.get("/qr/:id", authMiddleware, getQr);
router.get("/payment/qr/:id", authMiddleware, getPaymentQr);
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "posterImg" },
    { name: "qrCodeImg" },
  ]), createTournament
);
router.put("/:id", authMiddleware, updateTournament);
router.put("/cancel-rank/:id", authMiddleware, cancelTournamentRank);
router.post("/managegroup/:id", authMiddleware, managegroup);


export default router;
