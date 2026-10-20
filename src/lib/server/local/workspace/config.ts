import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { Workspace, WorkspaceCreation } from "#lib/types/app.js";

export class WorkspaceConfigurator {
	private workspacesPath: string;

	get workspacesConfigPath(): string {
		return path.join(this.workspacesPath, "config.json");
	}

	private _workspaces: readonly Workspace[];

	get workspaces() {
		return this._workspaces;
	}

	set workspaces(workspaces: readonly Workspace[]) {
		this._workspaces = workspaces;
		writeFileSync(this.workspacesConfigPath, JSON.stringify(workspaces), "utf8");
	}

	constructor(workspacesPath: string) {
		this.workspacesPath = workspacesPath;

		if (existsSync(this.workspacesConfigPath)) {
			// TODO: type check the file (maybe with zod)
			this._workspaces = JSON.parse(readFileSync(this.workspacesConfigPath, "utf8"));

			// TODO: check out-of-sync file
		} else {
			this._workspaces = [];
		}

		this.workspaces = this._workspaces;
	}

	public createWorkspaceFolder(workspace: WorkspaceCreation): Workspace {
		// TODO: autorename on duplicates
		const { name } = workspace;
		let { folderName = name } = workspace;

		if (this.workspaces.find(({ name }) => name === workspace.name))
			throw new Error("workspace name already taken");

		let idx = 1;
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
