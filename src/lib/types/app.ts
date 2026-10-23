export interface AppConfig {
	workspacesPath: string;
	lastWorkspaceName?: string | null;
	lastVisitedPath?: string | null;
}
export interface Workspace {
	name: string;
	folderName: string;
}
export interface WorkspaceConfig {
	workspaces: readonly Workspace[];
	lastWorkspaceName?: string | null;
}
export interface WorkspaceCreation {
	name: string;
	folderName?: string;
}
