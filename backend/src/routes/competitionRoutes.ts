import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {createCompet,getCompets,updateCompet,deleteCompet } from "../controllers/competitionController"

const router = Router();
    router.get('/compet',authMiddleware,getCompets)
    router.post('/compet',authMiddleware,createCompet)
    router.put('/compet/:id',authMiddleware,updateCompet)
    router.delete('/compet/:id',authMiddleware,deleteCompet )
export default router;