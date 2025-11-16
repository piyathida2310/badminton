import z from "zod"

export const competitionSchema = z.object({
   time: z
    .string()
    .transform((val) => {
      //  ถ้ามีช่องว่างระหว่างวันกับเวลา → แปลงเป็น ISO รูปแบบที่ JS เข้าใจ
      if (!val) return undefined;
      const formatted = val.replace(" ", "T"); // "2025-12-01 09:30" → "2025-12-01T09:30"
      const date = new Date(formatted);
      return isNaN(date.getTime()) ? undefined : date;
    })
    .refine((date) => !date || date >= new Date(), {
      message: "เวลาที่เลือกต้องไม่ย้อนหลัง",
    })
    .optional(),
  detail: z.string().min(1,"ต้องมีมากกว่า 1 ตัวอักษร"),
  rank: z.enum(["BG", "NB", "N", "S", "P_MINUS", "P_PLUS"]),
  tournamentId : z.number()
})