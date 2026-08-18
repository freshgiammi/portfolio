import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { Icon } from "@/components/primitives/icons"
import { faker } from "@/storybook/lib/fake"

import { Tag } from "./index"

const meta = {
  title: "Primitives/Tag",
  component: Tag
} satisfies Meta<typeof Tag>

export default meta

export const Single: StoryObj<Tag.Props> = {
  args: {
    children: faker.word.sample()
  }
}

const TONES = ["info", "success", "important", "warning", "danger"] as const

export const Tones: StoryObj<Tag.Props> = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {TONES.map(tone => (
        <Tag key={tone} tone={tone}>
          {tone}
        </Tag>
      ))}
    </div>
  )
}

export const WithIcon: StoryObj<Tag.Props> = {
  args: {
    children: faker.word.sample(),
    icon: <Icon.TagIcon size={10} weight="bold" />,
    tone: "info"
  }
}

export const Sizes: StoryObj<Tag.Props> = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Tag>small</Tag>
      <Tag size="medium">medium</Tag>
      <Tag size="large" icon={<Icon.TagIcon size={14} weight="bold" />}>
        large
      </Tag>
    </div>
  )
}
