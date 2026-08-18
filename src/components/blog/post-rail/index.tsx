import { cx } from "cva"
import type { ComponentProps } from "react"
import { useState } from "react"

import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"
import { usePostStats } from "@/query/hooks/usePostStats"
import { CLAP_CAP } from "@/server/post-stats"

import { ReactionButton } from "./-components/reaction-button"
import styles from "./index.module.scss"

type PostRailProps = ComponentProps<"div"> & {
  title: string
  slug: string
  className?: string
}

/**
 * The numbers a post has earned, and the three things a reader can do about it. Presentational: the
 * stats and the actions come from `usePostStats`, called once by the page, so this can be rendered
 * in more than one place (sidebar on wide viewports, after the article on narrow ones) without
 * either count being fetched or incremented twice.
 */
export function PostRail({ title, slug, className, ...rest }: PostRailProps) {
  const { stats, toggleLike, canLike, clap, canClap } = usePostStats(slug)

  const liked = stats?.liked === true
  const spentClaps = stats?.myClaps ?? 0

  return (
    <div {...rest} className={cx(styles.PostRail, className)}>
      <div className={styles.PostRail__actions}>
        <ReactionButton
          label="Like"
          count={stats?.likes}
          icon={<Icon.HeartIcon size={18} weight={liked ? "fill" : "regular"} />}
          tone="danger"
          active={liked}
          aria-pressed={liked}
          disabled={!canLike}
          particleText={liked ? "-1" : "+1"}
          onClick={toggleLike}
        />
        {/*
         * Additive and capped: there is no way back off a clap, so the button only ever counts up,
         * and it stays lit from the first one even though the total belongs to everyone.
         */}
        <ReactionButton
          label="Clap"
          count={stats?.claps}
          icon={<Icon.HandsClappingIcon size={18} weight={spentClaps > 0 ? "fill" : "regular"} />}
          active={spentClaps > 0}
          borderSegments={[spentClaps, CLAP_CAP]}
          disabled={!canClap}
          confetti={spentClaps + 1 >= CLAP_CAP}
          onClick={clap}
        />
      </div>

      {/* Ruled off from the pills: share is the one action with nothing to count. */}
      <div className={styles.PostRail__meta}>
        <ShareButton title={title} />
      </div>
    </div>
  )
}

export declare namespace PostRail {
  export type Props = PostRailProps
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

/**
 * The native sheet where there is one, the clipboard everywhere else. Both paths need a user
 * gesture, so neither can run until the click.
 */
type ShareButtonProps = { title: string }

function ShareButton({ title }: ShareButtonProps) {
  const [shared, setShared] = useState(false)

  const share = async () => {
    const url = window.location.href

    if (typeof navigator.share === "function") {
      try {
        setShared(true)
        await navigator.share({ title, url }).finally(() => {
          setShared(false)
        })

        return
      } catch {
        // Dismissing the sheet rejects, and so does a browser that advertises the API without
        // allowing this share target: the clipboard below covers both.
      }
    }

    setShared(true)
    await navigator.clipboard
      .writeText(url)
      .catch()
      .finally(() => {
        setShared(false)
      })
  }

  return (
    <Typography
      size="xxx-small"
      family="mono"
      render={<button type="button" />}
      className={styles.PostRail__shareLabel}
      data-active={shared || undefined}
      onClick={() => void share()}>
      <Icon.ShareNetworkIcon size={14} />
      Share
    </Typography>
  )
}
