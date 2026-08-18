import type { Meta, StoryObj } from "@storybook/tanstack-react"

import type { TypographyAttributesProps } from "@/utils/typography"

import { Typography } from "./typography"

const meta = {
  title: "Primitives/Typography",
  component: Typography
} satisfies Meta<typeof Typography>

export default meta

const SIZES: Array<NonNullable<TypographyAttributesProps["size"]>> = [
  "xx-large",
  "x-large",
  "large",
  "medium",
  "small",
  "x-small",
  "xx-small",
  "xxx-small"
]

const WEIGHTS: Array<NonNullable<TypographyAttributesProps["weight"]>> = [
  "light",
  "regular",
  "medium",
  "semibold",
  "bold"
]

/** The full size ramp, so the relative scale is visible in one glance. */
export const Sizes: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {SIZES.map(size => (
        <Typography key={size} size={size}>
          {size} — The quick brown fox
        </Typography>
      ))}
    </div>
  )
}

/** Every weight at a readable body size. */
export const Weights: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {WEIGHTS.map(weight => (
        <Typography key={weight} weight={weight}>
          {weight} — The quick brown fox
        </Typography>
      ))}
    </div>
  )
}

/** Sans, serif and mono side by side. */
export const Families: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {(["sans", "serif", "mono"] as const).map(family => (
        <Typography key={family} family={family} size="medium">
          {family} — The quick brown fox jumps over the lazy dog
        </Typography>
      ))}
    </div>
  )
}

export const Truncate: StoryObj<Typography.Props> = {
  args: {
    truncate: 2
  },
  render: args => (
    <div style={{ maxWidth: "24rem" }}>
      <Typography {...args}>
        A long paragraph that runs well past two lines, to show where the clamp lands and how the ellipsis is applied
        once the text overflows its allotted space.
      </Typography>
    </div>
  )
}

/** Unspecified attributes inherit from the nearest Typography ancestor. */
export const Inheritance: StoryObj = {
  render: () => (
    <Typography size="small" family="serif">
      <div>Inherits serif small.</div>
      <Typography weight="bold">Inherits serif small, adds bold.</Typography>
    </Typography>
  )
}
