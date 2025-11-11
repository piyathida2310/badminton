import { Request, Response } from "express";
import {rulesSchema} from "../models/rulesModel"
import { ZodError } from "zod"; 
import { prisma } from "../services/prismaClient";

export const createRules = async (req: Request, res: Response) => {
    try {
        const validateData = rulesSchema.parse(req.body);
        const creatRules = await prisma.rule.create({
            data: {
                tournamentId:validateData.tournamentId,
                content:validateData.content
            }
        });
    return res.status(201).json({
        message: "Rules Create Successfully",
        data:creatRules
    })
    } catch (error) {
      if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error,
      });
    } else if (error instanceof Error) {
      return res.status(400).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    } else {
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
    }
}
export const getRules = async (req: Request, res: Response) => {
    try {
        const data =await prisma.rule.findMany();
        if (!data || data.length === 0) {
      return res.status(200).json({
        message: 'No Rules found',
        data: [],
      });
      
    }
       return res.status(200).json({
        message: "Rules fetched Successfully",
        data,
    })


    } catch (error) {

     if (error instanceof Error) {
      return res.status(400).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    } else {
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
    }
}
export const getRule = async (req: Request, res: Response) =>{
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid  id' });
    }

        const data = await prisma.rule.findUnique({
            where: {id,}
        });
        if (!data ) {
      return res.status(200).json({
        message: `No Rules found this ID:${id}`,
      });
      
    }
       return res.status(200).json({
        message: "Rules fetched Successfully",
        data,
    })

    } catch (error) {
        if (error instanceof Error) {
      return res.status(400).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    } else {
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
    }
}
export const updateRules = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid  id' });
    }
    const validateData = rulesSchema.partial().parse(req.body);
    const existingRule = await prisma.rule.findUnique({
      where: { id, },
    });
    if (!existingRule) {
      return res.status(404).json({ message: 'Rules not found' });
    }
    const updatedRules = await prisma.rule.update({
      where: { id, },
      data: validateData,
    });

    return res.status(200).json({
      message: 'Rules updated successfully',
      data: updatedRules,
    });

    } catch (error) {
         if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error,
      });
    } else if (error instanceof Error) {
      return res.status(400).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    } else {
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
    }
}