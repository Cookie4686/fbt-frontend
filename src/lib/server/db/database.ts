import type { PathLike } from "node:fs";

import { DatabaseSync, type DatabaseSyncOptions } from "node:sqlite";

import { seedAccount } from "./seed/account";
import sqlSetup from "./sqlite";

/**
 * Constructs a new `DatabaseSync` instance.
 * @param path The file path of the file-backed database.
 * If omitted create new in memory database instead.
 * @param options Configuration options for the database connection.
 */
export function createDatabase(path?: PathLike, options: DatabaseSyncOptions = {}) {
	const db = new DatabaseSync(path || ":memory:", options);

	setupDB(db);

	return db;
}

/**
 * Clears, initializes and seed all tables
 */
function setupDB(db: DatabaseSync) {
	db.exec(sqlSetup.init.bookkeeping);
	seedAccount(db);
}
