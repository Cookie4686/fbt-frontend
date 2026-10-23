import { type Actions, fail } from "@sveltejs/kit";
import { message } from "sveltekit-superforms";

import app from "#lib/server/local/app.js";

import type { PageServerLoad } from "./$types";

import * as Schema from "./schema";

export const load: PageServerLoad = async ({ depends }) => {
	depends("data:categories");

	const categories = app.service.category.getAllWithAccount();

	const accountCreateForm = await Schema.accountCreateFormLoad();
	const categoryCreateForm = await Schema.categoryCreateFormLoad();

	return { categories, accountCreateForm, categoryCreateForm };
};

export const actions: Actions = {
	createCategory: async ({ request }) => {
		const form = await Schema.categoryCreateFormAction(request);
		if (!form.valid) return fail(400, { form });

		const { name, parent_id } = form.data;

		const id = app.service.category.create({ name, parent_id });

		return message(form, { id });
	},
	createAccount: async ({ request }) => {
		const form = await Schema.accountCreateFormAction(request);
		if (!form.valid) return fail(400, { form });

		app.service.account.create(form.data);

		return message(form, "success");
	},
};
