import type { RequestEvent } from "@sveltejs/kit";

import { fail, isRedirect, redirect } from "@sveltejs/kit";
import { loginSchema } from "$lib/schema/auth";
import { login } from "$lib/server/auth/credential";
import { setSessionToken } from "$lib/server/auth/session";
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
			const session = await login(form.data);
			setSessionToken(event, session.id);
			return redirect(302, "/settings");
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			console.error(error);
			return message(form, "An error has occurred", { status: 500 });
		}

		// const existingUser = (
		// 	await db.select().from(table.user).where(eq(table.user.username, username))
		// ).at(0);

		// if (!existingUser) return setError(form, "username", "That user doesn't exist");

		// if (!existingUser.passwordHash) {
		// 	return message(form, "This user does not have credentials login enabled", {
		// 		status: 400
		// 	});
		// }

		// if (!(await verifyHashPassword(existingUser.passwordHash, password))) {
		// 	return setError(form, "password", "Incorrect Password");
		// }
	}
};
