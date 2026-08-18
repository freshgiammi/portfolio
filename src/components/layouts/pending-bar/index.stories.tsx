import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { PendingBar } from "./index"

const meta = {
  title: "Layouts/PendingBar",
  component: PendingBar
} satisfies Meta<typeof PendingBar>

export default meta

/** The route-wide loading fallback; a slim indeterminate bar, always in motion. */
export const Default: StoryObj = {
  render: () => (
    <div style={{ maxWidth: "40rem" }}>
      <PendingBar />
    </div>
  )
}
