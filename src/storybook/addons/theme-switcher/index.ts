import { createElement } from "react"
import { IconButton } from "storybook/internal/components"
import { useGlobals } from "storybook/manager-api"

const OPTIONS = ["light", "dark", "system"] as const

/** The toolbar button: cycles the `theme` global through light / dark / system. */
export function ThemeTool() {
  const [globals, setGlobals] = useGlobals()
  const current = (globals as { theme?: "light" | "dark" } | undefined)?.theme ?? "system"

  // createElement rather than JSX: the manager bundle compiles JSX with the classic transform,
  // which would need a `React` import in scope.
  return createElement(
    IconButton,
    {
      key: "theme-switcher",
      title: "Site theme: cycles light / dark / system",
      onClick: () => {
        const next = OPTIONS[(OPTIONS.indexOf(current) + 1) % OPTIONS.length]
        // "system" is stored as undefined: no attribute on <html>, so the document follows the OS.
        setGlobals({
          theme: next === "system" ? undefined : next
        })
      }
    },
    `Theme: ${current}`
  )
}
