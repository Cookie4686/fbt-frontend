/**
 * This is a per-application config.
 * Things such as current workspace, last visited page, application settings, etc. will be stored by this class.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

export interface AppConfig {
	workspacesPath: string;
	lastVisitedPath?: string;
}

export class AppConfigurator {
	private configPath = ".app/config.json";

	public config: Readonly<AppConfig>;

	constructor() {
		if (!existsSync(".app")) {
			mkdirSync(".app", { recursive: true });
		}

		if (existsSync(this.configPath)) {
			this.config = JSON.parse(readFileSync(this.configPath, "utf8"));
		} else {
			this.config = {
				workspacesPath: path.join(homedir(), "/Documents/fbt/workspaces"),
			};

			writeFileSync(this.configPath, JSON.stringify(this.config), "utf8");
		}
	}

	public setConfig(config: AppConfig) {
		this.config = config;
		writeFileSync(this.configPath, JSON.stringify(this.config), "utf8");
	}
}

const app = new AppConfigurator();

export default app;
