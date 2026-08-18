import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { NotFound } from "./index"

const meta = {
  title: "Layouts/NotFound",
  component: NotFound
} satisfies Meta<typeof NotFound>

export default meta

export const Default: StoryObj<NotFound.Props> = {}
