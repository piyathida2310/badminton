import { z } from "zod";

export const tournamentSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อรายการ"),
  location: z.string().min(1, "กรุณากรอกชื่อสถานที่แข่ง"),

  // รับเฉพาะ SINGLE / DOUBLE
  playType: z.enum(["SINGLE", "DOUBLE"]),

  // ค่า rank ต้องตรงกับ enum Prisma
  rank: z.enum(["BG", "NB", "N", "S", "P_MINUS", "P_PLUS"]),

  // แปลง string → number อัตโนมัติ
  shuttlePrice: z
    .string()
    .transform((val) => Number(val))
    .refine((num) => !isNaN(num) && num > 0, {
      message: "ราคาลูกต้องเป็นตัวเลขและมากกว่า 0",
    }),
  maxPlayers: z.coerce.number().positive("จำนวนผู้เล่นต้องมากกว่า 0"),

  // ตัดไฟล์ออกจากการตรวจ เพราะจะมาจาก req.files
  posterImg: z.string().optional(),
  qrCodeImg: z.string().optional(),

  //  วันที่ — ถ้าไม่ใส่ให้ optional, และต้องไม่ย้อนหลัง
  startDate: z.coerce
    .date()
    .optional()
    .refine((date) => !date || date >= new Date(), {
      message: "วันที่เริ่มต้นต้องไม่ย้อนหลัง",
    }),

  // แปลง ruleId จาก string → number
  ruleId: z.coerce.number().int("Rule ID ต้องเป็นตัวเลข"),

  // แปลง boolean จาก "true"/"false"
  isLowerBracket: z.coerce.boolean().default(false),
});
