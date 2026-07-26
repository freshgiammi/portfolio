import { useRender } from "@base-ui/react"

import type { ResolvedTheme } from "@/theme"
import { ThemeScopeContext } from "@/theme/context/context"

type ThemeScopeProps = {
  /** The theme this subtree renders in, whatever the document is set to. */
  theme: ResolvedTheme
  children?: React.ReactNode
  /** Renders as another element, for when the scope needs to be the element that carries layout. */
  render?: useRender.ComponentProps<"div">["render"]
  className?: string
}

/**
 * Renders a subtree in a fixed theme.
 *
 * Every colour token is declared behind `[data-theme]` rather than on `:root`, so the attribute is
 * all this needs: the block re-declares the whole set on this node and the subtree inherits it. The
 * default element is `display: contents`, so a scope adds no box unless `render` gives it one.
 *
 * Portalled descendants leave this subtree in the DOM, so they read the theme from context instead:
 * see `useScopedTheme`, which every portalled part here already spreads.
 */
export function ThemeScope({ theme, children, render, className }: ThemeScopeProps) {
  const element = useRender({
    render: render ?? <div style={{ display: "contents" }} />,
    props: { "data-theme": theme, className, children }
  })

  return <ThemeScopeContext.Provider value={theme}>{element}</ThemeScopeContext.Provider>
}

export declare namespace ThemeScope {
  export type Props = ThemeScopeProps
}
