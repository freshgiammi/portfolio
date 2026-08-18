import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useRef } from "react"

import { Button } from "@/components/primitives/button"

import { useParticles } from "./index"

const meta = {
  title: "Effects/Particles"
} satisfies Meta

export default meta

/** Same wiring ReactionButton uses: ref on a positioned wrapper, emit throws from there. */
function ParticlesHost() {
  const { ref, emit } = useParticles()
  const taps = useRef(0)

  return (
    <div style={{ padding: "3rem", display: "grid", justifyItems: "center", gap: "1rem" }}>
      <span style={{ position: "relative", display: "inline-block" }} ref={ref}>
        <Button
          onClick={() => {
            taps.current += 1
            emit(`+${taps.current}`)
          }}>
          tap me
        </Button>
      </span>
    </div>
  )
}

export const FromAButton: StoryObj = {
  render: () => <ParticlesHost />
}
