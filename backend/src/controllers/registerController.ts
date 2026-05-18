import { Request, Response } from "express";
import { prisma } from "../services/prismaClient";
import crypto from "crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import S3Client from "../config/minioManage";
import dotenv from "dotenv";

dotenv.config();

const BUCKET = process.env.MINIO_BUCKET!;
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT!; // http://localhost:9000

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

//  สร้าง URL ถาวรสำหรับเก็บลง DB
function buildPublicObjectUrl(key: string) {
  const base = MINIO_ENDPOINT.replace(/\/+$/, "");
  return `${base}/${BUCKET}/${encodeURIComponent(key)}`;
}

//  ดึง key ออกจากค่าที่ "อาจเป็น URL หรือ key เดิม"
function extractKeyFromMaybeUrl(value?: string | null) {
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    const marker = `/${BUCKET}/`;
    const idx = value.indexOf(marker);
    if (idx !== -1) {
      const keyPart = value.substring(idx + marker.length);
      return decodeURIComponent(keyPart);
    }
  }

  return value;
}

//  ทำ presigned url (รองรับทั้ง DB เก็บเป็น URL หรือ key เดิม)
const getSignedUrlOrNull = async (objectValue?: string | null) => {
  if (!objectValue) return null;

  try {
    const key = extractKeyFromMaybeUrl(objectValue);
    if (!key) return null;

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    return await getSignedUrl(S3Client, command, {
      expiresIn: 60 * 60, // 1 ชั่วโมง
    });
  } catch (error) {
    console.error(`Failed to generate signed url for ${objectValue}:`, error);
    return null;
  }
};

const getUserId = (req: Request) => Number((req as any).user?.sub);
const getUserRole = (req: Request) => (req as any).user?.role;

// ================================
// 1) POST /tournament/:tournamentId/register
// ================================
export const createRegistration = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const {
      teamName,
      managerName,
      player1Name,
      player1Phone,
      player1Gender,
      player1Birthday,
      player2Name,
      player2Phone,
      player2Gender,
      player2Birthday,
      playType,
      mode,
    } = req.body;

    if (!teamName || !managerName || !player1Name || !player1Phone || !player1Birthday || !playType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (mode === "double" && (!player2Name || !player2Phone || !player2Birthday)) {
      return res.status(400).json({ message: "Player 2 information is required for double mode" });
    }

    const parsedTournamentId = Number(tournamentId);
    if (Number.isNaN(parsedTournamentId)) {
      return res.status(400).json({ message: "Invalid tournament ID" });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: parsedTournamentId },
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const registrationCount = await prisma.register.count({
      where: {
        tournamentId: parsedTournamentId,
        status: { not: "FAILED" },
        playType: playType // Count specific playType (category) only
      },
    });

    if (registrationCount >= tournament.maxPlayers) {
      return res.status(400).json({ message: `Registration is full for category ${playType}` });
    }

    //  videoUrl ใน DB จะเก็บเป็น URL ถาวร
    let videoUrl: string | null = null;

    if (req.files && typeof req.files === "object") {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const videoFile = files["video"]?.[0];

      if (videoFile) {
        if (!videoFile.buffer) {
          return res.status(400).json({
            message: "Video buffer not found. Please set multer to memoryStorage().",
          });
        }

        const videoExt = videoFile.originalname.split(".").pop() || "mp4";
        const videoName = `${crypto.randomUUID()}.${videoExt}`;

        await S3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: videoName,
            Body: videoFile.buffer,
            ContentType: videoFile.mimetype,
          })
        );

        //  เก็บ URL ลง DB
        // videoUrl = buildPublicObjectUrl(videoName);
        videoUrl = videoName; // New: Store only Key
      }
    }

    const userId = getUserId(req);

    const registrationData: any = {
      userId,
      tournamentId: parsedTournamentId,
      teamName,
      playType,
      phoneNumber: player1Phone,
      videoUrl, //  URL
      status: "WAITING",
      managerName,
      player1Name,
      player1Gender: player1Gender ? (player1Gender as string).toUpperCase() : null,
      player1Birthday: player1Birthday ? new Date(player1Birthday) : null,
    };

    if (mode === "double" && player2Name && player2Phone && player2Birthday) {
      registrationData.player2Name = player2Name;
      registrationData.player2Phone = player2Phone;
      registrationData.player2Gender = player2Gender ? (player2Gender as string).toUpperCase() : null;
      registrationData.player2Birthday = new Date(player2Birthday);
    }

    const registration = await prisma.register.create({ data: registrationData });

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

// ================================
// 2) GET /tournament/:tournamentId/registrations
// ================================
export const getRegistrationsByTournament = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const parsedTournamentId = Number(tournamentId);
    if (Number.isNaN(parsedTournamentId)) {
      return res.status(400).json({ message: "Invalid tournamentId" });
    }

    const registrations = await prisma.register.findMany({
      where: { tournamentId: parsedTournamentId },
      include: { user: true, payment: true, cancellation: true },
      orderBy: { id: "desc" },
    });

    //  ใส่ signed url ให้พร้อมใช้ (ถ้าหน้าไหนต้องแสดง)
    const enriched = await Promise.all(
      registrations.map(async (r) => {
        const videoSignedUrl = await getSignedUrlOrNull(r.videoUrl);
        const slipSignedUrl = await getSignedUrlOrNull(r.payment?.slipImg);
        return {
          ...r,
          media: { videoUrl: videoSignedUrl ?? r.videoUrl ?? null },
          paymentMedia: { slipUrl: slipSignedUrl ?? r.payment?.slipImg ?? null },
        };
      })
    );

    return res.status(200).json({
      message: "Registrations fetched successfully",
      data: enriched,
    });
  } catch (error) {
    console.error("Get Registrations Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// ================================
// 3) GET /user/registrations
// ================================
export const getUserRegistrations = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const registrations = await prisma.register.findMany({
      where: { userId },
      include: { tournament: true, payment: true, cancellation: true },
      orderBy: { id: "desc" },
    });

    const enriched = await Promise.all(
      registrations.map(async (r) => {
        const videoSignedUrl = await getSignedUrlOrNull(r.videoUrl);
        const slipSignedUrl = await getSignedUrlOrNull(r.payment?.slipImg);
        // สร้าง signed URL สำหรับ QR Code / Refund Slip จากตาราง CancellationRequest
        const cancellation = r.cancellation ? {
          ...r.cancellation,
          qrCodeUrl: await getSignedUrlOrNull(r.cancellation.qrCode),
          refundSlipUrl: await getSignedUrlOrNull(r.cancellation.refundSlip),
        } : null;
        return {
          ...r,
          cancellation,
          media: { videoUrl: videoSignedUrl ?? r.videoUrl ?? null },
          paymentMedia: { slipUrl: slipSignedUrl ?? r.payment?.slipImg ?? null },
        };
      })
    );

    return res.status(200).json({
      message: "User registrations fetched successfully",
      data: enriched,
    });
  } catch (error) {
    console.error("Get User Registrations Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// ================================
// 4) GET /tournament/:tournamentId/applicants
// ================================
export const getTournamentApplicantsForOrganizer = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;

    const parsedTournamentId = Number(tournamentId);
    if (Number.isNaN(parsedTournamentId)) {
      return res.status(400).json({ message: "Invalid tournamentId. It must be a number." });
    }

    const organizerId = getUserId(req);

    const tournament = await prisma.tournament.findUnique({
      where: { id: parsedTournamentId },
      select: { id: true, organizerId: true, playType: true, name: true, rank: true },
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (getUserRole(req) !== "ORGANIZER" || tournament.organizerId !== organizerId) {
      return res.status(403).json({
        message: "Forbidden: only the tournament organizer can view applicants",
      });
    }

    const registrations = await prisma.register.findMany({
      where: { tournamentId: parsedTournamentId },
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
        cancellation: true,
      },
      orderBy: { id: "desc" },
    });

    const applicants = await Promise.all(
      registrations.map(async (registration) => {
        //  ส่ง signed เป็นหลัก (รูป/วิดีโอมาชัวร์)
        const videoSignedUrl = await getSignedUrlOrNull(registration.videoUrl);
        const slipSignedUrl = await getSignedUrlOrNull(registration.payment?.slipImg);

        const isDouble = Boolean(registration.player2Name);

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
              gender: registration.player1Gender, // เพิ่มเพศ
            },
            isDouble
              ? {
                name: registration.player2Name,
                phoneNumber: registration.player2Phone,
                birthday: registration.player2Birthday,
                gender: registration.player2Gender, //เพิ่มเพศ
              }
              : undefined,
          ].filter(Boolean),
          rank: registration.playType,
          rankLabel: HAND_TYPE_LABELS[registration.playType] || registration.playType,
          matchType: isDouble ? "DOUBLE" : "SINGLE",
          matchTypeLabel: isDouble ? MATCH_TYPE_LABELS.DOUBLE : MATCH_TYPE_LABELS.SINGLE,
          status: {
            evaluation: registration.status,
            score: registration.score,
            comment: registration.comment,
          },
          payment: registration.payment
            ? {
              status: registration.payment.status,
              // เอา signed เป็น slipUrl หลัก
              slipUrl: slipSignedUrl ?? registration.payment.slipImg ?? null,
              slipPublicUrl: registration.payment.slipImg ?? null,
            }
            : null,
          media: {
            // เอา signed เป็น videoUrl หลัก
            videoUrl: videoSignedUrl ?? registration.videoUrl ?? null,
            videoPublicUrl: registration.videoUrl ?? null,
          },
          // ข้อมูลการยกเลิก/คืนเงิน จากตาราง CancellationRequest
          cancellationStatus: registration.cancellation?.status ?? null,
          cancelReason: registration.cancellation?.reason ?? null,
          refundBankName: registration.cancellation?.bankName ?? null,
          refundAccountNum: registration.cancellation?.accountNum ?? null,
          refundAccountName: registration.cancellation?.accountName ?? null,
          refundQrUrl: await getSignedUrlOrNull(registration.cancellation?.qrCode ?? null),
          refundSlipUrl: await getSignedUrlOrNull(registration.cancellation?.refundSlip ?? null),
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
          ranks: tournament.rank,
        },
        applicants,
        meta: { total: applicants.length },
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

// ================================
// 5) PATCH /registration/:registrationId/evaluation
// ================================
export const updateRegistrationEvaluation = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;
    const { score, comment, status } = req.body;

    const parsedRegistrationId = Number(registrationId);
    if (Number.isNaN(parsedRegistrationId)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    const registration = await prisma.register.findUnique({
      where: { id: parsedRegistrationId },
      include: { tournament: { select: { organizerId: true } } },
    });

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const organizerId = getUserId(req);
    const userRole = getUserRole(req);

    // Debug Log สำหรับตรวจสอบปัญหา 403
    console.log(`[Debug Auth] UserID: ${organizerId}, Role: ${userRole}`);
    console.log(`[Debug Tournament] Target OrganizerID: ${registration.tournament.organizerId}`);

    if (String(userRole).toUpperCase() !== "ORGANIZER" || Number(registration.tournament.organizerId) !== Number(organizerId)) {
      return res.status(403).json({
        message: "Forbidden: only the tournament organizer can update evaluations",
        debug: {
          yourRole: userRole,
          yourId: organizerId,
          ownerId: registration.tournament.organizerId
        }
      });
    }

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

// ================================
// 6) PATCH /registration/:registrationId/payment/status
// ================================
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;

    if (!status || !["PENDING", "CONFIRMED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const parsedRegistrationId = Number(registrationId);
    if (Number.isNaN(parsedRegistrationId)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    const registration = await prisma.register.findUnique({
      where: { id: parsedRegistrationId },
      include: {
        tournament: { select: { organizerId: true } },
        payment: true,
      },
    });

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const organizerId = getUserId(req);
    if (getUserRole(req) !== "ORGANIZER" || registration.tournament.organizerId !== organizerId) {
      return res.status(403).json({
        message: "Forbidden: only the tournament organizer can update payment status",
      });
    }

    let payment;
    if (registration.payment) {
      payment = await prisma.payment.update({
        where: { registerId: parsedRegistrationId },
        data: { status, confirmedById: organizerId },
      });
    } else {
      payment = await prisma.payment.create({
        data: { registerId: parsedRegistrationId, status, confirmedById: organizerId },
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

// ================================
// 7) POST /registration/:registrationId/payment/slip
// ================================
export const uploadPaymentSlip = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;

    const parsedRegistrationId = Number(registrationId);
    if (Number.isNaN(parsedRegistrationId)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    const registration = await prisma.register.findUnique({
      where: { id: parsedRegistrationId },
      include: { payment: true },
    });

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const userId = getUserId(req);
    if (registration.userId !== userId) {
      return res.status(403).json({
        message: "Forbidden: you can only upload payment slip for your own registration",
      });
    }

    let slipUrl: string | null = null;

    if (req.files && typeof req.files === "object") {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const slipFile = files["slip"]?.[0];

      if (slipFile) {
        if (!slipFile.buffer) {
          return res.status(400).json({
            message: "Slip buffer not found. Please set multer to memoryStorage().",
          });
        }

        const slipExt = slipFile.originalname.split(".").pop() || "jpg";
        const slipName = `${crypto.randomUUID()}.${slipExt}`;

        await S3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: slipName,
            Body: slipFile.buffer,
            ContentType: slipFile.mimetype,
          })
        );

        // เก็บ Key (filename) ลง DB เท่านั้น (เพื่อให้เหมือน posterImg)
        // เดิม: slipUrl = buildPublicObjectUrl(slipName);
        slipUrl = slipName;
      }
    }

    if (!slipUrl) {
      return res.status(400).json({ message: "Payment slip image is required" });
    }

    let payment;
    if (registration.payment) {
      payment = await prisma.payment.update({
        where: { registerId: parsedRegistrationId },
        data: { slipImg: slipUrl, status: "PENDING" },
      });
    } else {
      payment = await prisma.payment.create({
        data: { registerId: parsedRegistrationId, slipImg: slipUrl, status: "PENDING" },
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

// ================================
// 8) GET /payment/slip/:registrationId
// ================================
export const getPaymentSlip = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;

    const parsedRegistrationId = Number(registrationId);
    if (Number.isNaN(parsedRegistrationId)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    const registration = await prisma.register.findUnique({
      where: { id: parsedRegistrationId },
      include: { payment: true },
    });

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const userId = getUserId(req);
    if (registration.userId !== userId) {
      return res.status(403).json({
        message: "Forbidden: you can only view payment slip for your own registration",
      });
    }

    if (!registration.payment?.slipImg) {
      return res.status(404).json({ message: "Payment slip not found" });
    }

    const publicUrl = registration.payment.slipImg;
    const signedUrl = await getSignedUrlOrNull(publicUrl);

    return res.status(200).json({
      message: "Payment slip fetched successfully",
      //  สำคัญ: ให้ frontend ใช้ signed เป็นหลัก (รูปมาชัวร์)
      url: signedUrl ?? publicUrl,
      publicUrl,
      signedUrl,
    });
  } catch (error) {
    console.error("Get Payment Slip Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// ================================
// 9) POST /registration/:registrationId/cancel
// ================================
export const requestCancellation = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;
    const { reason, bankName, accountNum, accountName } = req.body;
    const parsedId = Number(registrationId);
    if (Number.isNaN(parsedId)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    const registration = await prisma.register.findUnique({
      where: { id: parsedId },
      include: { payment: true, cancellation: true },
    });
    if (!registration) return res.status(404).json({ message: "Registration not found" });
    if (registration.cancellation) return res.status(400).json({ message: "คำขอยกเลิกมีอยู่แล้ว" });

    const userId = getUserId(req);
    if (registration.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    const isPaid = registration.payment?.status === "CONFIRMED";

    // สร้าง record ในตาราง CancellationRequest
    const cancellation = await prisma.cancellationRequest.create({
      data: {
        registerId: parsedId,
        reason: reason || null,
        status: "REQUESTED",
      },
    });

    return res.status(200).json({ message: "ส่งคำขอยกเลิกสำเร็จ", data: cancellation });
  } catch (error) {
    console.error("Request Cancellation Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================================
// 10) GET /tournament/:tournamentId/cancellations
// ================================
export const getTournamentCancellations = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const organizerId = getUserId(req);
    const tournament = await prisma.tournament.findUnique({ where: { id: Number(tournamentId) } });
    if (!tournament) return res.status(404).json({ message: "Tournament not found" });
    if (tournament.organizerId !== organizerId) return res.status(403).json({ message: "Forbidden" });

    const cancellations = await prisma.cancellationRequest.findMany({
      where: { register: { tournamentId: Number(tournamentId) } },
      include: { register: { include: { user: true, payment: true } } },
      orderBy: { createdAt: "desc" },
    });

    const enriched = await Promise.all(cancellations.map(async (c) => {
      const qrUrl = await getSignedUrlOrNull(c.qrCode);
      const slipUrl = await getSignedUrlOrNull(c.refundSlip);
      return { ...c, refundQrUrl: qrUrl, refundSlipUrl: slipUrl };
    }));

    return res.status(200).json({ data: enriched });
  } catch (error) {
    console.error("Get Cancellations Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================================
// 11) PATCH /registration/:registrationId/refund
// ================================
export const processRefund = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;
    const parsedId = Number(registrationId);

    const registration = await prisma.register.findUnique({
      where: { id: parsedId },
      include: { tournament: true, cancellation: true },
    });
    if (!registration) return res.status(404).json({ message: "Registration not found" });

    // ถ้ายังไม่มี CancellationRequest สร้างอัตโนมัติ (กรณีข้อมูลเก่า)
    if (!registration.cancellation) {
      await prisma.cancellationRequest.create({
        data: { registerId: parsedId, status: "REQUESTED" },
      });
    }

    const organizerId = getUserId(req);
    if (registration.tournament.organizerId !== organizerId) return res.status(403).json({ message: "Forbidden" });

    if (!["REFUNDED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // อัปเดตตาราง CancellationRequest
    const updatedCancellation = await prisma.cancellationRequest.update({
      where: { registerId: parsedId },
      data: { status },
    });

    // ไม่ว่าจะคืนเงิน (REFUNDED) หรือไม่คืนเงิน (REJECTED) ให้ถือว่าสละสิทธิ์และยกเลิกการสมัคร (FAILED) เพื่อคืนที่นั่งให้คนอื่น
    await prisma.register.update({ where: { id: parsedId }, data: { status: "FAILED" } });

    return res.status(200).json({ message: "อัปเดตสถานะสำเร็จ", data: updatedCancellation });
  } catch (error) {
    console.error("Process Refund Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
