import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useState } from "react"

import { Button } from "@/components/primitives/button"
import { catImage, faker } from "@/storybook/lib/fake"

import type { GalleryLightbox } from "./index"
import { GalleryLightbox as GalleryLightboxComponent } from "./index"

const meta = {
  title: "UI/GalleryLightbox",
  component: GalleryLightboxComponent
} satisfies Meta<typeof GalleryLightboxComponent>

export default meta

function fakeImages(count = 3): Array<GalleryLightbox.Image> {
  return Array.from({ length: count }, () => ({
    src: catImage(1200, 800),
    alt: faker.lorem.words(2),
    description: faker.lorem.sentence()
  }))
}

/** Images generated once per mount, so open/close doesn't reshuffle the gallery. */
function Host({
  count = 3,
  initialOpen = false,
  initialIndex = 0
}: {
  count?: number
  initialOpen?: boolean
  initialIndex?: number
}) {
  const [images] = useState(() => fakeImages(count))
  const [open, setOpen] = useState(initialOpen)

  return (
    <div style={{ padding: "2rem" }}>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open gallery ({images.length} image{images.length === 1 ? "" : "s"})
      </Button>
      <GalleryLightboxComponent open={open} onOpenChange={setOpen} images={images} initialIndex={initialIndex} />
    </div>
  )
}

export const MultiImage: StoryObj = {
  render: () => <Host />
}

export const StartsMidGallery: StoryObj = {
  render: () => <Host initialOpen initialIndex={1} />
}

export const SingleImage: StoryObj = {
  render: () => <Host count={1} />
}
