import "@fontsource/inter/400.css"
import "@fontsource/inter/600.css"
import "@fontsource/instrument-serif/400.css"

import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { faker } from "@/storybook/lib/fake"

import { OGCard } from "./index"

const SECTIONS = ["Writing", "Craft", "About", "Thoughts", "Finds", "Work"]
const EMOJIS = ["✍️", "🧵", "✨", "📓", "🔍"]

function fakeTitle() {
  const words = faker.lorem.words({ min: 4, max: 8 })
  return words.charAt(0).toUpperCase() + words.slice(1)
}

// Every card carries both a title and a description, so no story previews a state the real
// pipeline never emits.
function fakeContent() {
  return {
    emoji: faker.helpers.arrayElement(EMOJIS),
    section: faker.helpers.arrayElement(SECTIONS),
    title: fakeTitle(),
    description: faker.lorem.sentences({ min: 2, max: 3 })
  }
}

const meta = {
  title: "UI/OGCard",
  component: OGCard,
  decorators: [
    Story => (
      <div style={{ overflow: "hidden", width: 600, height: 315 }}>
        <div style={{ transform: "scale(0.5)", transformOrigin: "top left" }}>
          <Story />
        </div>
      </div>
    )
  ]
} satisfies Meta<typeof OGCard>

export default meta

export const Post: StoryObj<typeof OGCard> = {
  args: { variant: "post", ...fakeContent() }
}

export const Craft: StoryObj<typeof OGCard> = {
  args: { variant: "craft", ...fakeContent() }
}

export const Default: StoryObj<typeof OGCard> = {
  args: { variant: "default", ...fakeContent() }
}

export const TruncatedDescription: StoryObj<typeof OGCard> = {
  args: {
    variant: "craft",
    title: fakeTitle(),
    description: `${faker.lorem.sentences(4)} ${faker.lorem.sentences(3)}`
  }
}
