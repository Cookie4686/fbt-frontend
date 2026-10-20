import { type AccountFieldsCreation } from "#lib/types/account.js";
import { type CategoryFields } from "#lib/types/category.js";
import { type CategoryFieldsCreation } from "#lib/types/category.js";

import type { Repo } from "../../repo";

export class Category {
	fields: CategoryFields;
	repo: Repo;

	constructor(data: CategoryFields, repo: Repo) {
		this.fields = data;
		this.repo = repo;
	}

	// --- Category related function ---
	public attachTo(parentCategory: Category | null) {
		this.repo.category.updateParentID({
			category_id: this.fields.category_id,
			parent_id: parentCategory?.fields.category_id || null,
		});
	}

	public addCategory(data: CategoryFieldsCreation) {
		this.repo.category.create({ ...data, parent_id: this.fields.category_id });
	}

	public delete() {
		this.repo.category.delete(this.fields.category_id);
	}

	// --- Account in category related function ---
	public addAccount(account: Omit<AccountFieldsCreation, "category_id">) {
		this.repo.account.create({ category_id: this.fields.category_id, ...account });
	}
}
