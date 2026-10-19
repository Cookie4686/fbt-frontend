import { type Actions } from "@sveltejs/kit";

import workspace from "#lib/server/local/workspace/workspace.js";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const categories = workspace.service.category.getAllWithAccount();

	return { categories };
};

export const actions: Actions = {
	// create: async (event) => {
	// },
	// update: async (event) => {
	// },
	// delete: async (event) => {
	// },
};
