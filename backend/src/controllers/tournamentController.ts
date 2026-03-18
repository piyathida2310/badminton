
import { Request, Response } from "express";
import { tournamentSchema } from "../models/tournamentModels";
import { ZodError } from "zod";
import { prisma } from "../services/prismaClient";
import crypto from "crypto";
import { signGetObjectUrl, uploadFileToS3 } from "../services/storageService";
import { organizeTournamentGroups } from "../services/groupingService";
import { getGroupColor, getGroupHeaderColor } from "../utils/groupUtils";

export const createTournament = async (req: Request, res: Response) => {
  try {
    // 1) ตรวจสอบข้อมูล body ด้วย Zod
    if (typeof req.body.rank === "string") {
      try {
        req.body.rank = JSON.parse(req.body.rank);
      } catch (e) {
        console.error("Rank parse error:", e);
      }
    }

    const validatedData = tournamentSchema.parse(req.body);

    // 2) ดึงไฟล์ออกจาก req.files
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const posterFile = files?.["posterImg"]?.[0];
    const qrFile = files?.["qrCodeImg"]?.[0];

    if (!posterFile || !qrFile) {
      return res.status(400).json({
        message: "Both posterImg and qrCodeImg are required",
      });
    }

    // 3) เตรียมชื่อไฟล์
    const posterExt = posterFile.originalname.split(".").pop();
    const qrExt = qrFile.originalname.split(".").pop();

    const posterName = `${crypto.randomUUID()}.${posterExt}`;
    const qrName = `${crypto.randomUUID()}.${qrExt}`;

    // 4) อัปโหลดไฟล์ไป S3/MinIO ผ่าน Service
    await Promise.all([
      uploadFileToS3(posterFile, posterName),
      uploadFileToS3(qrFile, qrName),
    ]);

    // 5) สร้างข้อมูลใน Prisma (DB เก็บ "Key" ของรูป)
    const tournament = await prisma.tournament.create({
      data: {
        name: validatedData.name,
        location: validatedData.location,
        playType: validatedData.playType,
        rank: validatedData.rank,
        shuttlePrice: Number(validatedData.shuttlePrice),
        maxPlayers: validatedData.maxPlayers,
        posterImg: posterName,
        qrCodeImg: qrName,
        startDate: validatedData.startDate,
        ruleId: validatedData.ruleId,
        isLowerBracket: validatedData.isLowerBracket,
        organizerId: Number(req.user.sub),
      },
    });

    return res.status(201).json({
      message: "Tournament created successfully",
      data: tournament,
    });
  } catch (error) {
    console.error("Create Tournament Error:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getTournament = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;

    const data = await prisma.tournament.findUnique({
      where: { id: Number(_id) },
      include: {
        rule: true,
        competition: {
          orderBy: { time: "asc" },
        },
        groups: {
          include: {
            registers: {
              orderBy: { score: "desc" },
            },
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: {
            registrations: {
              where: { status: { not: "FAILED" } },
            },
          },
        },
      },
    });

    if (!data) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    //  Get stats by playType
    const registrationStats = await prisma.register.groupBy({
      by: ["playType"],
      where: {
        tournamentId: Number(_id),
        status: { not: "FAILED" },
      },
      _count: {
        id: true,
      },
    });

    const statsByHand = registrationStats.reduce((acc, curr) => {
      acc[curr.playType] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    //  สร้าง presigned URL จาก key (DB) แล้วส่งให้ FE ใช้ได้ทันที
    const [posterUrl, qrUrl] = await Promise.all([
      signGetObjectUrl(data.posterImg),
      signGetObjectUrl(data.qrCodeImg),
    ]);

    const formattedGroups = data.groups.map((group) => {
      const teamNames = group.registers.map((reg) => {
        if (reg.teamName) return reg.teamName;
        if (reg.player2Name) return [reg.player1Name, reg.player2Name];
        return reg.player1Name;
      });

      // ใช้ logic เดียวกับ Service เพื่อหา letter
      const groupLetter = group.name.split(" ").pop() || "A";

      return {
        id: group.id,
        name: group.name,
        color: getGroupColor(groupLetter),
        header: getGroupHeaderColor(groupLetter),
        teams: teamNames,
        summary: "",
      };
    });

    const iconsWithUrl = {
      id: data.id,
      title: data.name,
      location: data.location,
      playType: data.playType,
      rank: data.rank,
      shuttlePrice: data.shuttlePrice,
      maxPlayers: data.maxPlayers,
      currentPlayers: data._count.registrations,
      registrationStats: statsByHand, // Add stats breakdown

      //  เปลี่ยนเป็น presigned URL
      image: posterUrl,
      qrCodeImg: qrUrl,

      date: data.startDate,
      ruleId: data.ruleId,
      isLowerBracket: data.isLowerBracket,
      canceled: data.isCancel,
      competition: data.competition,
      rule: data.rule,
      groups: formattedGroups,
      organizerId: data.organizerId,
      isOrganizer: Number(req.user?.sub) === data.organizerId,
    };

    return res.status(200).json({
      message: "Tournament fetched successfully",
      data: iconsWithUrl,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: "Something went wrong!",
        errors: error.message,
      });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getTournaments = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const total = await prisma.tournament.count({
      where: { organizerId: Number(req.user.sub) },
    });

    const data = await prisma.tournament.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        competition: true,
        rule: true,
        _count: {
          select: {
            registrations: {
              where: { status: { not: "FAILED" } },
            },
          },
        },
      },
    });

    // ทำเป็น async เพราะต้อง sign url ให้แต่ละรายการ
    const iconsWithUrl = await Promise.all(
      data.map(async (tournament) => {
        const [posterUrl, qrUrl, registrationStats] = await Promise.all([
          signGetObjectUrl(tournament.posterImg),
          signGetObjectUrl(tournament.qrCodeImg),
          prisma.register.groupBy({
            by: ["playType"],
            where: {
              tournamentId: tournament.id,
              status: { not: "FAILED" },
            },
            _count: { id: true },
          }),
        ]);

        const statsByHand = registrationStats.reduce((acc, curr) => {
          acc[curr.playType] = curr._count.id;
          return acc;
        }, {} as Record<string, number>);

        return {
          id: tournament.id,
          title: tournament.name,
          location: tournament.location,
          playType: tournament.playType,
          rank: tournament.rank,
          shuttlePrice: tournament.shuttlePrice,
          maxPlayers: tournament.maxPlayers,
          currentPlayers: tournament._count.registrations,
          registrationStats: statsByHand,

          // เปลี่ยนเป็น presigned URL
          image: posterUrl,
          qrCodeImg: qrUrl,

          date: tournament.startDate,
          ruleId: tournament.ruleId,
          isLowerBracket: tournament.isLowerBracket,
          canceled: tournament.isCancel,
          competition: tournament.competition,
          rule: tournament.rule,
          IsOwner: Number(req.user.sub) === tournament.organizerId,
        };
      })
    );

    return res.status(200).json({
      message: "Tournament fetched successfully",
      data: iconsWithUrl,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: "Something went wrong!",
        errors: error.message,
      });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getPoster = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const tournament = await prisma.tournament.findUnique({ where: { id } });

    if (!tournament?.posterImg) {
      return res.status(404).json({ message: "Poster Not Found" });
    }

    const url = await signGetObjectUrl(tournament.posterImg);

    return res.status(200).json({
      message: "Poster presigned URL generated successfully",
      url,
    });
  } catch (error) {
    console.error("Get Poster Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      errors: error instanceof Error ? error.message : error,
    });
  }
};

export const getQr = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const tournament = await prisma.tournament.findUnique({ where: { id } });

    if (!tournament?.qrCodeImg) {
      return res.status(404).json({ message: "QrPhoto Not Found" });
    }

    const url = await signGetObjectUrl(tournament.qrCodeImg);

    return res.status(200).json({
      message: "QR presigned URL generated successfully",
      url,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      errors: error instanceof Error ? error.message : error,
    });
  }
};

export const updateTournament = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (Number(req.user.sub) !== tournament.organizerId) {
      return res
        .status(400)
        .json({ message: "You can only cancel tournament your own." });
    }

    if (tournament.isCancel) {
      return res.status(400).json({
        message: "Tournament already canceled. Cannot reopen.",
      });
    }

    const update = await prisma.tournament.update({
      where: { id },
      data: { isCancel: true },
    });

    return res.json({
      message: "Tournament cancelled successfully.",
      data: update,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      errors: error instanceof Error ? error.message : error,
    });
  }
};

export const getPaymentQr = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid tournament id" });
    }

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament?.qrCodeImg) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    const presignedUrl = await signGetObjectUrl(tournament.qrCodeImg);

    return res.status(200).json({
      message: "Presigned URL generated successfully",
      url: presignedUrl,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      errors: error instanceof Error ? error.message : error,
    });
  }
};

export const managegroup = async (req: Request, res: Response) => {
  try {
    const tournamentId = Number(req.params.id);
    const detail = req.body.detail || "ไม่มีรายละเอียดเพิ่มเติม";
    const playType = req.body.playType; //  รับค่า playType
    const requireReason = req.body.requireReason === true; // รับค่า option
    const language = req.body.language || "th"; // รับค่าภาษาเพื่อใช้ในการอธิบาย

    if (!playType) {
      return res
        .status(400)
        .json({ message: "Require playType (Hand Type) to manage group." });
    }

    // เรียกใช้ Service เพื่อจัดกลุ่ม
    const { groups: enrichedGroups, reason: groupingReason } = await organizeTournamentGroups(
      tournamentId,
      playType,
      detail,
      requireReason,
      language
    );

    return res.status(200).json({
      message: `Groups organized for ${playType} successfully`,
      groups: enrichedGroups,
      reason: groupingReason
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === "Tournament not found") {
        return res.status(404).json({ message: "Tournament not found" });
      }
      return res.status(400).json({
        message: "Something went wrong!",
        errors: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const cancelTournamentRank = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { rank } = req.body;

    if (!rank) {
      return res.status(400).json({ message: "Rank is required" });
    }

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (Number(req.user.sub) !== tournament.organizerId) {
      return res
        .status(403)
        .json({ message: "You can only cancel rank in your own tournament." });
    }

    // Check if rank exists in the tournament
    if (!tournament.rank.includes(rank)) {
      return res.status(400).json({
        message: "Rank not found in this tournament or already cancelled.",
      });
    }

    // Remove the rank
    const updatedRanks = tournament.rank.filter((r) => r !== rank);

    const update = await prisma.tournament.update({
      where: { id },
      data: { rank: updatedRanks },
    });

    return res.json({
      message: `Rank ${rank} cancelled successfully.`,
      data: update,
    });
  } catch (error) {
    console.error("Cancel Rank Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      errors: error instanceof Error ? error.message : error,
    });
  }
};
