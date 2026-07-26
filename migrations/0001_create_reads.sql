-- One row per post. The row is created by the first read, so a post that nobody has finished
-- simply has no row rather than a zero.
CREATE TABLE IF NOT EXISTS reads (
  slug TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
