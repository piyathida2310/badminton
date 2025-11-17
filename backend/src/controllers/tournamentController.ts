import { Request, Response } from "express";
import { tournamentSchema } from "../models/tournamentModels";
import { ZodError } from "zod";
import { prisma } from "../services/prismaClient";
import crypto from "crypto";
import minioClient from "../config/minioManage";
import dotenv from "dotenv";
dotenv.config();
const BUCKET = process.env.MINIO_BUCKET!;

export const createTournament = async (req: Request, res: Response) => {
  try {
    // ตรวจสอบข้อมูล body ด้วย Zod
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

export const getTournaments = async (req: Request, res: Response) => {
  try {
    const data = await prisma.tournament.findMany({
      where: {
        organizerId: Number(req.user.sub),
      },
      orderBy: { createdAt: "desc" },
      include:{
        competition:true,
        rule:true
      }

    });

    if (!data || data.length === 0) {
      return res.status(200).json({
        message: "Tournament not found",
        data: [],
      });
    }

    const iconsWithUrl = data.map((tournament) => ({
      id: tournament.id,
      location: tournament.location,
      playType: tournament.playType,
      rank: tournament.rank,
      shuttlePrice: tournament.shuttlePrice,
      maxPlayers: tournament.maxPlayers,
      posterImg: `${process.env.APP_BASE_URL}/api/tournament/poster/${tournament.id}`,
      qrCodeImg: `${process.env.APP_BASE_URL}/api/tournament/qr/${tournament.id}`,
      startDate: tournament.startDate,
      ruleId: tournament.ruleId,
    isLowerBracket: tournament.isLowerBracket,
    isCancel:tournament.isCancel,
    competition:tournament.competition,
    rule:tournament.rule
    }));

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

    const update = await prisma.tournament.update({
      where: {
        id,
      },
      data: {
        isCancel: !tournament.isCancel,
      },
    });
    return res.json({
      message: `Tournament ${update.isCancel ? "cancelled" : "reopened"
      } successfully.`,
      data: update,
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
