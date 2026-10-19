import { expect, test } from "vitest";

import { createDatabase, setupDatabase } from "../database/database";
import { Repo } from "../service/repo";

test("should create 5 default categories", () => {
	const db = createDatabase();
	const repo = new Repo(db);
	setupDatabase(db, repo);

	const topLevelCategories = repo.category.getAll().filter(({ parent_id }) => parent_id === null);
	expect(topLevelCategories).toHaveLength(5);

	const DEFAULT_TOP_LEVEL_CATEGORIES: { name: string; category_type: string }[] = [
		{ name: "Asset", category_type: "asset" },
		{ name: "Liability", category_type: "liability" },
		{ name: "Equity", category_type: "equity" },
		{ name: "Revenue", category_type: "revenue" },
		{ name: "Expense", category_type: "expense" },
	];

	for (const defaultCategory of DEFAULT_TOP_LEVEL_CATEGORIES) {
		expect(
			topLevelCategories.find(
				({ category_type, name, parent_id }) =>
					parent_id === null
					&& name === defaultCategory.name
					&& category_type === defaultCategory.category_type
			)
		).not.toBeUndefined();
	}

	db.close();
});
