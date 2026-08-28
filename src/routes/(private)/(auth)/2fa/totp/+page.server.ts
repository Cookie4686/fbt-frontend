import { fail, isHttpError, redirect } from "@sveltejs/kit";
import Route from "$lib/route";
import { totpVerifyFormSchema } from "$lib/schema/mfa";
import { validateTOTP } from "$lib/server/auth/mfa";
import H from "$lib/server/http-code";
import { ExpiringTokenBucket } from "$lib/server/rate-limit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const [{ session, user }, form] = await Promise.all([
		event.parent(),
		superValidate(zod4(totpVerifyFormSchema)),
	]);

	if (session.twoFactorVerified) return redirect(302, Route.P_2FA);

	return { user, form };
};

const totpBucket = new ExpiringTokenBucket<string>(3, 60);

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(totpVerifyFormSchema));
		if (!form.valid) return fail(400, { form });

		const { session, user } = event.locals;

		if (!session || !user) redirect(302, Route.P_LOGIN);
		if (session.twoFactorVerified) return redirect(302, Route.P_2FA);

		if (!totpBucket.check(user.id, 1)) return message(form, "Too many requests", { status: 429 });

		const { code } = form.data;

		if (!totpBucket.consume(user.id, 1)) return message(form, "Too many requests", { status: 429 });

		try {
			await validateTOTP(event, { code });
		} catch (err) {
			if (isHttpError(err) && err.status == H.C_400_BAD_REQUEST) {
				return setError(form, "code", "Invalid code.");
			} else {
				return message(form, "Error Occured", { status: 500 });
			}
		}

		totpBucket.reset(user.id);

		return redirect(302, Route.A_PROFILE);
	},
};
