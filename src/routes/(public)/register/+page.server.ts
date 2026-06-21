import { fail, isRedirect, redirect } from "@sveltejs/kit";
import { registerSchema } from "$lib/schema/auth";
import { register } from "$lib/server/auth/credential";
import { setSessionToken } from "$lib/server/auth/session";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) return redirect(302, "/profile");

	return { form: await superValidate(zod4(registerSchema)) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(registerSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const session = await register(form.data);
			setSessionToken(event, session.id);
			return redirect(302, "/profile");
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			console.error(error);
			return message(form, "An error has occurred", { status: 500 });
		}
	}
};
