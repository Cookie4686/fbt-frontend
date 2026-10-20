import { homedir } from "node:os";
import path from "node:path";

import { type Workspace, type WorkspaceCreation } from "#lib/types/app.js";

import app from "../app";
import { WorkspaceConfigurator } from "./config";
import { WorkspaceService } from "./service";

const DEFAULT_WORKSPACES_PATH = path.join(homedir(), "/Documents/fbt/workspaces");

class WorkspaceManager {
	private __workspacesConfigurator: WorkspaceConfigurator;

	// TODO: set workspaces path from app config
	private workspacesPath: string = DEFAULT_WORKSPACES_PATH;

	get workspaces() {
		return this.__workspacesConfigurator.workspaces;
	}

	private _currentWorkspaceName = "";

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
		app.config = { ...app.config, lastWorkspaceName: workspace?.name };
	}

	private _service: WorkspaceService = new WorkspaceService();

	get service(): WorkspaceService {
		return this._service;
	}

	constructor() {
		this.__workspacesConfigurator = new WorkspaceConfigurator(this.workspacesPath);

		if (this.workspaces.length !== 0) {
			const { lastWorkspaceName } = app.config;

			const lastWorkspace =
				lastWorkspaceName ?
					this.workspaces.find(({ name }) => name === lastWorkspaceName)
				:	undefined;

			this.currentWorkspace = lastWorkspace || this.workspaces[0];
		}

		this.currentWorkspace = null;
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

		this.__workspacesConfigurator.deleteWorkspaceFolder(workspace.folderName);

		if (workspace === this.currentWorkspace) {
			this.currentWorkspace = this.workspaces.length === 0 ? null : this.workspaces[0];
		}
	}
}

const workspace = new WorkspaceManager();

export default workspace;
