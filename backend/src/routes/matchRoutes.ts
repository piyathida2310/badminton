
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { getGroupDetails, updateGroupMatchScore, updateBracketMatchScore, getBracketMatches, getMatchHistory } from "../controllers/matchController";

const router = Router();

/**
 * @swagger
 * /matches/{tournamentId}:
 *   get:
 *     summary: ดึงรายละเอียดการแข่งขันรอบแบ่งกลุ่มและตารางคะแนน (Group Matches & Rankings)
 *     description: ต้องแนบ JWT ใน Authorization header และระบุ `tournamentId` ในพาร์ท และ `groupName` ในคิวรีพารามิเตอร์
 *     tags:
 *       - Matches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน (Tournament ID)
 *       - in: query
 *         name: groupName
 *         required: true
 *         schema:
 *           type: string
 *         example: "Group A"
 *         description: ชื่อกลุ่มแข่งขัน (เช่น Group A, Group B)
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ ส่งกลับตารางคะแนน Rank และข้อมูลแมตช์ในกลุ่ม
 *       400:
 *         description: พารามิเตอร์ไม่ครบถ้วน
 *       404:
 *         description: ไม่พบกลุ่มที่ระบุ
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
router.get("/matches/:tournamentId", authMiddleware, getGroupDetails);

/**
 * @swagger
 * /group-matches/{matchId}:
 *   put:
 *     summary: บันทึก/แก้ไขคะแนนการแข่งขันรอบแบ่งกลุ่ม (Update Group Match Score)
 *     description: อัปเดตผลการแข่งขันและข้อมูลเวลาของแมตช์แบ่งกลุ่มที่กำหนด
 *     tags:
 *       - Matches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสแมตช์แบ่งกลุ่ม
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score1:
 *                 type: integer
 *                 example: 21
 *                 description: คะแนนของทีมแรก
 *               score2:
 *                 type: integer
 *                 example: 19
 *                 description: คะแนนของทีมสอง
 *               sets:
 *                 type: string
 *                 example: "21-19"
 *                 description: ผลคะแนนแยกเป็นเซ็ต (เช่น "21-19" หรือ "21-19,21-18")
 *               shuttle:
 *                 type: integer
 *                 example: 2
 *                 description: จำนวนลูกแบดมินตันที่ใช้
 *               time:
 *                 type: string
 *                 example: "14:30"
 *                 description: เวลาแข่งขัน (รูปแบบ HH:MM)
 *     responses:
 *       200:
 *         description: อัปเดตผลสำเร็จ
 *       404:
 *         description: ไม่พบแมตช์ที่ระบุ
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
router.put("/group-matches/:matchId", authMiddleware, updateGroupMatchScore);

/**
 * @swagger
 * /bracket-matches/{tournamentId}:
 *   get:
 *     summary: ดึงหรือสร้างสายการแข่งขันรอบน็อกเอาต์ (Get/Initialize Bracket Matches)
 *     description: ดึงข้อมูลสายการแข่งขันตามประเภทรุ่นฝีมือ (Hand Type) หรือดึงข้อมูลทั้งหมด หากยังไม่เคยมีการตั้งต้นสาย จะทำการคำนวณและตั้งต้นให้โดยอัตโนมัติ
 *     tags:
 *       - Matches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *       - in: query
 *         name: handType
 *         schema:
 *           type: string
 *           enum: [BG, NB, N, S, P_MINUS, P_PLUS]
 *         required: false
 *         description: รุ่นระดับฝีมือ
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         required: false
 *         description: หากเป็น true จะดึงสายการแข่งขันทุกรุ่น
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสายที่มีการตั้งค่าอยู่แล้วสำเร็จ
 *       201:
 *         description: ตั้งต้นสร้างสายการแข่งขันใหม่สำเร็จ
 *       400:
 *         description: รหัสทัวร์นาเมนต์ไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
router.get("/bracket-matches/:tournamentId", authMiddleware, getBracketMatches);

/**
 * @swagger
 * /bracket-matches/{matchId}:
 *   put:
 *     summary: บันทึก/แก้ไขคะแนนและผู้เล่นในสายประกบคู่รอบน็อกเอาต์ (Update Bracket Score & Players)
 *     description: อัปเดตผลการแข่งขันรอบสายประกบคู่ พร้อมคำนวณและส่งต่อผู้ชนะ (Winner) ไปยังรอบถัดไปโดยอัตโนมัติ
 *     tags:
 *       - Matches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสแมตช์รอบน็อกเอาต์
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score1:
 *                 type: integer
 *                 example: 21
 *               score2:
 *                 type: integer
 *                 example: 15
 *               sets:
 *                 type: string
 *                 example: "21-15"
 *               shuttle:
 *                 type: integer
 *                 example: 3
 *               time:
 *                 type: string
 *                 example: "16:00"
 *               player1Id:
 *                 type: integer
 *                 example: 5
 *                 description: เปลี่ยนตัว/กำหนดคู่ผู้สมัครที่ 1 (หากสายขยับมาเองจะส่งมาออโต้)
 *               player2Id:
 *                 type: integer
 *                 example: 12
 *                 description: เปลี่ยนตัว/กำหนดคู่ผู้สมัครที่ 2
 *     responses:
 *       200:
 *         description: อัปเดตข้อมูลและเลื่อนตำแหน่งผู้ชนะในสายเรียบร้อย
 *       404:
 *         description: ไม่พบแมตช์ที่ระบุ
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
router.put("/bracket-matches/:matchId", authMiddleware, updateBracketMatchScore);

/**
 * @swagger
 * /match-history/{tournamentId}:
 *   get:
 *     summary: ดึงประวัติและสถานะแมตช์ทั้งหมดในรายการแข่งขัน (Match History)
 *     description: ดึงข้อมูลผลการแข่ง สถานะ เวลา และคู่การแข่งของทั้งรอบแบ่งกลุ่มและรอบสายประกบคู่ทั้งหมดในรายการเดียว
 *     tags:
 *       - Matches
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
 *         description: ดึงประวัติรายการแข่งสำเร็จ
 *       400:
 *         description: รหัสรายการแข่งขันไม่ถูกต้อง
 *       404:
 *         description: ไม่พบรายการแข่งขัน
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
router.get("/match-history/:tournamentId", authMiddleware, getMatchHistory);

export default router;
