import type { Meta, StoryObj } from "@storybook/tanstack-react"

import type { Find, FindTag } from "@/data/finds"
import { catImage, faker } from "@/storybook/lib/fake"

import { FindTile } from "./index"

const meta = {
  title: "UI/FindTile",
  component: FindTile
} satisfies Meta<typeof FindTile>

export default meta

function fakeFind(tag?: FindTag): Find {
  return {
    id: faker.string.uuid(),
    title: faker.company.catchPhrase(),
    description: faker.lorem.sentence(),
    url: faker.internet.url(),
    tag: tag ?? faker.helpers.arrayElement(["library", "tool", "app", "design", "website"] as const),
    // A plain string overrides the build-time og:image resolution (see the Find type).
    image: catImage(640, 360)
  }
}

/** Hover to reveal the caption; on touch it reveals in view. */
export const Single: StoryObj<FindTile.Props> = {
  args: {
    find: fakeFind("tool")
  },
  render: args => (
    <div style={{ width: "22rem" }}>
      <FindTile {...args} />
    </div>
  )
}

export const Grid: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 20rem)", gap: "1rem", padding: "1rem" }}>
      {[0, 1, 2, 3].map(i => (
        <FindTile key={i} find={fakeFind()} />
      ))}
    </div>
  )
}
