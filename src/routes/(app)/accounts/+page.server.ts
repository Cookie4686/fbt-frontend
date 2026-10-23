import { type Actions, fail } from "@sveltejs/kit";
import { message } from "sveltekit-superforms";

import app from "#lib/server/local/app.js";

import type { PageServerLoad } from "./$types";

import {
	accountCreateFormAction,
	accountCreateFormLoad,
	categoryCreateFormAction,
	categoryCreateFormLoad,
} from "./schema";

export const load: PageServerLoad = async ({ depends }) => {
	depends("data:categories");

	const categories = app.service.category.getAllWithAccount();

	console.log("account load", categories.length);

	const accountCreateForm = await accountCreateFormLoad();
	const categoryCreateForm = await categoryCreateFormLoad();

	return { categories, accountCreateForm, categoryCreateForm };
};

export const actions: Actions = {
	createAccount: async ({ request }) => {
		const form = await accountCreateFormAction(request);

		if (!form.valid) return fail(400, { form });

		app.service.account.create(form.data);

		return message(form, "success");
	},
	createCategory: async ({ request }) => {
		const form = await categoryCreateFormAction(request);

		if (!form.valid) return fail(400, { form });

		const { name, parent_id } = form.data;

		const id = app.service.category.createCategory({ name, parent_id });

		return message(form, { id });
	},
	// update: async (event) => {
	// },
};
