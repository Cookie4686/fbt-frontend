import fs from "node:fs";
import path from "node:path";

const sqlInitDir = "src/lib/server/db/sqlite/init";
const sqlSeedDir = "src/lib/server/db/sqlite/seed";

const init = {
	bookkeeping: fs.readFileSync(path.join(sqlInitDir, "bookkeeping.sql"), "utf8"),
};

const seed = {
	account: fs.readFileSync(path.join(sqlSeedDir, "account.sql"), "utf8"),
};

const sqlSetup = { init, seed };

export default sqlSetup;
