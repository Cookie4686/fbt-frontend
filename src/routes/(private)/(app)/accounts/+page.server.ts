import { type Actions } from "@sveltejs/kit";

import { createDatabase } from "#lib/server/db/database.js";
import { getAllCategory } from "#lib/server/db/repo/bookkeeping/category.js";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const db = createDatabase();
	const categories = getAllCategory(db);
	db.close();

	return { categories };
	// try {
	// 	const accounts = await getAccounts(event, {});
	// 	return { accounts };
	// } catch {
	// 	redirect(302, "/");
	// }
};

export const actions: Actions = {
	// create: async (event) => {
	// 	const { session } = event.locals;
	// 	if (!session) return fail(401);
	//
	// 	const data = await getFormData(event);
	//
	// 	const validateResult = createAccountSchema.safeParse(data);
	//
	// 	if (!validateResult.success) return fail(400, { ...z.treeifyError(validateResult.error) });
	//
	// 	return {
	// 		data: await createAccount(event, validateResult.data),
	// 	};
	// },
	// update: async (event) => {
	// 	const { session } = event.locals;
	// 	if (!session) return fail(401);
	//
	// 	const data = await getFormData(event);
	// 	const validateResult = updateAccountSchema.safeParse(data);
	//
	// 	if (!validateResult.success) return fail(400, { ...z.treeifyError(validateResult.error) });
	//
	// 	return {
	// 		data: await updateAccount(event, validateResult.data),
	// 	};
	// },
	// delete: async (event) => {
	// 	const { session } = event.locals;
	// 	if (!session) return fail(401);
	//
	// 	const data = await getFormData(event);
	// 	const validateResult = deleteAccountSchema.safeParse(data);
	//
	// 	if (!validateResult.success) return fail(400);
	//
	// 	await deleteAccount(event, validateResult.data);
	// },
};
