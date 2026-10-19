import { expect, test } from "vitest";

import { createDatabase } from "../database/database";
import { DBMigrator } from "./migrator";

test("should create migration table from constructor invocation", () => {
	const db = createDatabase();

	new DBMigrator(db);

	expect(() => {
		db.prepare("SELECT * FROM migration").all();
	}).not.toThrow();

	console.log(db.prepare("SELECT * FROM migration").all());

	db.close();
});
