import { Request, Response } from "express";
import { prisma } from "../services/prismaClient";
import crypto from "crypto";
import minioClient from "../config/minioManage";
import dotenv from "dotenv";

dotenv.config();
const BUCKET = process.env.MINIO_BUCKET!;

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
