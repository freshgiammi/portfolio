import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { faker } from "@/storybook/lib/fake"

import { Alert } from "./index"

const meta = {
  title: "Blog/Alert",
  component: Alert
} satisfies Meta<typeof Alert>

export default meta

const KINDS = ["note", "tip", "important", "warning", "caution"] as const

/** One story per kind, so the tone colours sit side by side. */
export const AllKinds: StoryObj = {
  render: () => (
    <div style={{ maxWidth: "34rem", display: "grid", gap: "1rem" }}>
      {KINDS.map(kind => (
        <Alert key={kind} type={kind}>
          <p>{faker.lorem.sentence()}</p>
        </Alert>
      ))}
    </div>
  )
}

export const WithRichBody: StoryObj<Alert.Props> = {
  args: {
    type: "tip",
    children: (
      <p>
        Body content is whatever falls inside — {faker.lorem.words(3)}, <code>inline code</code>, <a href="#">a link</a>
        .
      </p>
    )
  },
  render: args => (
    <div style={{ maxWidth: "34rem" }}>
      <Alert {...args} />
    </div>
  )
}
