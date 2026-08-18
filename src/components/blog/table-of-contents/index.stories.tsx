import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { faker } from "@/storybook/lib/fake"
import type { MarkdownHeading } from "@/utils/markdown"

import { TableOfContents } from "./index"

const meta = {
  title: "Blog/TableOfContents",
  component: TableOfContents
} satisfies Meta<typeof TableOfContents>

export default meta

function fakeHeadings(count = 6): Array<MarkdownHeading> {
  const top = ["Why bother", "How it works", "Caveats", "Wrapping up"]
  return Array.from({ length: count }, (_, i) => ({
    id: `section-${i}`,
    // Mostly top-level sections, with the occasional subsection mixed in.
    level: i % 3 === 2 ? 3 : 2,
    text: i < top.length ? top[i]! : faker.lorem.words(3)
  }))
}

/** Sticky (as the blog post template holds it), beside a stand-in article whose ids feed the scroll-spy. */
export const InPage: StoryObj<TableOfContents.Props> = {
  render: args => (
    <div style={{ display: "grid", gridTemplateColumns: "14rem 1fr", gap: "2rem", padding: "1rem" }}>
      <div style={{ position: "sticky", top: "1rem", alignSelf: "start" }}>
        <TableOfContents {...args} />
      </div>
      <article>
        {args.headings.map(heading => (
          <section key={heading.id} style={{ marginBottom: "60vh" }}>
            <h2 id={heading.id} style={{ fontSize: heading.level === 2 ? "1.25rem" : "1rem" }}>
              {heading.text}
            </h2>
            <p>{faker.lorem.paragraph()}</p>
          </section>
        ))}
      </article>
    </div>
  ),
  args: {
    headings: fakeHeadings()
  }
}

/** Renders nothing when there is nothing to list. */
export const NoHeadings: StoryObj<TableOfContents.Props> = {
  args: {
    headings: []
  },
  render: args => <TableOfContents {...args} />
}
