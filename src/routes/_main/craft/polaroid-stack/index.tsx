import { createFileRoute } from "@tanstack/react-router"

import { PolaroidStack } from "@/components/ui/polaroid-stack"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import { ShowcaseTemplate } from "../-components/showcase-template"
import styles from "./index.module.scss"

const SUBTITLE =
  "Drag the top card (or use arrow keys) to reshuffle the stack, or click/press Enter to open the gallery lightbox."

// The query string only needs to be distinct per photo, so the same 30 cats load every time
// instead of a fresh random set on every build.
const PHOTOS: Array<PolaroidStack.Photo> = Array.from({ length: 30 }, (_, i) => ({
  src: `https://cataas.com/cat?random=${i}`,
  caption: `Cat #${i + 1}`
}))

const SEO = {
  title: "Polaroid Stack",
  description: "Interactive Polaroid stack component showcase.",
  emoji: "✨"
} satisfies PageSeo

export const Route = createFileRoute("/_main/craft/polaroid-stack/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/craft/polaroid-stack" }),
  component: PolaroidStackShowcase
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function PolaroidStackShowcase() {
  return (
    <ShowcaseTemplate.Root>
      <ShowcaseTemplate.Header
        to="/craft/polaroid-stack"
        subtitle={SUBTITLE}
        githubUrl="https://github.com/freshgiammi/portfolio/tree/master/src/components/generic/polaroid-stack"
      />
      <ShowcaseTemplate.Demo>
        <div className={styles.Demo}>
          <PolaroidStack photos={PHOTOS} />
        </div>
      </ShowcaseTemplate.Demo>
      <ShowcaseTemplate.Lede>
        A pile of photographs on a table, and the one on top is free to be thrown aside. The physics are borrowed and
        the gestures are the conventional ones you&apos;d expect. What actually took the work was making that same pile
        answer to a keyboard without turning into a list somewhere along the way.
      </ShowcaseTemplate.Lede>

      <ShowcaseTemplate.Section title="An order, not a position">
        <ShowcaseTemplate.Prose>
          Nothing here actually moves a card. The stack is just an array saying which photo is on top and which ones sit
          behind it, and each card reads its own place in that array to work out where it sits, how far it leans, and
          how much of the card below it shows. Sending the top photo to the back is a single immutable update to that
          array. The springs handle everything else.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Aside>
          That&apos;s the whole reason the keyboard even works here. A drag and an arrow press end up as the same event
          by the time they reach the state, they both just mean &ldquo;the order changed&rdquo;, and neither one knows a
          thing about pixels.
        </ShowcaseTemplate.Aside>
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="Only the top card is live">
        <ShowcaseTemplate.Prose>
          The cards underneath aren&apos;t draggable, focusable, or clickable at all. That&apos;s one line of code, and
          it removes an entire category of accidents: a stray grab pulling a photo out of the middle, a tab stop for
          every single image in the pile, a click that opens the wrong one. The top card carries all of that
          responsibility, and the moment it leaves, the next card inherits the job — an arrow press carries the keyboard
          focus along with it too, a drag doesn&apos;t need to.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.List
          items={[
            "Drag it anywhere, and it flies out and comes back underneath.",
            "Arrow keys rotate the pile in either direction, focus following the new top card.",
            "Enter opens the gallery at whichever photo is currently on top, so the overlay starts where the eye already is."
          ]}
        />
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="What it is made of">
        <ShowcaseTemplate.Prose>
          Motion handles the springs and the drag gesture, since a hand-rolled inertia curve would be a week of work to
          get half as right. The overlay isn&apos;t part of this component at all. It composes the same gallery lightbox
          and dialog primitives the rest of the site already uses, which is why focus trapping and the escape key just
          work out of the box.
        </ShowcaseTemplate.Prose>
      </ShowcaseTemplate.Section>
    </ShowcaseTemplate.Root>
  )
}
