import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {createCompet,getCompets,updateCompet,deleteCompet } from "../controllers/competitionController"

const router = Router();

/**
 * @swagger
 * /compet:
 *   get:
 *     summary: ดึงข้อมูลระดับการแข่งขันทั้งหมด
 *     description: คืนค่ารายการระดับการแข่งขันทั้งหมด หากระบุ `tournamentId` จะคืนค่าเฉพาะทัวร์นาเมนต์นั้น (หากยังไม่มีประวัติ จะสร้างให้จากค่าเริ่มต้นอัตโนมัติ)
 *     tags:
 *       - Competition
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         schema:
 *           type: integer
 *         required: false
 *         description: รหัสทัวร์นาเมนต์
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *       400:
 *         description: พารามิเตอร์ไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */
router.get('/', authMiddleware, getCompets);

/**
 * @swagger
 * /compet:
 *   post:
 *     summary: สร้างระดับการแข่งขันใหม่
 *     description: สร้างการแข่งขันระดับใหม่ภายใต้ทัวร์นาเมนต์
 *     tags:
 *       - Competition
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - time
 *               - detail
 *               - rank
 *               - tournamentId
 *             properties:
 *               time:
 *                 type: string
 *                 example: "09:30"
 *                 description: เวลาแข่งขัน (รูปแบบ HH:MM)
 *               detail:
 *                 type: string
 *                 example: "ประเภทคู่มือ N มือใหม่"
 *               rank:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [BG, NB, N, S, P_MINUS, P_PLUS]
 *                 example: ["N"]
 *               tournamentId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: สร้างสำเร็จ
 *       400:
 *         description: ข้อมูลนำเข้าไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 */
router.post('/', authMiddleware, createCompet);

/**
 * @swagger
 * /compet/{id}:
 *   put:
 *     summary: แก้ไขระดับการแข่งขัน
 *     description: แก้ไขข้อมูลของระดับการแข่งขันที่กำหนดโดยระบุ ID
 *     tags:
 *       - Competition
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสระดับการแข่งขัน
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *                 example: "10:30"
 *               detail:
 *                 type: string
 *                 example: "ประเภทคู่มือ S มือทั่วไป"
 *               rank:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [BG, NB, N, S, P_MINUS, P_PLUS]
 *                 example: ["S"]
 *               tournamentId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลสำเร็จ
 *       400:
 *         description: ID หรือข้อมูลนำเข้าไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: ไม่พบระดับการแข่งขัน
 */
router.put('/:id', authMiddleware, updateCompet);

/**
 * @swagger
 * /compet/{id}:
 *   delete:
 *     summary: ลบระดับการแข่งขัน
 *     description: ลบระดับการแข่งขันที่กำหนดโดยระบุ ID
 *     tags:
 *       - Competition
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสระดับการแข่งขัน
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *       400:
 *         description: ID ไม่ถูกต้อง
 *       401:
 *         description: ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: ไม่พบระดับการแข่งขัน
 */
router.delete('/:id', authMiddleware, deleteCompet);

export default router;