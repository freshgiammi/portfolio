import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { faker } from "@/storybook/lib/fake"

import { Page } from "./index"

const meta = {
  title: "Primitives/Page",
  component: Page.Root,
  subcomponents: { Header: Page.Header, Content: Page.Content }
} satisfies Meta<typeof Page.Root>

export default meta

/** The standard index page shape: header, then content on the root's rhythm. */
export const IndexPage: StoryObj<Page.Header.Props> = {
  render: args => (
    <Page.Root>
      <Page.Header {...args} />
      <Page.Content>
        <p style={{ color: "var(--text-subtle)" }}>{faker.lorem.paragraph()}</p>
        <p style={{ color: "var(--text-subtle)" }}>{faker.lorem.paragraph()}</p>
      </Page.Content>
    </Page.Root>
  ),
  args: {
    emoji: "✍️",
    title: "Blog",
    subtitle: faker.lorem.sentence()
  }
}

/** A quiet cross-link line under the subtitle, as blog and thoughts carry one. */
export const WithAside: StoryObj<Page.Header.Props> = {
  render: args => (
    <Page.Root>
      <Page.Header {...args} />
    </Page.Root>
  ),
  args: {
    emoji: "💭",
    title: "Thoughts",
    subtitle: faker.lorem.sentence(),
    aside: (
      <span>
        Longer things live in the <a href="#">blog</a>.
      </span>
    )
  }
}

/** Right-hand controls share the header row with the intro, wrapping under it when tight. */
export const WithTrailing: StoryObj<Page.Header.Props> = {
  render: args => (
    <Page.Root gap="2xl">
      <Page.Header {...args} />
      <Page.Content>
        <p style={{ color: "var(--text-subtle)" }}>{faker.lorem.paragraph()}</p>
      </Page.Content>
    </Page.Root>
  ),
  args: {
    emoji: "🔖",
    title: "Finds",
    subtitle: faker.lorem.sentence(),
    trailing: (
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.5rem",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)"
        }}>
        Grid / Sections
      </div>
    )
  }
}

/** `width="narrow"` caps the measure for single-column pages like work. */
export const NarrowPage: StoryObj = {
  render: () => (
    <Page.Root width="narrow">
      <Page.Header emoji="💼" title="Work" subtitle={faker.lorem.sentence()} />
      <Page.Content>
        <p style={{ color: "var(--text-subtle)" }}>{faker.lorem.paragraph()}</p>
      </Page.Content>
    </Page.Root>
  )
}

/** A page with nothing to list yet keeps the quiet line inside its content. */
export const Empty: StoryObj = {
  render: () => (
    <Page.Root>
      <Page.Header emoji="✨" title="Craft" subtitle={faker.lorem.sentence()} />
      <Page.Content>
        <p style={{ color: "var(--text-subtle)" }}>Nothing here yet, check back soon!</p>
      </Page.Content>
    </Page.Root>
  )
}
