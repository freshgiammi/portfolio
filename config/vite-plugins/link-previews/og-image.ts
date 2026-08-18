/**
 * Reads a page's `og:image` without downloading the page.
 *
 * The tag lives in `<head>`, usually inside the first few kilobytes, while the document behind it
 * can be megabytes of markup. So the response is consumed as a stream and abandoned the moment the
 * answer is known: found the tag, left the head, or hit the byte ceiling, whichever comes first.
 */

/** Enough for any reasonable `<head>`; a page that has not declared one by here is not going to. */
const MAX_BYTES = 256 * 1024

const TIMEOUT_MS = 5000

/** Kept between chunks so a tag split across a chunk boundary is still seen whole. */
const TAIL_BYTES = 16

/**
 * Named as a bot, with a contact URL, because that is what the sites being read expect: an honest
 * agent string is what lets an operator identify and block this if they want to.
 */
const USER_AGENT = "Mozilla/5.0 (compatible; freshgiammi-og/1.0; +https://freshgiammi.dev)"

const HTML_TYPES = ["text/html", "application/xhtml+xml"]

/**
 * In preference order. `og:image` is the real tag; `og:image:url` is its documented long form, and
 * `og:image:secure_url` is what a handful of sites publish instead of either.
 */
const IMAGE_PROPERTIES = ["og:image", "og:image:url", "og:image:secure_url"] as const

/**
 * Whether a URL is safe for the server to fetch on a caller's behalf.
 *
 * Checks literal addresses only: Workers can't resolve DNS before fetching, so a hostname
 * resolving to a private address slips through. This is a second line of defense, not the only one.
 */
export function isPublicHttpUrl(raw: string): boolean {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return false
  // Credentials in a fetched URL are never intentional here, and they are a common way to smuggle a
  // different host past a naive reader (`https://trusted@169.254.169.254/`).
  if (url.username || url.password) return false

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "")
  if (!host) return false

  if (host === "localhost" || /\.(localhost|local|internal|home\.arpa)$/.test(host)) return false

  // A bare number is still a valid host: `http://2130706433/` is 127.0.0.1 by another spelling.
  if (/^\d+$/.test(host)) return false

  if (host.includes(":")) return isPublicIpv6(host)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return isPublicIpv4(host)

  return true
}

/**
 * The page's `og:image`, resolved against the URL it was actually served from, or null if the page
 * declares none, is not HTML, or does not answer in time.
 *
 * Never throws: a find without a preview is a missing image, not a failed request.
 */
export async function extractOgImage(pageUrl: string): Promise<string | null> {
  if (!isPublicHttpUrl(pageUrl)) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(pageUrl, {
      // Redirects are followed by the runtime, and `response.url` is what relative image paths are
      // then resolved against, so a redirected page still resolves its own images correctly.
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" }
    })

    if (!response.ok || !response.body) return null

    // An empty content-type is tolerated; a declared non-HTML one is not, since parsing a jpeg for
    // meta tags can only waste the byte budget.
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? ""
    if (contentType && !HTML_TYPES.some(type => contentType.includes(type))) return null

    // The redirected URL, if any: relative images belong to wherever the page actually came from.
    const found = await readUntilOgImage(response.body)
    if (!found) return null

    const resolved = new URL(found, response.url || pageUrl).href
    return isPublicHttpUrl(resolved) ? resolved : null
  } catch {
    // A timeout, a refused connection, a malformed response: all of them mean no image.
    return null
  } finally {
    clearTimeout(timeout)
    // Releases the connection whether the answer was found on the first chunk or never.
    controller.abort()
  }
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

/**
 * Pulls chunks until the image is known or the budget runs out, keeping only the unparsed tail
 * between reads so memory stays flat however large the document is.
 */
async function readUntilOgImage(body: ReadableStream<Uint8Array>): Promise<string | null> {
  const reader = body.getReader()
  const decoder = new TextDecoder("utf-8")
  const candidates = new Map<string, string>()

  let pending = ""
  let bytes = 0

  try {
    while (bytes < MAX_BYTES) {
      // Sequential by nature: each chunk is what decides whether another is worth asking for.
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read()
      if (done) break

      bytes += value.byteLength
      pending += decoder.decode(value, { stream: true })

      const { rest, headEnded } = scanTags(pending, candidates)

      // The best tag wins the moment it appears; the weaker spellings are only worth waiting for
      // while there is still head left to read.
      const best = candidates.get(IMAGE_PROPERTIES[0])
      if (best) return best
      if (headEnded) break

      pending = rest
    }
  } catch {
    // A stream that dies mid-page still gets to keep whatever it already parsed.
  } finally {
    void reader.cancel().catch(() => {})
  }

  for (const property of IMAGE_PROPERTIES) {
    const value = candidates.get(property)
    if (value) return value
  }

  return null
}

/**
 * Reads every complete `<meta>` in the buffer, returning what could not be parsed yet: either a tag
 * still waiting for its `>`, or the last few characters, which may be the start of one.
 */
function scanTags(buffer: string, candidates: Map<string, string>): { rest: string; headEnded: boolean } {
  const lower = buffer.toLowerCase()

  let cursor = 0
  while (cursor < buffer.length) {
    const start = lower.indexOf("<meta", cursor)
    if (start === -1) break

    const end = buffer.indexOf(">", start)
    // The tag is still arriving. Keeping it whole is what makes a chunk boundary invisible.
    if (end === -1) return { rest: buffer.slice(start), headEnded: false }

    readMeta(buffer.slice(start, end + 1), candidates)
    cursor = end + 1
  }

  // `</head>` may itself straddle the boundary, so it is looked for in the same pass and the tail
  // kept is long enough to hold either it or the start of a `<meta`.
  const headEnd = lower.indexOf("</head>", cursor)
  if (headEnd !== -1) return { rest: "", headEnded: true }

  return { rest: buffer.slice(Math.max(cursor, buffer.length - TAIL_BYTES)), headEnded: false }
}

/** Attributes are read off one already-delimited tag, so the pattern can never run away over a page. */
const ATTRIBUTE = /([a-z0-9_:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi

function readMeta(tag: string, candidates: Map<string, string>) {
  const attributes = new Map<string, string>()

  for (const match of tag.matchAll(ATTRIBUTE)) {
    attributes.set(match[1]!.toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "")
  }

  // `property` is what the OG spec uses and `name` is what several generators emit instead, and
  // either may be written before or after the `content` it belongs to — reading the whole tag first
  // is what makes attribute order a non-question.
  const property = (attributes.get("property") ?? attributes.get("name") ?? "").toLowerCase()
  const content = attributes.get("content")?.trim()

  if (!content) return
  // First declaration wins, matching how consumers read a page that repeats a tag.
  if (IMAGE_PROPERTIES.some(name => name === property) && !candidates.has(property)) {
    candidates.set(property, content)
  }
}

function isPublicIpv4(host: string): boolean {
  const parts = host.split(".").map(Number)
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return false

  const [a, b, c] = parts as [number, number, number, number]

  if (a === 0) return false // this network
  if (a === 10) return false // private
  if (a === 127) return false // loopback
  if (a === 100 && b >= 64 && b <= 127) return false // carrier-grade NAT
  if (a === 169 && b === 254) return false // link-local, and the cloud metadata endpoint with it
  if (a === 172 && b >= 16 && b <= 31) return false // private
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false // protocol assignments, TEST-NET-1
  if (a === 192 && b === 168) return false // private
  if (a === 198 && (b === 18 || b === 19)) return false // benchmarking
  if (a === 198 && b === 51 && c === 100) return false // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return false // TEST-NET-3
  if (a >= 224) return false // multicast and reserved

  return true
}

function isPublicIpv6(host: string): boolean {
  if (host === "::" || host === "::1") return false
  if (/^f[cd]/.test(host)) return false // unique local
  if (/^fe[89ab]/.test(host)) return false // link-local

  // `::ffff:127.0.0.1` is loopback wearing an IPv6 spelling, so the embedded address is judged on
  // its own terms. `URL` rewrites the dotted form to hex on the way in (`::ffff:7f00:1`), so that is
  // the spelling actually seen here — the dotted one is still handled for a host that skipped it.
  const hex = /^::(?:ffff:)?([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(host)
  if (hex) {
    const high = parseInt(hex[1]!, 16)
    const low = parseInt(hex[2]!, 16)
    const octets = [Math.floor(high / 256), high % 256, Math.floor(low / 256), low % 256]
    return isPublicIpv4(octets.join("."))
  }

  if (host.includes(".")) {
    const embedded = host.slice(host.lastIndexOf(":") + 1)
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(embedded)) return isPublicIpv4(embedded)
  }

  return true
}
