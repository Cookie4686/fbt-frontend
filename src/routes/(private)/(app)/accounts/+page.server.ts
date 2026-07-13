import { type Actions, fail, redirect } from "@sveltejs/kit";
import { createAccountSchema, deleteAccountSchema, updateAccountSchema } from "$lib/schema/account";
import {
	createAccount,
	deleteAccount,
	getAccounts,
	updateAccount,
} from "$lib/server/bookkeeping/account";
import { getFormData } from "$lib/utils";
import z from "zod";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	try {
		const accounts = await getAccounts(event, {});
		return { accounts };
	} catch {
		redirect(302, "/");
	}
};

export const actions: Actions = {
	create: async (event) => {
		const { session } = event.locals;
		if (!session) return fail(401);

		const data = await getFormData(event);

		const validateResult = createAccountSchema.safeParse(data);

		if (!validateResult.success) return fail(400, { ...z.treeifyError(validateResult.error) });

		return {
			data: await createAccount(event, validateResult.data),
		};
	},
	update: async (event) => {
		const { session } = event.locals;
		if (!session) return fail(401);

		const data = await getFormData(event);
		const validateResult = updateAccountSchema.safeParse(data);

		if (!validateResult.success) return fail(400, { ...z.treeifyError(validateResult.error) });

		return {
			data: await updateAccount(event, validateResult.data),
		};
	},
	delete: async (event) => {
		const { session } = event.locals;
		if (!session) return fail(401);

		const data = await getFormData(event);
		const validateResult = deleteAccountSchema.safeParse(data);

		if (!validateResult.success) return fail(400);

		await deleteAccount(event, validateResult.data);
	},
};
