import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod";

const workspaceCreateSchema = z.object({
	name: z.string().min(3),
});

export const workspaceCreateFormLoad = async () => await superValidate(zod4(workspaceCreateSchema));

export const workspaceCreateFormAction = async (request: Request) =>
	await superValidate(request, zod4(workspaceCreateSchema));
