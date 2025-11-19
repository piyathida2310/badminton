import { Request, Response } from "express";
import { competitionSchema } from "../models/competitionModel";
import { ZodError } from "zod";
import { prisma } from "../services/prismaClient";

export const createCompet = async (req: Request, res: Response) => {
  try {
    const validateData = competitionSchema.parse(req.body);
    const creatRules = await prisma.competition.create({
      data: {
        time: validateData.time,
        detail: validateData.detail,
        rank: validateData.rank,
        tournamentId: validateData.tournamentId,
      },
    });
    return res.status(201).json({
      message: "Rules Create Successfully",
      data: creatRules,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error,
      });
    } else if (error instanceof Error) {
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
export const getCompets = async (req: Request, res: Response) => {
  try {
    const tournamentIdParam = req.query.tournamentId;

    const Categories = await prisma.competition.count({
      where: { tournamentId: Number(tournamentIdParam) },
    });

    if (Categories === 0) {
      const presetCategories = await prisma.competition.findMany({
        where: { tournamentId: null },
      });
      const userCategories = presetCategories.map((validateData) => ({
        time: validateData.time,
        detail: validateData.detail,
        rank: validateData.rank,
        tournamentId:Number(tournamentIdParam),
      }));
      await prisma.competition.createMany({ data: userCategories });
    }
    // ถ้าไม่ส่ง tournamentId -> แสดงทั้งหมด
    let data;
    if (!tournamentIdParam) {
      data = await prisma.competition.findMany();
    } else {
      const tournamentId = Number(tournamentIdParam);
      if (isNaN(tournamentId)) {
        return res
          .status(400)
          .json({ message: "tournamentId must be a number" });
      }

      data = await prisma.competition.findMany({
        where: { tournamentId },
        orderBy: { time: "asc" },
      });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({
        message: "No Competition found",
        data: [],
      });
    }
    return res.status(200).json({
      message: "Competiton fetched Successfully",
      data,
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

export const updateCompet = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid  id" });
    }
    const validateData = competitionSchema.partial().parse(req.body);
    const existingCompetition = await prisma.competition.findUnique({
      where: { id },
    });
    if (!existingCompetition) {
      return res.status(404).json({ message: "Competition not found" });
    }
    const updated = await prisma.competition.update({
      where: { id },
      data: validateData,
    });

    return res.status(200).json({
      message: "Competition updated successfully",
      data: updated,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error,
      });
    } else if (error instanceof Error) {
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
export const deleteCompet = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid  id" });
    }

    const existingCompetition = await prisma.competition.findUnique({
      where: { id },
    });
    if (!existingCompetition) {
      return res.status(404).json({ message: "Competition not found" });
    }
    await prisma.competition.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Competition delete successfully",
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
