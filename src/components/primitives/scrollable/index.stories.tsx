import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { faker } from "@/storybook/lib/fake"
import { formatDate } from "@/utils/date"

import { Scrollable } from "./index"

const meta = {
  title: "Primitives/Scrollable",
  component: Scrollable
} satisfies Meta<typeof Scrollable>

export default meta

function fakeLogLines(count = 30) {
  return Array.from({ length: count }, () => ({
    at: faker.date.recent({ days: 2 }).toISOString(),
    line: faker.hacker.phrase()
  }))
}

const LINES = fakeLogLines()

/** Vertical, opening anchored to the end like a log whose newest entry is its last. */
export const Log: StoryObj<Scrollable.Props> = {
  render: args => (
    <div style={{ maxWidth: "26rem", padding: "1rem" }}>
      <Scrollable {...args} maxHeight={240}>
        <ul style={{ display: "grid", gap: "0.375rem" }}>
          {[...LINES].reverse().map(entry => (
            <li key={entry.at + entry.line} style={{ fontSize: "0.75rem", opacity: 0.8 }}>
              <time dateTime={entry.at}>{formatDate(entry.at)}</time> — {entry.line}
            </li>
          ))}
        </ul>
      </Scrollable>
    </div>
  ),
  args: {
    initialScroll: { y: "end" }
  }
}

/** Horizontal rail with edge fades; scroll it sideways. */
export const Rail: StoryObj<Scrollable.Props> = {
  render: args => (
    <Scrollable {...args} maxWidth={480}>
      <div style={{ display: "flex", gap: "0.75rem", padding: "1rem", width: "max-content" }}>
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            style={{
              width: "6rem",
              height: "4rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border-subtle)",
              display: "grid",
              placeItems: "center",
              fontSize: "0.75rem",
              opacity: 0.7
            }}>
            card {i + 1}
          </span>
        ))}
      </div>
    </Scrollable>
  )
}
