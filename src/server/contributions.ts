import { createServerFn } from "@tanstack/react-start"
import { setResponseHeader } from "@tanstack/react-start/server"

/**
 * A year of GitHub contributions, read off the calendar GitHub renders on a profile.
 *
 * Not the API, which has no anonymous route to this: `contributionsCollection` is GraphQL only, and
 * GraphQL refuses unauthenticated callers outright. The REST events feed needs no token but caps out
 * around three hundred events and ninety days, which is a month of history for this account and not
 * enough to say anything about a year. The calendar page is the one source that answers anonymously
 * with the whole window, so it is the one being read.
 *
 * The cost is that this parses markup rather than a contract, and markup can be rewritten without
 * notice. Everything downstream is built for that: a parse that comes back short returns null and
 * the widget renders nothing, rather than the page showing a year of zeroes.
 */

const USERNAME = "freshgiammi"
const CALENDAR_URL = `https://github.com/users/${USERNAME}/contributions`

/** GitHub serves the calendar to a browser-ish caller; an empty agent gets a challenge page. */
const USER_AGENT = "freshgiammi.dev"

/**
 * A day's contributions cannot change once the day is over, and today's only grows, so this is much
 * longer-lived than the activity feed beside it.
 */
const CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400"
const CACHE_CONTROL_EMPTY = "public, max-age=300"
const UPSTREAM_CACHE_SECONDS = 3600

const WEEK_DAYS = 7
const MONTH_DAYS = 30

/** Below this, the markup has moved and what parsed is not worth showing. */
const MIN_DAYS = 300

/**
 * Matched as whole tags, then read attribute by attribute: GitHub writes `data-date`, `id` and
 * `data-level` in one order today, and a single regex spanning all three would silently return
 * nothing the day that order changes.
 */
const CELL_TAG = /<td\b[^>]*\bdata-date="\d{4}-\d{2}-\d{2}"[^>]*>/g
const CELL_DATE = /\bdata-date="(\d{4}-\d{2}-\d{2})"/
const CELL_LEVEL = /\bdata-level="(\d)"/
const CELL_ID = /\bid="(contribution-day-component-\d+-\d+)"/

/** The exact count lives only in the tooltip; the cell itself carries a bucket from 0 to 4. */
const TOOLTIP = /<tool-tip\b[^>]*\bfor="(contribution-day-component-\d+-\d+)"[^>]*>\s*(?:(\d+)|No)\s*contributions?/g

export type ContributionDay = {
  date: string
  count: number
  /** GitHub's own 0-4 bucket, kept so the heatmap shades the way the profile does. */
  level: number
}

export type Contributions = {
  /** Chronological, and starting on a Sunday, so the grid can lay them out column by column. */
  days: Array<ContributionDay>
  week: number
  month: number
  year: number
  /** Consecutive days up to now. A quiet today does not end it, an empty yesterday does. */
  streak: number
  best: ContributionDay
}

export const getContributions = createServerFn({ method: "GET" }).handler(async (): Promise<Contributions | null> => {
  const contributions = await readContributions().catch(() => null)
  setResponseHeader("Cache-Control", contributions ? CACHE_CONTROL : CACHE_CONTROL_EMPTY)
  return contributions
})

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

async function readContributions(): Promise<Contributions | null> {
  const response = await fetch(CALENDAR_URL, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    // As in `activity`: the ttl is what protects us from calling GitHub once per visitor, and it
    // only applies in a deployed worker.
    cf: { cacheTtl: UPSTREAM_CACHE_SECONDS, cacheEverything: true }
  })

  if (!response.ok) return null

  const days = parseDays(await response.text())
  if (days.length < MIN_DAYS) return null

  return summarise(days)
}

function parseDays(html: string): Array<ContributionDay> {
  const counts = new Map<string, number>()
  for (const [, id, count] of html.matchAll(TOOLTIP)) {
    // "No contributions on …" leaves the number group empty, which is a real zero rather than a
    // failed match.
    if (id) counts.set(id, count ? Number(count) : 0)
  }

  const days: Array<ContributionDay> = []

  for (const [tag] of html.matchAll(CELL_TAG)) {
    const date = CELL_DATE.exec(tag)?.[1]
    const id = CELL_ID.exec(tag)?.[1]
    if (!date || !id) continue

    const count = counts.get(id)
    if (count === undefined) continue

    days.push({ date, count, level: Number(CELL_LEVEL.exec(tag)?.[1] ?? 0) })
  }

  // The cells are written a row at a time, so the document holds every Sunday, then every Monday,
  // and so on. Sorting is what turns that back into a year.
  days.sort((a, b) => a.date.localeCompare(b.date))

  // The calendar runs to the end of the current week, so it ends on days that have not happened.
  const today = new Date().toISOString().slice(0, 10)
  const future = days.findIndex(day => day.date > today)
  return future === -1 ? days : days.slice(0, future)
}

function summarise(days: Array<ContributionDay>): Contributions {
  const sum = (from: number) => days.slice(from).reduce((total, day) => total + day.count, 0)

  let streak = 0
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i]!.count === 0) {
      // Today is still in progress, so it is allowed to be empty without ending anything.
      if (i === days.length - 1) continue
      break
    }
    streak += 1
  }

  return {
    days,
    week: sum(days.length - WEEK_DAYS),
    month: sum(days.length - MONTH_DAYS),
    year: sum(0),
    streak,
    best: days.reduce((best, day) => (day.count > best.count ? day : best), days[0]!)
  }
}
