import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { Workspace, WorkspaceConfig, WorkspaceCreation } from "#lib/types/app.js";

export class WorkspaceConfigurator {
	static configFilename = "config.json";

	private workspacesPath: string;

	get workspacesConfigPath(): string {
		return path.join(this.workspacesPath, WorkspaceConfigurator.configFilename);
	}

	private _workspaces: readonly Workspace[];

	get workspaces() {
		return this._workspaces;
	}

	set workspaces(workspaces: readonly Workspace[]) {
		this._workspaces = workspaces;
		this.config = { workspaces };
	}

	private _config: WorkspaceConfig;

	get config(): Readonly<WorkspaceConfig> {
		return this._config;
	}

	set config(config: WorkspaceConfig) {
		this._config = config;
		writeFileSync(this.workspacesConfigPath, JSON.stringify(config), "utf8");
	}

	constructor(workspacesPath: string) {
		this.workspacesPath = workspacesPath;

		if (existsSync(this.workspacesConfigPath)) {
			try {
				// TODO: type check the file (maybe with zod)
				this._config = JSON.parse(readFileSync(this.workspacesConfigPath, "utf8"));
			} catch {
				this._config = { workspaces: [] };
			}

			const syncWorkspaces: Workspace[] = [];
			for (const directory of readdirSync(this.workspacesPath, { withFileTypes: true }).filter(
				(file) => file.isDirectory()
			)) {
				const existingWorkspace = this._config.workspaces.find(
					({ folderName }) => folderName === directory.name
				);
				syncWorkspaces.push({
					name: existingWorkspace ? existingWorkspace.name : directory.name,
					folderName: directory.name,
				});
			}

			this._config = { workspaces: syncWorkspaces };
			writeFileSync(this.workspacesConfigPath, JSON.stringify(this._config), "utf8");
		} else {
			this._config = { workspaces: [] };
		}

		this._workspaces = this._config.workspaces;
	}

	public createWorkspaceFolder(workspace: WorkspaceCreation): Workspace {
		let { name, folderName = name } = workspace;

		let idx = 1;
		while (this.workspaces.find((workspace) => workspace.name === name)) {
			name = `${workspace.name}-${idx++}`;
		}

		idx = 1;
		while (existsSync(path.join(this.workspacesPath, folderName))) {
			folderName = `${workspace.folderName}-${idx++}`;
		}

		mkdirSync(path.join(this.workspacesPath, folderName), { recursive: true });
		this.workspaces = [{ name, folderName }, ...this.workspaces];

		return { name, folderName };
	}

	public deleteWorkspaceFolder(folderName: string): void {
		rmSync(path.join(this.workspacesPath, folderName), { recursive: true, force: true });

		this.workspaces = this.workspaces.filter((workspace) => workspace.folderName !== folderName);
	}
}
