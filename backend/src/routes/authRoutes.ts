import express from "express";
import { prisma } from "../services/prismaClient";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication with Clerk + Backend
 */

/**
 * @swagger
 * /auth/create-from-clerk:
 *   post:
 *     summary: สร้างหรืออัปเดตผู้ใช้หลังสมัครผ่าน Clerk
 *     description: ตรวจสอบจาก userName และ email ถ้ามีอยู่แล้วให้ update เฉยๆ ถ้าไม่มีให้สร้างใหม่
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - role
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [PLAYER, ORGANIZER]
 *     responses:
 *       200:
 *         description: สำเร็จ ส่ง role กลับ
 *       400:
 *         description: ข้อมูลไม่ครบ
 *       500:
 *         description: เซิร์ฟเวอร์มีปัญหา
 */
router.post("/create-from-clerk", async (req, res) => {
  try {
    const { userName, email, firstName, lastName, role } = req.body;

    if (!userName || !email) {
      return res.status(400).json({ error: "Missing required data" });
    }

    // 1) หา user จาก userName ก่อน
    let user = await prisma.user.findFirst({
      where: { userName },
    });

    // 2) ถ้าไม่เจอ ให้ลองหา email (กัน email ซ้ำ)
    if (!user) {
      user = await prisma.user.findFirst({
        where: { email },
      });
    }

    // 3) ถ้ายังไม่เจอ → สร้างใหม่
    if (!user) {
      user = await prisma.user.create({
        data: {
          userName,
          email,
          role,
          firstName: firstName || "Clerk",
          lastName: lastName || "User",
          password: "CLERK_AUTH",
        },
      });
    } else {
      // 4) ถ้าเจอ user อยู่แล้ว → update เฉพาะ role + userName (กัน userName เก่า)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          userName,
          role,
        },
      });
    }

    return res.json({ success: true, role });
  } catch (err) {
    console.error("create-from-clerk error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * @swagger
 * /auth/get-role:
 *   get:
 *     summary: ดึง role ของผู้ใช้จาก userName (clerkId)
 *     description: ใช้หลังจาก login เพื่อ redirect หน้า
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: userName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: role หรือ null
 *       400:
 *         description: ไม่มี userName
 *       500:
 *         description: server error
 */
router.get("/get-role", async (req, res) => {
  try {
    const { userName } = req.query;

    if (!userName) {
      return res.status(400).json({ error: "Missing userName" });
    }

    const user = await prisma.user.findFirst({
      where: { userName: String(userName) },
    });

    if (!user) return res.json({ role: null });

    return res.json({ role: user.role });
  } catch (err) {
    console.error("get-role error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: ดึงข้อมูลผู้ใช้ (ต้องมี token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ส่งข้อมูล user กลับ
 *       401:
 *         description: ไม่มี token
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * @swagger
 * /auth/me:
 *   patch:
 *     summary: อัปเดตข้อมูลผู้ใช้
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: req.body,
    });

    return res.json(user);
  } catch (err) {
    console.error("PATCH /me error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
