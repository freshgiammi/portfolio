import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { faker } from "@/storybook/lib/fake"

import { PostRail } from "./index"

const meta: Meta<typeof PostRail> = {
  title: "Blog/PostRail",
  component: PostRail,
  // Server function defaults (stats, like/clap mutations) are seeded preview-wide; this story
  // needs nothing on top. Interactions really move the numbers through the mocks.
  decorators: [
    Story => (
      <div style={{ padding: "2rem" }}>
        <Story />
      </div>
    )
  ]
}

export default meta

export const Default: StoryObj<PostRail.Props> = {
  args: {
    title: faker.lorem.sentence({ min: 3, max: 6 }),
    slug: "storybook-demo-post"
  }
}
