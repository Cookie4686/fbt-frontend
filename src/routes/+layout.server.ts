import { workspaceCreateFormLoad } from "#lib/components/workspace-create-schema.js";
import app from "#lib/server/local/app.js";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
	const { workspaces, currentWorkspace } = app;

	const createWorkspaceForm = await workspaceCreateFormLoad();

	return {
		workspaces,
		currentWorkspace,
		createWorkspaceForm,
	};
};
