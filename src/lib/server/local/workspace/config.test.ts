import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as baseTest, describe, expect } from "vitest";

import type { WorkspaceConfig } from "#lib/types/app.js";

import { WorkspaceConfigurator } from "./config";

const test = baseTest
	.extend("workspacesPath", () => mkdtempSync(path.join(tmpdir(), "fbt")))
	.extend("workspacesConfigPath", ({ workspacesPath }) =>
		path.join(workspacesPath, WorkspaceConfigurator.configFilename)
	)
	.extend(
		"setupWorkspaces",
		({ workspacesPath, workspacesConfigPath }) =>
			(config: WorkspaceConfig): WorkspaceConfig => {
				for (const { folderName } of config.workspaces) {
					mkdirSync(path.join(workspacesPath, folderName));
				}

				writeFileSync(workspacesConfigPath, JSON.stringify(config), "utf8");
				return config;
			}
	);

test.afterEach(({ workspacesPath }) => {
	rmSync(workspacesPath, { recursive: true, force: true });
});

function writeConfigFile(path: string, config: WorkspaceConfig) {
	writeFileSync(path, JSON.stringify(config), "utf8");
}

describe("constructor()", () => {
	test("given valid config file should read workspaces", ({
		workspacesPath,
		workspacesConfigPath,
		setupWorkspaces,
	}) => {
		const workspaces = [{ name: "main", folderName: "main-folder" }];
		const config = setupWorkspaces({ workspaces, lastWorkspaceName: "main" });

		const configurator = new WorkspaceConfigurator(workspacesPath);

		expect(configurator.workspaces).toEqual(workspaces);
		expect(configurator.config).toEqual(config);
		expect(JSON.parse(readFileSync(workspacesConfigPath, "utf8"))).toEqual(config);
	});

	test("given out-of-sync config file should read and keep valid workspaceinfo", ({
		workspacesPath,
		workspacesConfigPath,
		setupWorkspaces,
	}) => {
		const workspaces = [
			{ name: "a", folderName: "a-folder" },
			{ name: "b", folderName: "b-folder" },
		];
		const config = setupWorkspaces({ workspaces, lastWorkspaceName: "b" });

		writeConfigFile(workspacesConfigPath, {
			...config,
			workspaces: [...workspaces, { name: "old", folderName: "old" }],
		});
		const configurator = new WorkspaceConfigurator(workspacesPath);
		expect(configurator.workspaces).toEqual(workspaces);
		expect(configurator.config).toEqual(config);
		expect(JSON.parse(readFileSync(workspacesConfigPath, "utf8"))).toEqual(config);
	});

	test("given invalid config file should read and regenerate workspace config", ({
		workspacesPath,
		workspacesConfigPath,
		setupWorkspaces,
	}) => {
		const workspaces = [
			{ name: "a-folder", folderName: "a-folder" },
			{ name: "b-folder", folderName: "b-folder" },
		];
		setupWorkspaces({ workspaces, lastWorkspaceName: "b" });

		writeFileSync(workspacesConfigPath, "{invalid json}", "utf8");
		expect(new WorkspaceConfigurator(workspacesPath).workspaces).toEqual(workspaces);
		expect(JSON.parse(readFileSync(workspacesConfigPath, "utf8")).workspaces).toEqual(workspaces);
	});
});

describe("createWorkspaceFolder()", () => {
	test("given duplicated name should use new sequence postfixed name", ({ workspacesPath }) => {
		const configurator = new WorkspaceConfigurator(workspacesPath);
		configurator.createWorkspaceFolder({ name: "main", folderName: "main-folder" });

		expect(
			configurator.createWorkspaceFolder({ name: "main", folderName: "main-1-folder" })
		).toHaveProperty("name", "main-1");
	});

	test("given duplicated folder should use sequence postfixed folder", ({ workspacesPath }) => {
		const configurator = new WorkspaceConfigurator(workspacesPath);
		configurator.createWorkspaceFolder({ name: "main", folderName: "main-folder" });

		expect(
			configurator.createWorkspaceFolder({ name: "main-1", folderName: "main-folder" })
		).toHaveProperty("folderName", "main-folder-1");
	});
});

describe("deleteWorkspaceFolder()", () => {
	test("given valid workspace folder should remove folder and workspace info", ({
		workspacesPath,
		workspacesConfigPath,
	}) => {
		const configurator = new WorkspaceConfigurator(workspacesPath);

		const workspace = configurator.createWorkspaceFolder({
			name: "main",
			folderName: "main-folder",
		});

		expect(existsSync(workspacesConfigPath)).toBe(true);

		configurator.deleteWorkspaceFolder(workspace.folderName);

		expect(existsSync(path.join(workspacesPath, workspace.folderName))).toBe(false);
		expect(configurator.workspaces).toEqual([]);
	});

	test("given non existent workspace folder should do nothing", ({ workspacesPath }) => {
		const configurator = new WorkspaceConfigurator(workspacesPath);
		const workspace = configurator.createWorkspaceFolder({
			name: "main",
			folderName: "main-folder",
		});

		expect(() => configurator.deleteWorkspaceFolder("old-folder")).not.toThrow();
		expect(configurator.workspaces).toEqual([workspace]);
	});
});
