import { fail, redirect } from "@sveltejs/kit";
import { invalidateSession } from "$lib/server/auth/session";

import type { Actions } from "./$types";

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.session) return fail(401);

		if (await invalidateSession(event)) {
			return redirect(302, "/login");
		}

		return fail(500);
	}
};
