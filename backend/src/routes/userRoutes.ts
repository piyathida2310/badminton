import { Router } from 'express';
import { checkUserByClerkId, createUserFromClerk } from '../controllers/userController';

const router = Router();

// ตรวจสอบข้อมูลผู้ใช้โดยใช้ clerkId
router.post('/check', checkUserByClerkId);

// สร้างผู้ใช้ใหม่จากข้อมูล Clerk
router.post('/create', createUserFromClerk);

export default router;