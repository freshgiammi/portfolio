import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useState } from "react"

import { Icon } from "@/components/primitives/icons"
import { faker } from "@/storybook/lib/fake"

import { Tab } from "./index"

const meta = {
  title: "Primitives/Tab",
  component: Tab.Root,
  subcomponents: { List: Tab.List, Item: Tab.Item, Indicator: Tab.Indicator, Panel: Tab.Panel }
} satisfies Meta<typeof Tab.Root>

export default meta

const TABS = ["posts", "thoughts", "finds"] as const

type TabKey = (typeof TABS)[number]

/** Controlled (`value` + `onValueChange` are required), so the story owns the state. */
export const Switcher: StoryObj = {
  render: () => <SwitcherHost />
}

function SwitcherHost() {
  const [value, setValue] = useState<TabKey>("posts")

  return (
    <Tab.Root value={value} onValueChange={setValue}>
      <Tab.List label="Content type">
        {TABS.map((tab, index) => (
          <Tab.Item key={tab} value={tab} icon={index === 0 ? <Icon.ArticleIcon size={13} /> : undefined}>
            {tab}
          </Tab.Item>
        ))}
        <Tab.Indicator />
      </Tab.List>

      {TABS.map(tab => (
        <Tab.Panel key={tab} value={tab}>
          <p style={{ padding: "1rem 0", maxWidth: "32rem" }}>
            {tab === "posts" ? faker.lorem.paragraphs(2) : faker.lorem.paragraph()}
          </p>
        </Tab.Panel>
      ))}
    </Tab.Root>
  )
}
