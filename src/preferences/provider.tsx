import { type ReactNode, useCallback, useState } from "react"

import { COOKIES, DEFAULT_PREFERENCES, type Preferences, toggleValue } from "@/preferences"
import { PreferencesContext } from "@/preferences/context"
import { resolveTheme } from "@/theme"
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
  const setPreference = useCallback((patch: Partial<Preferences>) => {
    const entries = Object.entries(patch) as Array<[keyof Preferences, Preferences[keyof Preferences]]>
    if (entries.length === 0) return
    for (const [key, value] of entries) {
      const attribute: string = typeof value === "boolean" ? toggleValue(value) : value
      document.cookie = `${COOKIES[key]}=${attribute}; path=/; max-age=31536000; SameSite=Lax`
    }
    withoutTransitions(() => {
      setPreferences(previous => ({ ...previous, ...patch }))
      if (patch.theme !== undefined) {
        document.documentElement.setAttribute("data-theme", resolveTheme(patch.theme))
      }
      for (const [key, value] of entries) {
        if (key === "theme") continue
        const attribute: string = typeof value === "boolean" ? toggleValue(value) : value
        document.documentElement.setAttribute(`data-${key}`, attribute)
      }
    })
  }, [])

  return (
    <PreferencesContext.Provider value={{ preferences, setPreference }}>{children}</PreferencesContext.Provider>
  )
}

export declare namespace PreferencesProvider {
  export type Props = PreferencesProviderProps
}
