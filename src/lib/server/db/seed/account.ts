import type { DatabaseSync } from "node:sqlite";

import { createCategory } from "../repo/bookkeeping/category";
import { categoryTypes, createCategoryType } from "../repo/bookkeeping/categoryType";

function capitalize(word: string) {
	return word[0].toUpperCase() + word.slice(1);
}

export function seedAccount(db: DatabaseSync) {
	for (const categoryType of categoryTypes) {
		createCategoryType(db, { category_type: categoryType, is_deletable: false });
		createCategory(db, { category_type: categoryType, name: capitalize(categoryType) });
	}
}
