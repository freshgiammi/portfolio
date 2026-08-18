import { cx } from "cva"
import type { ComponentProps, ReactNode } from "react"
import { useRef, useState } from "react"

import { useConfetti } from "@/components/effects/confetti"
import { CountRoll } from "@/components/effects/count-roll"
import { useParticles } from "@/components/effects/particles"
import { Typography } from "@/components/primitives/typography"
import { useMergeRefs } from "@/hooks/useMergeRefs"
import { formatCount } from "@/utils/number"

import styles from "./index.module.scss"

/**
 * Everything a `<button>` already answers for — `onClick`, `disabled`, `className`, `ref`,
 * `aria-pressed` for the reactions that genuinely toggle — is inherited rather than restated. What
 * remains below is only what this button adds to one.
 */
type ReactionButtonProps = Omit<ComponentProps<"button">, "children" | "type"> & {
  label: string
  icon: ReactNode
  /** Omit for an action with nothing to tally: no number is shown, and no particle is thrown. */
  count?: number
  tone?: "accent" | "danger"
  /** `pill` frames the button; `bare` leaves it as an icon and a label. */
  variant?: "pill" | "bare"
  /** Lit in the tone colour, for a reaction the reader has already spent. */
  active?: boolean
  /** `[spent, total]` draws the border as `total` slices with the first `spent` in tone colour. */
  borderSegments?: [spent: number, total: number]
  /** Fixed text for the flying particle, instead of the running tap count. */
  particleText?: string
  /** Fires a burst on every tap. Meant for the last tap of a capped run, not for all of them. */
  confetti?: boolean
}

/**
 * A tally you can add to, with the feedback that makes adding to it feel like it landed: the icon
 * beats, a particle carrying the running streak flies off it, and a capped reaction can mark its
 * last tap with a burst.
 *
 * All three are CSS animations rather than JS-driven ones. They are fire-and-forget, never
 * interrupted mid-flight, and a burst puts 21 elements on screen at once — which belongs in the
 * compositor, not on the main thread the taps are already arriving on.
 */
export function ReactionButton({
  label,
  icon,
  count,
  tone = "accent",
  active,
  borderSegments = [0, 0],
  particleText,
  confetti,
  className,
  disabled,
  onClick,
  ...rest
}: ReactionButtonProps) {
  const [beat, setBeat] = useState(0)
  const { ref: particles, emit } = useParticles({
    className: cx(
      styles.ReactionButton__particle,
      tone === "danger" ? styles.ReactionButton__particleDanger : styles.ReactionButton__particleAccent
    )
  })
  // A cannon rather than a popper: this one goes off inside a column of text, where a full circle
  // spends half its paper on the paragraph below. Fired straight up and wide, so it clears the rail.
  const { ref: burstBox, burst } = useConfetti({ pieces: 26, spray: "cannon", cone: 80, distance: 150 })
  // Both leave from the icon, so both are handed the same box: the burst takes its position from
  // it, and the particles their colour.
  const iconContainer = useMergeRefs([particles, burstBox])
  // The streak is the tally the particles carry, and it belongs here rather than in them: a particle
  // knows what it says, not how many came before it.
  const streak = useRef(0)
  const [spent, total] = borderSegments
  const segments = Array.from({ length: total }, (_, position) => position)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Remounting the icon on every click is what lets a burst of taps restart the same animation
    // rather than each tap landing mid-flight and being ignored.
    setBeat(current => current + 1)

    if (count !== undefined && !disabled) {
      streak.current += 1
      emit(particleText ?? `+${streak.current}`)

      if (confetti) burst()
    }

    onClick?.(event)
  }

  return (
    <button
      type="button"
      // A counted button shows its number where the label would otherwise go. Spread first, so a
      // caller can still override the label or hand the button its own `aria-pressed`.
      aria-label={label}
      {...rest}
      className={cx(styles.ReactionButton, className)}
      data-tone={tone}
      data-active={active || undefined}
      data-segmented-border={total > 0 || undefined}
      onClick={handleClick}
      disabled={disabled}>
      {total > 0 && (
        <svg className={styles.ReactionButton__segments} viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden>
          {segments.map(position => (
            <rect
              key={position}
              x="0"
              y="0"
              width="100"
              height="36"
              pathLength={total}
              strokeDasharray="0.82 100"
              strokeDashoffset={-position}
              className={styles.ReactionButton__segment}
              data-filled={position < spent || undefined}
            />
          ))}
        </svg>
      )}
      <span className={styles.ReactionButton__iconContainer} ref={iconContainer}>
        <span key={beat} className={styles.ReactionButton__icon} data-beat={beat > 0 || undefined}>
          {icon}
        </span>
      </span>
      <Typography size="xxx-small" family="mono" render={<span />} className={styles.ReactionButton__label}>
        {label}
      </Typography>
      {/* Absent rather than empty at zero, so the button falls back to its label instead of showing
          a bare icon. */}
      {count !== undefined && count > 0 && (
        <Typography
          size="xxx-small"
          family="mono"
          render={<span title={count > 9999 ? formatCount(count) : undefined} />}
          className={styles.ReactionButton__count}>
          <CountRoll value={count} />
        </Typography>
      )}
    </button>
  )
}

export declare namespace ReactionButton {
  export type Props = ReactionButtonProps
}
