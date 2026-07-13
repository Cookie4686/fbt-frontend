import type { RequestEvent } from "@sveltejs/kit";

import { fail, redirect } from "@sveltejs/kit";
import Route from "$lib/route";
import { loginSchema } from "$lib/schema/auth";
import { login } from "$lib/server/auth/credential";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) return redirect(302, "/profile");

	return { form: await superValidate(zod4(loginSchema)) };
};

export const actions: Actions = {
	default: async (event: RequestEvent) => {
		const form = await superValidate(event, zod4(loginSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await login(event, { username: form.data.username, password: form.data.password });
		} catch {
			return message(form, "An error has occurred", { status: 500 });
		}

		redirect(302, Route.A_SETTINGS);
	},
};
