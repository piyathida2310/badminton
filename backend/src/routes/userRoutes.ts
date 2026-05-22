import { Router } from 'express';
import { checkUserByClerkId, createUserFromClerk } from '../controllers/userController';

const router = Router();

/**
 * @swagger
 * /users/check:
 *   post:
 *     summary: ตรวจสอบข้อมูลผู้ใช้โดยใช้ Clerk ID
 *     description: ตรวจสอบสถานะการลงทะเบียนของสมาชิกว่ามีอยู่ในระบบหรือยัง
 *     tags:
 *       - Users (Clerk Sync)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clerkId
 *             properties:
 *               clerkId:
 *                 type: string
 *                 example: "user_2aB3cD4e5F..."
 *                 description: รหัสผู้ใช้ของ Clerk
 *               email:
 *                 type: string
 *                 example: somchai@example.com
 *               firstName:
 *                 type: string
 *                 example: สมชาย
 *               lastName:
 *                 type: string
 *                 example: ใจดี
 *               username:
 *                 type: string
 *                 example: somchai123
 *               imageUrl:
 *                 type: string
 *                 example: "https://clerk.com/images/default.png"
 *     responses:
 *       200:
 *         description: ตรวจสอบสำเร็จ (จะส่งกลับสถานะ exists ว่าจริงหรือเท็จ)
 *       400:
 *         description: ไม่ได้ระบุ clerkId
 *       500:
 *         description: เกิดข้อผิดพลาดของระบบ
 */
router.post('/check', checkUserByClerkId);

/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: สร้างผู้ใช้ใหม่จากข้อมูล Clerk
 *     description: บันทึกข้อมูลโปรไฟล์ผู้ใช้ใหม่เข้าฐานข้อมูลระบบ หลังจากลงทะเบียนสำเร็จบน Clerk
 *     tags:
 *       - Users (Clerk Sync)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clerkId
 *               - email
 *               - firstName
 *               - lastName
 *             properties:
 *               clerkId:
 *                 type: string
 *                 example: "user_2aB3cD4e5F..."
 *               email:
 *                 type: string
 *                 example: somchai@example.com
 *               firstName:
 *                 type: string
 *                 example: สมชาย
 *               lastName:
 *                 type: string
 *                 example: ใจดี
 *               username:
 *                 type: string
 *                 example: somchai123
 *               imageUrl:
 *                 type: string
 *                 example: "https://clerk.com/images/default.png"
 *               age:
 *                 type: string
 *                 example: "25"
 *               playType:
 *                 type: string
 *                 example: "SINGLE"
 *     responses:
 *       201:
 *         description: สร้างผู้ใช้สำเร็จ
 *       400:
 *         description: ข้อมูลที่จำเป็นไม่ครบถ้วน หรือมีผู้ใช้นี้อยู่แล้ว
 *       500:
 *         description: เกิดข้อผิดพลาดของระบบ
 */
router.post('/create', createUserFromClerk);

export default router;