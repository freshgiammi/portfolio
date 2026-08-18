import { useState } from "react"

import { formatCount } from "@/utils/number"

import styles from "./index.module.scss"

type CountRollProps = {
  value: number
  /** How the number is written out. Digits are compared per column, whatever the shape of it. */
  format?: (value: number) => string
}

/**
 * One column per character, so 10 → 11 rolls the units digit and leaves the tens alone. Columns are
 * compared right to left: a count growing a digit (9 → 10) matches the 9 against the new units
 * column rather than against the 1 that just appeared beside it.
 *
 * Each incoming character is keyed on itself, which is what confines the animation to the columns
 * that changed — an unchanged character keeps its key, is never remounted, and so never restarts.
 */
export function CountRoll({ value, format = formatCount }: CountRollProps) {
  // Comparing against the last rendered value during render, rather than reacting to it afterwards:
  // there is nothing to synchronise with the outside world here, and an effect would paint the new
  // number once before the roll it belongs to could start.
  const [roll, setRoll] = useState<{ value: number; from: string | null; direction: "up" | "down" }>({
    value,
    from: null,
    direction: "up"
  })
  if (roll.value !== value) {
    setRoll({ value, from: format(roll.value), direction: value > roll.value ? "up" : "down" })
  }

  const text = format(value)
  const from = roll.from ?? ""
  const offset = text.length - from.length

  return (
    <span className={styles.CountRoll}>
      {text.split("").map((char, index) => {
        const previous = from[index - offset]
        const changed = previous !== undefined && previous !== char

        return (
          // oxlint-disable-next-line react/no-array-index-key -- the column, not the character in it
          <span key={index} className={styles.CountRoll__digit}>
            {changed && (
              // Keyed on the value it belongs to, so a column rolling twice in a row replays rather
              // than sitting finished at the end of its first animation.
              <span key={roll.value} className={styles.CountRoll__digitOut} data-direction={roll.direction}>
                {previous}
              </span>
            )}
            <span
              key={char}
              className={styles.CountRoll__digitIn}
              data-direction={changed ? roll.direction : undefined}>
              {char}
            </span>
          </span>
        )
      })}
    </span>
  )
}

export declare namespace CountRoll {
  export type Props = CountRollProps
}
