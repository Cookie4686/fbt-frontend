import { redirect } from "@sveltejs/kit";
import Route from "$lib/route";
import { getUserMFA } from "$lib/server/auth/mfa";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const response = await getUserMFA(event, {});
	if (response.totp) {
		return redirect(302, Route.P_2FA_TOTP);
	} else {
		return redirect(302, Route.P_2FA_TOTP_SETUP);
	}
};
