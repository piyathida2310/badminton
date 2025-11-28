import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";
import { uploadVideo } from "../middleware/uploadVideo";
import {
    createRegistration,
    getRegistrationsByTournament,
    getUserRegistrations,
    getTournamentApplicantsForOrganizer,
    updateRegistrationEvaluation,
    updatePaymentStatus,
    uploadPaymentSlip,
    getPaymentSlip,
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

// Get registrations with user/payment details for organizer dashboard
router.get(
    "/tournament/:tournamentId/applicants",
    authMiddleware,
    getTournamentApplicantsForOrganizer
);

// Get all registrations for the authenticated user
router.get("/user/registrations", authMiddleware, getUserRegistrations);

// Update registration evaluation (score, comment, status) - Organizer only
router.patch(
    "/registration/:registrationId/evaluation",
    authMiddleware,
    updateRegistrationEvaluation
);

// Update payment status - Organizer only
router.patch(
    "/registration/:registrationId/payment/status",
    authMiddleware,
    updatePaymentStatus
);

// Upload payment slip - User only
router.post(
    "/registration/:registrationId/payment/slip",
    authMiddleware,
    upload.fields([{ name: "slip" }]),
    uploadPaymentSlip
);

// Get payment slip URL - User only
router.get(
    "/payment/slip/:registrationId",
    authMiddleware,
    getPaymentSlip
);

export default router;
