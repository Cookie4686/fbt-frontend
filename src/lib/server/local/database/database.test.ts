import { existsSync, rmSync } from "node:fs";
import { test as baseTest, describe, expect } from "vitest";

import { createDatabase } from "./database";

const test = baseTest.extend("filePath", ".test/db.sqlite3");

describe("createDatabase()", () => {
	test("given no file path should create an in-memory database", () => {
		const db = createDatabase();

		expect(db.isOpen).toBe(true);

		db.close();
	});

	test("given non-existent file path should create a file-backed database", ({ filePath }) => {
		const db = createDatabase(filePath);

		expect(db.isOpen).toBe(true);
		expect(existsSync(filePath)).toBe(true);

		db.close();
		rmSync(filePath);
	});

	test("given existing file path should connect to file-backed database", ({ filePath }) => {
		{
			const db = createDatabase(filePath);
			db.prepare("CREATE TABLE test(name TEXT)").run();
			db.prepare("INSERT INTO test(name) VALUES (?)").run("js");
			db.close();
		}

		const db = createDatabase(filePath);
		const data = db.prepare("SELECT * FROM test").get();

		expect(db.isOpen).toBe(true);
		expect(existsSync(filePath)).toBe(true);
		expect(data).toHaveProperty("name", "js");

		db.close();
		rmSync(filePath);
	});
});

describe("setupDatabase()", () => {
	test("should run migration");
	test("should seed database");
});
