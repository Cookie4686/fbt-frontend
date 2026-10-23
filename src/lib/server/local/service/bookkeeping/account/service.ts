import type { AccountFields, AccountFieldsCreation } from "#lib/types/account.js";

import type { Repo } from "../../repo";

// TODO: validator

export class AccountService {
	repo: Repo;

	constructor(repo: Repo) {
		this.repo = repo;
	}

	public getAll(): AccountFields[] {
		return this.repo.account.getAll();
	}

	public create(payload: AccountFieldsCreation): number {
		return this.repo.account.create(payload);
	}

	public delete(accountID: AccountFields["account_id"]) {
		return this.repo.account.delete(accountID);
	}
}
