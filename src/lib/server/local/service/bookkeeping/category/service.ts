import type { AccountFields } from "#lib/types/account.js";

import { type CategoryFields } from "#lib/types/category.js";
import { type CategoryFieldsCreation } from "#lib/types/category.js";

import type { Repo } from "../../repo";

export class CategoryService {
	repo: Repo;

	constructor(repo: Repo) {
		this.repo = repo;
	}

	public getAll(): CategoryFields[] {
		return this.repo.category.getAll();
	}

	public getAllWithAccount(): (CategoryFields & { accounts: AccountFields[] })[] {
		const categories = this.repo.category.getAll();
		const accounts = this.repo.account.getAll();

		// TODO: optimize by allocating array before
		const categoriesWithAccount: ReturnType<typeof this.getAllWithAccount> = [];
		for (const data of categories) {
			const categoryAccounts = accounts.filter(
				({ category_id }) => category_id === data.category_id
			);
			categoriesWithAccount.push({ ...data, accounts: categoryAccounts });
		}

		return categoriesWithAccount;
	}

	public createCategory(payload: CategoryFieldsCreation): number {
		return this.repo.category.create(payload);
	}

	public delete(categoryID: CategoryFields["category_id"]) {
		return this.repo.category.delete(categoryID);
	}
}
