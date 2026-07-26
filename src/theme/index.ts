import { createIsomorphicFn } from "@tanstack/react-start"
import { getCookie } from "@tanstack/react-start/server"

export const THEMES = {
  light: { label: "Light", previewVar: "--color-sand" },
  dark: { label: "Dark", previewVar: "--color-aurora" },
  system: { label: "System", previewVar: "--color-sand" }
} as const satisfies Record<string, { label: string; previewVar: `--color-${string}` }>

export type ThemeKey = keyof typeof THEMES

export const DEFAULT_THEME: ThemeKey = "system"

export const THEME_COOKIE = "theme"

export function isThemeKey(key: string): key is ThemeKey {
  return key in THEMES
}

/** What a theme resolves to, and the only two values the `data-theme` attribute ever carries. */
export type ResolvedTheme = "light" | "dark"

export function resolveTheme(key: ThemeKey): ResolvedTheme {
  if (key !== "system") return key
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

// Reads the cookie on whichever side it runs: the request's Cookie header on the server,
// `document.cookie` on the client. The root route loader uses it so the server-rendered theme
// icon matches the user's preference from the very first byte.
/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

const readThemeCookie = createIsomorphicFn()
  .server(() => getCookie(THEME_COOKIE))
  .client(() => document.cookie.match(/(?:^|; )theme=([^;]+)/)?.[1])

export function getServerTheme(): ThemeKey {
  const value = readThemeCookie()
  return value && isThemeKey(value) ? value : DEFAULT_THEME
}
