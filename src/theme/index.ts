export const THEMES = {
  light: { label: "Light" },
  dark: { label: "Dark" },
  system: { label: "System" }
} as const satisfies Record<string, { label: string }>

export type ThemeKey = keyof typeof THEMES

/** What a visitor with no stored preference gets. "system" stays selectable, it is just not assumed. */
export const DEFAULT_THEME: ThemeKey = "dark"

export function isThemeKey(key: string): key is ThemeKey {
  return key in THEMES
}

/** What a theme resolves to, and the only two values the `data-theme` attribute ever carries. */
export type ResolvedTheme = "light" | "dark"

export function resolveTheme(key: ThemeKey): ResolvedTheme {
  if (key !== "system") return key
  // The server cannot know what the OS prefers, and the default is what it falls back to.
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/** Runs `callback` whenever `<html data-theme>` changes, without subscribing to React theme state.
    Returns the teardown. */
export function onDataThemeChange(callback: () => void): () => void {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  return () => observer.disconnect()
}

/**
 * The hues the accent can be, each a four-step ramp in `tokens.scss`. Every one of them is placed so
 * both themes can read it: the light theme takes the deep end and the dark theme the light end, and
 * each measures at least 4.5:1 against the background it lands on. A hue that cannot do that is not
 * a hue this list can carry.
 */
export const ACCENTS = {
  aurora: { label: "Aurora" },
  fern: { label: "Fern" },
  orchid: { label: "Orchid" },
  tide: { label: "Tide" },
  ember: { label: "Ember" },
  umber: { label: "Umber" }
} as const satisfies Record<string, { label: string }>

export type AccentKey = keyof typeof ACCENTS

export const DEFAULT_ACCENT: AccentKey = "aurora"

export function isAccentKey(key: string): key is AccentKey {
  return key in ACCENTS
}

/** Presets that pair each accent with its best theme — dark with aurora is the "aurora" theme. */
export const PRESETS = [
  { key: "aurora", label: "Aurora", theme: "dark" as const, accent: "aurora" as const },
  { key: "fern", label: "Fern", theme: "dark" as const, accent: "fern" as const },
  { key: "orchid", label: "Orchid", theme: "dark" as const, accent: "orchid" as const },
  { key: "tide", label: "Tide", theme: "light" as const, accent: "tide" as const },
  { key: "ember", label: "Ember", theme: "light" as const, accent: "ember" as const },
  { key: "umber", label: "Umber", theme: "light" as const, accent: "umber" as const }
] as const

export type PresetKey = (typeof PRESETS)[number]["key"]
