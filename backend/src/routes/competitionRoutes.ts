import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {createCompet,getCompets,updateCompet,deleteCompet } from "../controllers/competitionController"

const router = Router();
    router.get('/',authMiddleware,getCompets)
    router.post('/',authMiddleware,createCompet)
    router.put('/:id',authMiddleware,updateCompet)
    router.delete('/:id',authMiddleware,deleteCompet )
export default router;