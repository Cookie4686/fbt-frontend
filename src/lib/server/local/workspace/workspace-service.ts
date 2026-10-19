/**
 * This is a per-workspace service.
 * All the service that is in that workspace folder like database will be provided by this class.
 */

import type { DatabaseSync } from "node:sqlite";

import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import { createDatabase, setupDatabase } from "../database/database";
import { CategoryService } from "../service/bookkeeping/category/service";
import { Repo } from "../service/repo";

export class WorkspaceService {
	private workspacePath;

	private db: DatabaseSync;

	public category: CategoryService;

	constructor(workspacePath: string) {
		this.workspacePath = workspacePath;

		if (!existsSync(this.workspacePath)) {
			mkdirSync(this.workspacePath, { recursive: true });
		}

		this.db = createDatabase(path.join(this.workspacePath, "data.sqlite3"));
		const repo = new Repo(this.db);

		this.category = new CategoryService(repo);

		setupDatabase(this.db, repo);
	}

	public close() {
		this.db.close();
	}

	// TODO: db backup feature
	// public async backupDB(path: PathLike, options: BackupOptions = {}) {
	// 	if (this.db.location() !== path) {
	// 		await backup(this.db, path, options);
	// 	}
	// }
}
