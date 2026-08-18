import type { Meta, StoryObj } from "@storybook/tanstack-react"
import type { MDXComponents } from "mdx/types"

import { catImage, faker } from "@/storybook/lib/fake"

import { Mdx } from "./index"

const meta = {
  title: "Blog/Mdx",
  component: Mdx
} satisfies Meta<typeof Mdx>

export default meta

/** Hand-written MDXContent stand-in consuming the same components map compiled output does `Mdx` an already-compiled MDX component (content-collections + the vite mdx plugin); Storybook has no such compile step, so this fixture is a hand-written stand-in that consumes the same `components` map exactly the way compiled output does — which exercises the map's overrides: heading anchors, captioned figures, lightboxed images, callouts, scrolling code. */
function FakePost({ components = {} }: { components?: MDXComponents }) {
  const H2 = (components.h2 ?? "h2") as (props: { id?: string; children?: React.ReactNode }) => React.ReactElement
  const Img = (components.img ?? "img") as (props: {
    src?: string
    alt?: string
    title?: string
    loading?: string
    layout?: string
  }) => React.ReactElement | null
  const A = (components.a ?? "a") as (props: { href?: string; children?: React.ReactNode }) => React.ReactElement
  const Blockquote = (components.blockquote ?? "blockquote") as (props: {
    "data-callout"?: string
    children?: React.ReactNode
  }) => React.ReactElement
  const Pre = (components.pre ?? "pre") as (props: {
    className?: string
    children?: React.ReactNode
  }) => React.ReactElement

  return (
    <>
      <p>
        Opening prose with an <A href="https://example.com">{faker.lorem.words(2)}</A> and a jump link,{" "}
        <A href="#anchors">to the anchors section</A>.
      </p>

      <H2 id="images">Images</H2>
      <p>
        <Img src={catImage(1200, 700)} alt={faker.lorem.words(3)} title={faker.lorem.sentence()} />
      </p>
      <p>
        <Img src={catImage(640, 400)} alt={faker.lorem.words(2)} data-static />
      </p>

      <H2 id="callouts">Callouts</H2>
      <Blockquote data-callout="tip">A tip rendered through the Alert component.</Blockquote>

      <H2 id="code">Code</H2>
      <Pre className="shiki">
        <code>{`const stories = await Promise.all(components.map(story))`}</code>
      </Pre>

      <H2 id="anchors">Anchors</H2>
      <p>{faker.lorem.paragraph()}</p>
    </>
  )
}

export const Article: StoryObj<Mdx.Props> = {
  render: () => (
    // The blog route's column provides this measure; the component itself runs full width.
    <div style={{ maxWidth: "40rem", padding: "1rem" }}>
      <Mdx component={FakePost} />
    </div>
  )
}
