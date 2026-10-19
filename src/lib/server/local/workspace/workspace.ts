import path from "node:path";

import app from "./app-config";
import { type Workspace, WorkspaceConfigurator } from "./workspace-config";
import { WorkspaceService } from "./workspace-service";

class WorkspaceManager {
	private worspacesConfigurator: WorkspaceConfigurator;

	get workspaces() {
		return this.worspacesConfigurator.workspaces;
	}

	public currentWorkspace: Readonly<Workspace>;
	public service: WorkspaceService;

	constructor() {
		this.worspacesConfigurator = new WorkspaceConfigurator(app.config.workspacesPath);

		if (this.worspacesConfigurator.workspaces.length === 0) {
			this.currentWorkspace = this.worspacesConfigurator.createNewWorkspace({
				name: "Default Workspace",
				folderName: "default",
			});
		} else {
			this.currentWorkspace = this.worspacesConfigurator.workspaces[0];
		}

		this.service = this.createWorkspaceService();
	}

	public changeWorkspace(workspace: Workspace) {
		this.service.close();

		this.currentWorkspace = workspace;
		this.service = this.createWorkspaceService();
	}

	private createWorkspaceService() {
		return new WorkspaceService(
			path.join(app.config.workspacesPath, this.currentWorkspace.folderName)
		);
	}
}

const workspace = new WorkspaceManager();

export default workspace;
