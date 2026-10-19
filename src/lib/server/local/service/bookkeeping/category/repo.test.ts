import { expect, test } from "vitest";

import { createDatabase, setupDatabase } from "#lib/server/local/database/database.js";

import { Repo } from "../../repo";

test("should be able to get all category", () => {
	const db = createDatabase();
	const repo = new Repo(db);
	setupDatabase(db, repo, { seed: false });

	const categories = repo.category.getAll();

	expect(categories).toHaveLength(0);

	db.close();
});
