import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/primitives/button"
import { faker } from "@/storybook/lib/fake"

import { CountRoll } from "./index"

const meta = {
  title: "Effects/CountRoll",
  component: CountRoll
} satisfies Meta<typeof CountRoll>

export default meta

/** Click to nudge the value; only the columns that changed roll. */
export const Rolling: StoryObj<CountRoll.Props> = {
  args: {
    value: faker.number.int({ min: 100, max: 999 })
  },
  render: args => <RollingHost initialValue={args.value} />
}

function RollingHost({ initialValue }: { initialValue: number }) {
  const [value, setValue] = useState(initialValue)

  return (
    <div style={{ padding: "3rem", display: "grid", justifyItems: "center", gap: "1.5rem" }}>
      <CountRoll value={value} />
      <Button size="small" onClick={() => setValue(current => current + faker.number.int({ min: 1, max: 25 }))}>
        +n
      </Button>
    </div>
  )
}

/** Digit-count changes (9 → 10) roll without losing the outgoing column. */
export const AcrossMagnitude: StoryObj<CountRoll.Props> = {
  render: () => <MagnitudeHost />
}

function MagnitudeHost() {
  const [value, setValue] = useState(9)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setValue(current => {
        const next = current + direction * 1
        if (next >= 12 || next <= 8) setDirection(d => -d)
        return next
      })
    }, 1200)
    return () => clearInterval(timer)
  }, [direction])

  return (
    <div style={{ padding: "3rem", display: "grid", justifyItems: "center" }}>
      <CountRoll value={value} />
    </div>
  )
}
