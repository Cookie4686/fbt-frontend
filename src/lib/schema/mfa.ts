import z from "zod";

export const digits = 6;
export const period = 30;

const code = z.string().length(digits, { error: `Code must be ${digits} digits` });

export const totpVerifyFormSchema = z.object({
	code
});

export const totpSetupFormSchema = z.object({
	key: z.string(),
	secret: z.string(),
	code
});
