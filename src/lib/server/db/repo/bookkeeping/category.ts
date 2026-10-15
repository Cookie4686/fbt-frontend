import type { DatabaseSync } from "node:sqlite";

import type { CategoryTypeEnum } from "./categoryType";

export class Category {
	category_id: number;
	parent_id: number | null;

	name: string;
	category_type: CategoryTypeEnum | null;

	constructor(data: Category) {
		this.category_id = data.category_id;
		this.parent_id = data.parent_id;
		this.name = data.name;
		this.category_type = data.category_type;
	}

	public attachTo(db: DatabaseSync, parentCategory: Category | null) {
		updateParentID(db, {
			childCategoryID: this.category_id,
			parentCategoryID: parentCategory?.category_id || null,
		});
	}

	public delete(db: DatabaseSync) {
		deleteCategory(db, this.category_id);
	}
}

export function getAllCategory(db: DatabaseSync): Category[] {
	const categoryData: Category[] = db
		.prepare("SELECT * FROM category")
		.all() as unknown as Category[];

	// TODO: optimize by allocating array before
	const categories: Category[] = [];
	for (const data of categoryData) {
		categories.push(new Category(data));
	}

	return categories;
}

export function createCategory(
	db: DatabaseSync,
	{ name, category_type }: { name: string; category_type: CategoryTypeEnum }
) {
	db.prepare(
		`
      INSERT INTO category (name, category_type)
      VALUES
        (?, ?)
      ;
    `
	).run(name, category_type);
}

function updateParentID(
	db: DatabaseSync,
	{
		childCategoryID,
		parentCategoryID,
	}: {
		childCategoryID: Category["category_id"];
		parentCategoryID: Category["parent_id"];
	}
) {
	db.prepare(
		`
      UPDATE category
      SET parent_id = ?
      WHERE category_id = ?
    `
	).run(parentCategoryID, childCategoryID);
}

function deleteCategory(db: DatabaseSync, categoryID: Category["category_id"]) {
	db.prepare(
		`
      DELETE FROM category
      WHERE category_id = ?
    `
	).run(categoryID);
}
