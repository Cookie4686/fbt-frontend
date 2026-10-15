import { expect, test } from "vitest";

import { createDatabase } from "../database";
import { getAllCategory } from "../repo/bookkeeping/category";

test("should create 5 default categories", () => {
	const db = createDatabase();

	const categories = getAllCategory(db);
	expect(categories).toHaveLength(5);

	const DEFAULT_CATEGORIES: { name: string; category_type: string }[] = [
		{ name: "Asset", category_type: "asset" },
		{ name: "Liability", category_type: "liability" },
		{ name: "Equity", category_type: "equity" },
		{ name: "Revenue", category_type: "revenue" },
		{ name: "Expense", category_type: "expense" },
	];

	for (const defaultCategory of DEFAULT_CATEGORIES) {
		expect(
			categories.find(
				({ category_type, name, parent_id }) =>
					parent_id === null
					&& name === defaultCategory.name
					&& category_type === defaultCategory.category_type
			)
		).not.toBeUndefined();
	}

	db.close();
});
