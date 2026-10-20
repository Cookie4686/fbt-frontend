import { error } from "@sveltejs/kit";

import workspace from "#lib/server/local/workspace/manager.js";

import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ request }) => {
	const data = await request.json();

	const { id } = data;
	if (!id) return error(422);

	workspace.service.category.delete(id);

	return Response.json({ success: true });
};
