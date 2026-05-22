
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { getTournamentSummary, refreshTournamentSummaryEndpoint } from "../controllers/summaryController";

const router = Router();

/**
 * @swagger
 * /summary/{tournamentId}:
 *   get:
 *     summary: ดึงข้อมูลสรุปผลการแข่งขันและตารางอันดับรางวัล (Get Tournament Summary)
 *     description: คำนวณและดึงข้อมูลรายชื่อผู้ชนะรางวัลอันดับที่ 1, 2 และ 3 (ทั้งรอบ Upper และ Lower) พร้อมข้อมูลการใช้ลูกแบดมินตันของแต่ละทีม
 *     tags:
 *       - Summary & Results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสรุปรางวัลสำเร็จ
 *       400:
 *         description: รหัสทัวร์นาเมนต์ไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดของระบบ
 */
router.get("/summary/:tournamentId", authMiddleware, getTournamentSummary);

/**
 * @swagger
 * /summary/{tournamentId}/refresh:
 *   post:
 *     summary: สั่งคำนวณและอัปเดตตารางสรุปผลรางวัลใหม่แบบแมนนวล (Manual Refresh Summary)
 *     description: เรียกใช้เพื่อคำนวณและประมวลผลอันดับรางวัลของทีมต่าง ๆ จากตารางผลการแข่งขันรอบน็อกเอาต์ใหม่ทันที
 *     tags:
 *       - Summary & Results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *     responses:
 *       200:
 *         description: อัปเดตและคำนวณสรุปรางวัลสำเร็จ
 *       400:
 *         description: รหัสทัวร์นาเมนต์ไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดของระบบ
 */
router.post("/summary/:tournamentId/refresh", authMiddleware, refreshTournamentSummaryEndpoint);

export default router;
