import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { PreferencesProvider } from "@/preferences/provider"
import { ThemeProvider } from "@/theme/context/provider"

import { Appearance } from "./index"

const meta: Meta<typeof Appearance> = {
  title: "Layouts/Appearance",
  component: Appearance,
  decorators: [
    // Reads and writes theme + layout preferences through these providers; picking an option
    // swaps the document's `data-theme`, so the whole canvas follows.
    Story => (
      <PreferencesProvider>
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </PreferencesProvider>
    )
  ]
}

export default meta

/** The header's appearance popover: themes, accents, decoration toggles. */
export const Default: StoryObj = {
  render: () => (
    <div style={{ padding: "2rem", display: "flex", justifyContent: "flex-end" }}>
      <Appearance />
    </div>
  )
}
