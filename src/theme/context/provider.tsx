import { useHydrated } from "@tanstack/react-router"
import { type ReactNode, useCallback, useSyncExternalStore } from "react"

import { usePreferences } from "@/preferences/context"
import type { ResolvedTheme, ThemeKey } from "@/theme"
import { ThemeContext } from "@/theme/context/context"
import { withoutTransitions } from "@/utils/transitions"

const MEDIA = "(prefers-color-scheme: dark)"

/** Resolves "system" against the media query, since it's the one preference that isn't its own answer. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { preferences, setPreference } = usePreferences()

  const systemPrefersDark = useSyncExternalStore(subscribeToSystemTheme, getSystemPrefersDark, () => false)
  const hydrated = useHydrated()

  // undefined until hydrated, since "system" can't be resolved on the server; the inline document
  // script paints the right theme in the meantime.
  const resolved: ResolvedTheme | undefined = resolveAttribute(preferences.theme, { hydrated, systemPrefersDark })

  const setTheme = useCallback((key: ThemeKey) => setPreference("theme", key), [setPreference])

  return (
    <ThemeContext.Provider value={{ theme: preferences.theme, resolved, setTheme }}>{children}</ThemeContext.Provider>
  )
}

export declare namespace ThemeProvider {
  export type Props = { children: ReactNode }
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function resolveAttribute(
  theme: ThemeKey,
  { hydrated, systemPrefersDark }: { hydrated: boolean; systemPrefersDark: boolean }
): ResolvedTheme | undefined {
  if (theme !== "system") return theme
  if (!hydrated) return undefined
  return systemPrefersDark ? "dark" : "light"
}

function subscribeToSystemTheme(onChange: () => void) {
  const query = window.matchMedia(MEDIA)
  // An OS-level flip is the same swap as a click, and wants the same suppression.
  const handler = () => withoutTransitions(onChange)

  query.addEventListener("change", handler)
  return () => query.removeEventListener("change", handler)
}

function getSystemPrefersDark() {
  return window.matchMedia(MEDIA).matches
}
