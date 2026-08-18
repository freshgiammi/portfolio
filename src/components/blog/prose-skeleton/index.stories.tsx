import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { ProseSkeleton } from "./index"

const meta = {
  title: "Blog/ProseSkeleton",
  component: ProseSkeleton
} satisfies Meta<typeof ProseSkeleton>

export default meta

/** The placeholder shown while an MDX chunk streams in; lines animate in step. */
export const Loading: StoryObj = {
  render: () => (
    <div style={{ maxWidth: "36rem" }}>
      <ProseSkeleton />
    </div>
  )
}
