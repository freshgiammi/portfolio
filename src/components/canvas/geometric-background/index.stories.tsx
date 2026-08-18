import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { GeometricBackground } from "./index"

const meta = {
  title: "Canvas/GeometricBackground",
  component: GeometricBackground
} satisfies Meta<typeof GeometricBackground>

export default meta

/** A full-box canvas of drifting shapes; sits behind the page in the app. */
export const BehindContent: StoryObj = {
  render: () => (
    // `absolute` positioning inside a relative box, since the component itself only draws.
    <div style={{ position: "relative", height: "24rem", overflow: "hidden", borderRadius: "0.5rem" }}>
      <GeometricBackground />
      <p style={{ position: "relative", padding: "2rem", textAlign: "center" }}>Page content floats above.</p>
    </div>
  )
}
