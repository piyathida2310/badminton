import { Request, response, Response } from "express";
import { tournamentSchema } from "../models/tournamentModels";
import { ZodError } from "zod";
import { prisma } from "../services/prismaClient";
import crypto from "crypto";
import S3Client from "../config/minioManage";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

import dotenv from "dotenv";
import { manageGroup, Player } from "../services/openai";

import { Readable } from "stream";
import { arrayBuffer } from "stream/consumers";
dotenv.config();

const BUCKET = process.env.MINIO_BUCKET!;

export const createTournament = async (req: Request, res: Response) => {
  try {
    // 1. ตรวจสอบข้อมูล body ด้วย Zod
    if (typeof req.body.rank === "string") {
      try {
        req.body.rank = JSON.parse(req.body.rank);
      } catch (e) {
        console.error("Rank parse error:", e);
      }
    }

    const validatedData = tournamentSchema.parse(req.body);

    // 2. ดึงไฟล์ออกจาก req.files
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

    // 3. เตรียมชื่อไฟล์
    const posterExt = posterFile.originalname.split(".").pop();
    const qrExt = qrFile.originalname.split(".").pop();

    const posterName = `${crypto.randomUUID()}.${posterExt}`;
    const qrName = `${crypto.randomUUID()}.${qrExt}`;

    // 4. อัปโหลดไฟล์ไป S3/MinIO (ใช้ s3Client ที่สร้างไว้ข้างต้น)
    // สำหรับ Poster
    await S3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: posterName,
        Body: posterFile.buffer, // ใช้ buffer จาก Multer ได้เลย
        ContentType: posterFile.mimetype,
      })
    );

    // สำหรับ QR Code
    await S3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: qrName,
        Body: qrFile.buffer,
        ContentType: qrFile.mimetype,
      })
    );

    // 5. สร้างข้อมูลใน Prisma
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
      IsOwner: Number(req.user.sub) === tournament.organizerId,
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

    if (!poster) {
      return res.status(400).json({ message: "Poster Not Found" });
    }

    // 1. สร้าง Command สำหรับดึงข้อมูลจาก S3
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: poster.posterImg,
    });

    // 2. ส่งคำสั่งผ่าน S3Client
    const { Body, ContentType } = await S3Client.send(command);

    if (!Body) {
      return res.status(404).json({ message: "File body is empty" });
    }

    // 3. ตั้งค่า Header สำหรับการแสดงผล (inline คือแสดงบนเบราว์เซอร์)
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${poster.posterImg}"`
    );

    // ตั้งค่า Content-Type ตามไฟล์จริง (เช่น image/jpeg) เพื่อให้เบราว์เซอร์ render รูปได้
    if (ContentType) {
      res.setHeader("Content-Type", ContentType);
    }

    // 4. แปลง Body (ซึ่งเป็น SdkStream) ให้เป็น Readable และ pipe เข้า response
    (Body as Readable).pipe(res);
  } catch (error) {
    console.error("Get Poster Error:", error);
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

    // 1. สร้าง Command สำหรับดึงข้อมูลจาก S3
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: qr.qrCodeImg,
    });

    // 2. ส่งคำสั่งผ่าน S3Client
    const { Body, ContentType } = await S3Client.send(command);

    if (!Body) {
      return res.status(404).json({ message: "QR Code file is empty" });
    }

    // 3. ตั้งค่า Header สำหรับการส่งไฟล์
    res.setHeader("Content-Disposition", `inline; filename="${qr.qrCodeImg}"`);

    // ตั้งค่า Content-Type เพื่อให้เบราว์เซอร์แสดงผลรูปภาพได้ทันที
    if (ContentType) {
      res.setHeader("Content-Type", ContentType);
    }

    // 4. แปลง SdkStream เป็น Readable และ pipe เข้า response
    (Body as Readable).pipe(res);
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

    if (Number(req.user.sub) !== tournament.organizerId)
      return res
        .status(400)
        .json({ message: "You can only cancel tournament your own." });

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
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: tournament.qrCodeImg,
    });
    const s3Item = await S3Client.send(command);

    return res.status(200).json({
      message: "Presigned URL generated successfully",
      url: s3Item,
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
    const detail = req.body.detail || "ไม่มีรายละเอียดเพิ่มเติม";

    //  ดึงข้อมูล tournament พร้อมผู้ลงทะเบียน
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
      include: {
        registrations: {
          select: {
            id: true,
            score: true,
            comment: true,
            userId: true,
          },
        },
      },
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    //  เตรียมข้อมูลผู้เล่นให้เป็น Player[]
    const players: Player[] = tournament.registrations.map((reg) => ({
      id: reg.userId,
      score: reg.score,
      comment: reg.comment,
    }));

    //  เรียก AI เพื่อจัดกลุ่ม
    const result = await manageGroup(players, detail);

    if (!result)
      return res.status(400).json({ message: "Cannot Create Group" });
    return res.status(200).json({
      message: "จัดกลุ่มสำเร็จ ",
      groups: result,
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
