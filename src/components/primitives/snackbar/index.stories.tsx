import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { Button } from "@/components/primitives/button"
import { faker } from "@/storybook/lib/fake"

import { Snackbar, snackbar } from "./index"

const meta = {
  title: "Primitives/Snackbar",
  component: Snackbar.Provider,
  subcomponents: { Viewport: Snackbar.Viewport }
} satisfies Meta<typeof Snackbar.Viewport>

export default meta

/** Buttons raise snackbars via the plain snackbar() function; the viewport renders them. */
export const RaiseOne: StoryObj = {
  render: () => (
    <Snackbar.Provider>
      <div style={{ padding: "2rem", display: "grid", gap: "0.75rem", justifyItems: "start" }}>
        <Button
          onClick={() =>
            snackbar({
              title: faker.lorem.words(2),
              description: faker.lorem.sentence()
            })
          }>
          Raise snackbar
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            snackbar({
              title: "Saved",
              description: "Faster timeout on this one.",
              timeout: 2000
            })
          }>
          Raise short one
        </Button>
      </div>
      <Snackbar.Viewport />
    </Snackbar.Provider>
  )
}
