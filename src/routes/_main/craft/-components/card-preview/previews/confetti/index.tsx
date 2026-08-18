import { useConfetti } from "@/components/effects/confetti"
import { Button } from "@/components/primitives/button"
import { Icon } from "@/components/primitives/icons"

import styles from "./index.module.scss"

/** The real hook, firing a cannon on hover. */
export default function ConfettiPreview() {
  const { ref, burst } = useConfetti({ pieces: 18, spray: "cannon", cone: 70, distance: 80 })

  return (
    <>
      <span className={styles.Stage} aria-hidden="true" onPointerEnter={() => burst()} ref={ref} />
      <Button className={styles.Mark} icon={<Icon.ConfettiIcon size={20} weight="fill" />} />
    </>
  )
}
