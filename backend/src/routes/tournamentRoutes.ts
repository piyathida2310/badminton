import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";
import {
  createTournament,
  getTournaments,
  getTournament,
  getPoster,
  getQr,
  updateTournament,
  managegroup,
  updateManualGroups,
  getPaymentQr,
  cancelTournamentRank,
} from "../controllers/tournamentController";

const router = Router();

/**
 * @swagger
 * /tournament:
 *   get:
 *     summary: ดึงข้อมูลรายการแข่งขันทั้งหมด (Get All Tournaments)
 *     description: ดึงรายการทัวร์นาเมนต์ทั้งหมดในระบบ พร้อมระบบแบ่งหน้า (Pagination) และสามารถกรองตามความต้องการ เช่น ดึงเฉพาะรายการที่ตัวเราเป็นผู้จัด (myOnly=true) หรือกรองช่วงเวลาจัดแข่ง (upcoming / past)
 *     tags:
 *       - Tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: เลขหน้าที่ต้องการดึงข้อมูล
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: จำนวนรายการต่อหน้า
 *       - in: query
 *         name: myOnly
 *         schema:
 *           type: boolean
 *         description: ดึงเฉพาะทัวร์นาเมนต์ที่ตนเองเป็นผู้จัด (ORGANIZER)
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [upcoming, past, registered]
 *         description: ตัวกรองประเภทการแข่งขัน (upcoming = กำลังจะเกิดขึ้น, past = ผ่านมาแล้ว, registered = ที่เราลงสมัครแข่ง)
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get("/", authMiddleware, getTournaments);

/**
 * @swagger
 * /tournament/{id}:
 *   get:
 *     summary: ดึงรายละเอียดการแข่งขันตาม ID (Get Tournament Detail)
 *     description: ดึงข้อมูลอย่างละเอียดของรายการแข่งขันที่ระบุ รวมถึงกติกา กลุ่มการแข่งขัน ตารางการแข่งขันรอบแบ่งกลุ่ม และข้อมูลผู้ลงสมัคร
 *     tags:
 *       - Tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *     responses:
 *       200:
 *         description: ดึงข้อมูลรายละเอียดสำเร็จ
 *       400:
 *         description: รหัสทัวร์นาเมนต์ไม่ถูกต้อง
 *       404:
 *         description: ไม่พบรายการแข่งขันที่ระบุ
 *       500:
 *         description: เกิดข้อผิดพลาดของระบบ
 */
router.get("/:id", authMiddleware, getTournament);

/**
 * @swagger
 * /tournament/poster/{id}:
 *   get:
 *     summary: ดึง URL รูปภาพโปสเตอร์การแข่งขัน (Get Poster Image URL)
 *     description: สร้าง Presigned URL จาก Object Storage เพื่อใช้นำทางไปเปิดหรือดาวน์โหลดรูปภาพโปสเตอร์รายการแข่งขัน
 *     tags:
 *       - Tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *     responses:
 *       200:
 *         description: สร้าง URL สำเร็จ
 *       404:
 *         description: ไม่พบไฟล์โปสเตอร์หรือทัวร์นาเมนต์
 *       500:
 *         description: เกิดข้อผิดพลาดของระบบ
 */
router.get("/poster/:id", authMiddleware, getPoster);

/**
 * @swagger
 * /tournament/qr/{id}:
 *   get:
 *     summary: ดึง URL รูปภาพ QR Code สำหรับติดต่อกลุ่ม (Get Group QR Code URL)
 *     description: สร้าง Presigned URL สำหรับรูปภาพ QR Code (เช่น สำหรับเข้ากลุ่มสื่อสารของรายการแข่งขัน)
 *     tags:
 *       - Tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *     responses:
 *       200:
 *         description: สร้าง URL สำเร็จ
 *       404:
 *         description: ไม่พบไฟล์ QR Code
 *       500:
 *         description: เกิดข้อผิดพลาดของระบบ
 */
router.get("/qr/:id", authMiddleware, getQr);

/**
 * @swagger
 * /tournament/payment/qr/{id}:
 *   get:
 *     summary: ดึง URL รูปภาพ QR Code สำหรับรับชำระเงิน (Get Payment QR Code URL)
 *     description: สร้าง Presigned URL สำหรับรูปภาพ QR Code เพื่อใช้ในการจ่ายค่าสมัครเข้าร่วมการแข่งขัน
 *     tags:
 *       - Tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *     responses:
 *       200:
 *         description: สร้าง URL สำเร็จ
 *       400:
 *         description: รหัสทัวร์นาเมนต์ไม่ถูกต้อง
 *       404:
 *         description: ไม่พบไฟล์ QR Code การชำระเงิน
 *       500:
 *         description: เกิดข้อผิดพลาดของระบบ
 */
router.get("/payment/qr/:id", authMiddleware, getPaymentQr);

/**
 * @swagger
 * /tournament:
 *   post:
 *     summary: สร้างรายการแข่งขันใหม่ (Create Tournament)
 *     description: ผู้ใช้ที่ต้องการจัดแข่งขันทำการลงทะเบียนทัวร์นาเมนต์ โดยต้องส่งในรูปแบบ multipart/form-data และอัปโหลดไฟล์ posterImg และ qrCodeImg
 *     tags:
 *       - Tournament
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - playType
 *               - rank
 *               - shuttlePrice
 *               - maxPlayers
 *               - ruleId
 *               - posterImg
 *               - qrCodeImg
 *             properties:
 *               name:
 *                 type: string
 *                 example: "แบดมินตันชิงแชมป์ท้องถิ่น 2026"
 *                 description: ชื่อรายการแข่งขัน
 *               location:
 *                 type: string
 *                 example: "สนามแบดมินตันพระราม 9"
 *                 description: สถานที่จัดการแข่งขัน
 *               playType:
 *                 type: string
 *                 enum: [SINGLE, DOUBLE]
 *                 example: "DOUBLE"
 *                 description: ประเภทผู้เล่น (เดี่ยว หรือ คู่)
 *               rank:
 *                 type: string
 *                 example: '["BG", "NB", "N"]'
 *                 description: ระดับมือที่เปิดรับสมัคร (ส่งเป็น JSON String Array)
 *               shuttlePrice:
 *                 type: string
 *                 example: "50"
 *                 description: ราคาลูกแบดมินตันต่อลูก
 *               maxPlayers:
 *                 type: integer
 *                 example: 32
 *                 description: จำนวนผู้เล่นหรือคู่ที่สามารถลงสมัครสูงสุด
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-01T09:00:00.000Z"
 *                 description: วันเวลาเริ่มต้นแข่งขัน (ห้ามเป็นเวลาที่ผ่านมาแล้ว)
 *               ruleId:
 *                 type: integer
 *                 example: 1
 *                 description: รหัสกติกากลางที่อ้างอิงใช้ในการแข่ง
 *               isLowerBracket:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 example: "false"
 *                 description: กำหนดว่ามีสายล่าง (Lower Bracket) หรือรอบแก้ตัวหรือไม่
 *               posterImg:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์ภาพโปสเตอร์โฆษณาการแข่งขัน
 *               qrCodeImg:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์ภาพ QR Code เพื่อติดต่อหรือจ่ายเงิน
 *     responses:
 *       201:
 *         description: สร้างรายการแข่งขันสำเร็จ
 *       400:
 *         description: ข้อมูลนำเข้าหรือรูปแบบไม่ถูกต้อง หรือไฟล์ไม่ครบถ้วน
 *       500:
 *         description: เกิดข้อผิดพลาดของระบบ
 */
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "posterImg" },
    { name: "qrCodeImg" },
  ]),
  createTournament
);

/**
 * @swagger
 * /tournament/{id}:
 *   put:
 *     summary: ยกเลิกการจัดการแข่งขัน (Cancel/Close Tournament)
 *     description: ผู้จัดทัวร์นาเมนต์ทำการสั่งยกเลิก/ปิดรายการแข่งขันนี้ (ไม่อนุญาตให้แก้ไขหรือทำรายการอื่นอีก)
 *     tags:
 *       - Tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *     responses:
 *       200:
 *         description: ยกเลิกรายการสำเร็จ
 *       400:
 *         description: การดำเนินการผิดพลาด (ไม่ใช่ผู้จัดทัวร์นาเมนต์ หรือทัวร์นาเมนต์ยกเลิกไปก่อนหน้าแล้ว)
 *       404:
 *         description: ไม่พบรายการแข่งขัน
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.put("/:id", authMiddleware, updateTournament);

/**
 * @swagger
 * /tournament/cancel-rank/{id}:
 *   put:
 *     summary: ปิด/ยกเลิกระดับฝีมือเฉพาะรุ่น (Cancel Specific Rank Category)
 *     description: สำหรับผู้จัด ยกเลิกการจัดการแข่งขันเฉพาะรุ่นมือ (Hand Type) ที่ระบุในรายการแข่งขันนี้
 *     tags:
 *       - Tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rank
 *             properties:
 *               rank:
 *                 type: string
 *                 enum: [BG, NB, N, S, P_MINUS, P_PLUS]
 *                 example: "BG"
 *                 description: รุ่นมือฝีมือที่ต้องการยกเลิก
 *     responses:
 *       200:
 *         description: ยกเลิกรุ่นฝีมือสำเร็จ
 *       400:
 *         description: ไม่พบรุ่นฝีมือนี้ในทัวร์นาเมนต์ หรือข้อมูลนำเข้าไม่ถูกต้อง
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (ไม่ใช่ผู้จัดของทัวร์นาเมนต์นี้)
 *       404:
 *         description: ไม่พบรายการแข่งขันที่ระบุ
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.put("/cancel-rank/:id", authMiddleware, cancelTournamentRank);

/**
 * @swagger
 * /tournament/managegroup/{id}:
 *   post:
 *     summary: จัดแบ่งกลุ่มผู้สมัครด้วยระบบ AI อัตโนมัติ (Auto Organize Groups)
 *     description: สำหรับผู้จัด ดำเนินการให้ AI/ระบบจัดแบ่งกลุ่มและสร้างตารางแมตช์พบกันหมดภายในกลุ่ม (Round Robin) ในระดับฝีมือที่ระบุ
 *     tags:
 *       - Tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playType
 *             properties:
 *               playType:
 *                 type: string
 *                 enum: [BG, NB, N, S, P_MINUS, P_PLUS]
 *                 example: "N"
 *                 description: รุ่นมือที่ต้องการจัดกลุ่ม
 *               detail:
 *                 type: string
 *                 example: "โปรดจัดแบบเฉลี่ยระดับความสามารถในแต่ละกลุ่มให้เท่ากันที่สุด"
 *                 description: รายละเอียดหรือเงื่อนไขเพิ่มเติมที่อยากแจ้งให้ AI ทราบ
 *               requireReason:
 *                 type: boolean
 *                 example: true
 *                 description: ต้องการให้ระบบอธิบายเหตุผลในการจัดกลุ่มหรือไม่
 *               language:
 *                 type: string
 *                 enum: [th, en]
 *                 example: "th"
 *                 default: "th"
 *                 description: ภาษาหลักที่ใช้อธิบายเหตุผลในการแบ่งกลุ่ม
 *     responses:
 *       200:
 *         description: จัดกลุ่มและสร้างตารางแมตช์สำเร็จ
 *       400:
 *         description: ดำเนินการล้มเหลว (เช่น ข้อมูลไม่พร้อม หรือรุ่นฝีมือไม่ถูกต้อง)
 *       404:
 *         description: ไม่พบทัวร์นาเมนต์
 *       500:
 *         description: เกิดข้อผิดพลาดในการทำรายการ
 */
router.post("/managegroup/:id", authMiddleware, managegroup);

/**
 * @swagger
 * /manual-update-groups/{id}:
 *   put:
 *     summary: แก้ไขและบันทึกการแบ่งกลุ่มด้วยตนเอง (Manual Update Groups - Organizer Only)
 *     description: สำหรับผู้จัด ทำการสลับ ย้าย หรือกำหนดทีมที่อยู่ในกลุ่มต่างๆ ด้วยตนเอง โดยระบบจะล้างกลุ่มและสร้างตารางแมตช์พบกันหมดใหม่ให้โดยอัตโนมัติ
 *     tags:
 *       - Tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playType
 *               - groups
 *             properties:
 *               playType:
 *                 type: string
 *                 enum: [BG, NB, N, S, P_MINUS, P_PLUS]
 *                 example: "N"
 *                 description: รุ่นมือที่ต้องการอัปเดตกลุ่ม
 *               groups:
 *                 type: array
 *                 description: รายการโครงสร้างการแบ่งกลุ่มผู้สมัครแข่งขัน
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - teams
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "กลุ่ม A"
 *                       description: ชื่อของกลุ่ม
 *                     teams:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - id
 *                           - name
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 12
 *                             description: รหัสใบสมัครผู้เข้าแข่งขัน/ทีม
 *                           name:
 *                             type: string
 *                             example: "สมชาย & สมศักดิ์"
 *                             description: ชื่อทีม
 *     responses:
 *       200:
 *         description: อัปเดตและสร้างตารางแมตช์สำเร็จ
 *       400:
 *         description: ข้อมูลนำเข้าไม่ถูกต้อง
 *       404:
 *         description: ไม่พบรายการแข่งขัน
 *       500:
 *         description: เกิดข้อผิดพลาดของระบบ
 */

export default router;
