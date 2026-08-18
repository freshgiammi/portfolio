import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { Button } from "@/components/primitives/button"
import { faker } from "@/storybook/lib/fake"

import { Tooltip } from "./index"

const meta: Meta<typeof Tooltip.Root> = {
  title: "Primitives/Tooltip",
  component: Tooltip.Root,
  subcomponents: {
    Provider: Tooltip.Provider,
    Trigger: Tooltip.Trigger,
    Portal: Tooltip.Portal,
    Positioner: Tooltip.Positioner,
    Popup: Tooltip.Popup,
    Arrow: Tooltip.Arrow
  },
  decorators: [
    // Tooltips portal to the body, so the provider has to wrap the story from outside.
    Story => (
      <Tooltip.Provider>
        <Story />
      </Tooltip.Provider>
    )
  ]
}

export default meta

function HoverTarget({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "4rem", display: "flex", justifyContent: "center" }}>{children}</div>
}

/** Hover or focus the button; the tooltip follows after a 150ms delay. */
export const Default: StoryObj = {
  render: () => (
    <Tooltip.Root>
      <HoverTarget>
        <Tooltip.Trigger render={<Button variant="secondary" />}>Hover me</Tooltip.Trigger>
      </HoverTarget>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>{faker.lorem.words(3)}</Tooltip.Popup>
          <Tooltip.Arrow />
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

/** Longer payloads wrap instead of stretching into one line. */
export const LongPayload: StoryObj = {
  render: () => (
    <Tooltip.Root>
      <HoverTarget>
        <Tooltip.Trigger render={<Button variant="secondary" />}>Keyboard shortcut</Tooltip.Trigger>
      </HoverTarget>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>{faker.lorem.sentence()}</Tooltip.Popup>
          <Tooltip.Arrow />
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
