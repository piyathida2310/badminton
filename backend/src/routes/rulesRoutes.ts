import {Router} from "express"
import authMiddleware from '../middleware/authMiddleware';

import {createRules,getRules,updateRules,getRule} from "../controllers/rulesController"
const router = Router();


router.get('/',authMiddleware,getRules)
router.get('/:id',authMiddleware,getRule)
router.post('/',authMiddleware,createRules)
router.put('/:id',authMiddleware,updateRules)

export default router;
