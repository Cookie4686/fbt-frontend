/**
 * This is a per-application config.
 * Things such as current workspace, last visited page, application settings, etc. will be stored by this class.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

import type { AppConfig } from "#lib/types/app.js";

import { WorkspaceManager } from "./workspace/manager";

export class AppConfigurator {
	private _appPath: string;
	private configFilename = "config.json";

	get appPath() {
		return this._appPath;
	}

	set appPath(path: string) {
		if (!existsSync(path)) {
			mkdirSync(path, { recursive: true });
		}

		this._appPath = path;
	}

	get configPath(): string {
		return path.join(this.appPath, this.configFilename);
	}

	private _config: Readonly<AppConfig>;

	get config() {
		return this._config;
	}

	set config(config: AppConfig) {
		if (config.workspacesPath !== this.config.workspacesPath) {
			this._workspaceManager = new WorkspaceManager(config.workspacesPath);
		}
		this._config = config;
		writeFileSync(this.configPath, JSON.stringify(this.config), "utf8");
	}

	private _workspaceManager: WorkspaceManager;

	get workspaces() {
		return this._workspaceManager.workspaces;
	}

	get currentWorkspace() {
		return this._workspaceManager.currentWorkspace;
	}

	get service() {
		return this._workspaceManager.service;
	}

	get workspace() {
		return this._workspaceManager;
	}

	constructor(appPath: string) {
		this._appPath = appPath;
		if (!existsSync(appPath)) {
			mkdirSync(appPath, { recursive: true });
		}

		if (existsSync(this.configPath)) {
			this._config = JSON.parse(readFileSync(this.configPath, "utf8"));
		} else {
			this._config = { workspacesPath: path.join(homedir(), "/Documents/fbt/workspaces") };
			writeFileSync(this.configPath, JSON.stringify(this._config), "utf8");
		}
		this._workspaceManager = new WorkspaceManager(this._config.workspacesPath);
	}
}

const app = new AppConfigurator(".app");
export default app;
