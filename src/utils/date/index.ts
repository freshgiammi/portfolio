/**
 * Date presets shared across the site, so a date reads the same everywhere it appears.
 *
 * Every preset pins `timeZone: "UTC"`. The dates these format are date-only strings like
 * `2026-07-26`, which parse to midnight UTC, so formatting them in a local zone west of Greenwich
 * shows the day before. It also kept the server and the browser rendering different text.
 */
const DATE_PRESETS = {
  /** `Jun 1`, for dense list rows where the year is implied by the ordering. */
  short: { month: "short", day: "numeric", timeZone: "UTC" },
  /** `Jun 1, 2026` */
  medium: { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
  /** `June 1, 2026` */
  long: { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }
} satisfies Record<string, Intl.DateTimeFormatOptions>

export type DatePreset = keyof typeof DATE_PRESETS

export function formatDate(iso: string, preset: DatePreset = "medium") {
  return new Date(iso).toLocaleDateString("en-US", DATE_PRESETS[preset])
}

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

type RelativeTimeOptions = {
  base?: string | number | Date
  locale?: string
  numeric?: Intl.RelativeTimeFormatNumeric
  style?: Intl.RelativeTimeFormatStyle
}

/**
 * `Intl` handles the plurals and wording, this only picks an appropriate unit.
 *
 * Values are truncated rather than rounded: something that happened 19 and a half days ago reads
 * as "19 days ago" until day twenty is complete.
 */
export function formatRelativeTime(
  value: NonNullable<RelativeTimeOptions["base"]>,
  { base = Date.now(), locale = "en-US", numeric = "auto", style = "long" }: RelativeTimeOptions = {}
) {
  const seconds = Math.round((toUnixMs(value) - toUnixMs(base)) / 1000)
  const absolute = Math.abs(seconds)
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric, style })

  if (absolute < HOUR) return formatter.format(Math.trunc(seconds / MINUTE), "minute")
  if (absolute < DAY) return formatter.format(Math.trunc(seconds / HOUR), "hour")
  if (absolute < 30 * DAY) return formatter.format(Math.trunc(seconds / DAY), "day")
  return formatter.format(Math.trunc(seconds / (30 * DAY)), "month")
}

function toUnixMs(value: NonNullable<RelativeTimeOptions["base"]>) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}
