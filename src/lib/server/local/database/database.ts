import { type PathLike } from "node:fs";
import { DatabaseSync, type DatabaseSyncOptions } from "node:sqlite";

import type { Repo } from "../service/repo";

import { DBMigrator } from "../migrator/migrator";
import { seedAccount } from "../seeder/account";

interface DBSetupOptions {
	seed: boolean;
}

/**
 * Constructs a new `DatabaseSync` instance.
 * @param path The file path of the file-backed database.
 * If omitted create new in memory database instead.
 * @param sqliteOptions Configuration options for the database connection.
 */
export function createDatabase(path?: PathLike, sqliteOptions: DatabaseSyncOptions = {}) {
	return new DatabaseSync(path || ":memory:", sqliteOptions);
}

export function setupDatabase(
	db: DatabaseSync,
	repo: Repo,
	options: DBSetupOptions = { seed: true }
) {
	const migrator = new DBMigrator(db);
	const currentVersion = migrator.version();
	migrator.up("v0.1.0");

	// TODO: seeder class or something
	if (options.seed) {
		seedAccount(repo, currentVersion);
	}
}
