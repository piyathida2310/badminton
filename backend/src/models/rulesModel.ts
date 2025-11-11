import z from "zod"

export const rulesSchema = z.object({
    tournamentId: z.number(),
    content:z.string().min(1,"ต้องมีมากกว่า 1 ตัวอักษร")
})