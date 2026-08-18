import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useState } from "react"

import { catImage, faker } from "@/storybook/lib/fake"

import type { PolaroidStack } from "./index"
import { PolaroidStack as PolaroidStackComponent } from "./index"

const meta = {
  title: "UI/PolaroidStack",
  component: PolaroidStackComponent
} satisfies Meta<typeof PolaroidStackComponent>

export default meta

function fakePhotos(count = 4): Array<PolaroidStack.Photo> {
  return Array.from({ length: count }, () => ({
    src: catImage(600, 600),
    caption: faker.lorem.sentence({ min: 3, max: 6 })
  }))
}

/** Drag the top card (or arrow keys) to send it back; click opens the gallery lightbox. */
function StackHost({ count = 4, initialTopIndex = 0 }: { count?: number; initialTopIndex?: number }) {
  const [photos] = useState(() => fakePhotos(count))

  return (
    // Same constraint the showcase route applies (`width: min(24rem, 100%)`); without it the
    // stack stretches edge to edge on the story canvas.
    <div style={{ width: "min(24rem, 100%)", margin: "0 auto", padding: "2rem 0" }}>
      <PolaroidStackComponent photos={photos} initialTopIndex={initialTopIndex} />
    </div>
  )
}

export const Stack: StoryObj<PolaroidStack.Props> = {
  render: () => <StackHost />
}

export const StartsFromSecondPhoto: StoryObj<PolaroidStack.Props> = {
  render: () => <StackHost initialTopIndex={1} />
}
