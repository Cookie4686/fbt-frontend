-- UP
CREATE TABLE IF NOT EXISTS transaction_type (
	transaction_type TEXT PRIMARY KEY,
	is_deletable INTEGER NOT NULL DEFAULT TRUE
) STRICT;

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INTEGER PRIMARY KEY,
  datetime TEXT NOT NULL,
  description TEXT NOT NULL,
  note TEXT,

  sequence INTEGER
) STRICT;

CREATE TABLE IF NOT EXISTS transaction_type_info (
  transaction_type TEXT NOT NULL REFERENCES transaction_type(transaction_type),
  transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id),

	data BLOB,

  CONSTRAINT "transaction_type_info_pk" PRIMARY KEY(transaction_type, transaction_id)
) STRICT;

CREATE TABLE IF NOT EXISTS entry (
  transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id),
  account_id INTEGER NOT NULL REFERENCES account(account_id),

  amount REAL NOT NULL,
  is_debit INTEGER NOT NULL,

  CONSTRAINT "entry_pk" PRIMARY KEY(account_id, transaction_id)
) STRICT;

-- DOWN
DROP TABLE IF EXISTS entry;
DROP TABLE IF EXISTS transaction_type_info;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS transaction_type;
