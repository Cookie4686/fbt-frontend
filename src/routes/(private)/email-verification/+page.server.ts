import { fail, redirect } from "@sveltejs/kit";
import Route from "$lib/route";
import { hasEmailVerification, sendEmailOTP, verifyEmailOTP } from "$lib/server/auth/email";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();

	if (!hasEmailVerification(event)) {
		try {
			await sendEmailOTP(event, { email: user.email });
		} catch {
			return { email: user.email, failed: true };
		}
	}
	return { email: user.email };
};

export const actions: Actions = {
	verify: async (event) => {
		const { session, user } = event.locals;
		if (session === null || user === null) return fail(401);

		const formData = await event.request.formData();
		const otp = formData.get("otp")?.toString();
		if (typeof otp !== "string") return fail(400);

		await verifyEmailOTP(event, { otp });
		return redirect(302, Route.A_PROFILE);
	},
};
