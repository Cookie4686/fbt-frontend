import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
	const { session, user } = event.locals;

	if (!session || !user) {
		return redirect(302, "/login");
	}

	return { session, user };
};
