import type { DatabaseSync } from "node:sqlite";

export const categoryTypes = ["asset", "liability", "equity", "revenue", "expense"] as const;
export type CategoryTypeEnum = (typeof categoryTypes)[number];

export interface CategoryType {
	category_type: string;
	is_deletable: boolean;
}

export function createCategoryType(
	db: DatabaseSync,
	{ category_type, is_deletable }: CategoryType
) {
	db.prepare(
		`
      INSERT INTO category_type(category_type, is_deletable)
      VALUES (?, ?);
    `
	).run(category_type, +is_deletable);
}

export function getAllCategoryType(db: DatabaseSync) {
	return db.prepare(`SELECT * FROM category_type`).all() as unknown as CategoryType[];
}
