/**
 * SQL migration file convention
 * Filename: NUM_SEQUENCE-FILENAME.sql
 * File contains "UP" / "DOWN" one-line comment before each respective up/down sql statements
 * */

import type { DatabaseSync } from "node:sqlite";

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const SQL_UP_COMMENT = "-- UP";
const SQL_DOWN_COMMENT = "-- DOWN";

const CURRENT_DIR = "src/lib/server/local/migrator";
const MIGRATIONS_DIR = path.join(CURRENT_DIR, "/migrations");

export class DBMigrator {
	private db: DatabaseSync;

	constructor(db: DatabaseSync) {
		this.db = db;

		db.exec(readFileSync(path.join(CURRENT_DIR, "migration.sql"), "utf8"));

		for (const { version, filename } of getAllMigrationFiles("ascending")) {
			this.insertMigrationInfo({ version, filename, applied_at: null });
		}
	}

	public version() {
		const migrationInfo = this.db
			.prepare(
				`
          SELECT version FROM migration
          WHERE applied_at IS NOT NULL
          ORDER BY version DESC
        `
			)
			.get();

		if (migrationInfo) return migrationInfo.version as string;

		return "v0.0.0";
	}

	public up(targetVersion?: string) {
		const currentVersion = this.version();
		const migrationFiles = getAllMigrationFiles("ascending").filter(({ version }) => {
			const isHigherThanCurrent = !currentVersion || version > currentVersion;
			const isLowerThanTarget = !targetVersion || version <= targetVersion;
			return isHigherThanCurrent && isLowerThanTarget;
		});

		for (const { filepath, version, filename } of migrationFiles) {
			this.db.exec(readUpStatement(readFileSync(filepath, "utf8")));
			this.updateMigrationInfo({ version, filename, applied_at: new Date(Date.now()) });
		}
	}

	private insertMigrationInfo(payload: {
		version: string;
		filename: string;
		applied_at: Date | null;
	}) {
		const { version, filename, applied_at } = payload;

		this.db
			.prepare(
				`
          INSERT INTO migration (version, filename, applied_at)
          VALUES (?, ?, ?)
          ON CONFLICT DO NOTHING
        `
			)
			.run(version, filename, applied_at?.toISOString() || null);
	}

	private updateMigrationInfo(payload: {
		version: string;
		filename: string;
		applied_at: Date | null;
	}) {
		const { version, filename, applied_at } = payload;

		this.db
			.prepare(
				`
      UPDATE migration
      SET applied_at = ?
      WHERE version = ? AND filename = ?
    `
			)
			.run(applied_at?.toISOString() || null, version, filename);
	}
}

function getAllMigrationFiles(sortDirection: "ascending" | "descending" = "ascending"): {
	filepath: string;
	version: string;
	filename: string;
}[] {
	const files: ReturnType<typeof getAllMigrationFiles> = [];

	const compareString = (a: string, b: string) => {
		if (sortDirection === "ascending") return a < b ? -1 : 1;
		return a < b ? 1 : -1;
	};

	const versionDirectories = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
		.filter((f) => f.isDirectory())
		.sort((a, b) => compareString(a.name, b.name));

	for (const versionDirectory of versionDirectories) {
		const currentPath = path.join(versionDirectory.parentPath, versionDirectory.name);

		const currentFiles: ReturnType<typeof getAllMigrationFiles> = readdirSync(currentPath)
			.sort(compareString)
			.map((filename) => ({
				filepath: path.join(currentPath, filename),
				version: versionDirectory.name,
				filename,
			}));

		files.push(...currentFiles);
	}

	return files;
}

function readUpStatement(content: string) {
	const upStartPostion = content.search(SQL_UP_COMMENT);
	const downStartPostion = content.search(SQL_DOWN_COMMENT);

	return upStartPostion < downStartPostion ?
			content.substring(upStartPostion, downStartPostion)
		:	content.substring(upStartPostion);
}

function readDownStatement(content: string) {
	const upStartPostion = content.search(SQL_UP_COMMENT);
	const downStartPostion = content.search(SQL_DOWN_COMMENT);

	return downStartPostion < upStartPostion ?
			content.substring(downStartPostion, upStartPostion)
		:	content.substring(downStartPostion);
}
