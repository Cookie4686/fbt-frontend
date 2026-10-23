import type { CategoryFields, CategoryFieldsCreation } from "#lib/types/category.js";

import type { Repo } from "../../repo";

export class CategoryRepo {
	repo: Repo;

	constructor(repo: Repo) {
		this.repo = repo;
	}

	public getAll() {
		// TODO: create fields converter
		const categoryData: CategoryFields[] = this.repo.db
			.prepare(
				`
          SELECT * FROM category
          ORDER BY code_prefix ASC, sequence ASC
        `
			)
			.all() as unknown as CategoryFields[];

		return categoryData;
	}

	public create(payload: CategoryFieldsCreation) {
		const {
			parent_id = null,
			category_type = null,
			name,
			description = null,
			code_prefix = null,
			sequence = null,
		} = payload;

		const response = this.repo.db
			.prepare(
				`
          INSERT INTO category (parent_id, category_type, name, description, code_prefix, sequence)
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING category_id
        `
			)
			.get(parent_id, category_type, name, description, code_prefix, sequence);

		return response?.category_id as number;
	}

	public updateParentID(payload: Pick<CategoryFields, "category_id" | "parent_id">) {
		const { category_id, parent_id } = payload;

		this.repo.db
			.prepare(
				`
          UPDATE category
          SET parent_id = ?
          WHERE category_id = ?
        `
			)
			.run(parent_id, category_id);
	}

	public delete(categoryID: CategoryFields["category_id"]) {
		this.repo.db
			.prepare(
				`
          DELETE FROM category
          WHERE category_id = ?
        `
			)
			.run(categoryID);
	}
}
