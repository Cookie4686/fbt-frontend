import {
	type CategoryFields,
	type CategoryFieldsCreation,
	type CategoryWithAccount,
} from "#lib/types/category.js";

import type { Repo } from "../../repo";

export class CategoryService {
	repo: Repo;

	constructor(repo: Repo) {
		this.repo = repo;
	}

	public getAll(): CategoryFields[] {
		return this.repo.category.getAll();
	}

	public getAllWithAccount(): CategoryWithAccount[] {
		const categories = this.repo.category.getAll();
		const accounts = this.repo.account.getAll();

		return categories.map((category) => ({
			...category,
			accounts: accounts.filter(({ category_id }) => category_id === category.category_id),
		}));
	}

	public create(payload: CategoryFieldsCreation): number {
		return this.repo.category.create(payload);
	}

	public delete(categoryID: CategoryFields["category_id"]) {
		return this.repo.category.delete(categoryID);
	}
}
