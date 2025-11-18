import z from "zod"

export const competitionSchema = z.object({
   time: z
  .string()
  .min(1, "ต้องระบุเวลา")
  .transform((val) => {
    const date = new Date(`1970-01-01T${val}:00`);
    return date;
  }),

  detail: z.string().min(1,"ต้องมีมากกว่า 1 ตัวอักษร"),
  rank: z
  .array(z.enum(["BG", "NB", "N", "S", "P_MINUS", "P_PLUS"]))
  .min(1, "ต้องเลือกอย่างน้อย 1 ระดับ"),

  tournamentId : z.number()
})