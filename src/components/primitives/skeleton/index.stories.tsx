import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/primitives/button"
import { Typography } from "@/components/primitives/typography"

import { Skeleton } from "./index"

const meta = {
  title: "Primitives/Skeleton",
  component: Skeleton
} satisfies Meta<typeof Skeleton>

export default meta

/** Reveals after a moment; the toggle replays the sweep. */
export const OverText: StoryObj<Skeleton.Props> = {
  render: () => <SweepHost />
}

function SweepHost() {
  const [loading, setLoading] = useState(true)

  // Flip back automatically so the sweep can be replayed without a page reload.
  useEffect(() => {
    if (!loading) return undefined
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [loading])

  return (
    <div style={{ maxWidth: "24rem", display: "grid", gap: "0.75rem" }}>
      <Skeleton isLoading={loading}>
        <Typography size="small">Loading text keeps its exact shape under the sweep.</Typography>
      </Skeleton>
      <Skeleton isLoading={loading}>
        <Typography size="small">A second line animates in step with the first.</Typography>
      </Skeleton>
      <Button size="small" onClick={() => setLoading(current => !current)}>
        {loading ? "Reveal now" : "Sweep again"}
      </Button>
    </div>
  )
}

export const Revealed: StoryObj<Skeleton.Props> = {
  args: {
    isLoading: false
  },
  render: args => (
    <div style={{ maxWidth: "24rem" }}>
      <Skeleton {...args}>
        <Typography size="small">The real content, once it has loaded.</Typography>
      </Skeleton>
    </div>
  )
}
