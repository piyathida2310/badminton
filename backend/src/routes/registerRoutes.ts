import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";
import { uploadVideo } from "../middleware/uploadVideo";
import {
    createRegistration,
    getRegistrationsByTournament,
    getUserRegistrations,
    getTournamentApplicantsForOrganizer,
    updateRegistrationEvaluation,
    updatePaymentStatus,
    uploadPaymentSlip,
    getPaymentSlip,
    requestCancellation,
    getTournamentCancellations,
    processRefund,
} from "../controllers/registerController";

const router = Router();

/**
 * @swagger
 * /tournament/{tournamentId}/register:
 *   post:
 *     summary: สมัครเข้าร่วมการแข่งขัน (Register to Tournament)
 *     description: สมัครเข้าร่วมการแข่งขันแบบเดี่ยวหรือคู่ พร้อมอัปโหลดไฟล์วิดีโอคลิปการเล่นเพื่อประเมินฝีมือ
 *     tags:
 *       - Registration & Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการแข่งขัน
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - teamName
 *               - managerName
 *               - player1Name
 *               - player1Phone
 *               - player1Gender
 *               - player1Birthday
 *               - playType
 *               - mode
 *             properties:
 *               teamName:
 *                 type: string
 *                 example: "ทีมพญาไท"
 *               managerName:
 *                 type: string
 *                 example: "ผู้จัดการสมศักดิ์"
 *               player1Name:
 *                 type: string
 *                 example: "สมชาย รักดี"
 *               player1Phone:
 *                 type: string
 *                 example: "0812345678"
 *               player1Gender:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *                 example: "MALE"
 *               player1Birthday:
 *                 type: string
 *                 format: date
 *                 example: "1998-05-15"
 *               player2Name:
 *                 type: string
 *                 example: "สมศักดิ์ สีสัน"
 *                 description: (เฉพาะแข่งแบบคู่)
 *               player2Phone:
 *                 type: string
 *                 example: "0898765432"
 *                 description: (เฉพาะแข่งแบบคู่)
 *               player2Gender:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *                 example: "MALE"
 *                 description: (เฉพาะแข่งแบบคู่)
 *               player2Birthday:
 *                 type: string
 *                 format: date
 *                 example: "1997-11-20"
 *                 description: (เฉพาะแข่งแบบคู่)
 *               playType:
 *                 type: string
 *                 enum: [BG, NB, N, S, P_MINUS, P_PLUS]
 *                 example: "N"
 *                 description: รุ่นฝีมือที่ต้องการสมัคร
 *               mode:
 *                 type: string
 *                 enum: [single, double]
 *                 example: "double"
 *                 description: โหมดการแข่งเดี่ยวหรือคู่
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์วิดีโอคลิปการเล่นของนักกีฬาเพื่อใช้ประเมินฝีมือ
 *     responses:
 *       201:
 *         description: สมัครสำเร็จ
 *       400:
 *         description: ข้อมูลนำเข้าไม่ครบถ้วน หรือทัวร์นาเมนต์นี้รับสมัครนักกีฬาเต็มแล้ว
 *       404:
 *         description: ไม่พบทัวร์นาเมนต์
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.post(
    "/tournament/:tournamentId/register",
    authMiddleware,
    uploadVideo.fields([{ name: "video" }]),
    createRegistration
);

/**
 * @swagger
 * /tournament/{tournamentId}/registrations:
 *   get:
 *     summary: ดึงรายการผู้สมัครทั้งหมดในทัวร์นาเมนต์ (Get registrations by tournament)
 *     description: แสดงประวัติผู้สมัครพร้อมข้อมูลไฟล์สื่อและข้อมูลการเงิน
 *     tags:
 *       - Registration & Payment
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
 *         description: ดึงข้อมูลสำเร็จ
 *       400:
 *         description: พารามิเตอร์ไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.get(
    "/tournament/:tournamentId/registrations",
    authMiddleware,
    getRegistrationsByTournament
);

/**
 * @swagger
 * /tournament/{tournamentId}/applicants:
 *   get:
 *     summary: ดึงผู้สมัครพร้อมรายละเอียดเพศ/การชำระเงินสำหรับผู้จัด (Get Applicants for Organizer Dashboard)
 *     description: สำหรับผู้จัดทัวร์นาเมนต์เท่านั้น ใช้สำหรับตรวจสอบข้อมูลอย่างละเอียด และประเมินผลการโอนสลิปและฝีมือการเล่น
 *     tags:
 *       - Registration & Payment
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
 *         description: ดึงข้อมูลสำเร็จ
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น ORGANIZER ผู้จัดทัวร์นาเมนต์นี้เท่านั้น)
 *       404:
 *         description: ไม่พบทัวร์นาเมนต์
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.get(
    "/tournament/:tournamentId/applicants",
    authMiddleware,
    getTournamentApplicantsForOrganizer
);

/**
 * @swagger
 * /user/registrations:
 *   get:
 *     summary: ดึงรายการประวัติการสมัครทัวร์นาเมนต์ของผู้ใช้ปัจจุบัน (My Registrations)
 *     description: ดึงข้อมูลรายการแข่งขันและประวัติการสมัครทั้งหมดที่ผู้ใช้ล็อกอินเป็นคนสมัคร
 *     tags:
 *       - Registration & Payment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 *       500:
 *         description: เกิดข้อผิดพลาดของระบบ
 */
router.get("/user/registrations", authMiddleware, getUserRegistrations);

/**
 * @swagger
 * /registration/{registrationId}/evaluation:
 *   patch:
 *     summary: ประเมินคะแนนและระดับฝีมือผู้สมัคร (Evaluation - Organizer only)
 *     description: สำหรับผู้จัดทำการใส่คะแนนประเมิน, ความคิดเห็น และปรับเปลี่ยนระดับสถานะของผู้สมัคร (เช่น ผ่าน หรือ ไม่ผ่าน)
 *     tags:
 *       - Registration & Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสใบสมัคร (Registration ID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *                 example: 8.5
 *                 description: คะแนนประเมินความสามารถ
 *               comment:
 *                 type: string
 *                 example: "ทักษะดีมาก เหมาะสมกับรุ่นฝีมือ N"
 *               status:
 *                 type: string
 *                 enum: [WAITING, PASSED, FAILED]
 *                 example: "PASSED"
 *                 description: สถานะการประเมิน
 *     responses:
 *       200:
 *         description: ประเมินเรียบร้อย
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็นผู้จัด)
 *       404:
 *         description: ไม่พบข้อมูลใบสมัคร
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.patch(
    "/registration/:registrationId/evaluation",
    authMiddleware,
    updateRegistrationEvaluation
);

/**
 * @swagger
 * /registration/{registrationId}/payment/status:
 *   patch:
 *     summary: ตรวจสอบและอัปเดตสถานะการจ่ายค่าสมัคร (Update Payment Status - Organizer only)
 *     description: อัปเดตยืนยันการโอนเงินหรือปฏิเสธสำหรับยอดการจ่ายเงินตามสลิป
 *     tags:
 *       - Registration & Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสใบสมัคร
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, REJECTED]
 *                 example: "CONFIRMED"
 *                 description: สถานะการโอนเงิน
 *     responses:
 *       200:
 *         description: อัปเดตสถานะการชำระเงินเรียบร้อย
 *       400:
 *         description: สถานะการจ่ายเงินไม่ถูกต้อง
 *       403:
 *         description: ไม่มีสิทธิ์
 *       404:
 *         description: ไม่พบการสมัคร
 */
router.patch(
    "/registration/:registrationId/payment/status",
    authMiddleware,
    updatePaymentStatus
);

/**
 * @swagger
 * /registration/{registrationId}/payment/slip:
 *   post:
 *     summary: อัปโหลดสลิปหลักฐานการโอนเงิน (Upload Payment Slip - User only)
 *     description: ผู้สมัครทำการส่งภาพสลิปหลักฐานการชำระเงินค่าสมัครเข้าร่วมแข่งขัน
 *     tags:
 *       - Registration & Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสใบสมัคร
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - slip
 *             properties:
 *               slip:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์ภาพสลิปหลักฐานการชำระเงิน
 *     responses:
 *       200:
 *         description: อัปโหลดและบันทึกสลิปสำเร็จ
 *       400:
 *         description: ข้อมูลรูปภาพสลิปไม่ถูกต้อง
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (อัปโหลดแทนกันไม่ได้)
 *       404:
 *         description: ไม่พบการสมัคร
 */
router.post(
    "/registration/:registrationId/payment/slip",
    authMiddleware,
    upload.fields([{ name: "slip" }]),
    uploadPaymentSlip
);

/**
 * @swagger
 * /payment/slip/{registrationId}:
 *   get:
 *     summary: ดึงภาพหรือลิงก์ของสลิปโอนเงิน (Get Payment Slip URL)
 *     description: ดึงลิงก์รูปแบบ Presigned URL เพื่อใช้นำทางไปเปิดรูปสลิปจาก Object Storage ของใบสมัครที่กำหนด
 *     tags:
 *       - Registration & Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสใบสมัคร
 *     responses:
 *       200:
 *         description: ดึงรูปสลิปสำเร็จ
 *       403:
 *         description: ไม่มีสิทธิ์ดู
 *       404:
 *         description: ไม่พบไฟล์สลิปหรือใบสมัคร
 */
router.get(
    "/payment/slip/:registrationId",
    authMiddleware,
    getPaymentSlip
);

/**
 * @swagger
 * /registration/{registrationId}/cancel:
 *   post:
 *     summary: ขอขอยกเลิกการสมัครแข่งขัน (Request Cancellation - User only)
 *     description: สมาชิกทำการแจ้งความประสงค์ที่จะขอยกเลิกการสมัคร
 *     tags:
 *       - Cancellation & Refund
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสใบสมัคร
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "ติดธุระส่วนตัว ไม่สามารถมาแข่งได้"
 *               bankName:
 *                 type: string
 *                 example: "กสิกรไทย"
 *               accountNum:
 *                 type: string
 *                 example: "123-4-56789-0"
 *               accountName:
 *                 type: string
 *                 example: "สมชาย ใจดี"
 *     responses:
 *       200:
 *         description: ส่งคำขอยกเลิกเรียบร้อย
 *       400:
 *         description: คำขอยกเลิกนี้ซ้ำซ้อนหรือมีอยู่แล้ว
 *       403:
 *         description: ไม่มีสิทธิ์ขอยกเลิกแทนผู้อื่น
 *       404:
 *         description: ไม่พบการสมัคร
 */
router.post(
    "/registration/:registrationId/cancel",
    authMiddleware,
    requestCancellation
);

/**
 * @swagger
 * /tournament/{tournamentId}/cancellations:
 *   get:
 *     summary: ดึงข้อมูลรายการยกเลิกทั้งหมดเพื่อดำเนินเรื่องคืนเงิน (Get Cancellations for Organizer)
 *     description: แสดงรายการที่ผู้จัดทัวร์นาเมนต์จะต้องดำเนินการคืนเงินให้ผู้สมัคร
 *     tags:
 *       - Cancellation & Refund
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
 *         description: ดึงสำเร็จ
 *       403:
 *         description: สิทธิ์การเข้าถึงถูกปฏิเสธ
 *       404:
 *         description: ไม่พบทัวร์นาเมนต์
 */
router.get(
    "/tournament/:tournamentId/cancellations",
    authMiddleware,
    getTournamentCancellations
);

/**
 * @swagger
 * /registration/{registrationId}/refund:
 *   patch:
 *     summary: ยืนยันการดำเนินการคืนเงินหรืออัปเดตสถานะยกเลิก (Process Refund - Organizer only)
 *     description: อัปเดตสถานะคำร้องของรายการคืนเงิน พร้อมปรับปรุงสถานะการสมัครเข้าร่วมการแข่งขันเป็น FAILED เพื่อสละสิทธิ์และเปิดโอกาสให้ผู้อื่นสมัคร
 *     tags:
 *       - Cancellation & Refund
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสใบสมัคร
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [REFUNDED, REJECTED]
 *                 example: "REFUNDED"
 *                 description: สถานะการคืนเงิน
 *     responses:
 *       200:
 *         description: ดำเนินเรื่องคืนเงินสำเร็จ
 *       400:
 *         description: สถานะที่ส่งเข้ามาไม่ถูกต้อง
 *       403:
 *         description: ไม่มีสิทธิ์
 *       404:
 *         description: ไม่พบข้อมูลผู้สมัคร
 */
router.patch(
    "/registration/:registrationId/refund",
    authMiddleware,
    processRefund
);

export default router;
