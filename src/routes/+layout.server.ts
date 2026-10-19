import workspace from "#lib/server/local/workspace/workspace.js";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
	return {
		workspaces: workspace.workspaces,
		currentWorkspace: workspace.currentWorkspace,
	};
};
