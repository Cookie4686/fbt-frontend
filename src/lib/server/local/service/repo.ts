import type { DatabaseSync } from "node:sqlite";

import { AccountRepo } from "./bookkeeping/account/repo";
import { CategoryRepo } from "./bookkeeping/category/repo";
import { CategoryTypeRepo } from "./bookkeeping/categoryType/repo";

export class Repo {
	db: DatabaseSync;

	account: AccountRepo;
	category: CategoryRepo;
	categoryType: CategoryTypeRepo;

	constructor(db: DatabaseSync) {
		this.db = db;

		this.account = new AccountRepo(this);
		this.category = new CategoryRepo(this);
		this.categoryType = new CategoryTypeRepo(this);
	}
}
