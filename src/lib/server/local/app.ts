/**
 * This is a per-application config.
 * Things such as current workspace, last visited page, application settings, etc. will be stored by this class.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

import type { AppConfig } from "#lib/types/app.js";

export class AppConfigurator {
	private configPath = ".app/config.json";

	private _config: Readonly<AppConfig> = {};

	get config() {
		return this._config;
	}

	set config(config: AppConfig) {
		this._config = config;
		writeFileSync(this.configPath, JSON.stringify(this.config), "utf8");
	}

	constructor() {
		if (!existsSync(".app")) {
			mkdirSync(".app", { recursive: true });
		}

		if (existsSync(this.configPath)) {
			this._config = JSON.parse(readFileSync(this.configPath, "utf8"));
		} else {
			this.config = this._config;
		}
	}
}

const app = new AppConfigurator();

export default app;
