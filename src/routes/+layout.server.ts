import { workspaceCreateFormLoad } from "#lib/components/workspace-create-schema.js";
import workspace from "#lib/server/local/workspace/manager.js";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
	const { workspaces, currentWorkspace } = workspace;

	const createWorkspaceForm = await workspaceCreateFormLoad();

	return {
		workspaces,
		currentWorkspace,
		createWorkspaceForm,
	};
};
