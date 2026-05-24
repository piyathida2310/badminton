import z from "zod";

export const competitionSchema = z.object({
  time: z
    .string()
    .min(1)
    .transform((val) => {
      // Append 'Z' to force UTC — so "10:30" is always stored as 1970-01-01T10:30:00.000Z
      const date = new Date(`1970-01-01T${val}:00Z`);
      return date;
    }),

  detail: z.string().min(1, "ต้องมีมากกว่า 1 ตัวอักษร"),
  rank: z.array(z.enum(["BG", "NB", "N", "S", "P_MINUS", "P_PLUS"])),
  tournamentId: z.number(),
});
