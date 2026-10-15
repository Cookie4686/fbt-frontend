import { fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import Route from "#lib/route.js";
import { registerSchema } from "#lib/schema/auth.js";
import { register } from "#lib/server/auth/credential.js";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) return redirect(302, Route.A_PROFILE);

	return { form: await superValidate(zod4(registerSchema)) };
};

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.user) return redirect(302, Route.A_PROFILE);

		const form = await superValidate(event, zod4(registerSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await register(event, form.data);
		} catch {
			return message(form, "An error has occurred", { status: 500 });
		}
		redirect(302, Route.A_PROFILE);
	},
};
