import type { DatabaseSync } from "node:sqlite";

import { AccountRepo } from "./bookkeeping/account/repo";
import { CategoryRepo } from "./bookkeeping/category/repo";
import { CategoryTypeRepo } from "./bookkeeping/categoryType/repo";
import { EntryRepo } from "./bookkeeping/entry/repo";
import { TransactionRepo } from "./bookkeeping/transaction/repo";

export class Repo {
	db: DatabaseSync;

	account: AccountRepo;
	category: CategoryRepo;
	categoryType: CategoryTypeRepo;
	entry: EntryRepo;
	transaction: TransactionRepo;

	constructor(db: DatabaseSync) {
		this.db = db;

		this.account = new AccountRepo(this);
		this.category = new CategoryRepo(this);
		this.categoryType = new CategoryTypeRepo(this);
		this.entry = new EntryRepo(this);
		this.transaction = new TransactionRepo(this);
	}

	public runInTransaction<T>(callback: () => T): T {
		this.db.exec("BEGIN");
		try {
			const result = callback();
			this.db.exec("COMMIT");
			return result;
		} catch (error) {
			this.db.exec("ROLLBACK");
			throw error;
		}
	}
}
