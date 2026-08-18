import { createIsomorphicFn } from "@tanstack/react-start"
import { getCookie } from "@tanstack/react-start/server"

const STORAGE_KEY = "voter-id"
/** Same id as `STORAGE_KEY`, mirrored into a cookie so a route loader can read it too — localStorage
    has no server-side equivalent, and without this the server has no way to know which voter it's
    rendering for, so a post already liked on an earlier visit would render as unliked on every first
    paint until the client's own fetch corrected it. */
const COOKIE_KEY = "voter-id"

/**
 * A random id the browser keeps for itself, so a like can be undone and can still be shown as
 * yours on a later visit. Nothing about the reader is involved: clearing storage simply makes a new
 * anonymous voter, which is the whole extent of the abuse story a like button on a blog deserves.
 *
 * `null` when storage is unavailable, which leaves the like button read-only rather than pretending
 * a vote was recorded.
 */
export function getVoterId(): string | null {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    const id = existing ?? crypto.randomUUID().replaceAll("-", "")
    if (!existing) localStorage.setItem(STORAGE_KEY, id)

    // Kept in step on every read, not only on creation: a voter id from before this mirroring
    // existed still has no cookie of its own until this runs once.
    document.cookie = `${COOKIE_KEY}=${id}; path=/; max-age=31536000; SameSite=Lax`
    return id
  } catch {
    return null
  }
}

const readVoterCookie = createIsomorphicFn()
  .server(() => getCookie(COOKIE_KEY))
  .client(() => document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]+)`))?.[1])

/**
 * The same voter id `getVoterId` reads, but from the cookie rather than storage, and never creating
 * one — a route loader reads this to prefetch a post's stats for the reader actually making the
 * request, whichever side that loader happens to run on. A first-ever visit has no cookie yet, so
 * this is `undefined` until `getVoterId` runs once client-side and sets it for the next load.
 */
export function getServerVoterId(): string | undefined {
  return readVoterCookie()
}
