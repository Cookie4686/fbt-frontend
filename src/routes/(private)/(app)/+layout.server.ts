import { redirect } from "@sveltejs/kit";
import Route from "$lib/route";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
	const { session, user } = await event.parent();

	if (!user.emailVerified) redirect(302, Route.P_EMAIL_VERIFY);

	if (!session.twoFactorVerified) redirect(302, Route.P_2FA);

	return { session, user };
};
