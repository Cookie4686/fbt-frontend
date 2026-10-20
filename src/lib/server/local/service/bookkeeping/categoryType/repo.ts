import type { CategoryType } from "#lib/types/category.js";

import { Repo } from "../../repo";

export class CategoryTypeRepo {
	repo: Repo;

	constructor(repo: Repo) {
		this.repo = repo;
	}

	public create({ category_type, is_deletable }: CategoryType) {
		this.repo.db
			.prepare(
				`
        INSERT INTO category_type(category_type, is_deletable)
        VALUES (?, ?);
      `
			)
			.run(category_type, +is_deletable);
	}

	public getAll() {
		return this.repo.db.prepare(`SELECT * FROM category_type`).all() as unknown as CategoryType[];
	}
}
