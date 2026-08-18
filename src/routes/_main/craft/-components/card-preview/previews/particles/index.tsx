import { useParticles } from "@/components/effects/particles"
import { Button } from "@/components/primitives/button"
import { Icon } from "@/components/primitives/icons"

import styles from "./index.module.scss"

/** What this one throws: a handful, so one pass of the pointer fills the frame. */
const FACES = ["+1", "✦", "+2", "✧", "+3", "✶"]

/** The real hook, throwing on hover. */
export default function ParticlesPreview() {
  const { ref, emit } = useParticles({ drift: 44, rise: 40, tilt: 40, size: "xx-small" })

  return (
    <>
      <span
        className={styles.Stage}
        aria-hidden="true"
        onPointerEnter={() => {
          for (const face of FACES) emit(face)
        }}
        ref={ref}
      />
      <Button className={styles.Mark} icon={<Icon.SparkleIcon size={20} weight="fill" />} />
    </>
  )
}
