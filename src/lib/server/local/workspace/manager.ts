import path from "node:path";

import { type Workspace, type WorkspaceCreation } from "#lib/types/app.js";

import { WorkspaceConfigurator } from "./config";
import { WorkspaceService } from "./service";

export class WorkspaceManager {
	private workspacesPath: string;
	private __workspacesConfigurator: WorkspaceConfigurator;

	get workspaces() {
		return this.__workspacesConfigurator.workspaces;
	}

	private _currentWorkspaceName;

	get currentWorkspace(): Readonly<Workspace> | null {
		if (this._currentWorkspaceName === "") return null;

		const workspace = this.workspaces.find(({ name }) => name === this._currentWorkspaceName);
		if (workspace) return workspace;

		this.currentWorkspace = null;
		return null;
	}

	set currentWorkspace(workspace: Readonly<Workspace> | null) {
		this._currentWorkspaceName = workspace?.name || "";
		this._service.close();
		this._service = new WorkspaceService(
			workspace ? path.join(this.workspacesPath, workspace.folderName) : undefined
		);
		this.__workspacesConfigurator.config = {
			...this.__workspacesConfigurator.config,
			lastWorkspaceName: workspace?.name,
		};
	}

	private _service: WorkspaceService = new WorkspaceService();

	get service(): WorkspaceService {
		return this._service;
	}

	constructor(workspacesPath: string) {
		this.workspacesPath = workspacesPath;
		this.__workspacesConfigurator = new WorkspaceConfigurator(workspacesPath);
		const lastWorkspaceName = this.__workspacesConfigurator.config.lastWorkspaceName;

		if (this.workspaces.length === 0) {
			this._currentWorkspaceName = "";
			this._service = new WorkspaceService();
		} else {
			const lastWorkspace =
				lastWorkspaceName ?
					this.workspaces.find(({ name }) => name === lastWorkspaceName)
				:	undefined;

			this._currentWorkspaceName = lastWorkspace?.name || "";
			this._service = new WorkspaceService(
				this.currentWorkspace ?
					path.join(this.workspacesPath, this.currentWorkspace.folderName)
				:	undefined
			);
		}
	}

	public changeWorkspace(name?: string | null): typeof this.currentWorkspace {
		if (name) {
			const workspace = this.workspaces.find((workspace) => workspace.name === name);
			if (!workspace) throw new Error(`Workspace with name '${name}' not found`);

			this.currentWorkspace = workspace;
		} else {
			this.currentWorkspace = null;
		}

		return this.currentWorkspace;
	}

	public createWorkspace(workspace: WorkspaceCreation): Workspace {
		return this.__workspacesConfigurator.createWorkspaceFolder(workspace);
	}

	public deleteWorkspace(workspaceName: string) {
		const workspace = this.workspaces.find(({ name }) => name === workspaceName);
		if (!workspace) throw new Error("Delete workspace error: workspace not found");

		const isCurrent = workspace === this.currentWorkspace;

		this.__workspacesConfigurator.deleteWorkspaceFolder(workspace.folderName);

		if (isCurrent) {
			this.currentWorkspace = this.workspaces.length === 0 ? null : this.workspaces[0];
		}
	}
}
