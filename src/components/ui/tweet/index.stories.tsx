import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { mocked } from "storybook/test"

import { getCachedTweet } from "@/server/tweet"
import { faker } from "@/storybook/lib/fake"

import { Tweet } from "./index"

const meta: Meta<typeof Tweet> = {
  title: "UI/Tweet",
  component: Tweet
} satisfies Meta<typeof Tweet>

export default meta

export const Loaded: StoryObj<Tweet.Props> = {
  args: {
    id: faker.string.numeric(18)
  },
  render: args => (
    <div style={{ maxWidth: "26rem" }}>
      <Tweet {...args} />
    </div>
  )
}

/** A deleted or protected tweet renders an unavailable card rather than an error. */
export const Unavailable: StoryObj<Tweet.Props> = {
  // The preview seeds a loaded tweet for every id; "0" opts out of that.
  beforeEach: () => {
    mocked(getCachedTweet).mockResolvedValue(null)
  },
  args: {
    id: "0"
  },
  render: Loaded.render
}
