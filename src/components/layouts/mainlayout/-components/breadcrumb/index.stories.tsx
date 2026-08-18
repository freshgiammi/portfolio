import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { Breadcrumb } from "./index"

const meta = {
  title: "Layouts/Breadcrumb",
  component: Breadcrumb
} satisfies Meta<typeof Breadcrumb>

export default meta

/** Memory-history router knows only "/", so the trail is just "Home". */
export const HomeOnly: StoryObj = {
  render: () => <Breadcrumb />
}
