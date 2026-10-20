import { error } from "@sveltejs/kit";

import workspace from "#lib/server/local/workspace/manager.js";

import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	const { name } = data;

	const currentWorkspace = workspace.changeWorkspace(name);

	return Response.json({ success: true, workspace: currentWorkspace });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const data = await request.json();

	const { name } = data;

	if (!name) return error(422);

	workspace.deleteWorkspace(name);

	return Response.json({ success: true });
};
