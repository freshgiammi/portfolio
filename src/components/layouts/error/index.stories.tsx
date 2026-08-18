import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { ErrorPage } from "./index"

const meta = {
  title: "Layouts/ErrorPage",
  component: ErrorPage
} satisfies Meta<typeof ErrorPage>

export default meta

/** The dev-only message line appears because Storybook runs with `NODE_ENV=development`. */
export const Default: StoryObj<ErrorPage.Props> = {
  args: {
    error: new TypeError("Cannot read properties of undefined (reading 'map')"),
    reset: () => {}
  }
}

/** Click "Try again" to watch `reset` fire. */
export const WithResetAction: StoryObj<ErrorPage.Props> = {
  args: {
    error: new Error("Something exploded on the server"),
    reset: () => location.reload()
  }
}
