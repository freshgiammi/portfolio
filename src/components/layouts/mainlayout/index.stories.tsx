import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { PreferencesProvider } from "@/preferences/provider"
import { ThemeProvider } from "@/theme/context/provider"

import { MainLayout } from "./index"

const meta: Meta<typeof MainLayout> = {
  title: "Layouts/MainLayout",
  component: MainLayout,
  decorators: [
    // The header reads theme and layout preferences through these providers.
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

/** Memory-history router knows only "/", so the breadcrumb reads "Home". */
export const Default: StoryObj = {
  render: () => (
    <MainLayout>
      <div style={{ padding: "2rem" }}>Page content goes here.</div>
    </MainLayout>
  )
}
