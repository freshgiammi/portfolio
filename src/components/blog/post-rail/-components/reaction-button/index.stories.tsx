import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useState } from "react"

import { Icon } from "@/components/primitives/icons"

import { ReactionButton } from "./index"

const meta = {
  title: "Blog/ReactionButton",
  component: ReactionButton
} satisfies Meta<typeof ReactionButton>

export default meta

function Host({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "4rem", display: "flex", gap: "2rem", justifyContent: "center" }}>{children}</div>
}

/** Stateful, like the real rail: clicking likes/unlikes, and the count follows. */
export const Like: StoryObj = {
  render: () => <LikeHost />
}

function LikeHost() {
  const [likes, setLikes] = useState(48)
  const [liked, setLiked] = useState(false)

  return (
    <Host>
      <ReactionButton
        label="Like"
        count={likes}
        icon={<Icon.HeartIcon size={18} weight={liked ? "fill" : "regular"} />}
        tone="danger"
        active={liked}
        aria-pressed={liked}
        particleText={liked ? "-1" : "+1"}
        onClick={() => {
          setLiked(current => !current)
          setLikes(current => current + (liked ? -1 : 1))
        }}
      />
    </Host>
  )
}

/** Capped claps: border slices fill up to the cap, then confetti fires on the last one. */
export const Clap: StoryObj = {
  render: () => <ClapHost />
}

const CLAP_CAP = 10

function ClapHost() {
  const [claps, setClaps] = useState(132)
  const [mine, setMine] = useState(7)

  return (
    <Host>
      <ReactionButton
        label="Claps"
        count={claps}
        icon={<Icon.HandsClappingIcon size={18} weight={mine > 0 ? "fill" : "regular"} />}
        active={mine > 0}
        borderSegments={[mine, CLAP_CAP]}
        disabled={mine >= CLAP_CAP}
        confetti={mine + 1 >= CLAP_CAP}
        onClick={() => {
          setClaps(current => current + 1)
          setMine(current => current + 1)
        }}
      />
    </Host>
  )
}

export const BareVariant: StoryObj<ReactionButton.Props> = {
  args: {
    label: "Share",
    icon: <Icon.ShareNetworkIcon size={18} />,
    variant: "bare"
  },
  render: args => (
    <Host>
      <ReactionButton {...args} />
    </Host>
  )
}
