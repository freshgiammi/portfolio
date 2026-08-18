import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { catImage } from "@/storybook/lib/fake"

import { Image } from "./index"

const meta = {
  title: "Primitives/Image",
  component: Image
} satisfies Meta<typeof Image>

export default meta

/** Watch it load over the network: skeleton while pending, picture once it lands. */
export const Loaded: StoryObj<Image.Props> = {
  args: {
    src: catImage(800, 500),
    alt: "A random cat",
    layout: "fill"
  },
  render: args => <Image {...args} style={{ width: "24rem", height: "15rem" }} />
}

/** A broken src falls to the placeholder without throwing or reflowing. */
export const Missing: StoryObj<Image.Props> = {
  args: {
    src: "https://cataas.com/cat?width=1&height=1&this-does-not-exist",
    alt: "Nothing behind this link"
  },
  render: args => <Image {...args} style={{ width: "24rem", height: "15rem" }} />
}

/** `src` omitted entirely: there is no image and that is a state, not an error. */
export const NoSource: StoryObj<Image.Props> = {
  args: {
    alt: "No image was provided"
  },
  render: args => <Image {...args} style={{ width: "24rem", height: "8rem" }} />
}
