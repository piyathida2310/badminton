import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";
import { uploadVideo } from "../middleware/uploadVideo";
import {
    createRegistration,
    getRegistrationsByTournament,
    getUserRegistrations,
} from "../controllers/registerController";

const router = Router();

// Create a new registration for a tournament
router.post(
    "/tournament/:tournamentId/register",
    authMiddleware,
    uploadVideo.fields([{ name: "video" }]),
    createRegistration
);

// Get all registrations for a specific tournament
router.get(
    "/tournament/:tournamentId/registrations",
    authMiddleware,
    getRegistrationsByTournament
);

// Get all registrations for the authenticated user
router.get("/user/registrations", authMiddleware, getUserRegistrations);

export default router;
