import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { Icon } from "@/components/primitives/icons"
import { Tag } from "@/components/primitives/tag"
import { faker } from "@/storybook/lib/fake"
import { formatDate } from "@/utils/date"

import { List } from "./index"

const meta = {
  title: "Primitives/List",
  component: List.Root,
  subcomponents: { Item: List.Item, MetaItem: List.MetaItem }
} satisfies Meta<typeof List.Root>

export default meta

function fakeFooter() {
  const iso = faker.date.recent({ days: 90 }).toISOString().slice(0, 10)
  return `${formatDate(iso)} · ${faker.number.int({ min: 2, max: 12 })} min read`
}

export const PlainRow: StoryObj<List.Item.Props> = {
  render: args => (
    <List.Root>
      <List.Item {...args} />
    </List.Root>
  ),
  args: {
    title: faker.lorem.sentence({ min: 3, max: 6 }),
    description: faker.lorem.sentence(),
    footer: fakeFooter()
  }
}

export const InteractiveRowsWithTags: StoryObj<List.Item.Props> = {
  render: () => (
    <List.Root>
      {[0, 1].map(i => (
        <List.Item
          key={i}
          render={<a href="#" />}
          interactive
          title={faker.lorem.sentence({ min: 3, max: 6 })}
          description={faker.lorem.sentence()}
          footer={fakeFooter()}>
          <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
            {faker.helpers
              .uniqueArray(() => faker.word.sample(), 2)
              .map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
          </div>
        </List.Item>
      ))}
    </List.Root>
  )
}

export const MetaItemRow: StoryObj<List.MetaItem.Props> = {
  render: args => (
    <List.Root>
      <List.Item
        title={faker.book.title()}
        description={faker.person.fullName()}
        footer={
          <>
            <List.MetaItem {...args} /> {faker.number.int({ min: 1, max: 12 })}
            <span> of</span> {faker.number.int({ min: 13, max: 30 })}
            <span> chapters</span>
          </>
        }
      />
    </List.Root>
  ),
  args: {
    children: (
      <>
        <Icon.BookOpen size={12} />
        <span> Reading</span>
      </>
    )
  }
}
