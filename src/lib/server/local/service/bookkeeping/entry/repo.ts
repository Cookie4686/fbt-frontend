import type { EntryFields } from "#lib/types/transaction.js";

import type { Repo } from "../../repo";

export class EntryRepo {
	private repo: Repo;

	constructor(repo: Repo) {
		this.repo = repo;
	}

	public getAll() {
		return this.repo.db.prepare(`SELECT * FROM entry`).all() as unknown as EntryFields[];
	}
}
