import { error } from "@sveltejs/kit";

import app from "#lib/server/local/app.js";

import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ request }) => {
	const data = await request.json();

	const { id } = data;
	if (!id) return error(422);

	app.service.account.delete(id);

	return Response.json({ success: true });
};
