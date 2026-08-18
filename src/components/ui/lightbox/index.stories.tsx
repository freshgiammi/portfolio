import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { Typography } from "@/components/primitives/typography"
import { catImage, faker } from "@/storybook/lib/fake"

import { Lightbox } from "./index"

const meta = {
  title: "UI/Lightbox",
  component: Lightbox
} satisfies Meta<typeof Lightbox>

export default meta

/** Click the thumbnail to open the dialog; the enlarged image fills the popup. */
export const ThumbnailTrigger: StoryObj<Lightbox.Props> = {
  args: {
    src: catImage(),
    alt: faker.lorem.words(3)
  },
  render: args => (
    <div style={{ maxWidth: "18rem" }}>
      <Lightbox {...args}>
        <img src={args.src} alt={args.alt} style={{ width: "100%", display: "block", borderRadius: "0.5rem" }} />
      </Lightbox>
      <Typography size="xx-small" family="mono" style={{ marginTop: "0.5rem" }}>
        click to zoom
      </Typography>
    </div>
  )
}
