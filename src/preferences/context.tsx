import { createContext, useContext } from "react"

import type { Preferences } from "@/preferences"

export type PreferencesContextValue = {
  preferences: Preferences
  setPreference: <Key extends keyof Preferences>(key: Key, value: Preferences[Key]) => void
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)

/** Everything the reader has decided, and the one way to change any of it. */
export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error("usePreferences must be used inside <PreferencesProvider>")
  return ctx
}

/** Whether the things kept back are open, and the way to open them. */
export function useUnlocked(): { unlocked: boolean; unlock: () => void } {
  const { preferences, setPreference } = usePreferences()
  return { unlocked: preferences.unlocked, unlock: () => setPreference("unlocked", true) }
}
