import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";
import {createTournament,getTournaments,getTournament,getPoster,getQr,updateTournament,managegroup} from "../controllers/tournamentController"

const router = Router();

router.get("/tournament", authMiddleware,getTournaments);
router.get("/tournament/:id", authMiddleware,getTournament);
router.get("/tournament/poster/:id", authMiddleware,getPoster);
router.get("/tournament/qr/:id", authMiddleware,getQr);
router.post(
  "/tournament",
  authMiddleware,
  upload.fields([
    { name: "posterImg" },
    { name: "qrCodeImg" },
  ]),createTournament
);
router.put("/tournament/:id", authMiddleware,updateTournament);
router.post("/tournament/managegroup/:id", authMiddleware,managegroup);


export default router;
