import { createFileRoute } from "@tanstack/react-router"

import { PolaroidStack } from "@/components/generic/polaroid-stack"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import { ShowcaseTemplate } from "../-components/showcase-template"
import styles from "./index.module.scss"

const SUBTITLE =
  "Drag the top card (or use arrow keys) to reshuffle the stack, or click/press Enter to open the gallery lightbox."

const PHOTOS: Array<PolaroidStack.Photo> = [
  { src: "images/me.jpg", caption: "Turin, post-debug team dinner" },
  { src: "images/about/photo-04.jpg", caption: "Poolside, enjoying company provided drinks" },
  { src: "images/about/photo-12.jpg", caption: "Cooking something up (not sober enough to remember)" }
]

const SEO = {
  title: "Polaroid Stack — Showcase — freshgiammi",
  description: "Interactive Polaroid stack component showcase.",
  emoji: "🧩"
} satisfies PageSeo

export const Route = createFileRoute("/_main/showcase/polaroid-stack/")({
  loader: () => ({
    initialPhotoIndex: Math.floor(Math.random() * PHOTOS.length)
  }),
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/showcase/polaroid-stack" }),
  component: PolaroidStackShowcase
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function PolaroidStackShowcase() {
  const { initialPhotoIndex } = Route.useLoaderData()

  return (
    <ShowcaseTemplate
      title="Polaroid Stack"
      subtitle={SUBTITLE}
      overview="The stack is built as an ordered set of absolutely positioned cards. Each interaction updates that order so movement feels physical while remaining deterministic and keyboard-friendly."
      demo={
        <div className={styles.Demo}>
          <PolaroidStack photos={PHOTOS} initialTopIndex={initialPhotoIndex} />
        </div>
      }
      buildNotes={[
        "Cards are rendered from an order array, so moving a photo to the back is a small immutable state update.",
        "The top card is draggable while lower cards are static, reducing accidental interactions.",
        "Arrow keys on the focused top card rotate the stack forward/backward and keep focus anchored on the next top card.",
        "Opening the lightbox uses the current top card index, so the expanded gallery always starts from what the user is looking at."
      ]}
      techniques={[
        "Spring-based animation and drag gestures with Motion.",
        "Focusable top-card semantics, keyboard activation, and keyboard stack reordering for accessibility.",
        "Composed overlay behavior via reusable gallery lightbox and dialog primitives."
      ]}
      githubUrl="https://github.com/freshgiammi/portfolio/tree/master/src/components/generic/polaroid-stack"
    />
  )
}
