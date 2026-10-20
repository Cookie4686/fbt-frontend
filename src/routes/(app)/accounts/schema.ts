import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod";

const accountCreateSchema = z.object({
	code: z.string().min(3),
	name: z.string(),
	is_debit: z.boolean(),
});

export const accountCreateFormLoad = async () => await superValidate(zod4(accountCreateSchema));

export const accountCreateFormAction = async (request: Request) =>
	await superValidate(request, zod4(accountCreateSchema));

const categoryCreateSchema = z.object({
	name: z.string(),
	parent_id: z.coerce.number().optional().nullable(),
});

export const categoryCreateFormLoad = async () => await superValidate(zod4(categoryCreateSchema));

export const categoryCreateFormAction = async (request: Request) =>
	await superValidate(request, zod4(categoryCreateSchema));
