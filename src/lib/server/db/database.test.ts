import { expect, test } from "vitest";

import { createDatabase } from "./database";

test("should create an in-memory database", () => {
	const db = createDatabase();

	expect(db.isOpen).toBe(true);

	db.close();
});
