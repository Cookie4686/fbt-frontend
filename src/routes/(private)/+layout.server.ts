import { redirect } from "@sveltejs/kit";
import Route from "$lib/route";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
	const { session, user } = event.locals;

	if (!session || !user) redirect(302, Route.P_LOGIN);

	return { session, user };
};
