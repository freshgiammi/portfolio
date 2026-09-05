import { createContext, useContext } from "react"

import type { Preferences } from "@/preferences"
import type { AccentKey, ResolvedTheme, ThemeKey } from "@/theme"

export type ThemeContextValue = {
  /** What the reader chose, including "system". */
  theme: ThemeKey
  /** Palette — `accent` in `Preferences` / `data-accent`. */
  accent: AccentKey
  /** What that resolves to, and what `data-theme` carries. `undefined` until "system" can be read. */
  resolved: ResolvedTheme | undefined
  setTheme: (patch: Partial<Pick<Preferences, "theme" | "accent">>) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * The theme, resolved.
 *
 * The choice itself is a preference like any other and is stored with them; this is the half that
 * only the theme has, which is that "system" is a question and everything reading the theme wants
 * the answer.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>")
  return ctx
}

/**
 * The theme of the nearest `ThemeScope`, or `undefined` when none is active and the document's own
 * theme applies.
 *
 * React context crosses portals where the DOM does not, so a popup mounted on `document.body` can
 * still read the scope it was opened from and tag its own root with it.
 */
export const ThemeScopeContext = createContext<ResolvedTheme | undefined>(undefined)

/**
 * The theme to put on a portalled element, so it matches the scope it was opened from rather than the
 * document. `undefined` means "inherit", which is the right answer outside any scope.
 *
 * @example
 * const scopedTheme = useScopedTheme()
 * return <DropdownMenu.Positioner data-theme={scopedTheme} />
 */
export function useScopedTheme(): ResolvedTheme | undefined {
  return useContext(ThemeScopeContext)
}
