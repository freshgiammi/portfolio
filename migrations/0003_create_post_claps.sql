-- A counter per voter per post rather than a row per clap: claps are additive and capped, so what
-- matters is how many of the cap a voter has spent, and the post's total is SUM(count). The cap is
-- re-applied on every write in `data/post-stats`, so a tampered request cannot spend more than its
-- share. The voter is the same opaque browser id as `post_likes` and identifies nobody.
CREATE TABLE IF NOT EXISTS post_claps (
  slug TEXT NOT NULL,
  voter TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (slug, voter)
);
