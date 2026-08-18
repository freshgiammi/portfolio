import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { Button } from "@/components/primitives/button"
import { Typography } from "@/components/primitives/typography"
import { faker } from "@/storybook/lib/fake"

import { Popover } from "./index"

const meta: Meta<typeof Popover.Root> = {
  title: "Primitives/Popover",
  component: Popover.Root,
  subcomponents: {
    Trigger: Popover.Trigger,
    Portal: Popover.Portal,
    Positioner: Popover.Positioner,
    Popup: Popover.Popup
  }
}

export default meta

function Trigger() {
  return <Popover.Trigger render={<Button variant="secondary" />}>Open popover</Popover.Trigger>
}

export const Default: StoryObj = {
  render: () => (
    <div style={{ padding: "6rem", display: "flex", justifyContent: "center" }}>
      <Popover.Root>
        <Trigger />
        <Popover.Portal>
          <Popover.Positioner align="start">
            <Popover.Popup>
              <Typography size="x-small" render={<p />} style={{ maxWidth: "16rem" }}>
                {faker.lorem.paragraph()}
              </Typography>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
