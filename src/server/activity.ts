import { createServerFn } from "@tanstack/react-start"
import { setResponseHeader } from "@tanstack/react-start/server"
import { env } from "cloudflare:workers"

/**
 * The most recent thing I did in public on GitHub.
 *
 * The endpoint works with no credentials at all, at 60 requests an hour per IP, and worker egress
 * addresses are shared so that budget is not really ours. Two things keep it comfortable: the
 * subrequest is cached at the edge, and a `GITHUB_TOKEN` raises the ceiling to 5000 an hour when one
 * is configured. Without a token everything still works, just anonymously.
 */

const USERNAME = "freshgiammi"
const EVENTS_URL = `https://api.github.com/users/${USERNAME}/events/public?per_page=30`

/** GitHub rejects requests without one. */
const USER_AGENT = "freshgiammi.dev"

/**
 * What the browser is told. `max-age` is the part that matters: a reload inside five minutes is served
 * from the browser's own cache and never reaches the worker at all. Set by hand here, since a server
 * function returns a value rather than a `Response`.
 */
const CACHE_CONTROL = "public, max-age=300, stale-while-revalidate=86400"

/** A failed or empty lookup is not worth remembering for long, so it is retried sooner. */
const CACHE_CONTROL_EMPTY = "public, max-age=60"

/**
 * How long Cloudflare keeps GitHub's answer.
 *
 * This is the one that protects the rate limit. A `Cache-Control` header on our own response only
 * instructs the browser: Cloudflare does not cache a worker's output because of it. Caching the
 * subrequest does, so a thousand cold visitors in a quarter of an hour cost one call to GitHub per
 * location rather than a thousand.
 */
const UPSTREAM_CACHE_SECONDS = 900

/**
 * How many rows the feed holds for scrolling.
 */
const LIMIT = 15

/**
 * What each event becomes, in the order of preference. Stars are left out on purpose: this is meant to
 * say what I have been working on, and starring a repository is not work. Branch and tag creations are
 * out too, since their names carry ticket numbers.
 */
const ACTIONS: Record<string, (payload: EventPayload) => string | null> = {
  PushEvent: () => "pushed to",
  PullRequestEvent: payload => {
    if (payload.action === "opened") return "opened a PR in"
    if (payload.pull_request?.merged) return "merged a PR in"
    return null
  },
  PullRequestReviewEvent: () => "reviewed a PR in",
  PullRequestReviewCommentEvent: () => "reviewed a PR in",
  IssueCommentEvent: () => "commented on",
  IssuesEvent: payload => (payload.action === "opened" ? "opened an issue on" : null),
  ReleaseEvent: payload => (payload.action === "published" ? "released" : null),
  CreateEvent: payload => (payload.ref_type === "repository" ? "created" : null)
}

/** What kind of thing a row is about, which is what the row's icon is picked from. */
export type ActivityKind = "push" | "pr" | "comment" | "issue" | "release" | "create"

const KINDS: Record<string, ActivityKind> = {
  PushEvent: "push",
  PullRequestEvent: "pr",
  PullRequestReviewEvent: "pr",
  PullRequestReviewCommentEvent: "comment",
  IssueCommentEvent: "comment",
  IssuesEvent: "issue",
  ReleaseEvent: "release",
  CreateEvent: "create"
}

/**
 * What of GitHub's payloads this reads. The events API trims its nested objects: a
 * `PullRequestReviewEvent` carries a pull request with `id`, `number`, `url` and nothing else, so
 * `html_url` is only ever there on some of them and the browser link has to be built from `number`
 * when it is not.
 */
type EventPayload = {
  action?: string
  ref_type?: string
  number?: number
  pull_request?: { merged?: boolean; number?: number; html_url?: string }
  issue?: { number?: number; html_url?: string }
  release?: { html_url?: string }
  review?: { html_url?: string }
}

type GitHubEvent = {
  type?: string
  created_at?: string
  repo?: { name?: string }
  payload?: EventPayload
}

export type Activity = {
  /** Reads as "<action> <repo>", e.g. "reviewed a PR in arduino/cbor-js". */
  action: string
  kind: ActivityKind
  repo: string
  /** The pull request or issue the event was about, when it was about one. */
  number?: number
  at: string
  url: string
}

export type ActivityFeed = {
  items: Array<Activity>
  /** How many more the feed held past the ones being shown, so the list can say so and stop. */
  more: number
}

/**
 * A server function rather than an `/api` route: this widget is the only caller, so the handler's
 * return type is the component's type and there is no json payload to unwrap or re-declare.
 */
export const getActivity = createServerFn({ method: "GET" }).handler(async (): Promise<ActivityFeed> => {
  const activity = await readActivity().catch(() => [])
  setResponseHeader("Cache-Control", activity.length > 0 ? CACHE_CONTROL : CACHE_CONTROL_EMPTY)

  return { items: activity.slice(0, LIMIT), more: Math.max(0, activity.length - LIMIT) }
})

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

async function readActivity(): Promise<Array<Activity>> {
  let response = await fetchEvents(env.GITHUB_TOKEN)

  // An expired or revoked token should cost the widget nothing: retry as an anonymous caller, which is
  // how this worked before there was a token at all. 403 covers a token that is refused outright.
  if ((response.status === 401 || response.status === 403) && env.GITHUB_TOKEN) {
    response = await fetchEvents("")
  }

  if (!response.ok) return []

  const events = (await response.json()) as Array<GitHubEvent>
  const activity: Array<Activity> = []
  // Reviewing a pull request twice, or reviewing and then commenting, produces several events that
  // say the same sentence. Keyed by the sentence the row will read, number included, so two reviews
  // on two pull requests in one repository stay two rows.
  const seen = new Set<string>()

  for (const event of events) {
    const mapped = toActivity(event)
    if (!mapped) continue

    const key = `${mapped.action} ${mapped.repo}${mapped.number ?? ""}`
    if (seen.has(key)) continue

    seen.add(key)
    activity.push(mapped)
  }

  return activity
}

/** The token is optional, so the header is only sent when there is something to send. */
function fetchEvents(token: string) {
  return fetch(EVENTS_URL, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    // GitHub answers `Cache-Control: private`, so `cacheEverything` is needed for the ttl to apply.
    // Ignored outside a deployed worker, which is why dev still calls GitHub on every request.
    cf: { cacheTtl: UPSTREAM_CACHE_SECONDS, cacheEverything: true }
  })
}

function toActivity(event: GitHubEvent): Activity | null {
  const repo = event.repo?.name
  const payload = event.payload ?? {}
  const action = event.type ? ACTIONS[event.type]?.(payload) : undefined

  if (!action || !repo || !event.created_at) return null

  const pullNumber = payload.pull_request ? (payload.pull_request.number ?? payload.number) : undefined

  return {
    action,
    kind: KINDS[event.type!]!,
    repo,
    number: pullNumber ?? payload.issue?.number,
    at: event.created_at,
    // The pull request or issue itself when the event has one, so the link lands on the actual work
    // rather than on the repository. A review carries its own anchor on that same page; a pull
    // request event carries neither, and is put back together from the number.
    url:
      payload.issue?.html_url ??
      payload.pull_request?.html_url ??
      payload.review?.html_url ??
      payload.release?.html_url ??
      (pullNumber ? `https://github.com/${repo}/pull/${pullNumber}` : `https://github.com/${repo}`)
  }
}
