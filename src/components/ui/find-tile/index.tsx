import { cx } from "cva"
import { useRef } from "react"

import { Icon } from "@/components/primitives/icons"
import { Image } from "@/components/primitives/image"
import { Typography } from "@/components/primitives/typography"
import type { Find } from "@/data/finds"
import { FIND_TAGS, findHost } from "@/data/finds"
import { useRevealedWithoutHover } from "@/hooks/useRevealedWithoutHover"

import styles from "./index.module.scss"

/** The shape every tile holds, kept in step with `aspect-ratio` in the stylesheet. A grid of these
    derives its row height from it rather than measuring one to find out. */
export const FIND_TILE_ASPECT_RATIO = 16 / 9

type FindTileProps = {
  find: Find
  className?: string
  /**
   * How much of the screen a tile has to be crossing before it shows its caption, where there is no
   * pointer to hover with. A grid of tiles that is the page wants one talking at a time; a few of
   * them beside something else want to arrive together and stay while that section is on screen.
   */
  revealBand?: string
  /** Set on the tiles a grid already knows are above the fold, so those skip the lazy-load default. */
  eager?: boolean
}

/**
 * A find as its preview alone, with everything else arriving on hover, or on arrival where there is
 * nothing to hover with. It fills the box it is given and holds a 16 / 9 shape inside it, so a grid
 * of these is a grid of previews at one size.
 */
export function FindTile({ find, className, revealBand, eager }: FindTileProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const revealed = useRevealedWithoutHover(ref, revealBand)
  const host = findHost(find)
  const section = FIND_TAGS[find.tag]

  return (
    <a
      href={find.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(styles.Tile, className)}
      data-revealed={revealed || undefined}
      aria-label={`${find.title}, ${section}, ${host}`}
      ref={ref}>
      {/* Outside the caption below, because it is the one thing here that is true at rest: the
          caption answers "what is this", and this answers "what kind of thing is it". */}
      <Typography size="xxx-small" family="mono" render={<span />} className={styles.Tile__tag}>
        {section}
      </Typography>

      <Image
        src={find.image}
        alt=""
        className={styles.Tile__image}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        fallback={
          <Typography size="xxx-small" family="mono">
            {host}
          </Typography>
        }
      />

      {/*
       * The detail lives in the cell rather than in a tooltip: a tooltip cannot be reached by touch,
       * and it puts a second surface over the grid to say something about the tile underneath it.
       * Nothing in here is focusable or selectable — the tile is the link, and this is its caption.
       */}
      <span className={styles.Tile__detail} aria-hidden="true">
        <Typography size="xx-small" weight="semibold" render={<span />} className={styles.Tile__title}>
          {find.title}
        </Typography>
        <Typography size="xxx-small" family="mono" render={<span />} className={styles.Tile__host}>
          {host}
          <Icon.ArrowUpRightIcon size={10} />
        </Typography>
        <Typography size="xxx-small" weight="regular" render={<span />} className={styles.Tile__description}>
          {find.description}
        </Typography>
      </span>
    </a>
  )
}

export declare namespace FindTile {
  export type Props = FindTileProps
}
