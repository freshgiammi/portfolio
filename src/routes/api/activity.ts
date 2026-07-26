import { createFileRoute } from "@tanstack/react-router"
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
 * from the browser's own cache and never reaches the worker at all.
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

/** Enough for a short feed or a rotation, few enough that the list stays recent. */
const LIMIT = 5

/**
 * What each event becomes, in the order of preference. Stars are left out on purpose: this is meant to
 * say what I have been working on, and starring a repository is not work. Branch and tag creations are
 * out too, since their names carry ticket numbers.
 */
const ACTIONS: Record<string, (payload: EventPayload) => string | null> = {
  PushEvent: () => "pushed to",
  PullRequestEvent: payload => {
    if (payload.action === "opened") return "opened a pull request in"
    if (payload.pull_request?.merged) return "merged a pull request in"
    return null
  },
  PullRequestReviewEvent: () => "reviewed a pull request in",
  PullRequestReviewCommentEvent: () => "reviewed a pull request in",
  IssueCommentEvent: () => "commented in",
  IssuesEvent: payload => (payload.action === "opened" ? "opened an issue in" : null),
  ReleaseEvent: payload => (payload.action === "published" ? "published a release in" : null),
  CreateEvent: payload => (payload.ref_type === "repository" ? "created" : null)
}

type EventPayload = {
  action?: string
  ref_type?: string
  pull_request?: { merged?: boolean; html_url?: string }
  issue?: { html_url?: string }
  release?: { html_url?: string }
}

type GitHubEvent = {
  type?: string
  created_at?: string
  repo?: { name?: string }
  payload?: EventPayload
}

type Activity = {
  /** Reads as "<action> <repo>", e.g. "reviewed a pull request in arduino/cbor-js". */
  action: string
  repo: string
  at: string
  url: string
}

export const Route = createFileRoute("/api/activity")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return json({ activity: await readActivity() })
        } catch {
          return json({ activity: [] })
        }
      }
    }
  }
})

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function json(body: { activity: Array<Activity> }) {
  const cacheControl = body.activity.length > 0 ? CACHE_CONTROL : CACHE_CONTROL_EMPTY
  return Response.json(body, { headers: { "Cache-Control": cacheControl } })
}

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
  // say the same sentence. Keyed by the sentence, so only the most recent of each survives.
  const seen = new Set<string>()

  for (const event of events) {
    const mapped = toActivity(event)
    if (!mapped) continue

    const key = `${mapped.action} ${mapped.repo}`
    if (seen.has(key)) continue

    seen.add(key)
    activity.push(mapped)
    if (activity.length === LIMIT) break
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

  return {
    action,
    repo,
    at: event.created_at,
    // The pull request or issue itself when the event has one, so the link lands on the actual work.
    url:
      payload.pull_request?.html_url ??
      payload.issue?.html_url ??
      payload.release?.html_url ??
      `https://github.com/${repo}`
  }
}
