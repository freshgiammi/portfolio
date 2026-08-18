import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useRef } from "react"

import { Button } from "@/components/primitives/button"

import { useConfetti } from "./index"

const meta = {
  title: "Effects/Confetti"
} satisfies Meta

export default meta

/** Hooks render nothing themselves; each story wires one to a button. */
function ConfettiHost({ spray }: { spray: "popper" | "cannon" }) {
  const box = useRef<HTMLDivElement>(null)
  const { burst } = useConfetti({ spray })

  return (
    <div style={{ padding: "3rem", display: "grid", justifyItems: "center", gap: "1rem" }}>
      <div
        style={{
          width: "8rem",
          height: "3rem",
          borderRadius: "0.5rem",
          border: "1px solid var(--border-subtle)",
          display: "grid",
          placeItems: "center",
          fontSize: "0.75rem"
        }}
        ref={box}>
        burst source
      </div>
      <Button size="small" onClick={() => burst(box.current)}>
        Fire {spray}
      </Button>
    </div>
  )
}

export const Popper: StoryObj = {
  render: () => <ConfettiHost spray="popper" />
}

export const Cannon: StoryObj = {
  render: () => <ConfettiHost spray="cannon" />
}
