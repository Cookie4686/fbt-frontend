import { fail } from "@sveltejs/kit";
import { message } from "sveltekit-superforms";

import {
	workspaceCreateFormAction,
	workspaceCreateFormLoad,
} from "#lib/components/workspace-create-schema.js";
import app from "#lib/server/local/app.js";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const form = await workspaceCreateFormLoad();

	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await workspaceCreateFormAction(request);

		if (!form.valid) return fail(400, { form });

		const { name } = form.data;

		app.workspace.changeWorkspace(app.workspace.createWorkspace({ name }).name);

		return message(form, "success");
	},
} satisfies Actions;
