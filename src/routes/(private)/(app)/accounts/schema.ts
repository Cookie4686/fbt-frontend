import z from "zod";

export const accountFormSchema = z.object({
	isDebit: z.boolean().nullable().default(null),
	name: z.string().min(1).max(255),
});
