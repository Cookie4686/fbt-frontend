import { expect, test } from "vitest";

import { createDatabase, setupDatabase } from "#lib/server/local/database/database.js";

import { Repo } from "../../repo";

test("should be able to create account", () => {
	const db = createDatabase();
	const repo = new Repo(db);
	setupDatabase(db, repo, { seed: false });

	const accounts = repo.account.getAll();

	expect(accounts).toHaveLength(0);

	db.close();
});
