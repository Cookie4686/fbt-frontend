export interface AppConfig {
	workspacesPath?: string | null;
	lastWorkspaceName?: string | null;
	lastVisitedPath?: string | null;
}
export interface Workspace {
	name: string;
	folderName: string;
}
export interface WorkspaceCreation {
	name: string;
	folderName?: string;
}
