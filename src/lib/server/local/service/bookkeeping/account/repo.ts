import type { AccountFields, AccountFieldsCreation } from "#lib/types/account.js";

import type { Repo } from "../../repo";

export class AccountRepo {
	repo: Repo;

	constructor(repo: Repo) {
		this.repo = repo;
	}

	public getAll() {
		return this.repo.db.prepare(`SELECT * FROM account`).all() as unknown as AccountFields[];
	}

	public create(payload: AccountFieldsCreation) {
		const { category_id, code, name, is_debit } = payload;
		const accountID = this.repo.db
			.prepare(
				`
          INSERT INTO account (category_id, code, name, is_debit)
          VALUES (?, ?, ?, ?)
          RETURNING account_id
        `
			)
			.get(category_id, code, name, +is_debit);
		return accountID?.account_id as number;
	}
}
