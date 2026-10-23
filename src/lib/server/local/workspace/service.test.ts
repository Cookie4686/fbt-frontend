import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as baseTest, describe, expect } from "vitest";

import { WorkspaceService } from "./service";

const test = baseTest.extend("appPath", () => mkdtempSync(path.join(tmpdir(), "fbt")));

test.afterEach(({ appPath }) => {
	rmSync(appPath, { recursive: true, force: true });
});

describe("constructor()", () => {
	test("given non existent workspace path should create workspace folder", ({ appPath }) => {
		const workspacePath = path.join(appPath, "workspaces", "main-folder");

		const service = new WorkspaceService(workspacePath);

		expect(existsSync(workspacePath)).toBe(true);
		service.close();
	});

	test("given workspace path should create database file in workspace folder", ({ appPath }) => {
		const service = new WorkspaceService(appPath);

		expect(existsSync(path.join(appPath, WorkspaceService.dataFilename))).toBe(true);
		service.close();
	});

	test("given no workspace path should use in-memory database", () => {
		const service = new WorkspaceService();

		expect(service["db"].location()).toBeNull();
		service.close();
	});
});

describe("close()", () => {
	test("should close database connection", ({ appPath }) => {
		const service = new WorkspaceService(appPath);

		service.close();

		expect(service["db"].isOpen).toBe(false);
	});

	test("given already closed database should do nothing", ({ appPath }) => {
		const service = new WorkspaceService(appPath);
		service.close();

		expect(() => service.close()).not.toThrow();
	});
});
