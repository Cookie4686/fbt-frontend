-- UP
CREATE TABLE IF NOT EXISTS account_type (
  account_type TEXT PRIMARY KEY,
  is_deletable INTEGER NOT NULL DEFAULT FALSE
) STRICT;

CREATE TABLE IF NOT EXISTS category_type (
  category_type TEXT PRIMARY KEY,
  is_deletable INTEGER NOT NULL DEFAULT FALSE,

  account_type TEXT REFERENCES account_type(account_type)
) STRICT;

CREATE TABLE IF NOT EXISTS category (
  category_id INTEGER PRIMARY KEY,
  parent_id INTEGER REFERENCES category(category_id),
  category_type TEXT REFERENCES category_type(category_type),

  name TEXT NOT NULL UNIQUE,
  description TEXT,

  sequence INTEGER
) STRICT;

CREATE TABLE IF NOT EXISTS account (
  account_id INTEGER PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES category(category_id),

  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  is_debit INTEGER NOT NULL,
  description TEXT
) STRICT;

CREATE TABLE IF NOT EXISTS account_type_info (
  account_id INTEGER NOT NULL REFERENCES account(account_id),
  account_type TEXT NOT NULL REFERENCES account_type(account_type),

  data BLOB,

  CONSTRAINT "account_type_info_pk" PRIMARY KEY(account_id, account_type)
) STRICT;

CREATE TABLE IF NOT EXISTS tag (
  tag_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
) STRICT;

CREATE TABLE IF NOT EXISTS account_tag (
  account_id INTEGER NOT NULL REFERENCES account(account_id),
  tag_id INTEGER NOT NULL REFERENCES tag(account_id),

  CONSTRAINT "account_tag_pk" PRIMARY KEY(account_id, tag_id)
) STRICT;

-- DOWN
DROP TABLE IF EXISTS account_tag;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS account_type_info;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS category_type;
DROP TABLE IF EXISTS account_type;
