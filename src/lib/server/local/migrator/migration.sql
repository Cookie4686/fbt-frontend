CREATE TABLE IF NOT EXISTS migration (
  version TEXT NOT NULL,
  filename TEXT NOT NULL,
  applied_at TEXT,

  CONSTRAINT "migration_version_filename_pk" PRIMARY KEY(version, filename)
) STRICT;
