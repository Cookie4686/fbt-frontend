/**
 * This is a per-workspace service.
 * All the service that is in that workspace folder like database will be provided by this class.
 */

import type { DatabaseSync } from "node:sqlite";

import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import { createDatabase, setupDatabase } from "../database/database";
import { AccountService } from "../service/bookkeeping/account/service";
import { CategoryService } from "../service/bookkeeping/category/service";
import { Repo } from "../service/repo";

export class WorkspaceService {
	static dataFilename = "data.sqlite3";

	private db: DatabaseSync;

	public account: AccountService;
	public category: CategoryService;

	/**
	 * Constructs a new `WorkspaceService` instance.
	 * @param workspacePath The file path of the workspace.
	 * If omitted created database will be in-memory.
	 */
	constructor(workspacePath?: string | null) {
		if (workspacePath && !existsSync(workspacePath)) {
			mkdirSync(workspacePath, { recursive: true });
		}

		this.db = createDatabase(
			workspacePath ? path.join(workspacePath, WorkspaceService.dataFilename) : undefined
		);

		const repo = new Repo(this.db);
		this.account = new AccountService(repo);
		this.category = new CategoryService(repo);

		setupDatabase(this.db, repo);
	}

	public close() {
		if (this.db.isOpen) this.db.close();
	}

	// TODO: db backup feature
	// public async backupDB(path: PathLike, options: BackupOptions = {}) {
	// 	if (this.db.location() !== path) {
	// 		await backup(this.db, path, options);
	// 	}
	// }
}
