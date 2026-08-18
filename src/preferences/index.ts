import { createIsomorphicFn } from "@tanstack/react-start"
import { getCookie } from "@tanstack/react-start/server"

import type { AccentKey, ThemeKey } from "@/theme"
import { DEFAULT_ACCENT, DEFAULT_THEME, isAccentKey, isThemeKey } from "@/theme"

/** Everything the reader has decided about this site. Each one is its own cookie and its own `data-` attribute. */
export type Preferences = {
  theme: ThemeKey
  accent: AccentKey
  /** The fibre under the page. See `index.scss`. */
  grain: boolean
  /** The geometric drawing behind the page. See `components/canvas/geometric-background`. */
  backdrop: boolean
  /** Whether the things kept back are open. See `routes/_main/-components/wave` for the way in. */
  unlocked: boolean
}

export const COOKIES = {
  theme: "theme",
  accent: "accent",
  grain: "grain",
  backdrop: "backdrop",
  unlocked: "unlocked"
} as const satisfies Record<keyof Preferences, string>

export const DEFAULT_PREFERENCES: Preferences = {
  theme: DEFAULT_THEME,
  accent: DEFAULT_ACCENT,
  grain: true,
  backdrop: true,
  unlocked: false
}

/** What a toggle is written as, and read back from. The attribute carries the same two words. */
export const toggleValue = (on: boolean) => (on ? "on" : "off")

const readCookie = createIsomorphicFn()
  .server((name: string) => getCookie(name))
  .client((name: string) => document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`))?.[1])

/** A stored toggle, or the default where there is nothing stored: the cookie carries the same two
    words the attribute does, and anything else is treated as absent. */
function readToggle(name: string, fallback: boolean): boolean {
  const value = readCookie(name)
  if (value !== toggleValue(true) && value !== toggleValue(false)) return fallback
  return value === toggleValue(true)
}

/**
 * The stored preferences, read on whichever side this runs: the request's Cookie header on the
 * server, `document.cookie` in the browser. The root route loader uses it so the server-rendered
 * document already matches the reader, down to the icon in the menu, from the first byte rather than
 * from the first effect.
 */
export function getServerPreferences(): Preferences {
  const theme = readCookie(COOKIES.theme)
  const accent = readCookie(COOKIES.accent)

  return {
    theme: theme && isThemeKey(theme) ? theme : DEFAULT_THEME,
    accent: accent && isAccentKey(accent) ? accent : DEFAULT_ACCENT,
    grain: readToggle(COOKIES.grain, DEFAULT_PREFERENCES.grain),
    backdrop: readToggle(COOKIES.backdrop, DEFAULT_PREFERENCES.backdrop),
    unlocked: readToggle(COOKIES.unlocked, DEFAULT_PREFERENCES.unlocked)
  }
}
