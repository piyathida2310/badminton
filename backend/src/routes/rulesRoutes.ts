import {Router} from "express"
import authMiddleware from '../middleware/authMiddleware';
import {createRules,getRules,updateRules,getRule} from "../controllers/rulesController"

const router = Router();

/**
 * @swagger
 * /rules:
 *   get:
 *     summary: ดึงข้อมูลกติกาการแข่งขันทั้งหมด
 *     description: คืนค่ารายการกติกาการแข่งขันที่มีอยู่ในระบบทั้งหมด
 *     tags:
 *       - Rules
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */
router.get('/', authMiddleware, getRules);

/**
 * @swagger
 * /rules/{id}:
 *   get:
 *     summary: ดึงข้อมูลกติกาทีละรายการตาม ID
 *     description: คืนค่าข้อมูลกติกาตาม ID ที่กำหนด
 *     tags:
 *       - Rules
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสกติกา
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *       400:
 *         description: ID ไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */
router.get('/:id', authMiddleware, getRule);

/**
 * @swagger
 * /rules:
 *   post:
 *     summary: สร้างกติกาการแข่งขันใหม่
 *     description: สร้างกติกาใหม่บันทึกลงระบบ
 *     tags:
 *       - Rules
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "กติกาการเสิร์ฟลูก: ผู้เสิร์ฟต้องส่งลูกจากด้านล่างเอว..."
 *     responses:
 *       201:
 *         description: สร้างสำเร็จ
 *       400:
 *         description: ข้อมูลนำเข้าไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */
router.post('/', authMiddleware, createRules);

/**
 * @swagger
 * /rules/{id}:
 *   put:
 *     summary: แก้ไขข้อมูลกติกา
 *     description: อัปเดตกติกาที่มีอยู่ในระบบโดยระบุ ID
 *     tags:
 *       - Rules
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสกติกา
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "กติกาการนับคะแนน (อัปเดตใหม่): ฝ่ายที่ได้ 21 คะแนนก่อนจะเป็นผู้ชนะในเซ็ตนั้น..."
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลสำเร็จ
 *       400:
 *         description: ID หรือข้อมูลนำเข้าไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: ไม่พบกติกาตาม ID ที่ระบุ
 */
router.put('/:id', authMiddleware, updateRules);

export default router;
