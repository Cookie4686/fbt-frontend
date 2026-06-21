import { fail, redirect } from "@sveltejs/kit";
import { totpVerifyFormSchema } from "$lib/schema/mfa";
import { validateTOTP } from "$lib/server/auth/mfa";
import { ExpiringTokenBucket } from "$lib/server/rate-limit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const [{ session, user }, form] = await Promise.all([
		event.parent(),
		superValidate(zod4(totpVerifyFormSchema))
	]);

	// if (!user.registered2FA) return redirect(302, "/2fa/setup");
	if (session.twoFactorVerified) return redirect(302, "/");

	return { user, form };
};

const totpBucket = new ExpiringTokenBucket<string>(3, 60);

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(totpVerifyFormSchema));
		if (!form.valid) return fail(400, { form });

		const { session, user } = event.locals;

		if (!session || !user) return message(form, "Unauthorized", { status: 401 });
		if (!totpBucket.check(user.id, 1)) return message(form, "Too many requests", { status: 429 });

		const { code } = form.data;

		if (!totpBucket.consume(user.id, 1)) return message(form, "Too many requests", { status: 429 });

		const { is_passed } = await validateTOTP(code, session.id);

		if (!is_passed) return setError(form, "code", "Invalid code.");

		totpBucket.reset(user.id);
		// await setSessionAs2FAVerified(session.id);
		return redirect(302, "/");
	}
};
