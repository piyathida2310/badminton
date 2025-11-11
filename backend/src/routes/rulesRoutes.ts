import {Router} from "express"
import authMiddleware from '../middleware/authMiddleware';

import {createRules,getRules,updateRules,getRule} from "../controllers/rulesController"
const router = Router();


router.get('/rules',authMiddleware,getRules)
router.get('/rules/:id',authMiddleware,getRule)
router.post('/rules',authMiddleware,createRules)
router.put('/rules/:id',authMiddleware,updateRules)

export default router;
