-- One row per voter per post, rather than a counter: the primary key makes a double like
-- impossible, unliking is a delete instead of a decrement that could drift below zero, and the
-- count is whatever COUNT(*) says. The voter is an opaque id the browser generates for itself, so
-- nothing here identifies a person.
CREATE TABLE IF NOT EXISTS post_likes (
  slug TEXT NOT NULL,
  voter TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (slug, voter)
);
