import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { Icon } from "@/components/primitives/icons"
import { faker } from "@/storybook/lib/fake"

import { Button } from "./index"

const meta = {
  title: "Primitives/Button",
  component: Button
} satisfies Meta<typeof Button>

export default meta

export const Single: StoryObj<Button.Props> = {
  args: {
    children: faker.word.verb()
  }
}

const VARIANTS = ["primary", "secondary", "tertiary"] as const

export const Variants: StoryObj<Button.Props> = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      {VARIANTS.map(variant => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  )
}

export const Danger: StoryObj<Button.Props> = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      {VARIANTS.map(variant => (
        <Button key={variant} variant={variant} behaviour="danger">
          delete
        </Button>
      ))}
    </div>
  )
}

export const Neutral: StoryObj<Button.Props> = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      {VARIANTS.map(variant => (
        <Button key={variant} variant={variant} behaviour="neutral">
          {variant}
        </Button>
      ))}
    </div>
  )
}

const BEHAVIOURS = ["default", "danger", "neutral"] as const

export const Behaviours: StoryObj<Button.Props> = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      {VARIANTS.map(variant =>
        BEHAVIOURS.map(behaviour => (
          <Button key={`${variant}-${behaviour}`} variant={variant} behaviour={behaviour}>
            {behaviour}
          </Button>
        ))
      )}
    </div>
  )
}

const SIZES = ["small", "medium", "large"] as const

export const Sizes: StoryObj<Button.Props> = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      {SIZES.map(size => (
        <Button key={size} size={size}>
          {size}
        </Button>
      ))}
    </div>
  )
}

export const Disabled: StoryObj<Button.Props> = {
  args: {
    children: "unavailable",
    disabled: true
  }
}

export const WithIcon: StoryObj<Button.Props> = {
  args: {
    children: faker.word.verb(),
    icon: <Icon.PlayIcon size={12} weight="bold" />
  }
}

export const IconOnly: StoryObj<Button.Props> = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      {SIZES.map(size => (
        <Button key={size} size={size} icon={<Icon.SparkleIcon size={16} weight="fill" />} />
      ))}
    </div>
  )
}
