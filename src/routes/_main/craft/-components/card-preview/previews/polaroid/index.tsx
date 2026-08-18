import { PolaroidStack } from "@/components/ui/polaroid-stack"

import styles from "./index.module.scss"

/** Two is enough to read as a stack at this size, and half the images to fetch for a thumbnail. */
const PHOTOS: Array<PolaroidStack.Photo> = [
  { src: "https://cataas.com/cat?random=0", caption: "Cat #1" },
  { src: "https://cataas.com/cat?random=1", caption: "Cat #2" }
]

/** Slow enough to be scenery rather than a slideshow demanding to be watched. */
const CYCLE = 2600

/** The real stack, shrunk and dealing itself. Not draggable: the card is a link, and a drag surface would eat the click. */
export default function PolaroidPreview() {
  return (
    <div className={styles.Shrink} aria-hidden="true">
      <PolaroidStack photos={PHOTOS} cycleEvery={CYCLE} />
    </div>
  )
}
