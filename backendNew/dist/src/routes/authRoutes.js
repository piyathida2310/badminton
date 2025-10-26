"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: ลงทะเบียนผู้ใช้ใหม่
 *     description: สร้างผู้ใช้ใหม่ พร้อมคืน JWT สำหรับใช้งานทันที
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - confirmPassword
 *               - role
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: สมชาย ใจดี
 *               email:
 *                 type: string
 *                 format: email
 *                 example: somchai@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               confirmPassword:
 *                 type: string
 *                 example: password123
 *               username:
 *                 type: string
 *                 example: somchai88
 *               role:
 *                 type: string
 *                 enum: [PLAYER, ORGANIZER]
 *     responses:
 *       201:
 *         description: ลงทะเบียนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 expiresIn:
 *                   type: integer
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       409:
 *         description: อีเมลหรือชื่อผู้ใช้ซ้ำ
 */
router.post('/register', authController_1.register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: เข้าสู่ระบบ
 *     description: ตรวจสอบอีเมลและรหัสผ่านแล้วคืน JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: somchai@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *       401:
 *         description: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
 */
router.post('/login', authController_1.login);
/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: เปลี่ยนรหัสผ่าน
 *     description: ต้องแนบ JWT ใน Authorization header ก่อนเรียกใช้งาน
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: เปลี่ยนรหัสผ่านสำเร็จ
 *       400:
 *         description: รหัสผ่านเดิมไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */
router.post('/change-password', authMiddleware_1.default, authController_1.changePasswordHandler);
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: ดึงข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบัน
 *     description: ต้องแนบ JWT ใน Authorization header ก่อนเรียกใช้งาน
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: คืนข้อมูลผู้ใช้
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */
router.get('/me', authMiddleware_1.default, authController_1.me);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map