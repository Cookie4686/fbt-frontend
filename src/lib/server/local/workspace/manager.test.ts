import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as baseTest, describe, expect, vi } from "vitest";

import type { Workspace, WorkspaceConfig } from "#lib/types/app.js";

import { WorkspaceConfigurator } from "./config";
import { WorkspaceManager } from "./manager";

const test = baseTest.extend("workspacesPath", () => mkdtempSync(path.join(tmpdir(), "fbt")));

test.afterEach(({ workspacesPath }) => {
	rmSync(workspacesPath, { recursive: true, force: true });
	vi.restoreAllMocks();
});

function setupWorkspaces(workspacesPath: string, config: WorkspaceConfig) {
	for (const { folderName } of config.workspaces) {
		mkdirSync(path.join(workspacesPath, folderName));
	}

	writeFileSync(
		path.join(workspacesPath, WorkspaceConfigurator.configFilename),
		JSON.stringify(config),
		"utf8"
	);
}

const workspaceA: Workspace = { name: "a", folderName: "a-folder" };
const workspaceB: Workspace = { name: "b", folderName: "b-folder" };

describe("constructor()", () => {
	test("given existing last workspace name should use that as current workspace", ({
		workspacesPath,
	}) => {
		setupWorkspaces(workspacesPath, {
			workspaces: [workspaceA, workspaceB],
			lastWorkspaceName: workspaceB.name,
		});

		const manager = new WorkspaceManager(workspacesPath);

		expect(manager.currentWorkspace).toEqual(workspaceB);
		manager.service.close();
	});

	test("given workspaces and no last workspace name should use the first existing workspace", ({
		workspacesPath,
	}) => {
		setupWorkspaces(workspacesPath, { workspaces: [workspaceA, workspaceB] });

		const manager = new WorkspaceManager(workspacesPath);

		expect(manager.currentWorkspace).toEqual(manager.workspaces[0]);
		manager.service.close();
	});

	test("given workspaces and invalid last workspace name should use the first existing workspace", ({
		workspacesPath,
	}) => {
		setupWorkspaces(workspacesPath, {
			workspaces: [workspaceA, workspaceB],
			lastWorkspaceName: "old",
		});

		const manager = new WorkspaceManager(workspacesPath);

		expect(manager.currentWorkspace).toEqual(manager.workspaces[0]);
		manager.service.close();
	});

	test("given no existing workspaces should have null current workspace", ({ workspacesPath }) => {
		const manager = new WorkspaceManager(workspacesPath);

		expect(manager.currentWorkspace).toBeNull();
		manager.service.close();
	});
});

describe("changeWorkspace()", () => {
	test("given non-existing workspace name should throw error", ({ workspacesPath }) => {
		setupWorkspaces(workspacesPath, { workspaces: [workspaceA] });
		const manager = new WorkspaceManager(workspacesPath);

		expect(() => manager.changeWorkspace("old")).toThrow();
		manager.service.close();
	});

	test("given existing workspace name should change to that workspace", ({ workspacesPath }) => {
		setupWorkspaces(workspacesPath, {
			workspaces: [workspaceA, workspaceB],
			lastWorkspaceName: workspaceA.name,
		});
		const manager = new WorkspaceManager(workspacesPath);

		expect(manager.changeWorkspace(workspaceB.name)).toEqual(workspaceB);
		expect(manager.currentWorkspace).toEqual(workspaceB);
		manager.service.close();
	});
});

describe("createWorkspace()", () => {
	test("should call WorkspaceConfigurator.createWorkspaceFolder()", ({ workspacesPath }) => {
		const spy = vi.spyOn(WorkspaceConfigurator.prototype, "createWorkspaceFolder");
		const manager = new WorkspaceManager(workspacesPath);

		const workspace = manager.createWorkspace(workspaceA);

		expect(spy).toHaveBeenCalledWith(workspaceA);
		expect(workspace).toEqual(workspaceA);
		manager.service.close();
	});
});

describe("deleteWorkspace()", () => {
	test("given non-existing workspace name should throw error", ({ workspacesPath }) => {
		setupWorkspaces(workspacesPath, { workspaces: [workspaceA] });
		const manager = new WorkspaceManager(workspacesPath);

		expect(() => manager.deleteWorkspace("old")).toThrow();
		manager.service.close();
	});

	test("given existing workspace name should call WorkspaceConfigurator.deleteFolder()", ({
		workspacesPath,
	}) => {
		const spy = vi.spyOn(WorkspaceConfigurator.prototype, "deleteWorkspaceFolder");
		setupWorkspaces(workspacesPath, { workspaces: [workspaceA] });
		const manager = new WorkspaceManager(workspacesPath);

		manager.deleteWorkspace(workspaceA.name);

		expect(spy).toHaveBeenCalledWith(workspaceA.folderName);
		manager.service.close();
	});

	test("given multiple workspaces and the current workspace is deleted should switch to first available workspaces", ({
		workspacesPath,
	}) => {
		setupWorkspaces(workspacesPath, {
			workspaces: [workspaceA, workspaceB],
			lastWorkspaceName: workspaceA.name,
		});
		const manager = new WorkspaceManager(workspacesPath);

		manager.deleteWorkspace(workspaceA.name);

		expect(manager.currentWorkspace).toEqual(workspaceB);
		manager.service.close();
	});

	test("given one workspace and the current workspace is delted should have null current workspace", ({
		workspacesPath,
	}) => {
		setupWorkspaces(workspacesPath, {
			workspaces: [workspaceA],
			lastWorkspaceName: workspaceA.name,
		});
		const manager = new WorkspaceManager(workspacesPath);

		manager.deleteWorkspace(workspaceA.name);

		expect(manager.currentWorkspace).toBeNull();
		manager.service.close();
	});
});
