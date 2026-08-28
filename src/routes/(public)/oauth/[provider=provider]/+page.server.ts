import { fail, redirect } from "@sveltejs/kit";
import Route from "$lib/route";
import { oauthSchema } from "$lib/schema/auth";
import { handleOAuthCallback, link, login, register } from "$lib/server/auth/oauth";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.parent();
	const { provider } = event.params;

	const data = await handleOAuthCallback(event, provider);
	if (!data) return redirect(302, Route.P_LOGIN);

	const { tokenId, username, email, emailVerified } = data;

	if (session && user) {
		await link(event, { provider: provider, token: tokenId });
		return redirect(302, Route.A_SETTINGS);
	}

	const registrationNeeded = await login(event, {
		email: email,
		provider,
		token: tokenId,
		emailVerified,
	});

	if (!registrationNeeded) return redirect(302, Route.A_PROFILE);

	return {
		form: await superValidate(
			{
				username: username ?? "",
				email: email ?? "",
				idToken: tokenId,
			},
			zod4(oauthSchema)
		),
	};
};

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.user) return redirect(302, Route.A_PROFILE);

		const form = await superValidate(event, zod4(oauthSchema));
		if (!form.valid) return fail(400, { form });

		const { provider } = event.params;
		const { username, email, password, idToken } = form.data;

		try {
			await register(event, {
				provider,
				username,
				email,
				password,
				tokenId: idToken,
				passwordEnabled: true,
			});
		} catch {
			return message(form, "An error has occurred", { status: 500 });
		}

		redirect(302, Route.A_PROFILE);
	},
};
