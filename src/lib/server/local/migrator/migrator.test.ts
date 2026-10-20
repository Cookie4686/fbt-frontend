import { expect, test } from "vitest";

import { createDatabase } from "../database/database";
import { DBMigrator } from "./migrator";

test("should create migration table from constructor invocation", () => {
	const db = createDatabase();

	new DBMigrator(db);

	const data = db.prepare("SELECT * FROM migration").all();
	expect(data).toBeTypeOf("object");

	db.close();
});
