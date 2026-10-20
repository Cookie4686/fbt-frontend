import { test as baseTest, describe } from "vitest";

import { WorkspaceConfigurator } from "./config";

const test = baseTest
	.extend("workspacePath", ".test/workspaces")
	.extend("workspaceConfigurator", ({ workspacePath }) => new WorkspaceConfigurator(workspacePath));

describe("constructor()", () => {
	test("given valid file should read file workspaces");
	test("given invalid or out-of-sync file should update file workspaces");
});

describe("createWorkspaceFolder()", () => {
	test("given duplicated name should use sequence postfixed name");
	test("given duplicated folder should use sequence postfixed folder");
});

describe("deleteWorkspaceFolder()", () => {
	test("given valid workspace should remove folder and workspace info");
	test("given non existant workspace should do nothing");
});
