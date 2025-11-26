import { Request, Response } from "express";
import { prisma } from "../services/prismaClient";
import crypto from "crypto";
import minioClient from "../config/minioManage";
import dotenv from "dotenv";

dotenv.config();
const BUCKET = process.env.MINIO_BUCKET!;

const HAND_TYPE_LABELS: Record<string, string> = {
    BG: "BG",
    NB: "NB",
    N: "N",
    S: "S",
    P_MINUS: "P-",
    P_PLUS: "P+",
};

const MATCH_TYPE_LABELS: Record<string, string> = {
    SINGLE: "เดี่ยว",
    DOUBLE: "คู่",
};

const getSignedUrlOrNull = async (objectKey?: string | null) => {
    if (!objectKey) return null;
    try {
        return await minioClient.presignedGetObject(BUCKET, objectKey, 60 * 60);
    } catch (error) {
        console.error(`Failed to generate signed url for ${objectKey}:`, error);
        return null;
    }
};

export const createRegistration = async (req: Request, res: Response) => {
    try {
        const { tournamentId } = req.params;
        const {
            teamName,
            managerName,
            player1Name,
            player1Phone,
            player1Birthday,
            player2Name,
            player2Phone,
            player2Birthday,
            playType,
            mode,
        } = req.body;

        console.log("Registration request body:", req.body);
        console.log("Files received:", req.files);

        // Validate required fields
        if (!teamName || !managerName || !player1Name || !player1Phone || !player1Birthday || !playType) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        // Validate mode-specific requirements
        if (mode === "double" && (!player2Name || !player2Phone || !player2Birthday)) {
            return res.status(400).json({
                message: "Player 2 information is required for double mode",
            });
        }

        // Get video file if uploaded (optional)
        let videoUrl: string | null = null;

        // Check if files exist before accessing
        if (req.files && typeof req.files === 'object') {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const videoFile = files["video"]?.[0];

            if (videoFile) {
                try {
                    console.log("Processing video file:", videoFile.originalname, videoFile.mimetype, videoFile.size);
                    const videoExt = videoFile.originalname.split(".").pop() || "mp4";
                    const videoName = `${crypto.randomUUID()}.${videoExt}`;

                    await minioClient.putObject(
                        BUCKET,
                        videoName,
                        videoFile.buffer,
                        videoFile.size,
                        {
                            "Content-Type": videoFile.mimetype,
                        }
                    );

                    videoUrl = videoName;
                    console.log("Video uploaded successfully:", videoName);
                } catch (videoError) {
                    console.error("Video upload error:", videoError);
                    // Don't fail the entire registration if video upload fails
                    // Just log the error and continue without video
                }
            } else {
                console.log("No video file in request");
            }
        } else {
            console.log("No files uploaded (req.files is undefined)");
        }

        // Get userId from authenticated user
        const userId = Number(req.user.sub);

        // Prepare data for registration
        const registrationData: any = {
            userId,
            tournamentId: Number(tournamentId),
            teamName,
            playType,
            phoneNumber: player1Phone,
            videoUrl,
            status: "WAITING",
            managerName,
            player1Name,
            player1Birthday: player1Birthday ? new Date(player1Birthday) : null,
        };

        // Add player 2 data if mode is double
        if (mode === "double" && player2Name && player2Phone && player2Birthday) {
            registrationData.player2Name = player2Name;
            registrationData.player2Phone = player2Phone;
            registrationData.player2Birthday = new Date(player2Birthday);
        }

        // Create registration
        const registration = await prisma.register.create({
            data: registrationData,
        });

        console.log("Registration created successfully:", registration.id);

        return res.status(201).json({
            message: "Registration created successfully",
            data: registration,
        });
    } catch (error) {
        console.error("Create Registration Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};

export const getRegistrationsByTournament = async (req: Request, res: Response) => {
    try {
        const { tournamentId } = req.params;

        const registrations = await prisma.register.findMany({
            where: {
                tournamentId: Number(tournamentId),
            },
            include: {
                user: true,
                payment: true,
            },
        });

        return res.status(200).json({
            message: "Registrations fetched successfully",
            data: registrations,
        });
    } catch (error) {
        console.error("Get Registrations Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};

export const getUserRegistrations = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user.sub);

        const registrations = await prisma.register.findMany({
            where: {
                userId,
            },
            include: {
                tournament: true,
                payment: true,
            },
        });

        return res.status(200).json({
            message: "User registrations fetched successfully",
            data: registrations,
        });
    } catch (error) {
        console.error("Get User Registrations Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};

export const getTournamentApplicantsForOrganizer = async (req: Request, res: Response) => {
    try {
        const { tournamentId } = req.params;
        const rawUserId = req.query.userId as string | undefined;

        if (!tournamentId) {
            return res.status(400).json({
                message: "Tournament ID is required",
            });
        }

        const parsedTournamentId = Number(tournamentId);

        if (Number.isNaN(parsedTournamentId)) {
            return res.status(400).json({
                message: "Invalid tournamentId. It must be a number.",
            });
        }

        const organizerId = Number(req.user.sub);
        const tournament = await prisma.tournament.findUnique({
            where: { id: parsedTournamentId },
            select: { id: true, organizerId: true, playType: true, name: true },
        });

        if (!tournament) {
            return res.status(404).json({
                message: "Tournament not found",
            });
        }

        // Authorization: only organizer can view applicants
        if (req.user.role !== "ORGANIZER" || tournament.organizerId !== organizerId) {
            return res.status(403).json({
                message: "Forbidden: only the tournament organizer can view applicants",
            });
        }

        const whereClause: { tournamentId: number; userId?: number } = {
            tournamentId: parsedTournamentId,
        };

        if (rawUserId !== undefined) {
            const parsedUserId = Number(rawUserId);
            if (Number.isNaN(parsedUserId)) {
                return res.status(400).json({
                    message: "Invalid userId. It must be a number.",
                });
            }
            whereClause.userId = parsedUserId;
        }

        const registrations = await prisma.register.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
                payment: true,
                tournament: {
                    select: {
                        playType: true,
                    },
                },
            },
            orderBy: {
                id: "desc",
            },
        });

        const applicants = await Promise.all(
            registrations.map(async (registration) => {
                const videoUrl = await getSignedUrlOrNull(registration.videoUrl);
                const slipUrl = await getSignedUrlOrNull(registration.payment?.slipImg);

                return {
                    registrationId: registration.id,
                    tournamentId: registration.tournamentId,
                    tournamentName: tournament.name,
                    userId: registration.userId,
                    user: registration.user,
                    teamName: registration.teamName,
                    managerName: registration.managerName,
                    players: [
                        {
                            name: registration.player1Name,
                            phoneNumber: registration.phoneNumber,
                            birthday: registration.player1Birthday,
                        },
                        registration.tournament.playType === "DOUBLE"
                            ? {
                                name: registration.player2Name,
                                phoneNumber: registration.player2Phone,
                                birthday: registration.player2Birthday,
                            }
                            : undefined,
                    ].filter((player): player is NonNullable<typeof player> => Boolean(player)),
                    rank: registration.playType,
                    rankLabel: HAND_TYPE_LABELS[registration.playType] || registration.playType,
                    matchType: registration.tournament.playType,
                    matchTypeLabel:
                        MATCH_TYPE_LABELS[registration.tournament.playType] || registration.tournament.playType,
                    status: {
                        evaluation: registration.status,
                        score: registration.score,
                        comment: registration.comment,
                    },
                    payment: registration.payment
                        ? {
                            status: registration.payment.status,
                            slipUrl,
                            slipObjectKey: registration.payment.slipImg,
                        }
                        : null,
                    media: {
                        videoUrl,
                        videoObjectKey: registration.videoUrl,
                    },
                };
            })
        );

        return res.status(200).json({
            message: "Tournament applicants fetched successfully",
            data: {
                tournament: {
                    id: tournament.id,
                    name: tournament.name,
                    playType: tournament.playType,
                },
                applicants,
                meta: {
                    filters: {
                        tournamentId: parsedTournamentId,
                        userId: whereClause.userId ?? null,
                    },
                    total: applicants.length,
                },
            },
        });
    } catch (error) {
        console.error("Get Tournament Applicants Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};

// Update registration evaluation (score, comment, status)
export const updateRegistrationEvaluation = async (req: Request, res: Response) => {
    try {
        const { registrationId } = req.params;
        const { score, comment, status } = req.body;

        if (!registrationId) {
            return res.status(400).json({
                message: "Registration ID is required",
            });
        }

        const parsedRegistrationId = Number(registrationId);
        if (Number.isNaN(parsedRegistrationId)) {
            return res.status(400).json({
                message: "Invalid registration ID",
            });
        }

        // Get registration with tournament info
        const registration = await prisma.register.findUnique({
            where: { id: parsedRegistrationId },
            include: {
                tournament: {
                    select: { organizerId: true },
                },
            },
        });

        if (!registration) {
            return res.status(404).json({
                message: "Registration not found",
            });
        }

        // Check if user is the tournament organizer
        const organizerId = Number(req.user.sub);
        if (req.user.role !== "ORGANIZER" || registration.tournament.organizerId !== organizerId) {
            return res.status(403).json({
                message: "Forbidden: only the tournament organizer can update evaluations",
            });
        }

        // Update registration
        const updateData: any = {};
        if (score !== undefined) updateData.score = Number(score);
        if (comment !== undefined) updateData.comment = comment;
        if (status !== undefined) updateData.status = status;

        const updatedRegistration = await prisma.register.update({
            where: { id: parsedRegistrationId },
            data: updateData,
        });

        return res.status(200).json({
            message: "Registration evaluation updated successfully",
            data: updatedRegistration,
        });
    } catch (error) {
        console.error("Update Registration Evaluation Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};

// Update payment status
export const updatePaymentStatus = async (req: Request, res: Response) => {
    try {
        const { registrationId } = req.params;
        const { status } = req.body;

        if (!registrationId) {
            return res.status(400).json({
                message: "Registration ID is required",
            });
        }

        if (!status || !["PENDING", "CONFIRMED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                message: "Invalid payment status",
            });
        }

        const parsedRegistrationId = Number(registrationId);
        if (Number.isNaN(parsedRegistrationId)) {
            return res.status(400).json({
                message: "Invalid registration ID",
            });
        }

        // Get registration with tournament info
        const registration = await prisma.register.findUnique({
            where: { id: parsedRegistrationId },
            include: {
                tournament: {
                    select: { organizerId: true },
                },
                payment: true,
            },
        });

        if (!registration) {
            return res.status(404).json({
                message: "Registration not found",
            });
        }

        // Check if user is the tournament organizer
        const organizerId = Number(req.user.sub);
        if (req.user.role !== "ORGANIZER" || registration.tournament.organizerId !== organizerId) {
            return res.status(403).json({
                message: "Forbidden: only the tournament organizer can update payment status",
            });
        }

        // Update or create payment record
        let payment;
        if (registration.payment) {
            payment = await prisma.payment.update({
                where: { registerId: parsedRegistrationId },
                data: {
                    status,
                    confirmedById: organizerId,
                },
            });
        } else {
            payment = await prisma.payment.create({
                data: {
                    registerId: parsedRegistrationId,
                    status,
                    confirmedById: organizerId,
                },
            });
        }

        return res.status(200).json({
            message: "Payment status updated successfully",
            data: payment,
        });
    } catch (error) {
        console.error("Update Payment Status Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};

// Upload payment slip
export const uploadPaymentSlip = async (req: Request, res: Response) => {
    try {
        const { registrationId } = req.params;

        if (!registrationId) {
            return res.status(400).json({
                message: "Registration ID is required",
            });
        }

        const parsedRegistrationId = Number(registrationId);
        if (Number.isNaN(parsedRegistrationId)) {
            return res.status(400).json({
                message: "Invalid registration ID",
            });
        }

        // Get registration
        const registration = await prisma.register.findUnique({
            where: { id: parsedRegistrationId },
            include: { payment: true },
        });

        if (!registration) {
            return res.status(404).json({
                message: "Registration not found",
            });
        }

        // Check if user owns this registration
        const userId = Number(req.user.sub);
        if (registration.userId !== userId) {
            return res.status(403).json({
                message: "Forbidden: you can only upload payment slip for your own registration",
            });
        }

        // Get slip image from upload
        let slipUrl: string | null = null;

        if (req.files && typeof req.files === 'object') {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const slipFile = files["slip"]?.[0];

            if (slipFile) {
                try {
                    const slipExt = slipFile.originalname.split(".").pop() || "jpg";
                    const slipName = `${crypto.randomUUID()}.${slipExt}`;

                    await minioClient.putObject(
                        BUCKET,
                        slipName,
                        slipFile.buffer,
                        slipFile.size,
                        {
                            "Content-Type": slipFile.mimetype,
                        }
                    );

                    slipUrl = slipName;
                } catch (uploadError) {
                    console.error("Slip upload error:", uploadError);
                    return res.status(500).json({
                        message: "Failed to upload payment slip",
                    });
                }
            }
        }

        if (!slipUrl) {
            return res.status(400).json({
                message: "Payment slip image is required",
            });
        }

        // Update or create payment record
        let payment;
        if (registration.payment) {
            payment = await prisma.payment.update({
                where: { registerId: parsedRegistrationId },
                data: {
                    slipImg: slipUrl,
                    status: "PENDING",
                },
            });
        } else {
            payment = await prisma.payment.create({
                data: {
                    registerId: parsedRegistrationId,
                    slipImg: slipUrl,
                    status: "PENDING",
                },
            });
        }

        return res.status(200).json({
            message: "Payment slip uploaded successfully",
            data: payment,
        });
    } catch (error) {
        console.error("Upload Payment Slip Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};
