import { error } from "@sveltejs/kit";

import app from "#lib/server/local/app.js";

import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	const { name } = data;

	const currentWorkspace = app.workspace.changeWorkspace(name);

	return Response.json({ success: true, workspace: currentWorkspace });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const data = await request.json();

	const { name } = data;

	if (!name) return error(422);

	app.workspace.deleteWorkspace(name);

	return Response.json({ success: true });
};
