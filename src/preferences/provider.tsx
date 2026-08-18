import { type ReactNode, useCallback, useState } from "react"

import { COOKIES, DEFAULT_PREFERENCES, type Preferences, toggleValue } from "@/preferences"
import { PreferencesContext } from "@/preferences/context"
import { resolveTheme, type ThemeKey } from "@/theme"
import { withoutTransitions } from "@/utils/transitions"

type PreferencesProviderProps = {
  children: ReactNode
  initialPreferences?: Preferences
}

export function PreferencesProvider({ children, initialPreferences = DEFAULT_PREFERENCES }: PreferencesProviderProps) {
  // Seeded from the cookies the root route loader reads, so the first render already matches
  // the reader's real preferences and needs no post-mount correction or flash.
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences)

  // Cookie first, then attribute, so the document script's observer never races this to an answer.
  const setPreference = useCallback(<Key extends keyof Preferences>(key: Key, value: Preferences[Key]) => {
    const attribute: string = typeof value === "boolean" ? toggleValue(value) : value

    document.cookie = `${COOKIES[key]}=${attribute}; path=/; max-age=31536000; SameSite=Lax`

    withoutTransitions(() => {
      setPreferences(previous => ({ ...previous, [key]: value }))
      // The theme is the one preference whose attribute is not what was chosen: "system" is a
      // question, and `data-theme` only ever carries the answer.
      document.documentElement.setAttribute(
        `data-${key}`,
        key === "theme" ? resolveTheme(value as ThemeKey) : attribute
      )
    })
  }, [])

  return <PreferencesContext.Provider value={{ preferences, setPreference }}>{children}</PreferencesContext.Provider>
}

export declare namespace PreferencesProvider {
  export type Props = PreferencesProviderProps
}
