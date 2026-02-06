import { Request, Response } from "express";
import { tournamentSchema } from "../models/tournamentModels";
import { ZodError } from "zod";
import { prisma } from "../services/prismaClient";
import crypto from "crypto";
import S3Client from "../config/minioManage";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { rankPlayers, Player } from "../services/openai";

dotenv.config();

const BUCKET = process.env.MINIO_BUCKET!;

// =====================
// Presigned URL helper
// =====================
async function signGetObjectUrl(key?: string | null) {
  if (!key) return null;

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return await getSignedUrl(S3Client, command, {
    expiresIn: 24 * 60 * 60, // 1 day
  });
}

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

    // 4) อัปโหลดไฟล์ไป S3/MinIO
    await S3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: posterName,
        Body: posterFile.buffer,
        ContentType: posterFile.mimetype,
      })
    );

    await S3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: qrName,
        Body: qrFile.buffer,
        ContentType: qrFile.mimetype,
      })
    );

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
          include: { registers: true },
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

    // ✅ Get stats by playType
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

    // ✅ สร้าง presigned URL จาก key (DB) แล้วส่งให้ FE ใช้ได้ทันที
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

      const groupId = group.name.replace("Group ", "");

      return {
        id: group.id,
        name: group.name,
        color: getGroupColor(groupId),
        header: getGroupHeaderColor(groupId),
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
      registrationStats: statsByHand, // ✅ Add stats breakdown

      // ✅ เปลี่ยนเป็น presigned URL
      image: posterUrl,
      qrCodeImg: qrUrl,

      date: data.startDate,
      ruleId: data.ruleId,
      isLowerBracket: data.isLowerBracket,
      canceled: data.isCancel,
      competition: data.competition,
      rule: data.rule,
      groups: formattedGroups,
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

    // ✅ ทำเป็น async เพราะต้อง sign url ให้แต่ละรายการ
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

          // ✅ เปลี่ยนเป็น presigned URL
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

// =====================
// (Optional) keep these endpoints if you still want
// poster/qr endpoints to return presigned URL instead of streaming
// =====================
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

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: tournament.qrCodeImg,
    });

    const presignedUrl = await getSignedUrl(S3Client, command, {
      expiresIn: 24 * 60 * 60,
    });

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
    const playType = req.body.playType; // ✅ รับค่า playType

    if (!playType) {
      return res.status(400).json({ message: "Require playType (Hand Type) to manage group." });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          where: { status: { not: "FAILED" } },
          select: {
            id: true,
            score: true,
            comment: true,
            userId: true,
            playType: true,
            player1Name: true, // Needed for response enrichment
            player2Name: true,
            teamName: true,
          },
        },
      },
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // 1. Filter specific playType
    const targetRegistrations = tournament.registrations.filter(r => r.playType === playType);

    // 2. Validate Count (< 50% of maxPlayers)
    if (targetRegistrations.length < (tournament.maxPlayers / 2)) {
      return res.status(400).json({
        message: `Not enough players for ${playType}. Current: ${targetRegistrations.length}, Required > ${tournament.maxPlayers / 2}.`,
      });
    }

    // 3. Prepare AI players
    const players: Player[] = targetRegistrations.map((reg) => ({
      id: reg.id,
      score: reg.score,
      comment: reg.comment,
    }));

    // 4. Run AI
    // 4. Run AI to get Ranking only (List of IDs)
    const rankedIds = await rankPlayers(players, detail);

    // 4.1 FAILSAFE: ตรวจสอบว่า ID ครบไหม ถ้าไม่ครบให้เติมต่อท้าย
    const inputIds = new Set(players.map((p) => p.id));
    const returnedIds = new Set(rankedIds);

    // หา ID ที่หายไปจาก AI (Hallucination fix)
    const missingIds = players
      .filter((p) => !returnedIds.has(p.id))
      .map((p) => p.id);

    // เอา missing ไปต่อท้าย + กรองเฉพาะ ID ที่มีอยู่จริง (กันมั่ว)
    const finalRankedIds = [...rankedIds, ...missingIds].filter((id) =>
      inputIds.has(id)
    );

    // 5. คำนวณจำนวนกลุ่ม (Logic เดิมจาก AI Prompt ย้ายมาไว้ที่นี่)
    let numGroups = 4;
    // ถ้าเกิน 24 คน ให้แบ่ง 8 กลุ่ม (32 คน / 4 = 8 กลุ่ม)
    if (tournament.maxPlayers > 24) {
      numGroups = 8;
    } else {
      // Default: กลุ่มละ 4 คน (หรือตามความเหมาะสม)
      numGroups = Math.max(1, Math.floor(tournament.maxPlayers / 4));
    }

    // สร้าง Structure รอไว้
    // Group name: A, B, C, D...
    const groupsMap: { name: string; players: number[] }[] = Array.from(
      { length: numGroups },
      (_, i) => ({
        name: String.fromCharCode(65 + i), // 'A', 'B', 'C'...
        players: [],
      })
    );

    // 6. Snake Draft Distribution
    // 0 -> G0
    // 1 -> G1
    // ...
    // n -> Gn (Top)
    // n+1 -> Gn (Snake back)
    finalRankedIds.forEach((playerId, index) => {
      const round = Math.floor(index / numGroups);
      const isEvenRound = round % 2 === 0;

      let groupIndex;
      if (isEvenRound) {
        // ขาไป: 0, 1, 2, ...
        groupIndex = index % numGroups;
      } else {
        // ขากลับ: 3, 2, 1, ...
        groupIndex = numGroups - 1 - (index % numGroups);
      }

      // ใส่ผู้เล่นลงกลุ่ม
      if (groupsMap[groupIndex]) {
        groupsMap[groupIndex].players.push(playerId);
      }
    });

    // 7. Cleanup OLD Groups for this PlayType ONLY
    const groupsToDelete = await prisma.group.findMany({
      where: {
        tournamentId,
        registers: {
          some: { playType } // Groups containing players of this hand type
        }
      },
      select: { id: true }
    });

    const groupIdsToDelete = groupsToDelete.map(g => g.id);

    if (groupIdsToDelete.length > 0) {
      // Unlink players
      await prisma.register.updateMany({
        where: { groupId: { in: groupIdsToDelete } },
        data: { groupId: null },
      });

      // Delete Matches
      await prisma.match.deleteMany({
        where: { groupId: { in: groupIdsToDelete } },
      });

      // Delete Groups
      await prisma.group.deleteMany({
        where: { id: { in: groupIdsToDelete } },
      });
    }

    // 8. Create NEW Groups into DB
    for (const groupData of groupsMap) {
      // Name consistency: "BG Group A"
      const groupName = `${playType} Group ${groupData.name}`;

      const newGroup = await prisma.group.create({
        data: {
          name: groupName,
          tournamentId: tournamentId,
        },
      });

      // Link Players
      if (groupData.players.length > 0) {
        await prisma.register.updateMany({
          where: { id: { in: groupData.players } },
          data: { groupId: newGroup.id },
        });

        // Generate Round Robin Matches
        const groupPlayers = groupData.players;
        for (let i = 0; i < groupPlayers.length; i++) {
          for (let j = i + 1; j < groupPlayers.length; j++) {
            await prisma.match.create({
              data: {
                tournamentId,
                groupId: newGroup.id,
                player1Id: groupPlayers[i], // ID ของ register
                player2Id: groupPlayers[j],
                handType: playType,
                status: "PENDING",
                scheduledTime: tournament.startDate,
              },
            });
          }
        }
      }
    }

    // 7. Success - Fetch ALL groups to return
    const updatedGroups = await prisma.group.findMany({
      where: { tournamentId },
      include: { registers: true },
      orderBy: { name: "asc" },
    });

    const enrichedGroups = updatedGroups.map((group) => {
      // Logic for display name? if we named it "BG Group A", we might want frontend to strip prefix or show full.
      // Frontend filters by handType anyway.
      const teamNames = group.registers.map((reg) => {
        if (reg.teamName) return reg.teamName;
        if (reg.player2Name) return [reg.player1Name, reg.player2Name];
        return reg.player1Name;
      });

      // simplistic header/color logic based on last char?
      // group.name is "BG Group A".
      const groupLetter = group.name.split(" ").pop() || "A";

      return {
        id: group.id,
        name: group.name,
        handType: group.registers[0]?.playType || null,
        color: getGroupColor(groupLetter),
        header: getGroupHeaderColor(groupLetter),
        teams: teamNames,
        summary: "",
      };
    });

    return res.status(200).json({
      message: `Groups organized for ${playType} successfully`,
      groups: enrichedGroups,
    });
  } catch (error) {
    console.error(error);

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

// Helper functions
function getGroupColor(groupId: string) {
  const colors: Record<string, string> = {
    A: "from-yellow-100 to-yellow-50 border-yellow-400 shadow-yellow-200/50",
    B: "from-blue-100 to-blue-50 border-blue-400 shadow-blue-200/50",
    C: "from-pink-100 to-pink-50 border-pink-400 shadow-pink-200/50",
    D: "from-green-100 to-green-50 border-green-400 shadow-green-200/50",
    E: "from-orange-100 to-orange-50 border-orange-400 shadow-orange-200/50",
    F: "from-purple-100 to-purple-50 border-purple-400 shadow-purple-200/50",
    G: "from-teal-100 to-teal-50 border-teal-400 shadow-teal-200/50",
    H: "from-red-100 to-red-50 border-red-400 shadow-red-200/50",
  };
  return (
    colors[groupId] ||
    "from-gray-100 to-gray-50 border-gray-400 shadow-gray-200/50"
  );
}

function getGroupHeaderColor(groupId: string) {
  const colors: Record<string, string> = {
    A: "bg-yellow-400/80 text-yellow-900",
    B: "bg-blue-400/80 text-blue-900",
    C: "bg-pink-400/80 text-pink-900",
    D: "bg-green-400/80 text-green-900",
    E: "bg-orange-400/80 text-orange-900",
    F: "bg-purple-400/80 text-purple-900",
    G: "bg-teal-400/80 text-teal-900",
    H: "bg-red-400/80 text-red-900",
  };
  return colors[groupId] || "bg-gray-400/80 text-gray-900";
}
