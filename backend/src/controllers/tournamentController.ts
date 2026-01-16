import { Request, response, Response } from "express";
import { tournamentSchema } from "../models/tournamentModels";
import { ZodError } from "zod";
import { prisma } from "../services/prismaClient";
import crypto from "crypto";
import minioClient from "../config/minioManage";
import dotenv from "dotenv";
import { manageGroup, Player } from "../services/openai"
dotenv.config();

const BUCKET = process.env.MINIO_BUCKET!;

export const createTournament = async (req: Request, res: Response) => {
  try {
    // ตรวจสอบข้อมูล body ด้วย Zod
    if (typeof req.body.rank === "string") {
      try {
        req.body.rank = JSON.parse(req.body.rank);
      } catch (e) {
        console.error("Rank parse error:", e);
      }
    }

    const validatedData = tournamentSchema.parse(req.body);

    //  ดึงไฟล์ออกจาก req.files
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const posterFile = files["posterImg"]?.[0];
    const qrFile = files["qrCodeImg"]?.[0];

    if (!posterFile || !qrFile) {
      return res.status(400).json({
        message: "Both posterImg and qrCodeImg are required",
      });
    }

    // อัปโหลดไฟล์ไป MinIO
    const posterExt = posterFile.originalname.split(".").pop();
    const qrExt = qrFile.originalname.split(".").pop();

    const posterName = `${crypto.randomUUID()}.${posterExt}`;
    const qrName = `${crypto.randomUUID()}.${qrExt}`;

    await minioClient.putObject(
      BUCKET,
      posterName,
      posterFile.buffer,
      posterFile.size,
      {
        "Content-Type": posterFile.mimetype,
      }
    );
    await minioClient.putObject(BUCKET, qrName, qrFile.buffer, qrFile.size, {
      "Content-Type": qrFile.mimetype,
    });

    // สร้างข้อมูลใน Prisma
    const tournament = await prisma.tournament.create({
      data: {
        name: validatedData.name,
        location: validatedData.location,
        playType: validatedData.playType,
        rank: validatedData.rank,
        shuttlePrice: Number(validatedData.shuttlePrice),
        maxPlayers: validatedData.maxPlayers,
        posterImg: posterName, //  เก็บชื่อไฟล์ที่อัปโหลดจริง
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
    console.error(" Create Tournament Error:", error);

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

    //  ดึงข้อมูล page นั้น ๆ
    const data = await prisma.tournament.findUnique({
      where: { id: Number(_id) },
      include: {
        rule: true,
        competition: {
          orderBy: {
            time: "asc",
          },
        },
        groups: {
          include: {
            registers: true
          },
          orderBy: {
            name: "asc"
          }
        },
        _count: {
          select: {
            registrations: {
              where: {
                status: {
                  not: "FAILED",
                },
              },
            },
          },
        },
      },
    });

    // Check if data is null before accessing properties to avoid runtime errors
    if (!data) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const formattedGroups = data.groups.map(group => {
      const teamNames = group.registers.map(reg => {
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
        summary: ""
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
      image: `${process.env.APP_BASE_URL}/api/tournament/poster/${data.id}`,
      qrCodeImg: `${process.env.APP_BASE_URL}/api/tournament/qr/${data.id}`,
      date: data.startDate,
      ruleId: data.ruleId,
      isLowerBracket: data.isLowerBracket,
      canceled: data.isCancel,
      competition: data.competition,
      rule: data.rule,
      groups: formattedGroups
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
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const getTournaments = async (req: Request, res: Response) => {
  try {
    //  รับค่าจาก query
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // นับจำนวนทั้งหมดสำหรับ pagination
    const total = await prisma.tournament.count({
      where: {
        organizerId: Number(req.user.sub),
      },
    });

    //  ดึงข้อมูล page นั้น ๆ
    //  ดึงข้อมูล page นั้น ๆ
    const data = await prisma.tournament.findMany({
      // where: { organizerId: Number(req.user.sub) },  //จะเห็นการแข่งขันี่ผู้จัดสร้างของทุกคน
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        competition: true,
        rule: true,
        _count: {
          select: {
            registrations: {
              where: {
                status: {
                  not: "FAILED",
                },
              },
            },
          },
        },
      },
    });

    const iconsWithUrl = data.map((tournament) => ({
      id: tournament.id,
      title: tournament.name,
      location: tournament.location,
      playType: tournament.playType,
      rank: tournament.rank,
      shuttlePrice: tournament.shuttlePrice,
      maxPlayers: tournament.maxPlayers,
      currentPlayers: tournament._count.registrations,
      image: `${process.env.APP_BASE_URL}/api/tournament/poster/${tournament.id}`,
      qrCodeImg: `${process.env.APP_BASE_URL}/api/tournament/qr/${tournament.id}`,
      date: tournament.startDate,
      ruleId: tournament.ruleId,
      isLowerBracket: tournament.isLowerBracket,
      canceled: tournament.isCancel,
      competition: tournament.competition,
      rule: tournament.rule,
      IsOwner: Number(req.user.sub) === tournament.organizerId
    }));

    return res.status(200).json({
      message: "Tournament fetched successfully",
      data: iconsWithUrl,

      // ส่งข้อมูล pagination เพิ่มเติม
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
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const getPoster = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const poster = await prisma.tournament.findUnique({ where: { id } });
    if (!poster) return res.status(400).json({ message: "Poster Not Found" });
    const stream = await minioClient.getObject(BUCKET, poster.posterImg);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${poster.posterImg}"`
    );
    stream.pipe(res);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: "Something went wrong!",
        errors: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const getQr = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const qr = await prisma.tournament.findUnique({ where: { id } });
    if (!qr) return res.status(400).json({ message: "QrPhoto Not Found" });
    const stream = await minioClient.getObject(BUCKET, qr.qrCodeImg);
    res.setHeader("Content-Disposition", `inline; filename="${qr.qrCodeImg}"`);
    stream.pipe(res);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: "Something went wrong!",
        errors: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const updateTournament = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (Number(req.user.sub) !== tournament.organizerId) return res.status(400).json({ message: "You can only cancel tournament your own." });

    // ❗ หากยกเลิกแล้ว ห้ามกดยกเลิกอีก
    if (tournament.isCancel) {
      return res.status(400).json({
        message: "Tournament already canceled. Cannot reopen.",
      });
    }

    // ยกเลิกแบบถาวร
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
    const tournament = await prisma.tournament.findUnique({ where: { id } });

    if (!tournament || !tournament.qrCodeImg) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    // Generate presigned URL (valid for 1 day)
    const presignedUrl = await minioClient.presignedGetObject(
      BUCKET,
      tournament.qrCodeImg,
      24 * 60 * 60
    );

    return res.status(200).json({
      message: "Presigned URL generated successfully",
      url: presignedUrl,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: "Something went wrong!",
        errors: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const managegroup = async (req: Request, res: Response) => {
  try {
    const tournamentId = Number(req.params.id);
    const detail = req.body.detail || "ไม่มีรายละเอียดเพิ่มเติม"

    //  ดึงข้อมูล tournament พร้อมผู้ลงทะเบียน
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
      include: {
        registrations: {
          where: {
            status: {
              not: "FAILED",
            },
          },
          select: {
            id: true,
            score: true,
            comment: true,
            userId: true,
            teamName: true,
            player1Name: true,
            player2Name: true,
          },
        },
      },
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.registrations.length < tournament.maxPlayers) {
      return res.status(400).json({
        message: `Yet not full. Current: ${tournament.registrations.length}, Max: ${tournament.maxPlayers}. Cannot optimize groups.`
      });
    }

    //  เตรียมข้อมูลผู้เล่นให้เป็น Player ต่อน AI
    const players: Player[] = tournament.registrations.map((reg) => ({
      id: reg.id,
      score: reg.score,
      comment: reg.comment,
    }));

    //  เรียก AI เพื่อจัดกลุ่ม
    const aiResult = await manageGroup(players, detail, tournament.maxPlayers);

    if (!aiResult || !aiResult.groups) return res.status(400).json({ message: "Cannot Create Group" });

    // Map info back to groups and PERSIST to DB
    const enrichedGroups = await prisma.$transaction(async (tx) => {
      // Clear existing groups for this tournament to re-organize
      await tx.group.deleteMany({
        where: { tournamentId: tournament.id }
      });

      const createdGroups = [];

      for (const group of aiResult.groups) {
        // Create Group in DB
        const newGroup = await tx.group.create({
          data: {
            name: `Group ${group.groupId}`,
            tournamentId: tournament.id,
          }
        });

        const teamNames: any[] = [];

        // Update registers with groupId
        for (const playerId of group.players) {
          const reg = tournament.registrations.find(r => r.id === playerId);

          if (reg) {
            await tx.register.update({
              where: { id: reg.id },
              data: { groupId: newGroup.id }
            });

            // Prepare team name for response
            if (reg.teamName) teamNames.push(reg.teamName);
            else if (reg.player2Name) teamNames.push([reg.player1Name, reg.player2Name]);
            else teamNames.push(reg.player1Name);
          } else {
            teamNames.push(`Unknown (${playerId})`);
          }
        }

        createdGroups.push({
          id: newGroup.id,
          name: newGroup.name,
          color: getGroupColor(group.groupId),
          header: getGroupHeaderColor(group.groupId),
          teams: teamNames,
          summary: group.summary,
          players: group.players
        });
      }

      return createdGroups;
    });

    return res.status(200).json({
      message: "จัดกลุ่มสำเร็จ ",
      groups: enrichedGroups,
      criteria: aiResult.criteria
    });

  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return res.status(400).json({
        message: "Something went wrong!",
        errors: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

// Helper functions
function getGroupColor(groupId: string) {
  const colors: Record<string, string> = {
    "A": "from-yellow-100 to-yellow-50 border-yellow-400 shadow-yellow-200/50",
    "B": "from-blue-100 to-blue-50 border-blue-400 shadow-blue-200/50",
    "C": "from-pink-100 to-pink-50 border-pink-400 shadow-pink-200/50",
    "D": "from-green-100 to-green-50 border-green-400 shadow-green-200/50",
    "E": "from-orange-100 to-orange-50 border-orange-400 shadow-orange-200/50",
    "F": "from-purple-100 to-purple-50 border-purple-400 shadow-purple-200/50",
    "G": "from-teal-100 to-teal-50 border-teal-400 shadow-teal-200/50",
    "H": "from-red-100 to-red-50 border-red-400 shadow-red-200/50",
  };
  return colors[groupId] || "from-gray-100 to-gray-50 border-gray-400 shadow-gray-200/50";
}

function getGroupHeaderColor(groupId: string) {
  const colors: Record<string, string> = {
    "A": "bg-yellow-400/80 text-yellow-900",
    "B": "bg-blue-400/80 text-blue-900",
    "C": "bg-pink-400/80 text-pink-900",
    "D": "bg-green-400/80 text-green-900",
    "E": "bg-orange-400/80 text-orange-900",
    "F": "bg-purple-400/80 text-purple-900",
    "G": "bg-teal-400/80 text-teal-900",
    "H": "bg-red-400/80 text-red-900",
  };
  return colors[groupId] || "bg-gray-400/80 text-gray-900";
}
