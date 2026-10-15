import z from "zod";

import { password } from "./auth";

export const updatePasswordSchema = z.object({
	currentPassword: z.string(),
	newPassword: password,
});
