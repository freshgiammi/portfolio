import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { Image } from "@/components/primitives/image"
import { catImage, faker } from "@/storybook/lib/fake"

import { PreviewCard } from "./index"

const meta = {
  title: "Primitives/PreviewCard",
  component: PreviewCard.Root,
  subcomponents: {
    Trigger: PreviewCard.Trigger,
    Portal: PreviewCard.Portal,
    Positioner: PreviewCard.Positioner,
    Popup: PreviewCard.Popup,
    Viewport: PreviewCard.Viewport
  }
} satisfies Meta<typeof PreviewCard.Root>

export default meta

function LinkTrigger({ children }: { children: React.ReactNode }) {
  return (
    <PreviewCard.Trigger render={<a href="#" style={{ color: "var(--accent)" }} />}>{children}</PreviewCard.Trigger>
  )
}

/** Hover the link; a rich preview opens, like a link card on social media. */
export const Default: StoryObj = {
  render: () => (
    <div style={{ padding: "5rem", maxWidth: "30rem" }}>
      <PreviewCard.Root>
        <LinkTrigger>{faker.lorem.words(3)}</LinkTrigger>
        <PreviewCard.Portal>
          <PreviewCard.Positioner sideOffset={10}>
            <PreviewCard.Popup>
              <Image src={catImage(640, 360)} alt="" layout="fill" style={{ width: "20rem", height: "11rem" }} />
              <div style={{ padding: "0.75rem", maxWidth: "20rem" }}>
                <strong style={{ display: "block", marginBottom: "0.25rem" }}>{faker.lorem.words(4)}</strong>
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{faker.internet.domainName()}</span>
              </div>
            </PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>
    </div>
  )
}
