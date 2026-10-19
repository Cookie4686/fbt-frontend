import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface Workspace {
	name: string;
	folderName: string;
}

export class WorkspaceConfigurator {
	private workspacesPath;
	private workspacesConfigPath;

	public workspaces: readonly Workspace[] = [];

	constructor(workspacesPath: string) {
		this.workspacesPath = workspacesPath;
		this.workspacesConfigPath = path.join(this.workspacesPath, "config.json");

		if (!existsSync(this.workspacesPath)) {
			mkdirSync(this.workspacesPath, { recursive: true });
		}

		if (existsSync(this.workspacesConfigPath)) {
			// TODO: type check the file (maybe with zod)
			this.workspaces = JSON.parse(readFileSync(this.workspacesConfigPath, "utf8"));
		} else {
			this.setWorkspaces([]);
		}
	}

	public createNewWorkspace(workspace: Workspace): Workspace {
		if (this.workspaces.find(({ name }) => name === workspace.name))
			throw new Error("workspace name already taken");

		let idx = 1;
		let folderName = workspace.folderName;
		while (existsSync(path.join(this.workspacesPath, folderName))) {
			folderName = `${workspace.folderName}-${idx++}`;
		}

		mkdirSync(path.join(this.workspacesPath, folderName));

		this.setWorkspaces([workspace, ...this.workspaces]);

		return { name: workspace.name, folderName };
	}

	private setWorkspaces(workspaces: readonly Workspace[]) {
		this.workspaces = workspaces;
		writeFileSync(this.workspacesConfigPath, JSON.stringify(workspaces), "utf8");
	}
}
