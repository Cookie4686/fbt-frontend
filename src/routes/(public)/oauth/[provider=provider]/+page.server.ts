import { fail, isRedirect, redirect } from "@sveltejs/kit";
import { oauthSchema } from "$lib/schema/auth";
import { handleOAuthCallback, login, register } from "$lib/server/auth/oauth";
import { setSessionToken } from "$lib/server/auth/session";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) return redirect(302, "/profile");

	const { provider } = event.params;

	const data = await handleOAuthCallback(event, provider);
	if (!data) return redirect(302, "/login");

	const { tokenId, username, email, emailVerified } = data;

	const { session, registration_id, registration_needed } = await login(
		provider,
		tokenId,
		emailVerified ? email : null
	);

	if (!registration_needed) {
		setSessionToken(event, session.id);
		return redirect(302, "/profile");
	}

	return {
		form: await superValidate(
			{
				username: username ?? "",
				email: email ?? "",
				idToken: tokenId,
				registrationId: registration_id
			},
			zod4(oauthSchema)
		)
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(oauthSchema));
		if (!form.valid) return fail(400, { form });

		if (event.locals.user) return redirect(302, "/profile");

		const { provider } = event.params;
		const { username, email, password, idToken, registrationId } = form.data;

		try {
			const session = await register({
				provider,
				username,
				email,
				password,
				tokenID: idToken,
				registrationID: registrationId,
				passwordEnabled: true
			});
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
