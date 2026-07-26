import { useHydrated } from "@tanstack/react-router"
import { type ReactNode, useCallback, useState, useSyncExternalStore } from "react"

import { DEFAULT_THEME, type ResolvedTheme, resolveTheme, THEME_COOKIE, type ThemeKey } from "@/theme"
import { ThemeContext } from "@/theme/context/context"

const MEDIA = "(prefers-color-scheme: dark)"

/**
 * Tokens live behind `[data-theme]`, and plenty of elements transition colour, so swapping the
 * attribute would otherwise cross-fade the whole page one property at a time.
 *
 * `0ms` rather than `none`, on purpose: a zero-length transition still completes and still fires
 * `transitionend`, which Base UI waits on to finish closing a popup. Removing the property outright
 * means that event never arrives, and a menu open during the swap can be left stuck mid-animation.
 */
const SUPPRESS_TRANSITIONS = `[data-theme], [data-theme] * { transition: 0ms !important; }`

type ThemeProviderProps = {
  children: ReactNode
  initialTheme?: ThemeKey
}

/** Suppressed for exactly one painted frame: long enough to cover the swap, short enough to be invisible. */
function withoutTransitions(swap: () => void) {
  const style = document.createElement("style")
  style.textContent = SUPPRESS_TRANSITIONS
  document.head.appendChild(style)

  swap()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => style.remove())
  })
}

export function ThemeProvider({ children, initialTheme = DEFAULT_THEME }: ThemeProviderProps) {
  // Seeded from the cookie the root route loader reads, so the first render already matches
  // the user's real preference and needs no post-mount correction or flash.
  const [theme, setThemeState] = useState<ThemeKey>(initialTheme)

  const systemPrefersDark = useSyncExternalStore(subscribeToSystemTheme, getSystemPrefersDark, () => false)
  const hydrated = useHydrated()

  /**
   * What `data-theme` should be, or `undefined` while the answer is unknowable.
   *
   * "system" cannot be resolved on the server, so the attribute is left off the server-rendered html
   * and the inline script in the document head paints the right theme before hydration. Once
   * hydrated this always holds a concrete value, which is what makes the attribute survive a remount.
   */
  const resolved: ResolvedTheme | undefined = resolveAttribute(theme, { hydrated, systemPrefersDark })

  const setTheme = useCallback((key: ThemeKey) => {
    // The cookie first: it is what the document-level script resolves from, so the attribute write
    // below and anything the script's observer does afterwards agree on the answer.
    document.cookie = `${THEME_COOKIE}=${key}; path=/; max-age=31536000; SameSite=Lax`

    withoutTransitions(() => {
      setThemeState(key)
      document.documentElement.setAttribute("data-theme", resolveTheme(key))
    })
  }, [])

  return <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>
}

export declare namespace ThemeProvider {
  export type Props = ThemeProviderProps
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
